# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-01-21 10:39
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('WebPM', '0005_contracts_payments'),
    ]

    operations = [
        migrations.RenameField(
            model_name='payments',
            old_name='contractId',
            new_name='contract',
        ),
        migrations.RenameField(
            model_name='projectattributes',
            old_name='stageId',
            new_name='stage',
        ),
        migrations.RenameField(
            model_name='stages',
            old_name='projectId',
            new_name='project',
        ),
    ]
