import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fimiku_core.settings")
django.setup()

from store.models import Category, Product, Coupon


# =========================================================
# CATEGORY HELPER
# =========================================================

def get_category(slug, name, description, image_url):

    category = Category.objects.filter(slug=slug).first()

    if category:
        print(f"[Category Exists] {name}")
        return category

    category = Category.objects.create(
        name=name,
        slug=slug,
        description=description,
        image_url=image_url
    )

    print(f"[Category Created] {name}")

    return category


# =========================================================
# PRODUCT HELPER
# =========================================================

def create_or_update_product(product_data):

    sku = product_data["sku"]

    product = Product.objects.filter(sku=sku).first()

    if product:

        for field, value in product_data.items():
            setattr(product, field, value)

        product.save()

        print(f"[Product Updated] {product.name} | {sku}")

        return "updated"

    Product.objects.create(**product_data)

    print(f"[Product Created] {product_data['name']} | {sku}")

    return "created"


# =========================================================
# COUPON HELPER
# =========================================================

def create_coupon_if_missing(
    code,
    discount_type,
    value,
    min_order_amount
):

    coupon = Coupon.objects.filter(code=code).first()

    if coupon:
        print(f"[Coupon Exists] {code}")
        return

    Coupon.objects.create(
        code=code,
        discount_type=discount_type,
        value=value,
        min_order_amount=min_order_amount,
        is_active=True
    )

    print(f"[Coupon Created] {code}")


# =========================================================
# MAIN
# =========================================================

