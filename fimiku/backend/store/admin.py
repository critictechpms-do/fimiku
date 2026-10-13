import json

from django import forms
from django.contrib import admin
from django.db import models
from django.utils.html import format_html

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


class ProductAdminForm(forms.ModelForm):
    """Make the product image gallery easier to edit in Django Admin."""

    class Meta:
        model = Product
        fields = "__all__"
        widgets = {
            "additional_images": forms.Textarea(
                attrs={"rows": 6, "style": "width: 100%; font-family: monospace;"}
            ),
        }
        help_texts = {
            "image_url": "Main product image URL or path, for example: /products/baby-feeding-set.webp",
            "additional_images": (
                "Enter a JSON list of 2–3 extra image paths/URLs. Example: "
                '["/products/baby-feeding-set-side.webp", '
                '"/products/baby-feeding-set-detail.webp", '
                '"/products/baby-feeding-set-back.webp"]. '
                "Use real image files/URLs that exist."
            ),
        }


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = (
        "name",
        "category",
        "price",
        "discount_price",
        "stock",
        "gallery_image_count",
        "is_active",
        "is_featured",
    )
    list_filter = ("category", "is_active", "is_featured")
    search_fields = ("name", "sku", "description")
    prepopulated_fields = {"slug": ("name",)}

    @admin.display(description="Gallery images")
    def gallery_image_count(self, obj):
        extra_images = obj.additional_images if isinstance(obj.additional_images, list) else []
        count = len([image for image in extra_images if image]) + (1 if obj.image_url else 0)
        return count


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "full_name",
        "email",
        "total_amount",
        "payment_status",
        "order_status",
        "created_at",
    )
    list_filter = ("payment_status", "order_status", "created_at")
    search_fields = ("full_name", "email", "razorpay_order_id")
    inlines = [OrderItemInline]


admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Wishlist)
admin.site.register(Coupon)
admin.site.register(Review)
