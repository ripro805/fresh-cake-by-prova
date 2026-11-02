import uuid
from decimal import Decimal
from django.core.management.base import BaseCommand
from catalog.models import Category, Product, ProductImage, ProductVariant, ProductFlavor

class Command(BaseCommand):
    help = 'Seeds initial bakery catalog data with Cakes, Donuts, and Momos'

    def handle(self, *args, **options):
        self.stdout.write("Seeding categories and products for FRESH CAKE by PROVA...")

        # 1. Categories
        categories_data = [
            {
                'name': 'Cakes',
                'slug': 'cakes',
                'tagline': 'Handcrafted Celebration Cakes, Tub Cakes, Bento Mart Cakes & Cupcakes',
                'description': 'Baked fresh with pure European dairy butter, premium Belgian cocoa, and velvety Swiss meringue buttercream.',
                'image_url': '/images/hero_cake.jpg',
                'sort_order': 1,
            },
            {
                'name': 'Donuts',
                'slug': 'donuts',
                'tagline': 'Soft Brioche Donuts with Velvety Glazes & Decadent Fillings',
                'description': 'Golden fried fluffy dough tossed in fine sugar and filled with rich creams, curds, and Belgian ganache.',
                'image_url': '/images/category_donuts.jpg',
                'sort_order': 2,
            },
            {
                'name': 'Momos',
                'slug': 'momos',
                'tagline': 'Steamed & Crispy Pan-Fried Dumplings with Fiery Chili Dips',
                'description': 'Handcrafted thin wrappers enclosing succulent minced chicken, aromatic scallions, and served with house red chili dipping sauce.',
                'image_url': '/images/category_momos.jpg',
                'sort_order': 3,
            },
        ]

        category_objs = {}
        for cdata in categories_data:
            cat, created = Category.objects.update_or_create(
                slug=cdata['slug'],
                defaults=cdata
            )
            category_objs[cdata['slug']] = cat
            status_str = "Created" if created else "Updated"
            self.stdout.write(f"  [{status_str}] Category: {cat.name}")

        # 2. Products Data
        products_data = [
            # CAKES
            {
                'category': category_objs['cakes'],
                'name': 'Golden Caramel Drip Celebration Cake',
                'slug': 'golden-caramel-celebration-cake',
                'cake_type': 'Celebration Cakes',
                'description': 'Signature multi-tiered artisan sponge smothered in velvety Swiss meringue buttercream, luscious salted caramel drip, delicate edible gold leaf accents, and fresh blush blooms. Perfect for memorable birthdays and milestone celebrations.',
                'base_price': Decimal('1850.00'),
                'discount_price': Decimal('1650.00'),
                'prep_time': '24 Hours Advance Notice',
                'is_featured': True,
                'is_bestseller': True,
                'is_trending': True,
                'rating': Decimal('5.00'),
                'review_count': 24,
                'images': ['/images/hero_cake.jpg', '/images/chocolate_cake.jpg'],
                'variants': [
                    {'name': '1 Pound (Serves 4-6)', 'price': Decimal('1650.00'), 'is_default': True},
                    {'name': '2 Pound (Serves 8-12)', 'price': Decimal('3100.00'), 'is_default': False},
                    {'name': '3 Pound Tiered (Serves 15-20)', 'price': Decimal('4600.00'), 'is_default': False},
                ],
                'flavors': ['Salted Caramel Vanilla', 'Chocolate Hazelnut', 'Red Velvet Dream', 'Fresh Strawberry Vanilla']
            },
            {
                'category': category_objs['cakes'],
                'name': 'Belgian Dark Chocolate Truffle Cake',
                'slug': 'belgian-dark-chocolate-truffle-cake',
                'cake_type': 'Chocolate Cakes',
                'description': 'An indulgent, rich 70% dark Belgian chocolate fudge cake layered with silky chocolate mousse, cloaked in mirror chocolate ganache and crowned with handmade chocolate truffles and edible gold flakes.',
                'base_price': Decimal('1950.00'),
                'discount_price': Decimal('1750.00'),
                'prep_time': '12-24 Hours Notice',
                'is_featured': True,
                'is_bestseller': True,
                'is_trending': False,
                'rating': Decimal('4.90'),
                'review_count': 38,
                'images': ['/images/chocolate_cake.jpg', '/images/tub_cake.jpg'],
                'variants': [
                    {'name': '1 Pound (Serves 4-6)', 'price': Decimal('1750.00'), 'is_default': True},
                    {'name': '2 Pound (Serves 8-12)', 'price': Decimal('3300.00'), 'is_default': False},
                    {'name': '3 Pound (Serves 15-20)', 'price': Decimal('4800.00'), 'is_default': False},
                ],
                'flavors': ['Intense Dark Chocolate', 'Mocha Espresso Ganache']
            },
            {
                'category': category_objs['cakes'],
                'name': 'Salted Caramel Fudge Tub Cake',
                'slug': 'salted-caramel-fudge-tub-cake',
                'cake_type': 'Tub Cakes',
                'description': 'Grab a spoon and dive into pure bliss! Layered in a transparent dessert tub with rich chocolate sponge, house-cooked salted caramel sauce, silky whipped mousse, and crunchy hazelnut praline.',
                'base_price': Decimal('650.00'),
                'discount_price': Decimal('580.00'),
                'prep_time': 'Ready Same Day / 4 Hours',
                'is_featured': True,
                'is_bestseller': True,
                'is_trending': True,
                'rating': Decimal('5.00'),
                'review_count': 19,
                'images': ['/images/tub_cake.jpg'],
                'variants': [
                    {'name': 'Regular Tub (350g)', 'price': Decimal('580.00'), 'is_default': True},
                    {'name': 'Large Sharing Tub (600g)', 'price': Decimal('950.00'), 'is_default': False},
                ],
                'flavors': ['Caramel Chocolate', 'Triple Belgian Chocolate']
            },
            {
                'category': category_objs['cakes'],
                'name': 'Vintage Korean Bento Mart Cake',
                'slug': 'sweet-moments-korean-mart-cake',
                'cake_type': 'Mart Cakes',
                'description': 'Cute, minimalist Korean lunchbox bento cake packed in an eco-friendly sugarcane clamshell. Adorned with pastel buttercream piping, sugar pearls, and customizable vintage hand-piped greeting.',
                'base_price': Decimal('850.00'),
                'discount_price': Decimal('750.00'),
                'prep_time': 'Same Day / 6 Hours Notice',
                'is_featured': True,
                'is_bestseller': False,
                'is_trending': True,
                'rating': Decimal('4.80'),
                'review_count': 14,
                'images': ['/images/mart_cake.jpg'],
                'variants': [
                    {'name': 'Mini Bento 4" (Serves 1-2)', 'price': Decimal('750.00'), 'is_default': True},
                    {'name': 'Midi Bento 5" (Serves 3-4)', 'price': Decimal('1100.00'), 'is_default': False},
                ],
                'flavors': ['Vanilla Cream Cheese', 'Chocolate Fudge', 'Lotus Biscoff']
            },
            {
                'category': category_objs['cakes'],
                'name': 'Classic Red Velvet Berry Dream Cake',
                'slug': 'classic-red-velvet-berry-cake',
                'cake_type': 'Red Velvet Cakes',
                'description': 'Velvety crimson cocoa sponge with our signature tangy cream cheese frosting, raspberry coulis compote layers, and topped with fresh strawberries and dark chocolate shavings.',
                'base_price': Decimal('1800.00'),
                'discount_price': Decimal('1600.00'),
                'prep_time': '12 Hours Notice',
                'is_featured': True,
                'is_bestseller': False,
                'is_trending': False,
                'rating': Decimal('4.90'),
                'review_count': 22,
                'images': ['/images/red_velvet_cake.jpg'],
                'variants': [
                    {'name': '1 Pound (Serves 4-6)', 'price': Decimal('1600.00'), 'is_default': True},
                    {'name': '2 Pound (Serves 8-12)', 'price': Decimal('3000.00'), 'is_default': False},
                ],
                'flavors': ['Traditional Cream Cheese', 'White Chocolate Cream Cheese']
            },
            {
                'category': category_objs['cakes'],
                'name': 'Artisan Gourmet Cupcakes Box',
                'slug': 'artisan-gourmet-cupcakes-box',
                'cake_type': 'Cup Cakes',
                'description': 'An assorted luxury gift box of our most celebrated cupcake flavors: Madagascar Vanilla Bean, Belgian Dark Fudge, Salted Caramel Crunch, and Red Velvet Rose swirl.',
                'base_price': Decimal('720.00'),
                'discount_price': Decimal('650.00'),
                'prep_time': 'Ready Same Day / 3 Hours',
                'is_featured': False,
                'is_bestseller': True,
                'is_trending': False,
                'rating': Decimal('4.90'),
                'review_count': 31,
                'images': ['/images/cupcakes.jpg'],
                'variants': [
                    {'name': 'Box of 4 Assorted', 'price': Decimal('650.00'), 'is_default': True},
                    {'name': 'Box of 6 Assorted', 'price': Decimal('950.00'), 'is_default': False},
                    {'name': 'Box of 12 Party Pack', 'price': Decimal('1800.00'), 'is_default': False},
                ],
                'flavors': ['Assorted Baker Choice', 'All Chocolate Lovers', 'Vanilla & Berry Mix']
            },
            # DONUTS
            {
                'category': category_objs['donuts'],
                'name': 'Gourmet Artisan Donut Collection',
                'slug': 'gourmet-artisan-donut-collection',
                'cake_type': 'Donuts',
                'description': 'Light-as-air brioche yeast donuts crafted fresh every morning. Glazed with house-made Belgian chocolate ganache, lotus biscoff butter, berry glazes, and toasted almond praline.',
                'base_price': Decimal('540.00'),
                'discount_price': Decimal('480.00'),
                'prep_time': 'Fresh Daily / Ready in 2 Hours',
                'is_featured': True,
                'is_bestseller': True,
                'is_trending': True,
                'rating': Decimal('4.90'),
                'review_count': 45,
                'images': ['/images/category_donuts.jpg'],
                'variants': [
                    {'name': 'Box of 4 Donuts', 'price': Decimal('480.00'), 'is_default': True},
                    {'name': 'Box of 6 Donuts', 'price': Decimal('700.00'), 'is_default': False},
                    {'name': 'Box of 12 Celebration Dozen', 'price': Decimal('1350.00'), 'is_default': False},
                ],
                'flavors': ['Assorted Favorites', 'Nutella & Dark Chocolate', 'Lotus Biscoff Crunch', 'Classic Vanilla Glazed']
            },
            # MOMOS
            {
                'category': category_objs['momos'],
                'name': 'Himalayan Handcrafted Chicken Momos',
                'slug': 'himalayan-handcrafted-chicken-momos',
                'cake_type': 'Momos',
                'description': 'Juicy minced chicken infused with ginger, coriander, toasted sesame, and Himalayan mountain spices encased in delicate steamed or pan-fried dough folds. Served piping hot with our fiery garlic-chili and tomato-sesame chutneys.',
                'base_price': Decimal('320.00'),
                'discount_price': Decimal('280.00'),
                'prep_time': 'Freshly Prepared / 30-45 Mins',
                'is_featured': True,
                'is_bestseller': True,
                'is_trending': True,
                'rating': Decimal('5.00'),
                'review_count': 56,
                'images': ['/images/category_momos.jpg'],
                'variants': [
                    {'name': 'Steamed Classic (6 Pcs)', 'price': Decimal('280.00'), 'is_default': True},
                    {'name': 'Crispy Pan-Fried Kothey (6 Pcs)', 'price': Decimal('320.00'), 'is_default': False},
                    {'name': 'Jhol Spicy Broth Momos (6 Pcs)', 'price': Decimal('350.00'), 'is_default': False},
                    {'name': 'Sharing Platter (12 Pcs Mixed)', 'price': Decimal('580.00'), 'is_default': False},
                ],
                'flavors': ['Juicy Spicy Chicken', 'Mild Herbal Chicken', 'Cheese & Chicken Supreme']
            },
        ]

        for pdata in products_data:
            images = pdata.pop('images', [])
            variants = pdata.pop('variants', [])
            flavors = pdata.pop('flavors', [])

            product, created = Product.objects.update_or_create(
                slug=pdata['slug'],
                defaults=pdata
            )
            status_str = "Created" if created else "Updated"
            self.stdout.write(f"  [{status_str}] Product: {product.name}")

            # Re-seed images
            ProductImage.objects.filter(product=product).delete()
            for idx, img_url in enumerate(images):
                ProductImage.objects.create(
                    product=product,
                    image_url=img_url,
                    is_primary=(idx == 0),
                    sort_order=idx
                )

            # Re-seed variants
            ProductVariant.objects.filter(product=product).delete()
            for v in variants:
                ProductVariant.objects.create(
                    product=product,
                    name=v['name'],
                    price=v['price'],
                    is_default=v.get('is_default', False)
                )

            # Re-seed flavors
            ProductFlavor.objects.filter(product=product).delete()
            for flv in flavors:
                ProductFlavor.objects.create(
                    product=product,
                    name=flv,
                    is_available=True
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded catalog categories and products!"))
