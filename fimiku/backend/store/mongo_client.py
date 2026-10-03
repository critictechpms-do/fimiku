import os
import certifi
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

try:
    import dns.resolver

    custom_resolver = dns.resolver.Resolver(configure=True)
    custom_resolver.nameservers = ['8.8.8.8', '1.1.1.1', '8.8.4.4']
    dns.resolver.default_resolver = custom_resolver
except Exception:
    pass


_mongo_client = None


def get_mongo_client():
    """
    Returns a singleton PyMongo client connected to MongoDB Atlas or local MongoDB.
    Uses certifi for trusted TLS/SSL certificates on Windows & cloud environments.
    """
    global _mongo_client

    if _mongo_client is not None:
        return _mongo_client

    mongo_uri = os.getenv('MONGODB_URI', '').strip()

    if not mongo_uri:
        return None

    try:
        _mongo_client = MongoClient(
            mongo_uri,
            tlsCAFile=certifi.where() if 'mongodb+srv' in mongo_uri else None,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
        )

        return _mongo_client

    except Exception as e:
        print(f"[MongoDB] Client initialization warning: {e}")
        return None


def get_mongo_db():
    """
    Returns the MongoDB database instance.
    Default database: fimiku_db
    """
    client = get_mongo_client()

    if client is None:
        return None

    db_name = os.getenv('MONGODB_DB_NAME', 'fimiku_db')

    return client[db_name]


def test_mongo_connection():
    """
    Tests MongoDB Atlas connectivity and returns ping status.
    """
    client = get_mongo_client()

    if client is None:
        return {
            "connected": False,
            "error": "MONGODB_URI is not set in backend/.env"
        }

    try:
        client.admin.command('ping')

        server_info = client.server_info()

        return {
            "connected": True,
            "version": server_info.get('version', 'unknown'),
            "database": os.getenv('MONGODB_DB_NAME', 'fimiku_db')
        }

    except ConnectionFailure as e:
        return {
            "connected": False,
            "error": f"Connection failed: {str(e)}"
        }

    except OperationFailure as e:
        return {
            "connected": False,
            "error": f"Authentication failed: {str(e)}"
        }

    except Exception as e:
        return {
            "connected": False,
            "error": str(e)
        }


def sync_user_to_mongo(user):
    """
    Syncs a Django user into MongoDB Atlas 'users' collection
    with encrypted password hash.
    """
    db = get_mongo_db()

    if db is None:
        return

    try:
        users_col = db['users']

        users_col.update_one(
            {"django_id": user.id},
            {
                "$set": {
                    "django_id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "password_hash": user.password,
                    "is_active": user.is_active,
                    "is_staff": user.is_staff,
                    "date_joined": user.date_joined,
                    "last_login": user.last_login,
                }
            },
            upsert=True
        )

    except Exception as e:
        print(f"[MongoDB User Sync Error] {e}")


def sync_wishlist_to_mongo(wishlist):
    """
    Syncs a user's wishlist into MongoDB Atlas 'wishlists' collection.
    """
    db = get_mongo_db()

    if db is None:
        return

    try:
        wishlist_col = db['wishlists']

        wishlist_col.update_one(
            {"id": wishlist.id},
            {
                "$set": {
                    "id": wishlist.id,
                    "user_id": wishlist.user_id,
                    "session_key": wishlist.session_key,
                    "product_ids": list(
                        wishlist.products.values_list('id', flat=True)
                    ),
                    "updated_at": wishlist.created_at,
                }
            },
            upsert=True
        )

    except Exception as e:
        print(f"[MongoDB Wishlist Sync Error] {e}")


