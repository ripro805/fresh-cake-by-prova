from django.core.management.base import BaseCommand
from accounts.models import User, UserRole

class Command(BaseCommand):
    help = 'Securely provisions or updates the single Owner-Admin account for FRESH CAKE by PROVA.'

    def add_arguments(self, parser):
        parser.add_argument('--phone', type=str, default='01700000000', help='Owner admin phone number')
        parser.add_argument('--password', type=str, default='prova2026', help='Owner admin secure password')
        parser.add_argument('--name', type=str, default='PROVA (Owner & Head Baker)', help='Owner full name')
        parser.add_argument('--email', type=str, default='owner@freshcakebyprova.com', help='Owner contact email')

    def handle(self, *args, **options):
        phone = options['phone'].strip()
        password = options['password']
        name = options['name'].strip()
        email = options['email'].strip()

        # Check if an OWNER_ADMIN account already exists
        existing_owner = User.objects.filter(role=UserRole.OWNER_ADMIN).first()

        if existing_owner:
            self.stdout.write(self.style.WARNING(
                f"An Owner-Admin account already exists: {existing_owner.full_name} ({existing_owner.phone})."
            ))
            # Update password and details for the existing owner
            existing_owner.full_name = name
            existing_owner.phone = phone
            if email:
                existing_owner.email = email
            existing_owner.set_password(password)
            existing_owner.is_staff = True
            existing_owner.is_superuser = True
            existing_owner.save()
            self.stdout.write(self.style.SUCCESS(
                f"Successfully updated Owner-Admin credentials for {existing_owner.phone}."
            ))
            return

        # Check if user with this phone exists as customer
        user_by_phone = User.objects.filter(phone=phone).first()
        if user_by_phone:
            user_by_phone.role = UserRole.OWNER_ADMIN
            user_by_phone.full_name = name
            user_by_phone.email = email
            user_by_phone.set_password(password)
            user_by_phone.is_staff = True
            user_by_phone.is_superuser = True
            user_by_phone.save()
            self.stdout.write(self.style.SUCCESS(
                f"Upgraded user {phone} to exclusive OWNER_ADMIN role."
            ))
            return

        # Create new OWNER_ADMIN
        owner = User.objects.create_user(
            phone=phone,
            password=password,
            full_name=name,
            email=email,
            role=UserRole.OWNER_ADMIN,
            is_staff=True,
            is_superuser=True
        )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully created exclusive OWNER_ADMIN: {owner.full_name} ({owner.phone}) [ID: {owner.id}]"
        ))
