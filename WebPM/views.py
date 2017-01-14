from django.shortcuts import render, render_to_response
from django.views.decorators.csrf import csrf_exempt
from WebPM.models import Companies, Countries, Cities, StageTypes, Stages, AttributeTypes, ProjectAttributes
from WebPM.models import ProjectTypes, PaymentTypes
import logging

logger = logging.getLogger('WebPM')
logger.info('started');


# Create your views here.

@csrf_exempt
def index(request):
    logger.info('Request is: ')
    logger.info(request)
    if(request.POST):
        params = request.POST
        logger.info('POST request params:')
        logger.info(params)
    else:
        projectAttrs = getProjectFormAttrs()
        logger.info('Redirecting to main with project next attrs:')
        logger.info(projectAttrs)
        return render_to_response('main.html', {'projectAttrs': projectAttrs})


def getProjectFormAttrs():
    logger.info('Fetching project attributes')
    data = {}
    projectModels = [Companies, Countries, Cities, StageTypes, PaymentTypes]
    for Model in projectModels:
        data[Model.__name__] = []
        for value in Model.objects.all():
            data[Model.__name__].append(value)

    logger.info('Fetched project attributes: ')
    logger.info(data)
    return data

def main1(request):
    return render_to_response('main_backup.html')