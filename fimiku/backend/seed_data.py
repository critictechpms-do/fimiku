import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fimiku_core.settings')
django.setup()

from store.models import Category, Product, Coupon


def seed_database():
    print("[Seeding] Seeding Fimiku baby catalog...")

    # Clear existing categories, products & coupons for fresh seed
    Category.objects.all().delete()
    Product.objects.all().delete()
    Coupon.objects.all().delete()

    # Categories
    cat_teethers = Category.objects.create(
        name="Teething Toys",
        slug="teethers",
        description="Textured, pure food-grade silicone teethers to gently calm tender gums.",
        image_url="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600"
    )

    cat_bath = Category.objects.create(
        name="Bath Toys",
        slug="bath",
        description="Mold-free silicone bath animals, boats, and floating shapes.",
        image_url="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=600"
    )

    cat_feeding = Category.objects.create(
        name="Feeding Accessories",
        slug="feeding",
        description="Ergonomic silicone suction plates, bowls, soft-tip spoons, and slow feeders.",
        image_url="https://images.unsplash.com/photo-1584839619925-3e41416f393f?auto=format&fit=crop&q=80&w=600"
    )

    cat_sensory = Category.objects.create(
        name="Sensory Play",
        slug="sensory",
        description="Tactile geometric blocks, rainbow stackers, and sensory learning sets.",
        image_url="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600"
    )

    cat_babyplay = Category.objects.create(
        name="Baby Play",
        slug="baby-play",
        description="Soft, safe silicone exploration toys for infants and toddlers.",
        image_url="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600"
    )

    cat_pets = Category.objects.create(
        name="Pet Toys",
        slug="pets",
        description="Durable, safe silicone chew toys and slow feeder accessories.",
        image_url="https://images.unsplash.com/photo-1584839619925-3e41416f393f?auto=format&fit=crop&q=80&w=600"
    )

    cat_kitchen = Category.objects.create(
        name="Kitchen Silicone",
        slug="kitchen",
        description="Multi-purpose heat-resistant silicone mats, utensils, and organizers.",
        image_url="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=600"
    )

    products_data = [
        {
            "category": cat_feeding,
            "name": "3 in 1 Pet slow feeder bowl",
            "slug": "3-in-1-pet-slow-feeder-bowl",
            "description": "Multi-purpose silicone slow feeder bowl with water and dry food partitions. Promotes healthy digestion and easy cleaning.",
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
            "image_url": "https://images.unsplash.com/photo-1584839619925-3e41416f393f?auto=format&fit=crop&q=80&w=800",
            "is_featured": True
        },
        {
            "category": cat_kitchen,
            "name": "SILICONE KITCHEN MAT",
            "slug": "silicone-kitchen-mat",
            "description": "Multi-purpose heat-resistant silicone drying and prep mat. Quick drying, non-slip, and effortless to sanitize.",
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
            "image_url": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800",
            "is_featured": True
        },
        {
            "category": cat_feeding,
            "name": "SILICONE BABY FEEDING SET",
            "slug": "silicone-baby-feeding-set",
            "description": "Complete self-feeding starter set including suction bowl, adjustable catch bib, ergonomic spoon and easy-grip training cup.",
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
            "image_url": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800",
            "is_featured": True
        },
        {
            "category": cat_bath,
            "name": "SILICONE FOLDABLE TUB",
            "slug": "silicone-foldable-tub",
            "description": "Compact collapsible silicone infant bathtub with temperature-sensing drain plug. Safe, ergonomic, and mold-resistant.",
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
            "image_url": "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800",
            "is_featured": True
        },
        {
            "category": cat_teethers,
            "name": "Fimiku Koala Grip Textured Teething Ring",
            "slug": "koala-textured-teething-ring",
            "description": "Ergonomically engineered for tiny hands to grasp with ease. Multi-surface massage beads soothe inflamed gums during first teeth emergence.",
            "features": [
                "100% Platinum Food-Grade Silicone",
                "Ergonomic dual-grip handles",
                "Freezer-chilling safe",
                "Dishwasher & boil-safe"
            ],
            "material": "100% Food-Grade Silicone (BPA, PVC, Phthalate Free)",
            "target_age": "0 - 12m",
            "price": 499.00,
            "discount_price": 399.00,
            "stock": 120,
            "sku": "FIM-TEE-01",
            "image_url": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800",
            "is_featured": True
        },
        {
            "category": cat_sensory,
            "name": "Pastel Geometric Silicone Stacking Tower",
            "slug": "pastel-silicone-stacking-tower",
            "description": "A 7-tier Montessori-inspired silicone stacking set designed for fine motor development, tactile exploration, and teeth soothing.",
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
            "image_url": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800",
            "is_featured": True
        }
    ]

    for p_data in products_data:
        Product.objects.create(**p_data)

    # Demo Coupons
    Coupon.objects.create(
        code="FIMIKU10",
        discount_type="PERCENTAGE",
        value=10.00,
        min_order_amount=200.00,
        is_active=True
    )

    Coupon.objects.create(
        code="WELCOME50",
        discount_type="FIXED",
        value=50.00,
        min_order_amount=300.00,
        is_active=True
    )

    print("[Success] Fimiku database seeded successfully with PDF catalog items!")


if __name__ == '__main__':
    seed_database()