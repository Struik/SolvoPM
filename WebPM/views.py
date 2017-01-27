from django.shortcuts import render, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Max, Min
from datetime import datetime
from WebPM.models import Companies, Countries, Cities, StageTypes, Stages, AttributeTypes, ProjectAttributes
from WebPM.models import ProjectTypes, PaymentTypes, ContractTypes, Projects, Contracts, Payments
from itertools import groupby
from operator import itemgetter, methodcaller
import logging, json, WebPM


from WebPM.models import models


logger = logging.getLogger('WebPM')
logger.info('started');


# Create your views here.

#Main page which contains only two buttons at the moment: project adding and projects displaying
def index(request):
    logger.info('Request is: ')
    logger.info(request)
    projectAttrs = getProjectFormAttrs()
    logger.info('Redirecting to main with project next attrs:')
    logger.info(projectAttrs)
    return render_to_response('main.html', {'projectAttrs': projectAttrs})

#Preparing data for project adding form
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

#Saving new project to the database
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
            logger.info('Created new contract:')
            logger.info(contracts)
            contractObject = Contracts(name=contracts['name'], contractType_id = contracts['type'], project_id = projectObject.id)
            contractObject.save()
            logger.info('Contract #' + str(contractObject.id) +' created')
            for payment in contracts['payments']:
                logger.info('Adding payment:')
                logger.info(payment)
                paymentDate = datetime.strptime(payment['date'], '%d.%m.%Y')
                paymentObject = Payments(contract_id = contractObject.id, paymentDate = paymentDate,
                                         paymentAmount = payment['amount'])
                paymentObject.save()
                logger.info('Payment #' + str(paymentObject.id) + ' created')
    return HttpResponse(json.dumps({'newProjectId': projectObject.id}), content_type='application/json')

#Saving new reference value to the database. Value can be added via project adding form
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
        ref = model(name = params['value'])
        ref.save()
        logger.info('New reference value id: ' + str(ref.id))
    return HttpResponse(json.dumps({'refId': ref.id}), content_type='application/json')


#Page with projects info. Table with all the data from DB
def projects(request):
    logger.info('Projects page requested')
    return render_to_response('projects.html')


@csrf_exempt
def getProjectsData(request):
    logger.info('Preparing projects data')

    paymentsObject = Payments.objects.order_by('contract', 'paymentDate')

    minDate = min(payment.paymentDate for payment in paymentsObject)
    maxDate = max(payment.paymentDate for payment in paymentsObject)
    logger.info('Date period from ' + minDate.strftime('%d.%m.%Y') + ' to ' + maxDate.strftime('%d.%m.%Y'))

    monthsDict = getMonthList(minDate, maxDate)
    logger.info('Months in period: ' + str(monthsDict))

    paymentPeriod = (maxDate.year - minDate.year)*12 + maxDate.month - minDate.month + 1
    logger.info('Payment period is ' + str(paymentPeriod))

    columnsBasic = ['Project name', 'Manager', 'Current state', 'Contract type', 'Contract name', 'DT_RowId']
    logger.info('Basic column headers: ' + str(columnsBasic))

    columnsDicted = []
    monthsList = list(monthsDict.items())
    monthsList.sort(key=lambda x: x[1])
    for i in range(len(columnsBasic)):
        #Columns with DT ain't for showing in the table but for technical usage
        if not columnsBasic[i].startswith('DT'):
            columnsDicted.append({'data': columnsBasic[i], 'title': columnsBasic[i]})
    for i in range(len(monthsList)):
        columnsDicted.append({'data': monthsList[i][0].replace(' ','') + '.amount', 'title': monthsList[i][0]})
    logger.info('Final column headers: ' + str(columnsDicted))

    paymentsDataDicted = []
    paymentDict = dict(zip([i.replace(' ','') for i in monthsDict.keys()], [''] * len(monthsDict)))
    logger.info('PaymentDict: ' + str(paymentDict))

    for (key, group) in groupby(paymentsObject, lambda x: dict(zip(columnsBasic, [x.contract.project.name,
                                                                                  'Ahmetshin',
                                                                                  'Configuration',
                                                                                  x.contract.contractType.name,
                                                                                  x.contract.name,
                                                                                  x.contract.id]))):
        paymentPlannedDates = {key: {'amount': ''} for key in paymentDict}
        paymentFactDates = {key: {'amount': ''} for key in paymentDict}
        logger.info('key: ' +  str(key))
        for item in group:
            logger.info(item.paymentDate)
            month = item.paymentDate.strftime('%b%y')
            logger.info('month: ' + str(month))
            logger.info('payment amount:' + str(item.paymentAmount))
            paymentPlannedDates[month]['amount'] = item.paymentAmount
            paymentPlannedDates[month]['id'] = item.id
            paymentPlannedDates[month]['split'] = item.isSplit
            paymentPlannedDates[month]['date'] = item.paymentDate.strftime('%d.%m.%Y')
            if item.isSplit:
                logger.info('payment is split')
                splitPayments = Payments.objects.filter(parentPayment = item.id)
                logger.info(splitPayments)
                paymentPlannedDates[month]['splitPayments'] = []
                for splitPayment in splitPayments:
                    paymentPlannedDates[month]['splitPayments'].append({'id': splitPayment.id, 'date': item.paymentDate.strftime('%d.%m.%Y'), 'amount': item.paymentAmount})
            if item.payed:
                paymentFactDates[month]['amount'] = item.paymentAmount
                paymentFactDates[month]['id'] = item.id
                paymentFactDates[month]['split'] = item.isSplit
                paymentFactDates[month]['date'] = item.paymentDate.strftime('%d.%m.%Y')
        paymentPlannedDates.update(key)
        logger.info('paymentPlannedDates: ' + str(paymentPlannedDates))
        paymentsDataDicted.append({**key, **paymentPlannedDates})
        paymentsDataDicted.append({**key, **paymentFactDates})

    logger.info('Payments data:')
    logger.info(paymentsDataDicted)
    return HttpResponse(json.dumps({'payments': paymentsDataDicted, 'columns': columnsDicted}), content_type='application/json')

#Function to make an array of dictionaties with months as keys and numerical order as value.
#E.g.: with minDate = 21.12.2016 and maxDate = 04.02.2017 an array will be [{'Dec 16': 1}, {'Jan 17': 2}, {'Feb 17': 3}]
def getMonthList(minDate, maxDate):
    totalMonths = lambda dt: dt.month + 12 * dt.year
    monthsDict = {}
    i = 0
    for monthsRange in range(totalMonths(minDate)-1, totalMonths(maxDate)):
        y, m = divmod(monthsRange, 12)
        monthsDict[(datetime(y, m + 1, 1).strftime('%b %y'))] = i
        i += 1
    return monthsDict