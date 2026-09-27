import os
import uuid
import razorpay
from decimal import Decimal
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import generics, status, views, permissions
from rest_framework.response import Response

from django.utils import timezone
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Category, Product, Cart, CartItem, Wishlist, Coupon, Order, OrderItem, Review
from .serializers import (
    UserRegisterSerializer, UserSerializer, CategorySerializer,
    ProductSerializer, CartSerializer, WishlistSerializer,
    CouponSerializer, OrderSerializer, ReviewSerializer
)
from .gemini_service import query_fimiku_assistant
from .mongo_client import sync_wishlist_to_mongo, sync_order_to_mongo, sync_user_to_mongo

# --- Authentication Views ---

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        self.user.last_login = timezone.now()
        self.user.save(update_fields=['last_login'])
        # Sync user state and encrypted password hash to MongoDB Atlas
        sync_user_to_mongo(self.user)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
        }
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sync_user_to_mongo(request.user)
        return Response(UserSerializer(request.user).data)

# --- Catalog Views ---

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('reviews')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        featured = self.request.query_params.get('featured')
        sort = self.request.query_params.get('sort')

        if category:
            queryset = queryset.filter(Q(category__slug=category) | Q(category__name__iexact=category))
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(material__icontains=search)
            )
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)

        if sort == 'price_low':
            queryset = queryset.order_by('price')
        elif sort == 'price_high':
            queryset = queryset.order_by('-price')
        elif sort == 'newest':
            queryset = queryset.order_by('-created_at')

        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]

# --- Cart Views ---

