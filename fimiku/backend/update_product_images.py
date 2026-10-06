import sqlite3, json

db = sqlite3.connect("db.sqlite3")

products = {
    'silicone-foldable-basket': {
        'image_url': '/products/01_silicone_foldable_basket/image1.png',
        'additional_images': ['/products/01_silicone_foldable_basket/image2.jpeg', '/products/01_silicone_foldable_basket/image3.jpeg', '/products/01_silicone_foldable_basket/image4.jpeg'],
    },
    'pet-slow-feeder-bowl-3-in-1': {
        'image_url': '/products/02_pet_slow_feeder_bowl_3in1/image5.png',
        'additional_images': ['/products/02_pet_slow_feeder_bowl_3in1/image6.png', '/products/02_pet_slow_feeder_bowl_3in1/image7.png', '/products/02_pet_slow_feeder_bowl_3in1/image8.jpeg', '/products/02_pet_slow_feeder_bowl_3in1/image9.jpeg', '/products/02_pet_slow_feeder_bowl_3in1/image10.jpeg', '/products/02_pet_slow_feeder_bowl_3in1/image11.jpeg'],
    },
    'silicone-kitchen-mat': {
        'image_url': '/products/03_silicone_kitchen_mat/image12.png',
        'additional_images': ['/products/03_silicone_kitchen_mat/image13.png', '/products/03_silicone_kitchen_mat/image14.jpeg', '/products/03_silicone_kitchen_mat/image15.jpeg', '/products/03_silicone_kitchen_mat/image16.jpeg'],
    },
    'silicone-baby-feeding-set': {
        'image_url': '/products/04_silicone_baby_feeding_set/image17.jpeg',
        'additional_images': ['/products/04_silicone_baby_feeding_set/image18.png', '/products/04_silicone_baby_feeding_set/image19.png', '/products/04_silicone_baby_feeding_set/image20.png', '/products/04_silicone_baby_feeding_set/image21.jpeg', '/products/04_silicone_baby_feeding_set/image22.jpeg', '/products/04_silicone_baby_feeding_set/image23.jpeg', '/products/04_silicone_baby_feeding_set/image24.jpeg', '/products/04_silicone_baby_feeding_set/image25.jpeg', '/products/04_silicone_baby_feeding_set/image26.png', '/products/04_silicone_baby_feeding_set/image27.png', '/products/04_silicone_baby_feeding_set/image28.png', '/products/04_silicone_baby_feeding_set/image29.png', '/products/04_silicone_baby_feeding_set/image30.png', '/products/04_silicone_baby_feeding_set/image31.png', '/products/04_silicone_baby_feeding_set/image32.png', '/products/04_silicone_baby_feeding_set/image33.png', '/products/04_silicone_baby_feeding_set/image34.png'],
    },
}

for slug, data in products.items():
    db.execute(
        "UPDATE store_product SET image_url=?, additional_images=? WHERE slug=?",
        (data['image_url'], json.dumps(data['additional_images']), slug)
    )

db.commit()
print('PRODUCT IMAGES UPDATED')
for slug in products:
    print(db.execute('SELECT id,name,image_url FROM store_product WHERE slug=?', (slug,)).fetchone())
db.close()