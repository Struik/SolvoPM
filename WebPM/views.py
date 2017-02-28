import os
from django.conf import settings
from django.shortcuts import render, render_to_response
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Max, Min
from datetime import datetime
from WebPM.models import Companies, Countries, Cities, StageTypes, Stages, AttributeTypes, ProjectAttributes
from WebPM.models import ProjectTypes, PaymentTypes, ContractTypes, Projects, Contracts, Payments, Agreements
from itertools import groupby
from operator import itemgetter, methodcaller
import logging, json, WebPM

from WebPM.models import models

logger = logging.getLogger('WebPM')
logger.info('started');


# Create your views here.

# Main page which contains only two buttons at the moment: project adding and projects displaying
def index(request):
    logger.info('Request is: ')
    logger.info(request)
    projectAttrs = getProjectFormAttrs()
    logger.info('Redirecting to main with project next attrs:')
    logger.info(projectAttrs)
    return render_to_response('main.html', {'projectAttrs': projectAttrs})


# Preparing data for project adding form
def getProjectFormAttrs():
    logger.info('Fetching project attributes')
    data = {}
    projectModels = [Companies, Countries, Cities, StageTypes, PaymentTypes, ContractTypes]
    for Model in projectModels:
        data[Model.__name__] = []
        for value in Model.objects.all():
            data[Model.__name__].append(value)

    logger.info('Fetched project attributes: ')
    logger.info(data)
    return data


# Saving new project to the database
@csrf_exempt
def new_project(request):
    logger.info('Got new project request')
    logger.info(request)
    if (request.POST):
        logger.info('Request is POST:')
        params = json.loads(request.POST.get('projectData'))
        logger.info('POST request params:')
        logger.info(params)

        projectObject = Projects(name=params['projectName'], company_id=params['selectCompany'],
                                 country_id=params['selectCountry'], city_id=params['selectCity'],
                                 address=params['Address'])
        projectObject.save()
        logger.info(params['contracts'])
        for contracts in params['contracts']:
            logger.info('Creating new contract:')
            logger.info(contracts)
            contractObject = Contracts(name=contracts['name'], contractType_id=contracts['type'],
                                       project_id=projectObject.id)
            contractObject.save()
            logger.info('Contract #' + str(contractObject.id) + ' created')
            for payment in contracts['payments'].items():
                logger.info('Adding payment:')
                logger.info(payment)
                paymentDate = datetime.strptime(payment[1]['date'], '%d.%m.%Y')
                paymentObject = Payments(contract_id=contractObject.id, paymentDate=paymentDate,
                                         paymentAmount=payment[1]['amount'])
                paymentObject.save()
                logger.info('Payment #' + str(paymentObject.id) + ' created')
    return HttpResponse(json.dumps({'newProjectId': projectObject.id}), content_type='application/json')


# Saving new reference value to the database. Value can be added via project adding form
@csrf_exempt
def new_ref_value(request):
    logger.info('Got new reference value')
    logger.info(request)
    if (request.POST):
        params = request.POST
        logger.info('POST request params:')
        logger.info(params)
        logger.info(params['referenceName'])
        model = getattr(WebPM.models, params['referenceName'])
        logger.info(model)
        ref = model(name=params['value'])
        # If parentReference exists then given reference has foreign key to another reference
        if 'parentReference' in params:
            logger.info(str(params['referenceName']) + ' is linked to another reference')
            parentRef = json.loads(params['parentReference'])
            logger.info(parentRef)
            parentField = list(parentRef.keys())[0]
            parentValue = parentRef[parentField]
            setattr(ref, parentField, parentValue)
        logger.info(ref)
        ref.save()
        logger.info('New reference value id: ' + str(ref.id))
    return HttpResponse(json.dumps({'refId': ref.id}), content_type='application/json')


# Page with projects info. Table with all the data from DB
def projects(request):
    logger.info('Projects page requested')
    return render_to_response('projects.html')