def sync_order_to_mongo(order):
    """
    Syncs a Django order and its items into MongoDB Atlas.

    IMPORTANT:
    The Fimiku Order model does not expose order.user_id.
    Therefore we safely check whether a user relationship exists.
    """

    db = get_mongo_db()

    if db is None:
        return

    try:
        orders_col = db['orders']

        # ---------------------------------------------------------
        # Safely get the Django user if the Order model has one.
        # This prevents:
        # 'Order' object has no attribute 'user_id'
        # ---------------------------------------------------------
        user = getattr(order, 'user', None)

        if user is not None:
            django_user_id = getattr(user, 'id', None)
        else:
            django_user_id = None

        # ---------------------------------------------------------
        # Build order data
        # ---------------------------------------------------------
        order_data = {
            "id": order.id,

            # Safe user information
            "user_id": django_user_id,

            "full_name": order.full_name,
            "email": order.email,
            "phone": order.phone,

            "shipping_address": order.shipping_address,
            "city": order.city,
            "state": order.state,
            "postal_code": order.postal_code,

            "total_amount": float(order.total_amount),
            "discount_amount": float(order.discount_amount),

            "payment_status": order.payment_status,
            "order_status": order.order_status,

            "razorpay_order_id": order.razorpay_order_id,

            "created_at": order.created_at,

            "items": [
                {
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "price": float(item.price),
                    "quantity": item.quantity,
                    "subtotal": float(item.subtotal())
                }
                for item in order.items.all()
            ]
        }

        # ---------------------------------------------------------
        # Save / update order in MongoDB
        # ---------------------------------------------------------
        orders_col.update_one(
            {"id": order.id},
            {
                "$set": order_data
            },
            upsert=True
        )

        print(
            f"[MongoDB] Order {order.id} synced successfully."
        )

    except Exception as e:
        print(f"[MongoDB Order Sync Error] {e}")


def sync_catalog_to_mongo():
    """
    Syncs Django relational database products, categories,
    coupons, users, wishlists, and orders into MongoDB Atlas.
    """

    db = get_mongo_db()

    if db is None:
        return (
            False,
            "MongoDB Atlas not configured or connected."
        )

    try:
        from django.contrib.auth.models import User
        from store.models import (
            Category,
            Product,
            Coupon,
            Wishlist,
            Order
        )

        # =========================================================
        # SYNC USERS
        # =========================================================

        for user in User.objects.all():
            sync_user_to_mongo(user)

        # =========================================================
        # SYNC CATEGORIES
        # =========================================================

        categories_col = db['categories']

        for cat in Category.objects.all():

            categories_col.update_one(
                {"id": cat.id},
                {
                    "$set": {
                        "id": cat.id,
                        "name": cat.name,
                        "slug": cat.slug,
                        "description": cat.description,
                        "image_url": cat.image_url,
                    }
                },
                upsert=True
            )

        # =========================================================
        # SYNC PRODUCTS
        # =========================================================

        products_col = db['products']

        for p in Product.objects.all():

            products_col.update_one(
                {"id": p.id},
                {
                    "$set": {
                        "id": p.id,
                        "name": p.name,
                        "slug": p.slug,
                        "category_id": p.category_id,
                        "category_name": (
                            p.category.name
                            if p.category
                            else ""
                        ),
                        "description": p.description,
                        "features": p.features,
                        "material": p.material,
                        "target_age": p.target_age,
                        "price": float(p.price),

                        "discount_price": (
                            float(p.discount_price)
                            if p.discount_price
                            else None
                        ),

                        "final_price": float(p.final_price),

                        "stock": p.stock,
                        "sku": p.sku,
                        "image_url": p.image_url,

                        "is_active": p.is_active,
                        "is_featured": p.is_featured,
                    }
                },
                upsert=True
            )

        # =========================================================
        # SYNC COUPONS
        # =========================================================

        coupons_col = db['coupons']

        for c in Coupon.objects.all():

            coupons_col.update_one(
                {"code": c.code},
                {
                    "$set": {
                        "code": c.code,
                        "discount_type": c.discount_type,
                        "value": float(c.value),
                        "min_order_amount": float(
                            c.min_order_amount
                        ),
                        "is_active": c.is_active,
                    }
                },
                upsert=True
            )

        # =========================================================
        # SYNC WISHLISTS
        # =========================================================

        for w in Wishlist.objects.all():
            sync_wishlist_to_mongo(w)

        # =========================================================
        # SYNC ORDERS
        # =========================================================

        for o in Order.objects.all():
            sync_order_to_mongo(o)

        return (
            True,
            "Successfully synced all catalog data to MongoDB Atlas!"
        )

    except Exception as e:
        return (
            False,
            f"Sync error: {str(e)}"
        )