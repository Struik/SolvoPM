"""SolvoPM URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from WebPM import views

urlpatterns = [
    url(r'^$', views.index, name='pm'),
    url(r'^projects', views.projects, name='projects'),
    url(r'^get_projects_data', views.get_projects_data, name='get_projects_data'),
    url(r'^new_project', views.new_project, name='new_project'),
    url(r'^new_ref_value', views.new_ref_value, name='new_ref_value'),
    url(r'^confirm_payment', views.confirm_payment, name='confirm_payment'),
    url(r'^unconfirm_payment', views.unconfirm_payment, name='unconfirm_payment'),
    url(r'^postpone_payment', views.postpone_payment, name='postpone_payment'),
    url(r'^cancel_payment', views.cancel_payment, name='cancel_payment'),
    url(r'^split_payment', views.split_payment, name='split_payment'),
    url(r'^download_agreement', views.download_agreement, name='download_agreement'),
    url(r'^admin/', admin.site.urls),
]
