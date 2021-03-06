import os, platform
from django.conf import settings
from django.db.models import Sum, Min, Max
from django.forms.models import model_to_dict
from django.shortcuts import render, render_to_response
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.models import User, Permission
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
from django.db.models import Max, Min
from django.utils.translation import ugettext as _
from datetime import datetime, date
from WebPM.models import Companies, Countries, Cities, Stages, StageTypes, Payments
from WebPM.models import ProjectTypes, PaymentTypes, ContractTypes, Projects, Contracts, Agreements, ContractDates
from itertools import groupby
from operator import itemgetter, methodcaller
from django.core.serializers.json import DjangoJSONEncoder
from django.core import serializers
import logging, json, WebPM, locale
from WebPM.models import models
from django.core.mail import send_mail

logger = logging.getLogger('WebPM')
logger.info('Started')


def logout_page(request):
    logout(request)
    return HttpResponseRedirect('/')


# Page with contracts info and button to add new ones
@login_required
@permission_required('WebPM.viewProjects')
@never_cache
def projects(request):
    logger.info(User.get_all_permissions(request.user))
    logger.info('Projects page requested')
    projectAttrs = getProjectFormAttrs()
    logger.info('Redirecting to main with project next attrs:')
    logger.info(projectAttrs)
    return render(request, 'projects.html', {'LANGUAGES': settings.LANGUAGES, 'projectAttrs': projectAttrs})


# Page with contract info and related objects
@login_required
@permission_required('WebPM.viewContract')
@never_cache
def contract(request):
    logger.info('Contract page requested')
    contractData = get_full_contract_data(70)

    json_serializer = serializers.get_serializer("json")()
    stageTypes = json.loads(json_serializer.serialize(StageTypes.objects.all()))
    logger.info(json_serializer.serialize(StageTypes.objects.all()))

    return render(request, 'contract.html',
                  {'LANGUAGES': settings.LANGUAGES, 'contractData': contractData, 'stageTypes': stageTypes})


def get_full_contract_data(contractId):
    logger.info('Preparing full contract data')
    contractData = {}
    contract = Contracts.objects.filter(pk=contractId)
    logger.info(contract)
    json_serializer = serializers.get_serializer("json")()
    contractData['contract'] = json_serializer.serialize(contract)

    contractDates = get_contract_dates(contractId)
    contractFinance = get_contract_finance(contractId)
    stagesData, stagesSummary = get_stages_data(contractId)
    logger.info('stagesData')
    logger.info(stagesData)
    logger.info(stagesSummary)

    contractData['contractDates'] = json.dumps(contractDates)
    contractData['contractFinance'] = contractFinance
    contractData['stagesData'] = json.dumps(stagesData)
    contractData['stagesSummary'] = stagesSummary
    logger.info('Contract data:')
    logger.info(contractData)
    return contractData


def get_contract_dates(contractId):
    logger.info('Fetching contract dates')
    contractDates = ContractDates.objects.filter(contract_id=contractId).values()[0]
    # Converting dates to display-ready format
    for key in contractDates.keys():
        if isinstance(contractDates[key], date): contractDates[key] = contractDates[key].strftime('%d.%m.%y')
    return contractDates


def get_contract_finance(contractId):
    logger.info('Fetching contract finance')
    contractFinance = {}
    contractFinance['Total'] = \
        Payments.objects.filter(contract_id=contractId, split=False, canceled=False).aggregate(
            sum=Sum('paymentAmount'))[
            'sum']
    contractFinance['Confirmed'] = \
        Payments.objects.filter(contract_id=contractId, confirmed=True).aggregate(sum=Sum('paymentAmount'))['sum']
    return contractFinance


def get_stages_data(contractId):
    stagesData = []
    stagesSummary = {'minDate': '', 'maxDate': '', 'currentStage': ''}
    stages = Stages.objects.filter(contract_id=contractId).order_by('pk')
    if stages:
        stagesSummary['minDate'] = stages.aggregate(min=Min('plannedStartDate'))['min'].strftime('%d.%m.%y')
        stagesSummary['maxDate'] = stages.aggregate(max=Max('plannedFinishDate'))['max'].strftime('%d.%m.%y')
        stagesData = list(stages.values())
        logger.info(stagesData)
        for stage in stagesData:
            stage['stageType'] = StageTypes.objects.get(pk=stage['stageType_id']).name
            if (stage['actualFinishDate'] is None or stage['actualFinishDate'] == date.today()) and stage[
                'actualStartDate']:
                stagesSummary['currentStage'] = stage['stageType']
            for key in stage.keys():
                if isinstance(stage[key], date): stage[key] = stage[key].strftime('%d.%m.%y')
    return stagesData, stagesSummary


