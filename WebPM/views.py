from django.shortcuts import render, render_to_response
from django.views.decorators.csrf import csrf_exempt


# Create your views here.

@csrf_exempt
def index(request):
    print(request)
    params = request.POST
    print('params:')
    print(params)
    return render_to_response('main.html')

def main1(request):
    return render_to_response('main_backup.html')