from django.shortcuts import render, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Max, Min
from datetime import datetime
from WebPM.models import Companies, Countries, Cities, StageTypes, Stages, AttributeTypes, ProjectAttributes
from WebPM.models import ProjectTypes, PaymentTypes, ContractTypes, Projects, Contracts, Payments
from itertools import groupby
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
    logger.info('Preparing projects data')

    paymentsObject = Payments.objects.order_by('paymentDate')
    paymentsByMonth = {}

    minDate = min(payment.paymentDate for payment in paymentsObject)
    maxDate = max(payment.paymentDate for payment in paymentsObject)
    logger.info('Date period from ' + minDate.strftime('%d.%m.%Y') + ' to ' + maxDate.strftime('%d.%m.%Y'))

    monthList = getMonthList(minDate, maxDate)
    logger.info(monthList)

    paymentPeriod = (maxDate.year - minDate.year)*12 + maxDate.month - minDate.month + 1
    logger.info('Payment period is ' + str(paymentPeriod))

    paymentsData = []

    for payment in paymentsObject:

        paymentsData.append([payment.contract.project.name, 'Ahmetshin', 'Configuration', payment.contract.contractType.name, payment.contract.name])

    logger.info(paymentsData)

    for (grouping_type, group) in groupby(paymentsObject, lambda x: x.paymentDate.strftime('%B')):
        logger.info(grouping_type)
        logger.info(group)
    return render_to_response('projects.html', {'payments': paymentsObject})


def getMonthList(minDate, maxDate):
    totalMonths = lambda dt: dt.month + 12 * dt.year
    monthList = []
    for monthsRange in range(totalMonths(minDate)-1, totalMonths(maxDate)):
        y, m = divmod(monthsRange, 12)
        monthList.append(datetime(y, m+1, 1).strftime("%B %y"))
    return monthList