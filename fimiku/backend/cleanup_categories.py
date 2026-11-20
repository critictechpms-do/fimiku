import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fimiku_core.settings")
django.setup()

from store.models import Category, Product

APPLY = "--apply" in sys.argv

categories = list(Category.objects.all())
groups = {}

for category in categories:
    groups.setdefault(category.slug, []).append(category)

print("\n========== CATEGORY CLEANUP ==========")

total_moved = 0
total_deleted = 0

for slug, duplicates in groups.items():

    # Choose the category record with the most products attached
    keeper = max(
        duplicates,
        key=lambda category: Product.objects.filter(
            category=category
        ).count()
    )

    duplicate_categories = [
        category for category in duplicates
        if category.id != keeper.id
    ]

    print(f"\nCategory: {keeper.name}")
    print(f"Keeping: {keeper.id}")

    for duplicate in duplicate_categories:

        products = Product.objects.filter(category=duplicate)
        count = products.count()

        print(f"Duplicate: {duplicate.id} | Products: {count}")

        if APPLY:

            # Reassign products before deleting the duplicate category
            for product in products:
                product.category = keeper
                product.save()

            # Verify no products remain connected
            remaining = Product.objects.filter(
                category=duplicate
            ).count()

            if remaining != 0:
                print("ERROR: Products remain. Skipping deletion.")
                continue

            duplicate.delete()

            print("DELETED duplicate category")

            total_moved += count
            total_deleted += 1

print("\n========== SUMMARY ==========")
print("Categories before:", len(categories))
print("Unique categories:", len(groups))

if APPLY:
    print("Products reassigned:", total_moved)
    print("Duplicate categories deleted:", total_deleted)
    print("Categories remaining:", Category.objects.count())
else:
    print("PREVIEW MODE - NOTHING WAS DELETED")
    print("\nTo apply changes, run:")
    print("python cleanup_categories.py --apply")