# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-21 09:44
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('WebPM', '0025_auto_20170320_2214'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='projects',
            options={'permissions': (('viewProjects', "Access to main project's view"), ('addNewProject', 'Adding new project'))},
        ),
        migrations.AlterModelOptions(
            name='rightssupport',
            options={'managed': False, 'permissions': ()},
        ),
    ]
