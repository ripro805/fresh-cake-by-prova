from django.contrib import admin
from .models import PaymentSubmission, CashCollection

@admin.register(PaymentSubmission)
class PaymentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'order', 'provider', 'amount', 'sender_phone', 'status', 'verified_at')
    list_filter = ('provider', 'status')
    search_fields = ('transaction_id', 'sender_phone', 'order__order_number')

@admin.register(CashCollection)
class CashCollectionAdmin(admin.ModelAdmin):
    list_display = ('order', 'amount_collected', 'collected_by', 'collected_at')
    search_fields = ('order__order_number', 'collected_by')