@csrf_exempt
def get_projects_data(request):
    logger.info('Preparing projects data')

    paymentsObject = Payments.objects.order_by('contract', 'paymentDate')

    if not paymentsObject:
        return HttpResponse('No data')

    minDate = min(payment.paymentDate for payment in paymentsObject)
    maxDate = max(payment.paymentDate for payment in paymentsObject)
    logger.info('Date period from ' + minDate.strftime('%d.%m.%Y') + ' to ' + maxDate.strftime('%d.%m.%Y'))

    monthsDict = getMonthList(minDate, maxDate)
    logger.info('Months in period: ' + str(monthsDict))

    paymentPeriod = (maxDate.year - minDate.year) * 12 + maxDate.month - minDate.month + 1
    logger.info('Payment period is ' + str(paymentPeriod))

    # Rather putting several lines in one column "Project" than having 2 extra columns (not implemented - table size issue)
    columnsBasic = ['Project name', 'Manager', 'Current state', 'Contract type', 'Contract name', 'DT_RowId']
    # columnsBasic = ['Project', 'Contract type', 'Contract name', 'DT_RowId']
    logger.info('Basic column headers: ' + str(columnsBasic))

    columnsDicted = []
    monthsList = list(monthsDict.items())
    monthsList.sort(key=lambda x: x[1])
    for i in range(len(columnsBasic)):
        # Columns with DT ain't for showing in the table but for technical usage
        if not columnsBasic[i].startswith('DT'):
            columnsDicted.append({'data': columnsBasic[i], 'caption': columnsBasic[i]})
    for i in range(len(monthsList)):
        columnsDicted.append({'data': monthsList[i][0].replace(' ', '') + '.planned', 'caption': monthsList[i][0]})
        columnsDicted.append({'data': monthsList[i][0].replace(' ', '') + '.confirmed', 'caption': monthsList[i][0]})
    logger.info('Final column headers: ' + str(columnsDicted))

    paymentsGroupedData = []
    paymentDict = dict(zip([i.replace(' ', '') for i in monthsDict.keys()], [''] * len(monthsDict)))
    logger.info('PaymentDict: ' + str(paymentDict))

    paymentsFullData = {}

    for (key, group) in groupby(paymentsObject, lambda x: dict(zip(columnsBasic, [x.contract.project.name,
                                                                                  'Ahmetshin',
                                                                                  'Configuration',
                                                                                  x.contract.contractType.name,
                                                                                  x.contract.name,
                                                                                  x.contract.id]))):
        paymentsByDates = {month: {'planned': '', 'confirmed': '', 'paymentIds': []} for month in paymentDict}
        logger.info('key: ' + str(key))
        logger.info(paymentsByDates)
        for item in group:
            paymentsFullData[item.id] = {}
            payment = paymentsFullData[item.id]

            logger.info(item.paymentDate)
            month = item.paymentDate.strftime('%b%y')
            logger.info('month: ' + str(month))
            logger.info('id: ' + str(item.id))
            logger.info('payment amount: ' + str(item.paymentAmount))
            paymentsByDates[month]['paymentIds'].append(item.id)
            # Summing up planned and confirmed payments if it's not first one for this month else assigning it's value
            if paymentsByDates[month]['planned']:
                paymentsByDates[month]['planned'] += item.paymentAmount if not (item.canceled or item.split) else 0
            else:
                # TODO change to something more readable?
                paymentsByDates[month]['planned'] = item.paymentAmount if not (
                    item.canceled or item.split) else 0 if item.canceled else ''
            if item.confirmed:
                if paymentsByDates[month]['confirmed']:
                    paymentsByDates[month]['confirmed'] += item.paymentAmount if item.confirmed else 0
                else:
                    paymentsByDates[month]['confirmed'] = item.paymentAmount if item.confirmed else ''
            payment['amount'] = item.paymentAmount
            payment['parentPayment'] = item.parentPayment.id if item.parentPayment else 0
            payment['date'] = item.paymentDate.strftime('%d.%m.%y')
            payment['confirmed'] = item.confirmed
            payment['confirmedDate'] = item.confirmedDate.strftime('%d.%m.%y') if item.confirmed else ''
            payment['postponed'] = item.postponed
            if item.postponed:
                payment['initialDate'] = item.beforePostponedDate.strftime('%d.%m.%y')
                payment['postponeAgreementId'] = item.postponeAgreement.id
                payment['postponeAgreementName'] = item.postponeAgreement.name
            payment['canceled'] = item.canceled
            if item.canceled:
                payment['cancelAgreementId'] = item.cancelAgreement.id
                payment['cancelAgreementName'] = item.cancelAgreement.name
                payment['confirmedDate'] = 'Canceled'
            payment['split'] = item.split
            if item.split:
                logger.info('Payment is split')
                logger.info(
                    'Agreement id is: ' + str(item.splitAgreement.id) + ', name: ' + str(item.splitAgreement.name))
                payment['splitAgreementId'] = item.splitAgreement.id
                payment['splitAgreementName'] = item.splitAgreement.name
                payment['childPayments'] = []
                childPayments = Payments.objects.filter(parentPayment=item.id)
                logger.info(childPayments)
                for childPayment in childPayments:
                    payment['childPayments'].append(
                        {'id': childPayment.id, 'date': childPayment.paymentDate.strftime('%d.%m.%y'),
                         'amount': childPayment.paymentAmount})
        paymentsByDates.update(key)
        logger.info('paymentsByDates: ' + str(paymentsByDates))
        logger.info('paymentsFullData: ' + str(paymentsFullData))
        # Python 3.5 syntax
        paymentsGroupedData.append({**key, **paymentsByDates})

    logger.info('Payments data:')
    logger.info(paymentsGroupedData)
    logger.info(paymentsFullData)
    return HttpResponse(json.dumps({'payments': paymentsGroupedData, 'columns': columnsDicted,
                                    'paymentsFullData': paymentsFullData}), content_type='application/json')


