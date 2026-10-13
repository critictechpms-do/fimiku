
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='shiprocket_awb_code',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='order',
            name='shiprocket_courier_name',
            field=models.CharField(blank=True, default='', max_length=150),
        ),
        migrations.AddField(
            model_name='order',
            name='shiprocket_order_id',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='order',
            name='shiprocket_shipment_id',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='order',
            name='tracking_url',
            field=models.URLField(blank=True, default='', max_length=500),
        ),
    ]
  