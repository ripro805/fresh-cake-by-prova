from decimal import Decimal
import datetime
from django.core.management.base import BaseCommand
from inventory.models import Ingredient, FinishedGoodStock
from catalog.models import Product
from finance.models import ExpenseCategory, Expense

class Command(BaseCommand):
    help = 'Seeds bakery ingredients, finished goods stocks, and expense categories'

    def handle(self, *args, **options):
        self.stdout.write("Seeding bakery inventory ingredients...")

        ingredients_data = [
            {'name': 'All-Purpose Baking Flour (Special Pastry Grade)', 'category': 'Dry Essentials', 'unit': 'kg', 'current_stock': Decimal('45.00'), 'min_threshold': Decimal('15.00'), 'unit_cost': Decimal('75.00')},
            {'name': 'Fine Caster Sugar', 'category': 'Dry Essentials', 'unit': 'kg', 'current_stock': Decimal('38.00'), 'min_threshold': Decimal('10.00'), 'unit_cost': Decimal('140.00')},
            {'name': 'European Dairy Unsalted Butter (82% Fat)', 'category': 'Dairy', 'unit': 'kg', 'current_stock': Decimal('22.50'), 'min_threshold': Decimal('8.00'), 'unit_cost': Decimal('980.00')},
            {'name': 'Belgian Dark Chocolate Callebaut 70%', 'category': 'Chocolates', 'unit': 'kg', 'current_stock': Decimal('12.00'), 'min_threshold': Decimal('5.00'), 'unit_cost': Decimal('1850.00')},
            {'name': 'Philadelphia Cream Cheese', 'category': 'Dairy', 'unit': 'kg', 'current_stock': Decimal('14.00'), 'min_threshold': Decimal('6.00'), 'unit_cost': Decimal('1450.00')},
            {'name': 'Heavy Dairy Whipping Cream (35%)', 'category': 'Dairy', 'unit': 'l', 'current_stock': Decimal('25.00'), 'min_threshold': Decimal('8.00'), 'unit_cost': Decimal('550.00')},
            {'name': 'Farm Fresh Large Eggs', 'category': 'Poultry', 'unit': 'pcs', 'current_stock': Decimal('240.00'), 'min_threshold': Decimal('60.00'), 'unit_cost': Decimal('12.50')},
            {'name': 'Full Cream Pasteurized Milk', 'category': 'Dairy', 'unit': 'l', 'current_stock': Decimal('30.00'), 'min_threshold': Decimal('10.00'), 'unit_cost': Decimal('90.00')},
            {'name': 'Madagascar Pure Vanilla Extract', 'category': 'Flavorings', 'unit': 'ml', 'current_stock': Decimal('1200.00'), 'min_threshold': Decimal('300.00'), 'unit_cost': Decimal('3.50')},
            {'name': 'Dutch-Processed Dark Cocoa Powder', 'category': 'Dry Essentials', 'unit': 'kg', 'current_stock': Decimal('9.50'), 'min_threshold': Decimal('3.00'), 'unit_cost': Decimal('1200.00')},
            {'name': 'Fresh Minced Boneless Chicken Breast', 'category': 'Momo Ingredients', 'unit': 'kg', 'current_stock': Decimal('16.00'), 'min_threshold': Decimal('5.00'), 'unit_cost': Decimal('360.00')},
            {'name': 'Luxury Gold-Foil Cake Packaging Boxes (1-2 lb)', 'category': 'Packaging', 'unit': 'box', 'current_stock': Decimal('120.00'), 'min_threshold': Decimal('30.00'), 'unit_cost': Decimal('45.00')},
            {'name': 'Transparent Dessert Tubs with Lids', 'category': 'Packaging', 'unit': 'pcs', 'current_stock': Decimal('150.00'), 'min_threshold': Decimal('40.00'), 'unit_cost': Decimal('18.00')},
            {'name': 'Eco Sugarcane Clamshell Bento Boxes', 'category': 'Packaging', 'unit': 'box', 'current_stock': Decimal('90.00'), 'min_threshold': Decimal('25.00'), 'unit_cost': Decimal('22.00')},
        ]

        for item in ingredients_data:
            ing, created = Ingredient.objects.update_or_create(
                name=item['name'],
                defaults=item
            )
            status_str = "Created" if created else "Updated"
            self.stdout.write(f"  [{status_str}] {ing.name} ({ing.current_stock} {ing.unit})")

        # Finished goods stock tracking for every product
        for prod in Product.objects.all():
            stock, created = FinishedGoodStock.objects.get_or_create(
                product=prod,
                defaults={
                    'current_quantity': 15 if prod.category.slug in ['donuts', 'momos'] else 6,
                    'min_threshold': 3
                }
            )

        # Expense Categories
        expense_cats = [
            {'name': 'Raw Baking Ingredients', 'description': 'Butter, cocoa, flour, sugar, cream, eggs'},
            {'name': 'Packaging & Presentation', 'description': 'Luxury cake boxes, ribbon, tub containers, clamshells'},
            {'name': 'Bakery Utilities & Gas', 'description': 'Electricity, gas cylinders for ovens, water'},
            {'name': 'Kitchen Equipment & Maintenance', 'description': 'Mixers, silicone molds, scraper tools'},
            {'name': 'Delivery & Logistics', 'description': 'Delivery fuel and rider dispatch allowance'},
            {'name': 'Marketing & Social Media', 'description': 'Photography, social media promotions'},
        ]

        for ecat in expense_cats:
            c, created = ExpenseCategory.objects.update_or_create(
                name=ecat['name'],
                defaults=ecat
            )

        # Sample initial expenses for accurate demo P&L
        raw_cat = ExpenseCategory.objects.get(name='Raw Baking Ingredients')
        pkg_cat = ExpenseCategory.objects.get(name='Packaging & Presentation')
        util_cat = ExpenseCategory.objects.get(name='Bakery Utilities & Gas')

        today = datetime.date.today()
        sample_expenses = [
            {'category': raw_cat, 'title': 'Dairy Butter & Callebaut Cocoa Restock', 'amount': Decimal('8500.00'), 'payment_method': 'BKASH', 'date': today, 'notes': 'Fresh monthly stock from verified supplier'},
            {'category': pkg_cat, 'title': 'Custom Gold Foil Cake Boxes Batch 200 Pcs', 'amount': Decimal('4200.00'), 'payment_method': 'CASH', 'date': today, 'notes': 'Direct printer delivery to Kushtia studio'},
            {'category': util_cat, 'title': 'Commercial Baking Gas Cylinder Refills (2x)', 'amount': Decimal('2900.00'), 'payment_method': 'CASH', 'date': today, 'notes': 'LPG refueled for stone ovens'},
        ]

        for sexp in sample_expenses:
            Expense.objects.get_or_create(
                title=sexp['title'],
                date=sexp['date'],
                defaults=sexp
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded bakery business inventory & financial data!"))
