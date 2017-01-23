# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-01-14 20:13
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AttributeTypes',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Cities',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Companies',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Countries',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='PaymentTypes',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='ProjectAttributes',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('attrType', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.AttributeTypes')),
            ],
        ),
        migrations.CreateModel(
            name='Projects',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('address', models.CharField(max_length=200)),
                ('city', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.Cities')),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.Companies')),
                ('country', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.Countries')),
            ],
        ),
        migrations.CreateModel(
            name='ProjectTypes',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Stages',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('projectId', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.Projects')),
            ],
        ),
        migrations.CreateModel(
            name='StageTypes',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.AddField(
            model_name='stages',
            name='stageType',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.StageTypes'),
        ),
        migrations.AddField(
            model_name='projectattributes',
            name='stageId',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.Stages'),
        ),
        migrations.AddField(
            model_name='cities',
            name='country',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.Countries'),
        ),
    ]
