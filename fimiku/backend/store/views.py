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

from .models import (
    Category,
    Product,
    Cart,
    CartItem,
    Wishlist,
    Coupon,
    Order,
    OrderItem,
    Review
)

from .serializers import (
    UserRegisterSerializer,
    UserSerializer,
    CategorySerializer,
    ProductSerializer,
    CartSerializer,
    WishlistSerializer,
    CouponSerializer,
    OrderSerializer,
    ReviewSerializer
)

from .gemini_service import query_fimiku_assistant

from .mongo_client import (
    sync_wishlist_to_mongo,
    sync_order_to_mongo,
    sync_user_to_mongo
)


# =========================================================
# AUTHENTICATION VIEWS
# =========================================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):

        data = super().validate(attrs)

        self.user.last_login = timezone.now()

        self.user.save(
            update_fields=['last_login']
        )

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

    permission_classes = [
        permissions.AllowAny
    ]


class MeView(views.APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        sync_user_to_mongo(
            request.user
        )

        return Response(
            UserSerializer(
                request.user
            ).data
        )


# =========================================================
# CATALOG VIEWS
# =========================================================

class CategoryListView(generics.ListAPIView):

    queryset = Category.objects.all()

    serializer_class = CategorySerializer

    permission_classes = [
        permissions.AllowAny
    ]

    pagination_class = None


class ProductListView(generics.ListAPIView):

    serializer_class = ProductSerializer

    permission_classes = [
        permissions.AllowAny
    ]

    def get_queryset(self):

        queryset = (
            Product.objects
            .filter(is_active=True)
            .select_related('category')
            .prefetch_related('reviews')
        )

        category = self.request.query_params.get(
            'category'
        )

        search = self.request.query_params.get(
            'search'
        )

        featured = self.request.query_params.get(
            'featured'
        )

        sort = self.request.query_params.get(
            'sort'
        )

        if category:

            queryset = queryset.filter(
                Q(category__slug=category) |
                Q(category__name__iexact=category)
            )

        if search:

            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(material__icontains=search)
            )

        if featured and featured.lower() == 'true':

            queryset = queryset.filter(
                is_featured=True
            )

        if sort == 'price_low':

            queryset = queryset.order_by(
                'price'
            )

        elif sort == 'price_high':

            queryset = queryset.order_by(
                '-price'
            )

        elif sort == 'newest':

            queryset = queryset.order_by(
                '-created_at'
            )

        return queryset


class ProductDetailView(generics.RetrieveAPIView):

    queryset = Product.objects.filter(
        is_active=True
    )

    serializer_class = ProductSerializer

    lookup_field = 'id'

    permission_classes = [
        permissions.AllowAny
    ]


# =========================================================
# CART VIEWS
# =========================================================

