# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-03-19 18:36
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('WebPM', '0020_auto_20170223_1714'),
    ]

    operations = [
        migrations.CreateModel(
            name='RightsSupport',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            options={
                'permissions': (('addNewProject', 'Adding new project'),),
                'managed': False,
            },
        ),
    ]
