# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-01-21 10:45
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('WebPM', '0008_contracts_payments_projectattributes'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contracts',
            name='fullPrice',
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='contracts',
            name='startDate',
            field=models.DateField(null=True),
        ),
    ]