class CartView(views.APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def _get_cart(self, request):

        session_key = (
            request.headers.get(
                'X-Session-Key'
            )
            or request.data.get(
                'session_key'
            )
        )

        if not session_key:

            session_key = (
                'guest-' +
                str(uuid.uuid4())[:8]
            )

        cart, _ = Cart.objects.get_or_create(
            session_key=session_key
        )

        return cart

    def get(self, request):

        cart = self._get_cart(
            request
        )

        return Response(
            CartSerializer(
                cart
            ).data
        )

    def post(self, request):

        cart = self._get_cart(
            request
        )

        product_id = request.data.get(
            'product_id'
        )

        quantity = int(
            request.data.get(
                'quantity',
                1
            )
        )

        product = get_object_or_404(
            Product,
            id=product_id
        )

        if product.stock < quantity:

            return Response(
                {
                    'error':
                        f"Only {product.stock} items "
                        f"available in stock."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product
        )

        if not created:

            new_qty = (
                item.quantity +
                quantity
            )

            if product.stock < new_qty:

                return Response(
                    {
                        'error':
                            f"Cannot add more. Total in cart "
                            f"({new_qty}) exceeds stock "
                            f"({product.stock})."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            item.quantity = new_qty

        else:

            item.quantity = quantity

        item.save()

        return Response(
            CartSerializer(
                cart
            ).data
        )

    def put(self, request):

        cart = self._get_cart(
            request
        )

        item_id = request.data.get(
            'item_id'
        )

        quantity = int(
            request.data.get(
                'quantity',
                1
            )
        )

        item = get_object_or_404(
            CartItem,
            id=item_id,
            cart=cart
        )

        if quantity <= 0:

            item.delete()

        else:

            if item.product.stock < quantity:

                return Response(
                    {
                        'error':
                            f"Only {item.product.stock} "
                            f"units available in stock."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            item.quantity = quantity

            item.save()

        return Response(
            CartSerializer(
                cart
            ).data
        )

    def delete(self, request):

        cart = self._get_cart(
            request
        )

        item_id = request.data.get(
            'item_id'
        )

        if item_id:

            CartItem.objects.filter(
                cart=cart,
                id=item_id
            ).delete()

        else:

            CartItem.objects.filter(
                cart=cart
            ).delete()

        return Response(
            CartSerializer(
                cart
            ).data
        )


# =========================================================
# WISHLIST VIEWS
# =========================================================

class WishlistView(views.APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def _get_wishlist(self, request):

        session_key = (
            request.headers.get(
                'X-Session-Key'
            )
            or request.data.get(
                'session_key'
            )
            or 'guest-wishlist'
        )

        wishlist, _ = Wishlist.objects.get_or_create(
            session_key=session_key
        )

        return wishlist

    def get(self, request):

        wishlist = self._get_wishlist(
            request
        )

        return Response(
            WishlistSerializer(
                wishlist
            ).data
        )

    def post(self, request):

        wishlist = self._get_wishlist(
            request
        )

        product_id = request.data.get(
            'product_id'
        )

        product = get_object_or_404(
            Product,
            id=product_id
        )

        if wishlist.products.filter(
            id=product.id
        ).exists():

            wishlist.products.remove(
                product
            )

            in_wishlist = False

        else:

            wishlist.products.add(
                product
            )

            in_wishlist = True

        sync_wishlist_to_mongo(
            wishlist
        )

        return Response(
            {
                'in_wishlist':
                    in_wishlist,

                'wishlist':
                    WishlistSerializer(
                        wishlist
                    ).data
            }
        )


# =========================================================
# COUPON VALIDATION
# =========================================================

class CouponValidateView(views.APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request):

        code = request.data.get(
            'code',
            ''
        ).strip().upper()

        order_total = Decimal(
            str(
                request.data.get(
                    'total',
                    0
                )
            )
        )

        try:

            coupon = Coupon.objects.get(
                code=code,
                is_active=True
            )

            if order_total < coupon.min_order_amount:

                return Response(
                    {
                        'error':
                            f"Minimum order amount for coupon "
                            f"'{code}' is ₹"
                            f"{coupon.min_order_amount}"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if coupon.discount_type == 'PERCENTAGE':

                discount = (
                    order_total *
                    coupon.value
                ) / Decimal(100)

            else:

                discount = coupon.value

            return Response(
                {
                    'valid': True,
                    'code': coupon.code,
                    'discount_amount':
                        float(discount),
                    'discount_type':
                        coupon.discount_type,
                    'value':
                        float(coupon.value)
                }
            )

        except Coupon.DoesNotExist:

            return Response(
                {
                    'error':
                        'Invalid or expired coupon code.'
                },
                status=status.HTTP_404_NOT_FOUND
            )


# =========================================================
# PAYMENT & ORDERS
# =========================================================

class CreateRazorpayOrderView(views.APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request):

        try:

            data = request.data

            items_data = data.get(
                'items',
                []
            )

            if not items_data:

                return Response(
                    {
                        'error':
                            'No items selected for order.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            validated_items = []

            subtotal = Decimal('0')

            # -------------------------------------------------
            # VALIDATE PRODUCTS
            # -------------------------------------------------

            for item in items_data:

                product_id = item.get(
                    'product_id'
                )

                quantity = int(
                    item.get(
                        'quantity',
                        1
                    )
                )

                if not product_id:

                    return Response(
                        {
                            'error':
                                'Product ID is missing.'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if quantity < 1:

                    return Response(
                        {
                            'error':
                                'Quantity must be at least 1.'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                product = Product.objects.filter(
                    id=product_id
                ).first()

                if not product:

                    return Response(
                        {
                            'error':
                                f"Product '{product_id}' "
                                f"was not found."
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if product.stock < quantity:

                    return Response(
                        {
                            'error':
                                f"Only {product.stock} units "
                                f"of '{product.name}' are "
                                f"available."
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                discount_price = getattr(
                    product,
                    'discount_price',
                    None
                )

                normal_price = getattr(
                    product,
                    'price',
                    0
                )

                if discount_price is not None:

                    unit_price = Decimal(
                        str(discount_price)
                    )

                else:

                    unit_price = Decimal(
                        str(normal_price)
                    )

                subtotal += (
                    unit_price *
                    quantity
                )

                validated_items.append(
                    {
                        'product': product,
                        'quantity': quantity,
                        'price': unit_price
                    }
                )

            # -------------------------------------------------
            # DISCOUNT
            # -------------------------------------------------

            discount = Decimal(
                str(
                    data.get(
                        'discount_amount',
                        0
                    )
                )
            )

            if discount < 0:

                discount = Decimal('0')

            if discount > subtotal:

                discount = subtotal

            total = (
                subtotal -
                discount
            )

            amount_paise = int(
                total * 100
            )

            # -------------------------------------------------
            # RAZORPAY CONFIGURATION
            # -------------------------------------------------

            key_id = getattr(
                settings,
                'RAZORPAY_KEY_ID',
                ''
            )

            key_secret = getattr(
                settings,
                'RAZORPAY_KEY_SECRET',
                ''
            )

            is_mock = (
                not key_id
                or 'placeholder' in key_id.lower()
                or not key_secret
                or 'placeholder' in key_secret.lower()
            )

            # -------------------------------------------------
            # CREATE RAZORPAY ORDER
            # -------------------------------------------------

            if is_mock:

                razorpay_order_id = (
                    f"order_mock_"
                    f"{uuid.uuid4().hex[:12]}"
                )

            else:

                try:

                    client = razorpay.Client(
                        auth=(
                            key_id,
                            key_secret
                        )
                    )

                    razorpay_order = client.order.create(
                        {
                            'amount':
                                (
                                    amount_paise
                                    if amount_paise > 0
                                    else 100
                                ),
                            'currency':
                                'INR',
                            'payment_capture':
                                '1'
                        }
                    )

                    razorpay_order_id = (
                        razorpay_order['id']
                    )

                except Exception as e:

                    print(
                        f"[Razorpay Order Error] {e}"
                    )

                    razorpay_order_id = (
                        f"order_dev_"
                        f"{uuid.uuid4().hex[:12]}"
                    )

            # -------------------------------------------------
            # CREATE DATABASE ORDER
            # -------------------------------------------------

            order = Order.objects.create(

                full_name=data.get(
                    'full_name',
                    'Guest Parent'
                ),

                email=data.get(
                    'email',
                    'guest@fimiku.com'
                ),

                phone=data.get(
                    'phone',
                    '9876543210'
                ),

                shipping_address=data.get(
                    'shipping_address',
                    'Address'
                ),

                city=data.get(
                    'city',
                    'City'
                ),

                postal_code=data.get(
                    'postal_code',
                    '000000'
                ),

                state=data.get(
                    'state',
                    'State'
                ),

                total_amount=total,

                discount_amount=discount,

                razorpay_order_id=
                    razorpay_order_id,

                payment_status='INITIATED'
            )

            # -------------------------------------------------
            # CREATE ORDER ITEMS
            # -------------------------------------------------

            for item in validated_items:

                OrderItem.objects.create(

                    order=order,

                    product=item['product'],

                    product_name=
                        item['product'].name,

                    price=item['price'],

                    quantity=item['quantity']
                )

            # -------------------------------------------------
            # SUCCESS
            # -------------------------------------------------

            return Response(
                {
                    'order_id':
                        str(order.id),

                    'razorpay_order_id':
                        str(razorpay_order_id),

                    'amount':
                        amount_paise,

                    'currency':
                        'INR',

                    'key_id':
                        (
                            key_id
                            if key_id
                            else 'rzp_test_placeholder'
                        ),

                    'is_mock':
                        is_mock
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            print(
                f"[Order Creation Error] {e}"
            )

            return Response(
                {
                    'error':
                        f'Order creation failed: {str(e)}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )



# =========================================================
# CASH ON DELIVERY
# =========================================================

class CreateCODOrderView(views.APIView):
    """Create and confirm a Cash-on-Delivery order."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            data = request.data
            items_data = data.get('items', [])

            if not items_data:
                return Response(
                    {'error': 'No items selected for order.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            validated_items = []
            subtotal = Decimal('0')

            for item in items_data:
                product_id = item.get('product_id')

                try:
                    quantity = int(item.get('quantity', 1))
                except (TypeError, ValueError):
                    return Response(
                        {'error': 'Invalid product quantity.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if not product_id:
                    return Response(
                        {'error': 'Product ID is missing.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if quantity < 1:
                    return Response(
                        {'error': 'Quantity must be at least 1.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                product = Product.objects.filter(
                    id=product_id,
                    is_active=True
                ).first()

                if not product:
                    return Response(
                        {
                            'error':
                                f"Product '{product_id}' was not found."
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if product.stock < quantity:
                    return Response(
                        {
                            'error':
                                f"Only {product.stock} units of "
                                f"'{product.name}' are available."
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                discount_price = getattr(
                    product, 'discount_price', None
                )
                normal_price = getattr(
                    product, 'price', 0
                )

                unit_price = (
                    Decimal(str(discount_price))
                    if discount_price is not None
                    else Decimal(str(normal_price))
                )

                subtotal += unit_price * quantity

                validated_items.append({
                    'product': product,
                    'quantity': quantity,
                    'price': unit_price
                })

            try:
                discount = Decimal(
                    str(data.get('discount_amount', 0))
                )
            except Exception:
                discount = Decimal('0')

            discount = max(Decimal('0'), discount)
            discount = min(discount, subtotal)
            total = subtotal - discount

            order = Order.objects.create(
                full_name=data.get(
                    'full_name', 'Guest Parent'
                ),
                email=data.get(
                    'email', 'guest@fimiku.com'
                ),
                phone=data.get(
                    'phone', '9876543210'
                ),
                shipping_address=data.get(
                    'shipping_address', 'Address'
                ),
                city=data.get(
                    'city', 'City'
                ),
                postal_code=data.get(
                    'postal_code', '000000'
                ),
                state=data.get(
                    'state', 'State'
                ),
                total_amount=total,
                discount_amount=discount,
                razorpay_order_id=(
                    f"cod_{uuid.uuid4().hex[:16]}"
                ),
                payment_status='COD',
                order_status='PROCESSING'
            )

            for item in validated_items:
                OrderItem.objects.create(
                    order=order,
                    product=item['product'],
                    product_name=item['product'].name,
                    price=item['price'],
                    quantity=item['quantity']
                )

            for item in validated_items:
                product = item['product']
                product.stock = max(
                    0,
                    product.stock - item['quantity']
                )
                product.save(update_fields=['stock'])

            session_key = request.headers.get(
                'X-Session-Key'
            )

            if session_key:
                Cart.objects.filter(
                    session_key=session_key
                ).delete()

            try:
                sync_order_to_mongo(order)
            except Exception as e:
                print(
                    f"[MongoDB COD Sync Warning] {e}"
                )

            return Response(
                {
                    'status': 'COD Order Confirmed',
                    'message':
                        'Cash on Delivery order placed successfully.',
                    'order_id': str(order.id),
                    'payment_method': 'COD',
                    'payment_status':
                        str(order.payment_status),
                    'order_status':
                        str(order.order_status),
                    'total_amount':
                        float(order.total_amount),
                    'full_name': order.full_name,
                    'email': order.email,
                    'phone': order.phone,
                    'shipping_address':
                        order.shipping_address,
                    'city': order.city,
                    'state': order.state,
                    'postal_code':
                        order.postal_code
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            print(
                f"[COD Order Creation Error] {e}"
            )

            return Response(
                {
                    'error':
                        f'COD order creation failed: {str(e)}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )




# =========================================================
# VERIFY PAYMENT
# =========================================================

class VerifyPaymentView(views.APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request):

        razorpay_order_id = request.data.get(
            'razorpay_order_id'
        )

        razorpay_payment_id = request.data.get(
            'razorpay_payment_id',
            f"pay_mock_{uuid.uuid4().hex[:8]}"
        )

        razorpay_signature = request.data.get(
            'razorpay_signature'
        )

        try:

            order = Order.objects.get(
                razorpay_order_id=
                    razorpay_order_id
            )

        except Order.DoesNotExist:

            return Response(
                {
                    'error':
                        'Order not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # -------------------------------------------------
        # RAZORPAY CONFIGURATION
        # -------------------------------------------------

        key_id = getattr(
            settings,
            'RAZORPAY_KEY_ID',
            ''
        )

        key_secret = getattr(
            settings,
            'RAZORPAY_KEY_SECRET',
            ''
        )

        is_sandbox_mock = (
            not key_id
            or 'placeholder' in key_id.lower()
            or not key_secret
            or 'placeholder' in key_secret.lower()
        )

        # -------------------------------------------------
        # VERIFY RAZORPAY PAYMENT
        # -------------------------------------------------

        if (
            not is_sandbox_mock
            and razorpay_signature
        ):

            try:

                client = razorpay.Client(
                    auth=(
                        key_id,
                        key_secret
                    )
                )

                client.utility.verify_payment_signature(
                    {
                        'razorpay_order_id':
                            razorpay_order_id,

                        'razorpay_payment_id':
                            razorpay_payment_id,

                        'razorpay_signature':
                            razorpay_signature
                    }
                )

            except Exception as e:

                print(
                    f"[Razorpay Verification Error] {e}"
                )

                return Response(
                    {
                        'error':
                            'Payment signature '
                            f'verification failed: {str(e)}'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # -------------------------------------------------
        # MARK ORDER AS PAID
        # -------------------------------------------------

        order.payment_status = 'PAID'

        order.order_status = 'PROCESSING'

        order.razorpay_payment_id = (
            razorpay_payment_id
        )

        order.save()

        # -------------------------------------------------
        # DEDUCT INVENTORY
        # -------------------------------------------------

        for item in order.items.all():

            if item.product:

                item.product.stock = max(
                    0,
                    item.product.stock -
                    item.quantity
                )

                item.product.save()

        # -------------------------------------------------
        # CLEAR GUEST CART
        # -------------------------------------------------

        session_key = request.headers.get(
            'X-Session-Key'
        )

        if session_key:

            Cart.objects.filter(
                session_key=session_key
            ).delete()

        # -------------------------------------------------
        # SYNC ORDER TO MONGODB
        # -------------------------------------------------

        try:

            sync_order_to_mongo(
                order
            )

        except Exception as e:

            # Do not make a successful payment
            # look like a failed payment just
            # because MongoDB sync failed.

            print(
                f"[MongoDB Sync Warning] {e}"
            )

        # -------------------------------------------------
        # PAYMENT SUCCESS RESPONSE
        #
        # IMPORTANT:
        # Do NOT serialize the entire Order object here.
        # Mongo/ObjectId based IDs can cause a 500.
        # -------------------------------------------------

        return Response(
            {
                'status':
                    'Payment Verified Successfully',

                'message':
                    'Order placed successfully',

                'order_id':
                    str(order.id),

                'razorpay_order_id':
                    str(order.razorpay_order_id),

                'razorpay_payment_id':
                    str(
                        order.razorpay_payment_id
                    ),

                'payment_status':
                    str(order.payment_status),

                'order_status':
                    str(order.order_status)
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# ORDER LIST
# =========================================================

class OrderListView(generics.ListAPIView):

    serializer_class = OrderSerializer

    permission_classes = [
        permissions.AllowAny
    ]

    def get_queryset(self):

        email_param = (
            self.request
            .query_params
            .get(
                'email',
                ''
            )
            .strip()
        )

        if email_param:

            return (
                Order.objects
                .filter(
                    email__iexact=email_param
                )
                .prefetch_related(
                    'items__product'
                )
                .order_by(
                    '-created_at'
                )
            )

        return Order.objects.none()


class OrderDetailView(generics.RetrieveAPIView):

    serializer_class = OrderSerializer

    lookup_field = 'id'

    permission_classes = [
        permissions.AllowAny
    ]

    def get_queryset(self):

        return (
            Order.objects
            .all()
            .prefetch_related(
                'items__product'
            )
        )


# =========================================================
# REVIEWS
# =========================================================

class ReviewCreateView(views.APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):

        product_id = request.data.get(
            'product_id'
        )

        rating = request.data.get(
            'rating'
        )

        comment = request.data.get(
            'comment'
        )

        product = get_object_or_404(
            Product,
            id=product_id
        )

        review = Review.objects.create(
            product=product,
            rating=rating,
            comment=comment
        )

        return Response(
            ReviewSerializer(
                review
            ).data,
            status=status.HTTP_201_CREATED
        )


# =========================================================
# AI ASSISTANT
# =========================================================

class AIAssistantView(views.APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request):

        prompt = request.data.get(
            'prompt',
            ''
        ).strip()

        if not prompt:

            return Response(
                {
                    'error':
                        'Question prompt is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        response_text = (
            query_fimiku_assistant(
                prompt
            )
        )

        return Response(
            {
                'reply':
                    response_text
            }
        )


# =========================================================
# ADMIN QUICK STATS
# =========================================================

class AdminStatsView(views.APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def get(self, request):

        total_products = (
            Product.objects.count()
        )

        total_orders = (
            Order.objects.count()
        )

        total_revenue = sum(
            o.total_amount
            for o in Order.objects.filter(
                payment_status='PAID'
            )
        )

        low_stock = (
            Product.objects
            .filter(
                stock__lte=10,
                is_active=True
            )
            .values(
                'id',
                'name',
                'stock'
            )
        )

        return Response(
            {
                'total_products':
                    total_products,

                'total_orders':
                    total_orders,

                'total_revenue':
                    float(
                        total_revenue
                    ),

                'low_stock_count':
                    low_stock.count(),

                'low_stock_products':
                    list(low_stock)
            }
        )
    # =========================================================
# ONE-TIME PRODUCT IMAGE UPDATE
# =========================================================

class UpdateProductImagesView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        key = request.query_params.get("key")

        if key != os.environ.get("SEED_PRODUCTS_KEY", "fimiku-update-2026"):
            return Response(
                {"error": "Invalid key"},
                status=status.HTTP_403_FORBIDDEN
            )

        base = "https://www.fimiku.com/products/"

        updates = {
            "SILICONE BABY FEEDING SET":
                base + "04_silicone_baby_feeding_set/image17.jpeg",

            "SILICONE KITCHEN MAT":
                base + "03_silicone_kitchen_mat/image12.png",

            "3 in 1 Pet slow feeder bowl":
                base + "02_pet_slow_feeder_bowl_3in1/image5.png",
        }

        updated = []

        for name, image in updates.items():
            products = Product.objects.filter(name=name)

            for product in products:
                product.image_url = image
                product.save()
                updated.append({
                    "name": product.name,
                    "image_url": product.image_url
                })

        return Response({
            "status": "success",
            "updated": updated
        })