# Preparing data for project adding form
def getProjectFormAttrs():
    # send_mail(
    #     'Subject here',
    #     'Here is the message.',
    #     'webpm@solvo.ru',
    #     ['oignashev@solvo.ru'],
    #     fail_silently=False,
    # )
    logger.info('Fetching project attributes')
    data = {}
    json_serializer = serializers.get_serializer("json")()
    projectModels = [Projects, Companies, Countries, Cities, ContractTypes]
    for Model in projectModels:
        data[Model.__name__] = json.loads(json_serializer.serialize(Model.objects.all()))
        logger.info(json_serializer.serialize(Model.objects.all()))
        # for value in list(Model.objects.all()):
        #     logger.info(value)
        #     data[Model.__name__].append(value)

    logger.info('Fetched project attributes: ')
    logger.info(data)
    return data


# Saving new project to the database
@login_required
@csrf_exempt
def new_project(request):
    logger.info('Got new project request')
    logger.info(request)
    if (request.POST):
        logger.info('Request is POST:')
        params = json.loads(request.POST.get('projectData'))
        logger.info('POST request params:')
        logger.info(params)

        if params['selectProject'].isdigit() and Projects.objects.filter(id=params['selectProject']).exists():
            projectId = params['selectProject']
        else:
            projectObject = Projects(name=params['selectProject'], company_id=params['selectCompany'],
                                     country_id=params['selectCountry'], city_id=params['selectCity'],
                                     address=params['Address'])
            projectObject.save()
            projectId = projectObject.id
        logger.info(params['contracts'])
        for contracts in params['contracts']:
            logger.info('Creating new contract:')
            logger.info(contracts)
            contractObject = Contracts(name=contracts['name'], contractType_id=contracts['type'],
                                       project_id=projectId)
            contractObject.save()
            contractDatesObject = contractDates(contract=contractObject)
            contractDatesObject.save()
            logger.info('Contract #' + str(contractObject.id) + ' created')
            for payment in contracts['payments'].items():
                logger.info('Adding payment:')
                logger.info(payment)
                paymentDate = datetime.strptime(payment[1]['date'], '%d.%m.%Y')
                paymentObject = Payments(contract_id=contractObject.id, paymentDate=paymentDate,
                                         paymentAmount=payment[1]['amount'])
                paymentObject.save()
                logger.info('Payment #' + str(paymentObject.id) + ' created')
    return HttpResponse(json.dumps({'newProjectId': projectId}), content_type='application/json')


# Saving new reference value to the database. Value can be added via project adding form
@login_required
@csrf_exempt
def new_ref_value(request):
    logger.info(request.user)
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