# Function to make an array of dictionaties with months as keys and numerical order as value.
# E.g.: with minDate = 21.12.2016 and maxDate = 04.02.2017 an array will be [{'Dec 16': 1}, {'Jan 17': 2}, {'Feb 17': 3}]
def getMonthList(minDate, maxDate):
    totalMonths = lambda dt: dt.month + 12 * dt.year
    monthsDict = {}
    i = 0
    for monthsRange in range(totalMonths(minDate) - 1, totalMonths(maxDate)):
        y, m = divmod(monthsRange, 12)
        monthsDict[(datetime(y, m + 1, 1).strftime('%b %y'))] = i
        i += 1
    return monthsDict


# Confirm payment
@csrf_exempt
def confirm_payment(request):
    logger.info('Confirm payment request')
    logger.info(request)
    if (request.POST):
        logger.info('Request is POST:')
        params = request.POST
        logger.info('POST request params:')
        logger.info(params)
        paymentId = params['paymentId']
        confirmedDate = datetime.strptime(params['confirmDate'], '%d.%m.%Y')
        Payments.objects.filter(pk=paymentId).update(confirmed=True, confirmedDate=confirmedDate)
    return HttpResponse('')


# Unconfirm payment
@csrf_exempt
def unconfirm_payment(request):
    logger.info('Unconfirm payment request')
    logger.info(request)
    if (request.POST):
        logger.info('Request is POST:')
        params = request.POST
        logger.info('POST request params:')
        logger.info(params)
        paymentId = params['paymentId']
        Payments.objects.filter(pk=paymentId).update(confirmed=False, confirmedDate=None)
    return HttpResponse('')


