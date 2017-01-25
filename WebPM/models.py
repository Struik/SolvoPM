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
    name = models.CharField(max_length=200, null=False)
    company = models.ForeignKey(Companies)
    country = models.ForeignKey(Countries)
    city = models.ForeignKey(Cities)
    address = models.CharField(max_length=200)

class Stages(models.Model):
    name = models.CharField(max_length=200)
    stageType = models.ForeignKey(StageTypes)
    project = models.ForeignKey(Projects)

class ProjectAttributes(models.Model):
    stage = models.ForeignKey(Stages)
    attrType = models.ForeignKey(AttributeTypes)
    attrValue = models.IntegerField()

class ContractTypes(models.Model):
    name =  models.CharField(max_length=200)

class Contracts(models.Model):
    project = models.ForeignKey(Projects)
    contractType = models.ForeignKey(ContractTypes)
    name =  models.CharField(max_length=200, null=False)
    fullPrice = models.IntegerField(null=True)
    startDate = models.DateField(null=True)

class Payments(models.Model):
    contract = models.ForeignKey(Contracts)
    paymentDate = models.DateField()
    paymentAmount = models.IntegerField()
    payed = models.BooleanField(default=False)
    isSplit = models.BooleanField(default=False)
    parentPayment = models.ForeignKey('Payments', null=True)