def seed_database():

    print("")
    print("================================================")
    print("[FIMIKU] Updating database")
    print("================================================")
    print("")

    # =====================================================
    # CATEGORIES
    # =====================================================

    cat_teethers = get_category(
        "teethers",
        "Teething Toys",
        "Textured, pure food-grade silicone teethers to gently calm tender gums.",
        "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600"
    )

    cat_bath = get_category(
        "bath",
        "Bath Toys",
        "Mold-free silicone bath animals, boats, and floating shapes.",
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=600"
    )

    cat_feeding = get_category(
        "feeding",
        "Feeding Accessories",
        "Ergonomic silicone suction plates, bowls, soft-tip spoons, and slow feeders.",
        "https://images.unsplash.com/photo-1584839619925-3e41416f393f?auto=format&fit=crop&q=80&w=600"
    )

    cat_sensory = get_category(
        "sensory",
        "Sensory Play",
        "Tactile geometric blocks, rainbow stackers, and sensory learning sets.",
        "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600"
    )

    cat_babyplay = get_category(
        "baby-play",
        "Baby Play",
        "Soft, safe silicone exploration toys for infants and toddlers.",
        "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600"
    )

    cat_pets = get_category(
        "pets",
        "Pet Toys",
        "Durable, safe silicone chew toys and slow feeder accessories.",
        "https://images.unsplash.com/photo-1584839619925-3e41416f393f?auto=format&fit=crop&q=80&w=600"
    )

    cat_kitchen = get_category(
        "kitchen",
        "Kitchen Silicone",
        "Multi-purpose heat-resistant silicone mats, utensils, and organizers.",
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=600"
    )

    # =====================================================
    # PRODUCT IMAGE BASE URL
    # =====================================================

    BASE = "https://www.fimiku.com/products"

    # =====================================================
    # PRODUCTS
    # =====================================================

    products_data = [

        # =================================================
        # PET SLOW FEEDER
        # =================================================

        {
            "category": cat_feeding,

            "name": "3 in 1 Pet slow feeder bowl",

            "slug": "3-in-1-pet-slow-feeder-bowl",

            "description": (
                "Multi-purpose silicone slow feeder bowl "
                "with water and dry food partitions. "
                "Promotes healthy digestion and easy cleaning."
            ),

            "features": [
                "100% Food-Grade Silicone",
                "Anti-skid suction base",
                "Dishwasher safe & heat proof",
                "Dual-compartment slow digestion design"
            ],

            "material": "100% Food-Grade Platinum Silicone",

            "target_age": "All Ages",

            "price": 1422.00,

            "discount_price": 711.02,

            "stock": 80,

            "sku": "FIM-FEE-PET-01",

            "image_url":
                f"{BASE}/02_pet_slow_feeder_bowl_3in1/image11.jpeg",

            "additional_images": [
                f"{BASE}/02_pet_slow_feeder_bowl_3in1/image10.jpeg",
                f"{BASE}/02_pet_slow_feeder_bowl_3in1/image5.png",
                f"{BASE}/02_pet_slow_feeder_bowl_3in1/image6.png",
                f"{BASE}/02_pet_slow_feeder_bowl_3in1/image7.png",
                f"{BASE}/02_pet_slow_feeder_bowl_3in1/image8.jpeg",
                f"{BASE}/02_pet_slow_feeder_bowl_3in1/image9.jpeg"
            ],

            "is_featured": True
        },

        # =================================================
        # KITCHEN MAT
        # =================================================

        {
            "category": cat_kitchen,

            "name": "SILICONE KITCHEN MAT",

            "slug": "silicone-kitchen-mat",

            "description": (
                "Multi-purpose heat-resistant silicone drying "
                "and prep mat. Quick drying, non-slip, "
                "and effortless to sanitize."
            ),

            "features": [
                "Heat resistant up to 230°C",
                "Food safe & BPA-free",
                "Quick-drain ridge design",
                "Compact roll-up storage"
            ],

            "material": "100% Food-Grade Silicone",

            "target_age": "All Ages",

            "price": 1544.00,

            "discount_price": 772.38,

            "stock": 65,

            "sku": "FIM-KIT-01",

            "image_url":
                f"{BASE}/03_silicone_kitchen_mat/image14.jpeg",

            "additional_images": [
                f"{BASE}/03_silicone_kitchen_mat/image15.jpeg",
                f"{BASE}/03_silicone_kitchen_mat/image16.jpeg",
                f"{BASE}/03_silicone_kitchen_mat/image12.png",
                f"{BASE}/03_silicone_kitchen_mat/image13.png"
            ],

            "is_featured": True
        },

        # =================================================
        # BABY FEEDING SET
        # =================================================

        {
            "category": cat_feeding,

            "name": "SILICONE BABY FEEDING SET",

            "slug": "silicone-baby-feeding-set",

            "description": (
                "Complete self-feeding starter set including "
                "suction bowl, adjustable catch bib, ergonomic "
                "spoon and easy-grip training cup."
            ),

            "features": [
                "Ultra-strong suction lock",
                "Soft gum-friendly spoon",
                "Deep spill-prevention bib pocket",
                "Microwave & dishwasher safe"
            ],

            "material": "100% Platinum Food-Grade Silicone",

            "target_age": "6m+",

            "price": 1723.00,

            "discount_price": 861.50,

            "stock": 90,

            "sku": "FIM-FEE-SET-01",

            "image_url":
                f"{BASE}/04_silicone_baby_feeding_set/image19.png",

            "additional_images": [
                f"{BASE}/04_silicone_baby_feeding_set/image17.jpeg",
                f"{BASE}/04_silicone_baby_feeding_set/image18.png",
                f"{BASE}/04_silicone_baby_feeding_set/image20.png",
                f"{BASE}/04_silicone_baby_feeding_set/image21.jpeg",
                f"{BASE}/04_silicone_baby_feeding_set/image22.jpeg",
                f"{BASE}/04_silicone_baby_feeding_set/image23.jpeg",
                f"{BASE}/04_silicone_baby_feeding_set/image24.jpeg",
                f"{BASE}/04_silicone_baby_feeding_set/image25.jpeg",
                f"{BASE}/04_silicone_baby_feeding_set/image26.png",
                f"{BASE}/04_silicone_baby_feeding_set/image27.png",
                f"{BASE}/04_silicone_baby_feeding_set/image28.png",
                f"{BASE}/04_silicone_baby_feeding_set/image29.png",
                f"{BASE}/04_silicone_baby_feeding_set/image30.png",
                f"{BASE}/04_silicone_baby_feeding_set/image31.png",
                f"{BASE}/04_silicone_baby_feeding_set/image32.png",
                f"{BASE}/04_silicone_baby_feeding_set/image33.png",
                f"{BASE}/04_silicone_baby_feeding_set/image34.png"
            ],

            "is_featured": True
        },

        # =================================================
        # FOLDABLE BASKET
        # =================================================

        {
            "category": cat_kitchen,

            "name": "SILICON FOLDABLE BASKET",

            "slug": "silicon-foldable-basket",

            "description": (
                "Easily foldable- occupy less storage space, "
                "24L capacity, high durability."
            ),

            "features": [
                "Easily foldable",
                "Occupies less storage space",
                "24L capacity",
                "High durability",
                "Colour available: Pink"
            ],

            "material": "Silicone",

            "target_age": "All Ages",

            "price": 1089.34,

            "discount_price": None,

            "stock": 10,

            "sku": "FIM-BASKET-01",

            "image_url":
                f"{BASE}/01_silicone_foldable_basket/image3.jpeg",

            "additional_images": [
                f"{BASE}/01_silicone_foldable_basket/image1.png",
                f"{BASE}/01_silicone_foldable_basket/image2.jpeg",
                f"{BASE}/01_silicone_foldable_basket/image4.jpeg"
            ],

            "is_featured": True
        },

        # =================================================
        # FOLDABLE TUB
        # =================================================

        {
            "category": cat_bath,

            "name": "SILICONE FOLDABLE TUB",

            "slug": "silicone-foldable-tub",

            "description": (
                "Compact collapsible silicone infant bathtub "
                "with temperature-sensing drain plug. Safe, "
                "ergonomic, and mold-resistant."
            ),

            "features": [
                "Space-saving collapsible fold",
                "Mold-resistant seamless silicone",
                "Non-slip base support",
                "Built-in temperature plug"
            ],

            "material": "100% Premium Silicone & Food-Grade PP",

            "target_age": "0 - 36m",

            "price": 2200.00,

            "discount_price": 1089.34,

            "stock": 35,

            "sku": "FIM-BAT-01",

            "image_url":
                "https://images.unsplash.com/"
                "photo-1519689680058-324335c77eba"
                "?auto=format&fit=crop&q=80&w=800",

            "is_featured": True
        },

        # =================================================
        # KOALA TEETHING RING
        # =================================================

        {
            "category": cat_teethers,

            "name": "Fimiku Koala Grip Textured Teething Ring",

            "slug": "koala-textured-teething-ring",

            "description": (
                "Ergonomically engineered for tiny hands to "
                "grasp with ease. Multi-surface massage beads "
                "soothe inflamed gums during first teeth emergence."
            ),

            "features": [
                "100% Platinum Food-Grade Silicone",
                "Ergonomic dual-grip handles",
                "Freezer-chilling safe",
                "Dishwasher & boil-safe"
            ],

            "material":
                "100% Food-Grade Silicone "
                "(BPA, PVC, Phthalate Free)",

            "target_age": "0 - 12m",

            "price": 499.00,

            "discount_price": 399.00,

            "stock": 120,

            "sku": "FIM-TEE-01",

            "image_url":
                "https://images.unsplash.com/"
                "photo-1596461404969-9ae70f2830c1"
                "?auto=format&fit=crop&q=80&w=800",

            "is_featured": True
        },

        # =================================================
        # STACKING TOWER
        # =================================================

        {
            "category": cat_sensory,

            "name": "Pastel Geometric Silicone Stacking Tower",

            "slug": "pastel-silicone-stacking-tower",

            "description": (
                "A 7-tier Montessori-inspired silicone "
                "stacking set designed for fine motor development, "
                "tactile exploration, and teeth soothing."
            ),

            "features": [
                "Soft chewable rings",
                "Graduated sizing for motor logic",
                "Zero hidden hollows — mold-free water play",
                "Muted pastel palette"
            ],

            "material": "100% Food-Grade Silicone",

            "target_age": "1 - 3 Years",

            "price": 799.00,

            "discount_price": 649.00,

            "stock": 60,

            "sku": "FIM-SEN-01",

            "image_url":
                "https://images.unsplash.com/"
                "photo-1515488042361-ee00e0ddd4e4"
                "?auto=format&fit=crop&q=80&w=800",

            "is_featured": True
        }
    ]

    # =====================================================
    # CREATE / UPDATE PRODUCTS
    # =====================================================

    created_count = 0
    updated_count = 0

    print("")
    print("------------------------------------------------")
    print("Processing products...")
    print("------------------------------------------------")

    for product_data in products_data:

        result = create_or_update_product(product_data)

        if result == "created":
            created_count += 1

        elif result == "updated":
            updated_count += 1

    # =====================================================
    # COUPONS
    # =====================================================

    print("")
    print("------------------------------------------------")
    print("Processing coupons...")
    print("------------------------------------------------")

    create_coupon_if_missing(
        "FIMIKU10",
        "PERCENTAGE",
        10.00,
        200.00
    )

    create_coupon_if_missing(
        "WELCOME50",
        "FIXED",
        50.00,
        300.00
    )

    # =====================================================
    # FINAL RESULT
    # =====================================================

    print("")
    print("================================================")
    print("[SUCCESS] FIMIKU DATABASE UPDATE COMPLETE")
    print("================================================")
    print(f"Products created : {created_count}")
    print(f"Products updated : {updated_count}")
    print("No duplicate products were created.")
    print("================================================")
    print("")


if __name__ == "__main__":
    seed_database()