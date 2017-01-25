# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('WebPM', '0011_payments_payed'),
    ]

    operations = [
        migrations.AddField(
            model_name='payments',
            name='isSplit',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='payments',
            name='parentPayment',
            field=models.ForeignKey(to='WebPM.Payments', null=True),
        ),
    ]
