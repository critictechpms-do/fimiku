
import json
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "db.sqlite3"

# Catalogue MRP is stored in price.
# Existing discount_price values are preserved for matching products.
CATALOGUE = [
    {
        "code": "FST-01A",
        "name": "Foldable Basket",
        "slugs": ["silicone-foldable-Basket", "foldable-Basket"],
        "slug": "foldable-Basket",
        "description": "Foldable Basket from the Fimiku catalogue.",
        "features": ["Catalogue code: FST-01A", "MRP: ₹1089.34"],
        "price": 1089.34,
        "category_id": 13,
        "target_age": "Babies",
        "images": [],
    },
    {
        "code": "BFS-01B",
        "name": "Baby Feeding Set",
        "slugs": ["silicone-baby-feeding-set", "catalog-baby-feeding-set"],
        "slug": "catalog-baby-feeding-set",
        "description": "Baby Feeding Set from the Fimiku catalogue.",
        "features": ["Catalogue code: BFS-01B", "MRP: ₹1,723"],
        "price": 1723.00,
        "category_id": 14,
        "target_age": "Babies",
        "images": [],
    },
    {
        "code": "KSM-01C",
        "name": "Dish Drying Mat",
        "slugs": ["silicone-kitchen-mat", "dish-drying-mat"],
        "slug": "dish-drying-mat",
        "description": "Dish Drying Mat from the Fimiku catalogue.",
        "features": ["Catalogue code: KSM-01C", "MRP: ₹1,544"],
        "price": 1544.00,
        "category_id": 18,
        "target_age": "",
        "images": [],
    },
    {
        "code": "PFB-01D",
        "name": "Pet Feeding Mat",
        "slugs": ["pet-feeding-mat"],
        "slug": "pet-feeding-mat",
        "description": "Pet Feeding Mat from the Fimiku catalogue.",
        "features": ["Catalogue code: PFB-01D", "MRP: ₹1,422"],
        "price": 1422.00,
        "category_id": 17,
        "target_age": "Pets",
        "images": [],
    },
    {
        "code": "PGT-01E",
        "name": "Pet Teether",
        "slugs": ["pet-teether"],
        "slug": "pet-teether",
        "description": "Pet Teether from the Fimiku catalogue.",
        "features": ["Catalogue code: PGT-01E", "MRP: ₹549"],
        "price": 549.00,
        "category_id": 17,
        "target_age": "Pets",
        "images": [],
    },
    {
        "code": "BGT-01F",
        "name": "Baby Teether",
        "slugs": ["catalog-baby-teether"],
        "slug": "catalog-baby-teether",
        "description": "Baby Teether from the Fimiku catalogue.",
        "features": ["Catalogue code: BGT-01F", "MRP: ₹549"],
        "price": 549.00,
        "category_id": 12,
        "target_age": "Babies",
        "images": ["/products/blue-textured-bone-teether.webp"],
    },
]


def main():
    if not DB_PATH.is_file():
        raise FileNotFoundError(f"Database not found: {DB_PATH}")

    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row

    try:
        columns = {
            row["name"]
            for row in db.execute(
                "PRAGMA table_info(store_product)"
            ).fetchall()
        }

        required = {
            "id", "name", "slug", "description", "features",
            "material", "target_age", "price", "discount_price",
            "stock", "sku", "image_url", "additional_images",
            "is_active", "is_featured", "created_at", "category_id",
        }

        missing = required - columns
        if missing:
            raise RuntimeError(
                "Missing database columns: " + ", ".join(sorted(missing))
            )

        db.execute("BEGIN IMMEDIATE")

        for p in CATALOGUE:
            placeholders = ",".join("?" for _ in p["slugs"])
            existing = db.execute(
                f"""
                SELECT *
                FROM store_product
                WHERE slug IN ({placeholders})
                ORDER BY id
                LIMIT 1
                """,
                p["slugs"],
            ).fetchone()

            category = db.execute(
                "SELECT id FROM store_category WHERE id = ?",
                (p["category_id"],),
            ).fetchone()

            if category is None:
                raise RuntimeError(
                    f"Category {p['category_id']} is missing "
                    f"for {p['name']}."
                )

            if existing:
                # Preserve existing discount, stock, SKU, slug,
                # image gallery, category, and other product settings.
                try:
                    features = json.loads(existing["features"] or "[]")
                    if not isinstance(features, list):
                        features = [str(features)]
                except (json.JSONDecodeError, TypeError):
                    features = []

                for feature in p["features"]:
                    if feature not in features:
                        features.append(feature)

                # Update MRP, but never overwrite discount_price.
                db.execute(
                    """
                    UPDATE store_product
                    SET name = ?,
                        price = ?,
                        features = ?,
                        target_age = ?
                    WHERE id = ?
                    """,
                    (
                        p["name"],
                        p["price"],
                        json.dumps(features, ensure_ascii=False),
                        p["target_age"] or existing["target_age"],
                        existing["id"],
                    ),
                )

                print(
                    f"UPDATED existing: {p['name']} "
                    f"(ID {existing['id']})"
                )
                continue

            # Check for a SKU or slug conflict before inserting.
            conflicts = db.execute(
                """
                SELECT id, name, sku, slug
                FROM store_product
                WHERE sku = ? OR slug = ?
                """,
                (p["code"], p["slug"]),
            ).fetchall()

            if conflicts:
                raise RuntimeError(
                    f"SKU/slug conflict for {p['name']}: "
                    f"{[dict(row) for row in conflicts]}"
                )

            images = p["images"]

            db.execute(
                """
                INSERT INTO store_product (
                    name, slug, description, features, material,
                    target_age, price, discount_price, stock, sku,
                    image_url, additional_images, is_active,
                    is_featured, created_at, category_id
                )
                VALUES (
                    ?, ?, ?, ?, ?, ?, ?, NULL, 0, ?,
                    ?, ?, 1, 0, datetime('now'), ?
                )
                """,
                (
                    p["name"],
                    p["slug"],
                    p["description"],
                    json.dumps(p["features"], ensure_ascii=False),
                    "Silicone",
                    p["target_age"],
                    p["price"],
                    p["code"],
                    images[0] if images else "",
                    json.dumps(images[1:]),
                    p["category_id"],
                ),
            )

            print(f"ADDED new: {p['name']} ({p['code']})")

        db.commit()

        print("\n===== VERIFY CATALOGUE =====")
        for p in CATALOGUE:
            row = db.execute(
                """
                SELECT id, name, sku, price, discount_price, stock, slug
                FROM store_product
                WHERE slug IN (
                    SELECT slug FROM store_product WHERE name = ?
                )
                ORDER BY id
                """,
                (p["name"],),
            ).fetchone()

            if row:
                selling_price = (
                    row["discount_price"]
                    if row["discount_price"] is not None
                    else row["price"]
                )
                print(
                    f"{row['name']} | MRP ₹{row['price']} | "
                    f"Website price ₹{selling_price} | "
                    f"Stock {row['stock']} | ID {row['id']}"
                )

        print("\nSUCCESS: Catalogue import completed.")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
