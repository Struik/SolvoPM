# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-04-29 18:39
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('WebPM', '0030_auto_20170429_2129'),
    ]

    operations = [
        migrations.CreateModel(
            name='StageType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.RemoveField(
            model_name='stages',
            name='name',
        ),
        migrations.AddField(
            model_name='stages',
            name='stageType',
            field=models.CharField(default=1, max_length=200),
            preserve_default=False,
        ),
    ]