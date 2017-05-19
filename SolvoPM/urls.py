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
from django.conf.urls import url, include, i18n
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.views.i18n import JavaScriptCatalog
from WebPM import views
from django.utils.translation import ugettext as _

js_info_dict = {
    'domain': 'djangojs',
    'packages': ('WebPM',),
}

#admin.site.site_header = "Cute Cat Entreprise"

urlpatterns = [
    url(r'^$', views.projects, name='projects'),
    url(r'^contract$', views.contract, name='contract'),

    url(r'^i18n/', include('django.conf.urls.i18n')),
    url(r'^jsi18n/$', JavaScriptCatalog.as_view(), name='javascript-catalog'),

    #Payments(projects) page
    url(r'^get_projects_data', views.get_projects_data, name='get_projects_data'),
    url(r'^new_project', views.new_project, name='new_project'),
    url(r'^new_ref_value', views.new_ref_value, name='new_ref_value'),

    #Payments(projects) actions
    url(r'^confirm_payment', views.confirm_payment, name='confirm_payment'),
    url(r'^unconfirm_payment', views.unconfirm_payment, name='unconfirm_payment'),
    url(r'^postpone_payment', views.postpone_payment, name='postpone_payment'),
    url(r'^cancel_payment', views.cancel_payment, name='cancel_payment'),
    url(r'^split_payment', views.split_payment, name='split_payment'),
    url(r'^download_agreement', views.download_agreement, name='download_agreement'),

    #Contract actions
    url(r'^change_contract_date', views.change_contract_date, name='change_contract_date'),
    url(r'^add_new_stage', views.add_new_stage, name='add_new_stage'),
    url(r'^change_stage_date', views.change_stage_date, name='change_stage_date'),

    #System urls
    url(r'^admin/', admin.site.urls),
    url(r'^accounts/login/$', auth_views.login,  {
        'template_name': 'admin/login.html',
        'extra_context': {'site_header': 'Log In'},
    },
    name='login'),
    url(r'^logout/$', views.logout_page),
]
