# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('WebPM', '0010_contracts_project'),
    ]

    operations = [
        migrations.AddField(
            model_name='payments',
            name='payed',
            field=models.CharField(max_length=20, default='False'),
        ),
    ]
