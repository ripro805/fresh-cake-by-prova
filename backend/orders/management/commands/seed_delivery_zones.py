from decimal import Decimal
from django.core.management.base import BaseCommand
from orders.models import DeliveryZone

class Command(BaseCommand):
    help = 'Seeds Kushtia delivery zones (Pickup ৳0, Inside Kushtia ৳50, Outside Kushtia ৳150)'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Kushtia delivery zones...")
        zones = [
            {
                'name': 'Store Pickup (Kushtia Bakery Point)',
                'code': 'PICKUP',
                'fee': Decimal('0.00'),
                'estimated_time': 'Ready in 2-4 Hours',
                'is_active': True,
                'sort_order': 1,
            },
            {
                'name': 'Inside Kushtia Town (Standard Delivery)',
                'code': 'INSIDE_KUSHTIA',
                'fee': Decimal('50.00'),
                'estimated_time': 'Same Day / 2-4 Hours',
                'is_active': True,
                'sort_order': 2,
            },
            {
                'name': 'Outside Kushtia Town (Surrounding Suburbs)',
                'code': 'OUTSIDE_KUSHTIA',
                'fee': Decimal('150.00'),
                'estimated_time': 'Scheduled Delivery / 4-6 Hours',
                'is_active': True,
                'sort_order': 3,
            },
        ]

        for z in zones:
            zone, created = DeliveryZone.objects.update_or_create(
                code=z['code'],
                defaults=z
            )
            status_str = "Created" if created else "Updated"
            self.stdout.write(f"  [{status_str}] {zone.name} (BDT {zone.fee})")

        self.stdout.write(self.style.SUCCESS("Successfully seeded Kushtia delivery zones!"))
