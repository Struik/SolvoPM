# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-01-21 10:37
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('WebPM', '0003_auto_20170119_2229'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='contracts',
            name='contractType',
        ),
        migrations.RemoveField(
            model_name='payments',
            name='contractId',
        ),
        migrations.DeleteModel(
            name='Contracts',
        ),
        migrations.DeleteModel(
            name='Payments',
        ),
    ]