@login_required
@never_cache
@csrf_exempt
def get_projects_data(request):
    logger.info('Preparing projects data')

    if platform.system() == 'Windows':
        locale.setlocale(locale.LC_ALL, 'ru')
    else:
        locale.setlocale(locale.LC_ALL, 'ru_RU')

    paymentsObject = Payments.objects.order_by('contract', 'paymentDate')

    if not paymentsObject:
        return HttpResponse('No data')

    minDate = min(date for date in [paymentsObject.aggregate(Min('paymentDate'))['paymentDate__min'],
                                    paymentsObject.aggregate(Min('confirmedDate'))['confirmedDate__min']] if
                  date is not None)
    maxDate = max(date for date in [paymentsObject.aggregate(Max('paymentDate'))['paymentDate__max'],
                                    paymentsObject.aggregate(Max('confirmedDate'))['confirmedDate__max']] if
                  date is not None)
    logger.info('Date period from ' + minDate.strftime('%d.%m.%Y') + ' to ' + maxDate.strftime('%d.%m.%Y'))

    monthsDict = getMonthList(minDate, maxDate)
    logger.info('Months in period: ' + str(monthsDict))

    paymentPeriod = (maxDate.year - minDate.year) * 12 + maxDate.month - minDate.month + 1
    logger.info('Payment period is ' + str(paymentPeriod))

    # Rather putting several lines in one column "Project" than having 2 extra columns (not implemented - table size issue)
    columnsBasic = ['#', _('Project name'), _('Contract type'), _('Contract name'), 'DT_RowId']
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
    projectCounter = 0
    currentProjectName = '';

    for (key, group) in groupby(paymentsObject, lambda x: dict(zip(columnsBasic, [0, x.contract.project.name,
                                                                                  x.contract.contractType.name,
                                                                                  x.contract.name,
                                                                                  x.contract.id]))):
        paymentsByDates = {month: {'planned': '', 'confirmed': '', 'paymentIds': []} for month in paymentDict}
        logger.info('key: ' + str(key))
        logger.info(key[_('Project name')])
        logger.info(currentProjectName)
        logger.info(key['#'])
        logger.info(projectCounter)
        if currentProjectName != key[_('Project name')]:
            currentProjectName = key[_('Project name')]
            projectCounter += 1
        logger.info(paymentsByDates)
        for item in group:
            paymentsFullData[item.id] = {}
            payment = paymentsFullData[item.id]

            logger.info(item.paymentDate)
            month = item.paymentDate.strftime('%B%y')
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
                confirmedMonth = item.confirmedDate.strftime('%B%y')
                if confirmedMonth != month:
                    paymentsByDates[confirmedMonth]['paymentIds'].append(item.id)
                if paymentsByDates[confirmedMonth]['confirmed']:
                    paymentsByDates[confirmedMonth]['confirmed'] += item.paymentAmount if item.confirmed else 0
                else:
                    paymentsByDates[confirmedMonth]['confirmed'] = item.paymentAmount if item.confirmed else ''
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
                payment['confirmedDate'] = _('Canceled')
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
        paymentsByDates['#'] = projectCounter
        logger.info('paymentsByDates: ' + str(paymentsByDates))
        logger.info('paymentsFullData: ' + str(paymentsFullData))
        # Python 3.5 syntax
        paymentsGroupedData.append({**key, **paymentsByDates})

    logger.info('Payments data:')
    logger.info(paymentsGroupedData)
    logger.info(paymentsFullData)
    logger.info(_('Log In'))
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
        monthsDict[(datetime(y, m + 1, 1).strftime('%B %y'))] = i
        i += 1
    return monthsDict


# Confirm payment
@login_required
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
@login_required
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
@login_required
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
@login_required
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
@login_required
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


# Downloading specified agreement
@login_required
def download_agreement(request):
    logger.info('Download agreement request')
    logger.info(request)
    if (request.GET):
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


# Changing contract date
@login_required
@csrf_exempt
def change_contract_date(request):
    logger.info('Change contract date request')
    logger.info(request)
    if (request.POST):
        logger.info('Request is POST:')
        params = request.POST
        logger.info('POST request params:')
        logger.info(params)
        contract = Contracts.objects.get(pk=params['contractId'])
        logger.info('Found contract: ' + str(contract.name))
        contract.status = params['contractStatus']
        contract.save();
        contractDate = datetime.strptime(params['contractDate'], '%d.%m.%y') if params['contractDate'] else None
        contractDates = ContractDates.objects.get(contract=contract)
        setattr(contractDates, params['contractDateDbField'], contractDate)
        contractDates.save()
        return HttpResponse('')


# Adding new stage
@login_required
@csrf_exempt
def add_new_stage(request):
    logger.info('Stage adding request')
    logger.info(request)
    if (request.POST):
        logger.info('Request is POST:')
        params = request.POST
        logger.info('POST request params:')
        logger.info(params)
        newStage = Stages(stageType_id=params['selectStageType'], contract_id=params['contract_id'], status='Scheduled',
                          plannedStartDate=datetime.strptime(params['stageStartDate'], '%d.%m.%y'),
                          plannedFinishDate=datetime.strptime(params['stageFinishDate'], '%d.%m.%y'))
        newStage.save()
        logger.info('Saved new stage with id: ' + str(newStage.id))
        return HttpResponse('')


# Changing stage date
@login_required
@csrf_exempt
def change_stage_date(request):
    logger.info('Change stage date request')
    logger.info(request)
    if (request.POST):
        logger.info('Request is POST:')
        params = request.POST
        logger.info('POST request params:')
        logger.info(params)
        stage = Stages.objects.get(pk=params['stageId'])
        stage.status = params['stageStatus']
        stageDate = datetime.strptime(params['stageDate'], '%d.%m.%y') if params['stageDate'] else None
        setattr(stage, params['stageDateDbField'], stageDate)
        stage.save()
        return HttpResponse('')
