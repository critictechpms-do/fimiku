import sqlite3
import json

db = sqlite3.connect("db.sqlite3")

products = [
    {
        "name": "Silicone Foldable Basket",
        "slug": "silicone-foldable-basket",
        "description": "Easily foldable - occupies less storage space, 24L capacity, high durability. Colour available: Pink. Size: 53.5 x 38 x 24 cm. Free shipping, 50% off MRP.",
        "features": ["Pink", "24L capacity", "53.5 x 38 x 24 cm", "Foldable", "High durability"],
        "material": "Silicone",
        "target_age": "",
        "price": 1089.34,
        "stock": 10,
        "sku": "SFB-001",
        "category_id": 18,
    },
    {
        "name": "Pet Slow Feeder Bowl - 3 in 1",
        "slug": "pet-slow-feeder-bowl-3-in-1",
        "description": "3 in 1 combo with normal bowl, slow feed bowl and anti-overflow pad. Waterproof silicone pad, antibacterial material, easily foldable, soft silicone, anti-skid vacuum suction cup. Colour available: Black. Free shipping, 50% off MRP.",
        "features": ["Black", "3 in 1", "Normal bowl", "Slow feed bowl", "Anti-overflow pad", "Anti-skid vacuum suction cup"],
        "material": "Silicone",
        "target_age": "Pets",
        "price": 711.02,
        "stock": 10,
        "sku": "PSFB-001",
        "category_id": 17,
    },
    {
        "name": "Silicone Kitchen Mat",
        "slug": "silicone-kitchen-mat",
        "description": "Waterproof silicone material that safely drains utensils. Withstands temperatures up to 260C. Hotpots can be placed on the table. Easily foldable and flexible. 5mm thickness. Dimensions: 45cm x 55cm. Colour available: Grey. Free shipping, 50% off MRP.",
        "features": ["Grey", "45cm x 55cm", "5mm thickness", "Waterproof", "Heat resistant up to 260C", "Foldable"],
        "material": "Silicone",
        "target_age": "",
        "price": 772.38,
        "stock": 10,
        "sku": "SKM-001",
        "category_id": 18,
    },
    {
        "name": "Silicone Baby Feeding Set",
        "slug": "silicone-baby-feeding-set",
        "description": "Complete silicone baby feeding set including plate, bowl, pocket bib, sipper cup with lid, fork and spoon set. Made of BPA-free and PVC-free silicone. Dishwasher, microwave and freezer safe. Suitable for babies and toddlers learning to self-feed. Available in 11 colours. Free shipping, 50% off MRP.",
        "features": ["11 Colours", "BPA-free", "PVC-free", "Plate", "Bowl", "Pocket bib", "Sipper cup", "Fork and spoon set"],
        "material": "Silicone",
        "target_age": "Babies and toddlers",
        "price": 861.50,
        "stock": 10,
        "sku": "SBFS-001",
        "category_id": 14,
    },
]

for p in products:
    existing = db.execute(
        "SELECT id FROM store_product WHERE slug = ?",
        (p["slug"],)
    ).fetchone()

    if existing:
        print(f"ALREADY EXISTS: {p['name']} (ID {existing[0]})")
        continue

    db.execute(
        """
        INSERT INTO store_product
        (
            name,
            slug,
            description,
            features,
            material,
            target_age,
            price,
            discount_price,
            stock,
            sku,
            image_url,
            additional_images,
            is_active,
            is_featured,
            created_at,
            category_id
        )
        VALUES
        (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?
        )
        """,
        (
            p["name"],
            p["slug"],
            p["description"],
            json.dumps(p["features"]),
            p["material"],
            p["target_age"],
            p["price"],
            None,
            p["stock"],
            p["sku"],
            "",
            json.dumps([]),
            1,
            0,
            p["category_id"],
        )
    )

    print(f"ADDED: {p['name']}")

db.commit()

print("\n===== PRODUCTS =====")

rows = db.execute(
    """
    SELECT id, name, price, stock, category_id
    FROM store_product
    WHERE slug IN (
        'silicone-foldable-basket',
        'pet-slow-feeder-bowl-3-in-1',
        'silicone-kitchen-mat',
        'silicone-baby-feeding-set'
    )
    ORDER BY id
    """
).fetchall()

for row in rows:
    print(row)

db.close()
print("\nDONE!")
