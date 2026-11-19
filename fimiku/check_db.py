
import sqlite3
from pathlib import Path

db = sqlite3.connect(Path("backend") / "db.sqlite3")
db.row_factory = sqlite3.Row

print("===== EXISTING CATALOGUE MATCHES =====")

slugs = [
    "silicone-foldable-tub",
    "silicone-baby-feeding-set",
    "silicone-kitchen-mat",
    "3-in-1-pet-slow-feeder-bowl",
    "koala-textured-teething-ring",
]

for slug in slugs:
    row = db.execute(
        """
        SELECT id, name, slug, sku, price, discount_price,
               stock, image_url, additional_images, category_id
        FROM store_product
        WHERE slug = ?
        """,
        (slug,),
    ).fetchone()

    if row:
        print("\n", dict(row))

print("\n===== DATABASE PATH =====")
print(Path("backend/db.sqlite3").resolve())

db.close()