# Postpone payment
@csrf_exempt
def postpone_payment(request):
    logger.info('Postpone payment request')
    logger.info(request)
    logger.info(request.POST)
    logger.info(request.FILES.keys())
    if (request.POST and request.FILES):
        logger.info('Request is POST and FILES:')
        params = request.POST
        logger.info('POST request params:')
        logger.info(params)

        documentName = params['postponeDocumentName']
        logger.info('Saving file: ' + str(documentName))
        newDocument = Agreements(document=request.FILES['document'], name=documentName)
        newDocument.save()
        logger.info('Saved file with id: ' + str(newDocument.id))

        paymentId = params['paymentId']
        newPaymentDate = datetime.strptime(params['postponePaymentDate'], '%d.%m.%Y')
        payment = Payments.objects.get(pk=paymentId)
        payment.postponed = True
        payment.beforePostponedDate = payment.paymentDate
        payment.paymentDate = newPaymentDate
        payment.postponeAgreement = newDocument
        payment.save()
    return HttpResponse('')


# Cancel payment
@csrf_exempt
def cancel_payment(request):
    logger.info('Cancel payment request')
    logger.info(request)
    logger.info(request.POST)
    logger.info(request.FILES.keys())
    if (request.POST and request.FILES):
        logger.info('Request is POST and FILES:')
        params = request.POST
        logger.info('POST request params:')
        logger.info(params)

        documentName = params['cancelDocumentName']
        logger.info('Saving file: ' + str(documentName))
        newDocument = Agreements(document=request.FILES['document'], name=documentName)
        newDocument.save()
        logger.info('Saved file with id: ' + str(newDocument.id))

        paymentId = params['paymentId']
        canceledDate = datetime.now()
        payment = Payments.objects.get(pk=paymentId)
        payment.canceled = True
        payment.canceledDate = canceledDate
        payment.cancelAgreement = newDocument
        payment.save()
    return HttpResponse('')


# Saving new document value to the database
@csrf_exempt
def split_payment(request):
    logger.info('Split payment request')
    logger.info(request.method)
    logger.info(request.POST)
    logger.info(request.FILES.keys())
    if (request.POST and request.FILES):
        logger.info('Request is POST and FILES:')
        params = request.POST
        logger.info('POST request params:')
        logger.info(params)

        documentName = params['splitDocumentName']
        logger.info('Saving file: ' + str(documentName))
        newDocument = Agreements(document=request.FILES['document'], name=documentName)
        newDocument.save()
        logger.info('Saved file with id: ' + str(newDocument.id))

        logger.info('Splitting payment')
        payment = json.loads(params['splitPayment'])
        logger.info(payment)
        paymentId = payment['paymentId']
        logger.info('Payment id:' + str(paymentId))
        splitPayment = Payments.objects.get(pk=paymentId)
        contractId = splitPayment.contract.id
        logger.info('Contract id: ' + str(contractId))
        splitPayment.split = True
        splitPayment.splitAgreement = newDocument
        splitPayment.save()

        for childPayment in payment['childPayments']:
            logger.info('Creating child payment:')
            logger.info(childPayment)
            childPaymentDate = datetime.strptime(childPayment['date'], '%d.%m.%Y')
            childPaymentObject = Payments(contract_id=contractId, paymentDate=childPaymentDate,
                                          paymentAmount=childPayment['amount'], parentPayment_id=paymentId)
            childPaymentObject.save()
            logger.info('Payment #' + str(childPaymentObject.id) + ' created')
    return HttpResponse('')

#Downloading specified agreement
def download_agreement(request):
    logger.info('Download agreement request')
    logger.info(request)
    if(request.GET):
        logger.info('Request is GET:')
        params = request.GET
        logger.info('GET request params:')
        logger.info(params)
        splitPayment = Agreements.objects.get(pk=params['id'])
        file_path = splitPayment.document.file.name
        logger.info(file_path);
        logger.info('Agreement path: ' + str(file_path))
        if os.path.exists(file_path):
            with open(file_path, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type="application/force-download")
                response['Content-Disposition'] = 'attachment; filename=' + os.path.basename(file_path)
                return response
        else:
            raise Http404

