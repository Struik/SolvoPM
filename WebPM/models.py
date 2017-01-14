from django.db import models

# Create your models here.
class Companies(models.Model):
    name = models.CharField(max_length=200)

class Countries(models.Model):
    name = models.CharField(max_length=200)

class Cities(models.Model):
    name = models.CharField(max_length=200)
    country = models.ForeignKey(Countries)

class StageTypes(models.Model):
    name = models.CharField(max_length=200)

class PaymentTypes(models.Model):
    name = models.CharField(max_length=200)

class ProjectTypes(models.Model):
    name = models.CharField(max_length=200)

class AttributeTypes(models.Model):
    name = models.CharField(max_length=200)

class Projects(models.Model):
    name = models.CharField(max_length=200)
    company = models.ForeignKey(Companies)
    country = models.ForeignKey(Countries)
    city = models.ForeignKey(Cities)
    address = models.CharField(max_length=200)
    country = models.ForeignKey(Countries)

class Stages(models.Model):
    name = models.CharField(max_length=200)
    stageType = models.ForeignKey(StageTypes)
    projectId = models.ForeignKey(Projects)

class ProjectAttributes(models.Model):
    stageId = models.ForeignKey(Stages)
    attrType = models.ForeignKey(AttributeTypes)
    attrValue = models.IntegerField