class CartView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def _get_cart(self, request):
        session_key = request.headers.get('X-Session-Key')
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            # Auto-merge guest cart items into authenticated user cart
            if session_key:
                guest_cart = Cart.objects.filter(session_key=session_key).first()
                if guest_cart and guest_cart.id != cart.id:
                    for g_item in guest_cart.items.all():
                        u_item, created = CartItem.objects.get_or_create(cart=cart, product=g_item.product)
                        if not created:
                            u_item.quantity = min(g_item.product.stock, u_item.quantity + g_item.quantity)
                        else:
                            u_item.quantity = min(g_item.product.stock, g_item.quantity)
                        u_item.save()
                    guest_cart.delete()
        else:
            if not session_key:
                session_key = request.data.get('session_key', 'guest-' + str(uuid.uuid4())[:8])
            cart, _ = Cart.objects.get_or_create(session_key=session_key)
        return cart

    def get(self, request):
        cart = self._get_cart(request)
        return Response(CartSerializer(cart).data)

    def post(self, request):
        cart = self._get_cart(request)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        product = get_object_or_404(Product, id=product_id)
        if product.stock < quantity:
            return Response(
                {'error': f"Only {product.stock} items available in stock."},
                status=status.HTTP_400_BAD_REQUEST
            )

        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            new_qty = item.quantity + quantity
            if product.stock < new_qty:
                return Response(
                    {'error': f"Cannot add more. Total in cart ({new_qty}) exceeds stock ({product.stock})."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.quantity = new_qty
        else:
            item.quantity = quantity
        item.save()
        return Response(CartSerializer(cart).data)

    def put(self, request):
        """Update item quantity directly"""
        cart = self._get_cart(request)
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        if quantity <= 0:
            item.delete()
        else:
            if item.product.stock < quantity:
                return Response(
                    {'error': f"Only {item.product.stock} units available in stock."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.quantity = quantity
            item.save()
        return Response(CartSerializer(cart).data)

    def delete(self, request):
        cart = self._get_cart(request)
        item_id = request.data.get('item_id')
        if item_id:
            CartItem.objects.filter(cart=cart, id=item_id).delete()
        else:
            # Clear entire cart
            CartItem.objects.filter(cart=cart).delete()
        return Response(CartSerializer(cart).data)

# --- Wishlist Views ---

class WishlistView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def _get_wishlist(self, request):
        session_key = request.headers.get('X-Session-Key')
        if request.user.is_authenticated:
            wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
            # Auto-merge guest wishlist items into user wishlist
            if session_key:
                guest_wl = Wishlist.objects.filter(session_key=session_key).first()
                if guest_wl and guest_wl.id != wishlist.id:
                    for prod in guest_wl.products.all():
                        wishlist.products.add(prod)
                    guest_wl.delete()
                    sync_wishlist_to_mongo(wishlist)
        else:
            if not session_key:
                session_key = 'guest-wishlist'
            wishlist, _ = Wishlist.objects.get_or_create(session_key=session_key)
        return wishlist

    def get(self, request):
        wishlist = self._get_wishlist(request)
        return Response(WishlistSerializer(wishlist).data)

    def post(self, request):
        wishlist = self._get_wishlist(request)
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, id=product_id)

        if wishlist.products.filter(id=product.id).exists():
            wishlist.products.remove(product)
            in_wishlist = False
        else:
            wishlist.products.add(product)
            in_wishlist = True

        sync_wishlist_to_mongo(wishlist)

        return Response({
            'in_wishlist': in_wishlist,
            'wishlist': WishlistSerializer(wishlist).data
        })

# --- Coupon Validation ---

class CouponValidateView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        order_total = Decimal(str(request.data.get('total', 0)))

        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
            if order_total < coupon.min_order_amount:
                return Response({
                    'error': f"Minimum order amount for coupon '{code}' is ₹{coupon.min_order_amount}"
                }, status=status.HTTP_400_BAD_REQUEST)

            if coupon.discount_type == 'PERCENTAGE':
                discount = (order_total * coupon.value) / Decimal(100)
            else:
                discount = coupon.value

            return Response({
                'valid': True,
                'code': coupon.code,
                'discount_amount': float(discount),
                'discount_type': coupon.discount_type,
                'value': float(coupon.value)
            })
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid or expired coupon code.'}, status=status.HTTP_404_NOT_FOUND)

# --- Payment & Orders ---

class CreateRazorpayOrderView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        items_data = data.get('items', [])
        if not items_data:
            return Response({'error': 'No items selected for order.'}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = sum(Decimal(str(item['price'])) * int(item['quantity']) for item in items_data)
        discount = Decimal(str(data.get('discount_amount', 0)))
        total = max(Decimal('0'), subtotal - discount)
        amount_paise = int(total * 100)

        # Check stock validity before creating order
        for item in items_data:
            prod = Product.objects.filter(id=item.get('product_id')).first()
            if prod and prod.stock < int(item['quantity']):
                return Response(
                    {'error': f"Product '{prod.name}' only has {prod.stock} left in stock."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Create Razorpay order (or sandbox simulation if test keys)
        key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')
        
        is_sandbox_mock = not key_id or 'placeholder' in key_id.lower() or not key_secret or 'placeholder' in key_secret.lower()
        
        if is_sandbox_mock:
            razorpay_order_id = f"order_mock_{uuid.uuid4().hex[:12]}"
        else:
            try:
                client = razorpay.Client(auth=(key_id, key_secret))
                rzp_order = client.order.create({
                    "amount": amount_paise if amount_paise > 0 else 100,
                    "currency": "INR",
                    "payment_capture": "1"
                })
                razorpay_order_id = rzp_order['id']
            except Exception as e:
                # Fallback to simulation mode for smooth local testing
                razorpay_order_id = f"order_dev_{uuid.uuid4().hex[:12]}"

        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            full_name=data.get('full_name', 'Guest Parent'),
            email=data.get('email', 'guest@fimiku.com'),
            phone=data.get('phone', '9876543210'),
            shipping_address=data.get('shipping_address', 'Address'),
            city=data.get('city', 'City'),
            postal_code=data.get('postal_code', '000000'),
            state=data.get('state', 'State'),
            total_amount=total,
            discount_amount=discount,
            razorpay_order_id=razorpay_order_id,
            payment_status='INITIATED'
        )

        for item in items_data:
            prod = Product.objects.filter(id=item.get('product_id')).first()
            OrderItem.objects.create(
                order=order,
                product=prod,
                product_name=item.get('name', 'Silicone Essential'),
                price=Decimal(str(item['price'])),
                quantity=int(item['quantity'])
            )

        return Response({
            'order_id': order.id,
            'razorpay_order_id': razorpay_order_id,
            'amount': amount_paise,
            'currency': 'INR',
            'key_id': key_id if key_id else 'rzp_test_placeholder',
            'is_mock': is_sandbox_mock
        })

class VerifyPaymentView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id', f"pay_mock_{uuid.uuid4().hex[:8]}")
        razorpay_signature = request.data.get('razorpay_signature')

        try:
            order = Order.objects.get(razorpay_order_id=razorpay_order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')
        is_sandbox_mock = not key_id or 'placeholder' in key_id.lower() or not key_secret or 'placeholder' in key_secret.lower()

        if not is_sandbox_mock and razorpay_signature:
            try:
                client = razorpay.Client(auth=(key_id, key_secret))
                client.utility.verify_payment_signature({
                    'razorpay_order_id': razorpay_order_id,
                    'razorpay_payment_id': razorpay_payment_id,
                    'razorpay_signature': razorpay_signature
                })
            except Exception as e:
                return Response({'error': f'Payment signature verification failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark order as PAID & Processing
        order.payment_status = 'PAID'
        order.order_status = 'PROCESSING'
        order.razorpay_payment_id = razorpay_payment_id
        order.save()

        # Safely deduct inventory stock
        for item in order.items.all():
            if item.product:
                item.product.stock = max(0, item.product.stock - item.quantity)
                item.product.save()

        # Clear active cart for the user or session
        if request.user.is_authenticated:
            Cart.objects.filter(user=request.user).delete()
        else:
            session_key = request.headers.get('X-Session-Key')
            if session_key:
                Cart.objects.filter(session_key=session_key).delete()

        # Sync completed order to MongoDB Atlas
        sync_order_to_mongo(order)

        return Response({
            'status': 'Payment Verified Successfully',
            'order_id': order.id,
            'order': OrderSerializer(order).data
        })

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        email_param = self.request.query_params.get('email', '').strip()
        if self.request.user.is_authenticated:
            return Order.objects.filter(
                Q(user=self.request.user) | Q(email__iexact=self.request.user.email)
            ).prefetch_related('items__product').order_by('-created_at')
        elif email_param:
            return Order.objects.filter(
                email__iexact=email_param
            ).prefetch_related('items__product').order_by('-created_at')
        return Order.objects.none()

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Order.objects.all().prefetch_related('items__product')

# --- Reviews ---

class ReviewCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        rating = request.data.get('rating')
        comment = request.data.get('comment')

        product = get_object_or_404(Product, id=product_id)
        review = Review.objects.create(
            product=product,
            user=request.user,
            rating=rating,
            comment=comment
        )
        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)

# --- AI Assistant ---

class AIAssistantView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        prompt = request.data.get('prompt', '').strip()
        if not prompt:
            return Response({'error': 'Question prompt is required.'}, status=status.HTTP_400_BAD_REQUEST)

        response_text = query_fimiku_assistant(prompt)
        return Response({'reply': response_text})

# --- Admin Quick Stats ---

class AdminStatsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        total_revenue = sum(o.total_amount for o in Order.objects.filter(payment_status='PAID'))
        low_stock = Product.objects.filter(stock__lte=10, is_active=True).values('id', 'name', 'stock')

        return Response({
            'total_products': total_products,
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'low_stock_count': low_stock.count(),
            'low_stock_products': list(low_stock)
        })
