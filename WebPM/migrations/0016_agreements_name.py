# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-02-07 20:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('WebPM', '0015_auto_20170206_0009'),
    ]

    operations = [
        migrations.AddField(
            model_name='agreements',
            name='name',
            field=models.CharField(default=0, max_length=200),
            preserve_default=False,
        ),
    ]
