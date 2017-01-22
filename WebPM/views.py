from django.shortcuts import render, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from WebPM.models import Companies, Countries, Cities, StageTypes, Stages, AttributeTypes, ProjectAttributes
from WebPM.models import ProjectTypes, PaymentTypes, ContractTypes, Projects, Contracts, Payments
import logging, json, WebPM, datetime

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
            contractObject = Contracts(name=contracts['name'], contractType_id = contracts['type'])
            contractObject.save()
            logger.info('Contract #' + str(contractObject.id) +' created')
            for payment in contracts['payments']:
                logger.info('Adding payment:')
                logger.info(payment)
                paymentDate = datetime.datetime.strptime(payment['date'], '%d.%m.%Y')
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