from django.contrib.auth.models import User
from rest_framework import serializers

from .mongo_client import sync_user_to_mongo

from .models import (
    Category,
    Product,
    Cart,
    CartItem,
    Wishlist,
    Coupon,
    Order,
    OrderItem,
    Review,
)


class ObjectIdField(serializers.CharField):
    def to_representation(self, value):
        return str(value)

    def to_internal_value(self, data):
        return str(data)


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
        )

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )

        sync_user_to_mongo(user)

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
        )


class CategorySerializer(serializers.ModelSerializer):
    id = ObjectIdField(read_only=True)
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "image_url",
            "products_count",
        )

    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ReviewSerializer(serializers.ModelSerializer):
    id = ObjectIdField(read_only=True)
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        pk_field=ObjectIdField()
    )

    class Meta:
        model = Review
        fields = (
            "id",
            "product",
            "rating",
            "comment",
            "created_at",
        )
        read_only_fields = (
            "id",
            "created_at",
        )


class ProductSerializer(serializers.ModelSerializer):
    id = ObjectIdField(read_only=True)

    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        pk_field=ObjectIdField()
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    category_slug = serializers.CharField(
        source="category.slug",
        read_only=True
    )

    reviews = ReviewSerializer(
        many=True,
        read_only=True
    )

    average_rating = serializers.FloatField(
        read_only=True
    )

    final_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    is_in_stock = serializers.BooleanField(
        read_only=True
    )

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "category",
            "category_name",
            "category_slug",
            "description",
            "features",
            "material",
            "target_age",
            "price",
            "discount_price",
            "final_price",
            "stock",
            "sku",
            "image_url",
            "additional_images",
            "is_active",
            "is_featured",
            "is_in_stock",
            "average_rating",
            "reviews",
            "created_at",
        )


class CartItemSerializer(serializers.ModelSerializer):
    id = ObjectIdField(read_only=True)

    product = ProductSerializer(
        read_only=True
    )

    product_id = serializers.CharField(
        write_only=True
    )

    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product",
            "product_id",
            "quantity",
            "subtotal",
        )

    def get_subtotal(self, obj):
        return obj.subtotal()


class CartSerializer(serializers.ModelSerializer):
    id = ObjectIdField(read_only=True)

    items = CartItemSerializer(
        many=True,
        read_only=True
    )

    total = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = (
            "id",
            "items",
            "total",
            "item_count",
        )

    def get_total(self, obj):
        return sum(
            item.subtotal()
            for item in obj.items.all()
        )

    def get_item_count(self, obj):
        return sum(
            item.quantity
            for item in obj.items.all()
        )


class WishlistSerializer(serializers.ModelSerializer):
    id = ObjectIdField(read_only=True)

    products = ProductSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Wishlist
        fields = (
            "id",
            "products",
        )


class CouponSerializer(serializers.ModelSerializer):
    id = ObjectIdField(read_only=True)

    class Meta:
        model = Coupon
        fields = (
            "id",
            "code",
            "discount_type",
            "value",
            "min_order_amount",
            "is_active",
        )


class OrderItemSerializer(serializers.ModelSerializer):
    id = ObjectIdField(read_only=True)

    subtotal = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    product_slug = serializers.SerializerMethodField()

    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        pk_field=ObjectIdField()
    )

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_name",
            "price",
            "quantity",
            "subtotal",
            "image_url",
            "product_slug",
        )

    def get_subtotal(self, obj):
        return obj.subtotal()

    def get_image_url(self, obj):
        if obj.product and obj.product.image_url:
            return obj.product.image_url
        return ""

    def get_product_slug(self, obj):
        if obj.product and obj.product.slug:
            return obj.product.slug
        return ""


class OrderSerializer(serializers.ModelSerializer):
    id = ObjectIdField(read_only=True)

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Order
        fields = (
            "id",
            "full_name",
            "email",
            "phone",
            "shipping_address",
            "city",
            "postal_code",
            "state",
            "total_amount",
            "discount_amount",
            "razorpay_order_id",
            "razorpay_payment_id",
            "payment_status",
            "order_status",
            "items",
            "created_at",
        )