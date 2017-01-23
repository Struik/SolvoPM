# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AttributeTypes',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Cities',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Companies',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Contracts',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('fullPrice', models.IntegerField(null=True)),
                ('startDate', models.DateField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='ContractTypes',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Countries',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Payments',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, serialize=False, primary_key=True)),
                ('paymentDate', models.DateField()),
                ('paymentAmount', models.IntegerField()),
                ('contract', models.ForeignKey(to='WebPM.Contracts')),
            ],
        ),
        migrations.CreateModel(
            name='PaymentTypes',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='ProjectAttributes',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, serialize=False, primary_key=True)),
                ('attrValue', models.IntegerField()),
                ('attrType', models.ForeignKey(to='WebPM.AttributeTypes')),
            ],
        ),
        migrations.CreateModel(
            name='Projects',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('address', models.CharField(max_length=200)),
                ('city', models.ForeignKey(to='WebPM.Cities')),
                ('company', models.ForeignKey(to='WebPM.Companies')),
                ('country', models.ForeignKey(to='WebPM.Countries')),
            ],
        ),
        migrations.CreateModel(
            name='ProjectTypes',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Stages',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('project', models.ForeignKey(to='WebPM.Projects')),
            ],
        ),
        migrations.CreateModel(
            name='StageTypes',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.AddField(
            model_name='stages',
            name='stageType',
            field=models.ForeignKey(to='WebPM.StageTypes'),
        ),
        migrations.AddField(
            model_name='projectattributes',
            name='stage',
            field=models.ForeignKey(to='WebPM.Stages'),
        ),
        migrations.AddField(
            model_name='contracts',
            name='contractType',
            field=models.ForeignKey(to='WebPM.ContractTypes'),
        ),
        migrations.AddField(
            model_name='cities',
            name='country',
            field=models.ForeignKey(to='WebPM.Countries'),
        ),
    ]
