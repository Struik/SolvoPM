# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-04-13 13:57
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('WebPM', '0026_auto_20170321_1244'),
    ]

    operations = [
        migrations.CreateModel(
            name='AccountingDocuments',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.CreateModel(
            name='AccountingDocumentType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='AgreementDates',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('approvedDate', models.DateField(null=True)),
                ('sentDate', models.DateField(null=True)),
                ('receivedDate', models.DateField(null=True)),
                ('storedDate', models.DateField(null=True)),
                ('agreement', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.Agreements')),
            ],
        ),
        migrations.CreateModel(
            name='ContractDates',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('approvedDate', models.DateField(null=True)),
                ('sentDate', models.DateField(null=True)),
                ('receivedDate', models.DateField(null=True)),
                ('storedDate', models.DateField(null=True)),
                ('contract', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.Contracts')),
            ],
        ),
        migrations.CreateModel(
            name='ProjectDocumentDates',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('approvedDate', models.DateField(null=True)),
                ('sentDate', models.DateField(null=True)),
                ('receivedDate', models.DateField(null=True)),
                ('storedDate', models.DateField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='ProjectDocuments',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contract', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.Contracts')),
            ],
        ),
        migrations.CreateModel(
            name='ProjectDocumentTypes',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.RemoveField(
            model_name='projectattributes',
            name='attrType',
        ),
        migrations.RemoveField(
            model_name='projectattributes',
            name='stage',
        ),
        migrations.RemoveField(
            model_name='stages',
            name='name',
        ),
        migrations.RemoveField(
            model_name='stages',
            name='project',
        ),
        migrations.AddField(
            model_name='stages',
            name='contract',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='WebPM.Contracts'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='stagetypes',
            name='actualFinishDate',
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name='stagetypes',
            name='actualStartDate',
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name='stagetypes',
            name='allowanceDuration',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='stagetypes',
            name='plannedFinishDate',
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name='stagetypes',
            name='plannedStartDate',
            field=models.DateField(null=True),
        ),
        migrations.DeleteModel(
            name='AttributeTypes',
        ),
        migrations.DeleteModel(
            name='ProjectAttributes',
        ),
        migrations.AddField(
            model_name='projectdocuments',
            name='projectDocumentType',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.ProjectDocumentTypes'),
        ),
        migrations.AddField(
            model_name='projectdocumentdates',
            name='projectDocument',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.ProjectDocuments'),
        ),
        migrations.AddField(
            model_name='accountingdocuments',
            name='accountingDocumentType',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.AccountingDocumentType'),
        ),
        migrations.AddField(
            model_name='accountingdocuments',
            name='contract',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebPM.Contracts'),
        ),
    ]
