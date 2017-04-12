from django.db import models

class RightsSupport(models.Model):

    class Meta:
        managed = False  # No database table creation or deletion operations \
                         # will be performed for this model.
        permissions = (
        )

class Companies(models.Model):
    name = models.CharField(max_length=200)

class Countries(models.Model):
    name = models.CharField(max_length=200)

class Cities(models.Model):
    name = models.CharField(max_length=200)
    country = models.ForeignKey(Countries)

class PaymentTypes(models.Model):
    name = models.CharField(max_length=200)

class ProjectTypes(models.Model):
    name = models.CharField(max_length=200)

class Projects(models.Model):
    name = models.CharField(max_length=200, null=False)
    company = models.ForeignKey(Companies)
    country = models.ForeignKey(Countries)
    city = models.ForeignKey(Cities)
    address = models.CharField(max_length=200)

    class Meta:
        permissions = (
            ("viewProjects", "Access to main project's view"),
            ('addNewProject', 'Adding new project'),
        )

class StageTypes(models.Model):
    name = models.CharField(max_length=200)
    plannedStartDate = models.DateField(null=True)
    plannedFinishDate = models.DateField(null=True)
    actualStartDate = models.DateField(null=True)
    actualFinishDate = models.DateField(null=True)
    allowanceDuration = models.IntegerField(null=True)

class Stages(models.Model):
    stageType = models.ForeignKey(StageTypes)
    contract = models.ForeignKey(Contracts)

class ContractTypes(models.Model):
    name = models.CharField(max_length=200)

class Contracts(models.Model):
    contractType = models.ForeignKey(ContractTypes)
    project = models.ForeignKey(Projects)
    name =  models.CharField(max_length=200, null=False)
    fullPrice = models.IntegerField(null=True)
    startDate = models.DateField(null=True)

class ContractDates(models.Model):
    contract = models.ForeignKey(Contracts)
    approvedDate = models.DateField(null=True)
    sentDate = models.DateField(null=True)
    receivedDate = models.DateField(null=True)
    storedDate = models.DateField(null=True)

class ProjectDocumentTypes(models.Model):
    name = models.CharField(max_length=200)

class ProjectDocuments(models.Model):
    projectDocumentType = models.ForeignKey(ProjectDocumentTypes)
    contract = models.ForeignKey(Contracts)

class ProjectDocumentDates(models.Model):
    projectDocument = models.ForeignKey(ProjectDocuments)
    approvedDate = models.DateField(null=True)
    sentDate = models.DateField(null=True)
    receivedDate = models.DateField(null=True)
    storedDate = models.DateField(null=True)

class Agreements(models.Model):
    name =  models.CharField(max_length=200, null=False)
    document = models.FileField("Document", upload_to="documents/agreements")
    uploadDate = models.DateTimeField(auto_now_add=True)

class AgreementDates(models.Model):
    agreement = models.ForeignKey(Agreements)
    approvedDate = models.DateField(null=True)
    sentDate = models.DateField(null=True)
    receivedDate = models.DateField(null=True)
    storedDate = models.DateField(null=True)

class AccountingDocumentType(models.Model):
    name = models.CharField(max_length=200)

class AccountingDocuments(models.Model):
    accountingDocumentType = models.ForeignKey(AccountingDocumentType)
    contract = models.ForeignKey(Contracts)

class Payments(models.Model):
    contract = models.ForeignKey(Contracts)
    paymentDate = models.DateField()
    paymentAmount = models.IntegerField()
    confirmed = models.BooleanField(default=False)
    confirmedDate = models.DateField(null=True)
    postponed = models.BooleanField(default=False)
    beforePostponedDate = models.DateField(null=True)
    postponeAgreement = models.ForeignKey('Agreements', null=True, related_name='postpone_agreement')
    canceled = models.BooleanField(default=False)
    canceledDate = models.DateField(null=True)
    cancelAgreement = models.ForeignKey('Agreements', null=True, related_name='cancel_agreement')
    split = models.BooleanField(default=False)
    splitAgreement = models.ForeignKey('Agreements', null=True, related_name='split_agreement')
    parentPayment = models.ForeignKey('Payments', null=True)

    class Meta:
        permissions = (
            ("confirmPayment", "Confirm payment"),
            ("unconfirmPayment", "Unconfirm payment"),
            ("postponePayment", "Postpone payment"),
            ("splitPayment", "Split payment"),
            ("cancelPayment", "Cancel payment"),
        )


