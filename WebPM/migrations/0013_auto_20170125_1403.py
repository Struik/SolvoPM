# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('WebPM', '0012_auto_20170125_1353'),
    ]

    operations = [
        migrations.AlterField(
            model_name='payments',
            name='payed',
            field=models.BooleanField(default=False),
        ),
    ]
