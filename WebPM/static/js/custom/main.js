'use strict'

$(document).ready(function(){
    var addContractForm = $("#addContractForm");

    //Enabling jquery steps addon on contract adding form
    addContractForm.steps({
        headerTag: "h3",
        bodyTag: "section",
        transitionEffect: 1,
        autoFocus: true,
        enableCancelButton: true,
        labels:
        {
            current: "",
            cancel: gettext('Cancel'),
            previous: gettext('Previous'),
            next: gettext('Next'),
            finish: gettext('Save'),
        },
        onStepChanging: function (event, currentIndex, newIndex)
        {
            // Always allow going backward even if the current step contains invalid fields!
            if (currentIndex > newIndex)
            {
                return true;
            }

            var form = $(this)
            // Clean up if user went backward before
            if (currentIndex < newIndex)
            {
                // To remove success and error styles
                $(".body:eq(" + newIndex + ") label.error", form).remove();
                $(".body:eq(" + newIndex + ") .error", form).removeClass("error");
                $(".body:eq(" + newIndex +  ") .has-error.has-danger").removeClass("has-error has-danger")
                $(".body:eq(" + newIndex +  ") .has-success").removeClass("has-success");
            }

            // Start validation; Prevent going forward if false
            return form.valid();
        },
        onFinishing: function (event, currentIndex)
        {
            return true;
        },
        onFinished: function (event, currentIndex)
        {
            if($('#paymentDate').val() || $('#paymentAmount').val()){
                $('.save-alert').removeClass('hidden');
                $('.save-alert').fadeOut();
                $('.save-alert').fadeIn();
                return false;
            }

            var projectData = addContractForm.serializeObject();
            projectData['contracts'] = contracts;
            console.log(projectData);
            console.log(JSON.stringify(projectData));

            $.ajax({
                type: 'POST',
                url: "new_project",
                data: {'projectData': JSON.stringify(projectData)},
                dataType: "json",
                success: function (response) {
                    console.log('New project request returned successfully');
                    console.log(response);
                    location.reload();
                },
                error: function () {
                    console.log('New project request failed');
                },
            });
        }
    });


    //Enabling dynamic and static (values wise) select nodes with selectize plugin
    //At 15.03.2017 only one such field left, other select fields are having own initialisation due to special handling
    $('.selectize.fixed-values').selectize({
        sortField: 'text',
        onChange: function(value) {
            gotoNextTabIndex(this.$control_input[0]);
        },
    });

    $('.selectize:not(.fixed-values)').selectize({
        create: function (input, callback){
            newRefValue(input, callback, this);
        },
        sortField: 'text',
        onChange: function(value) {
            gotoNextTabIndex(this.$control_input[0]);
        },
    });

    //Variables starting with $select... are needed to programmatically clear and update selectized fields

    var $selectProject = $('#selectProject').selectize({
        create: true,
        onChange: function(value) {
            console.log('selectProject changed');
            var project = $.grep(projects.Projects, function(e){ return e.pk == value; })[0];
            //If project exists then automatically set other project attribute values and disable selection
            //Project with another attribute = new project
            if(project){
                console.log('Existing project chosen. Changing other fields.');
                $selectCompany[0].selectize.setValue(project.fields.company, true);
                $selectCountry[0].selectize.setValue(project.fields.country, true);
                $selectCity[0].selectize.setValue(project.fields.city, true);
                $selectCompany[0].selectize.disable();
                $selectCountry[0].selectize.disable();
                $selectCity[0].selectize.disable();
                $('#selectCompany').valid()
                $('#selectCountry').valid()
                $('#selectCity').valid()
                $('#Address').prop('disabled', true);
                return;
            }
            //If it's a new project, then enable selection in case it was disabled earlier except for selectCity field
            //which has special handling in selectCountry onChange event
            $selectCompany[0].selectize.clear();
            $selectCountry[0].selectize.clear();
            $selectCity[0].selectize.clear();
            $selectCompany[0].selectize.enable();
            $selectCountry[0].selectize.enable();
            $('#Address').prop('disabled', false);
            gotoNextTabIndex(this.$control_input[0]);
        },
    });

    var $selectCompany = $('#selectCompany').selectize();

    var $selectCity = $('#selectCity').selectize({
        create: function (input, callback){
            //Passing extra argument for cities since it has foreign key to countries reference
            newRefValue(input, callback, this, {'country_id': $('#selectCountry').val()});
        },
        onChange: function(value) {
            gotoNextTabIndex(this.$control_input[0]);
        },
    });

    $selectCity[0].selectize.disable();

    //Populating cities select field with values on country change
    var $selectCountry = $('#selectCountry').selectize({
        onChange: function(value) {
            console.log('Country changed');
            if (!value.length) return;
            var country = $('#selectCountry').text()
            $selectCity[0].selectize.disable();
            $selectCity[0].selectize.clearOptions();
            for (var i = 0; i < projects.Cities.length; i++) {
                if (projects.Cities[i].fields.country == value) {
                    $selectCity[0].selectize.addOption({value: projects.Cities[i].pk, text: projects.Cities[i].fields.name});
                }
            }
            $selectCity[0].selectize.enable();
            gotoNextTabIndex(this.$control_input[0]);
        },
        create: function (input, callback){
            newRefValue(input, callback, this);
        },
    });

    $('#selectContractType').selectize({
        onChange: function(value) {
            console.log('Contract type changed');
            if (!value.length){
                $('.contract-attr').prop('disabled', true);
                $('#saveContract').prop('disabled', true);
                $('.payment-attr').prop('disabled', true);
            }
            else{
                $('.contract-attr').prop('disabled', false);
                $('#saveContract').prop('disabled', false);
                $('.payment-attr').prop('disabled', false);
            }
            gotoNextTabIndex(this.$control_input[0]);
        },
        create: function (input, callback){
            newRefValue(input, callback, this);
        },
    });

    var $selectContractType = $('#selectContractType').selectize();

    //Fix for jquery validate highlightning ("has-success" class). Bootstrap classes "has-success" and "has-error"
    //require a node to have "form-control" class (or other combo of conditions which are not my case).
    //Selectize plugin generates own nodes including <div> with class "selectize-input" which is shown when any value
    //is selected. When there is no value selected then <select> is shown which has "form-control" class from the base
    //html. Thus "has-error" (plus "has-danger") class works correctly and lights borders with red but "has-success"
    //wasn't visible
    //It's fun reading comments few weeks later and getting no clue what do they mean
    $('div .selectize-input').addClass('form-control');

    //Enabling jquery validation addon on project adding form
    addContractForm.validate({
        //Fix to make selectize and validation working together.
        ignore: ':hidden:not([class~=selectized]),:hidden > .selectized, .selectize-control .selectize-input input',
        onsubmit: false,
        //debug: true,
        rules: {
            selectProject: {
                required: true,
            },
            selectCompany: {
                required: true,
            },
            selectCountry: {
                required: true,
            },
            selectCity: {
                required: true,
            },
            selectStage: {
                required: true,
                uniqueStage: true,
            },
            cost: {
                required: true,
                number: true,
            },
            duration: {
                required: true,
                number: true,
            },
            selectPayment: {
                required: true,
            },
            selectContractType: {
                required: true,
            },
            contractName: {
                required: true,
            },
            paymentAmount: {
                required: true,
                digits: true,
            },
            paymentDate: {
                required: true,
            },


        },
        //Playing with highlighting error fields. Some effects might be excess and should be removed
        highlight: function (element, errorClass, validClass) {
            $(element).parents('.form-group').addClass("has-error has-danger");
            $(element).parents('.form-group').removeClass("has-success");
            if ($(element).hasClass("selectized")){
                $(element).siblings('.selectize-control').fadeOut(function() {
                    $(element).siblings('.selectize-control').fadeIn();
                });
            }
            else
            {
                $(element).fadeOut(function() {
                    $(element).fadeIn();
                });
            }
        },
        //Changing red lightning border on corrected error field to green
        unhighlight: function (element, errorClass, validClass) {
            $(element).parents('.form-group').removeClass("has-error has-danger").addClass("has-success");
        },
        //Fix for selectized and datepicker fields so labels with error description are placed under the field
        errorPlacement: function(error, element) {
            if (element.hasClass("selectized")){
                element.parents('.form-group').append(error);
            }
            else if (element.hasClass("datepicker")){
                element.parents('.form-group').append(error);
            }
            else
            {
                error.insertAfter(element);
            }
        },
    });

    //Enabling bootstrap classes on project adding form
    $('#addContractModal .wizard .steps').addClass("modal-header");
    $('#addContractModal .wizard .content').addClass("modal-body");
    $('#addContractModal .wizard .actions').addClass("modal-footer");
    $("#addContractModal .steps ul li").each(function (i) {
        var title = $(this).find("a").contents().filter(function() {
            return this.nodeType == 3;
        }).text();
        $(this).append("<h4 class='modal-title'>" + title + "</h4>")
    })
    $('#addContractModal .actions ul').addClass("pager");
    $('#addContractModal a[href="#cancel"]').addClass("pull-left");

    //Enabling datetimepicker fields
    $('#paymentDatePicker').datetimepicker({
        format: 'DD.MM.YYYY',
        //minDate: moment(),
        allowInputToggle: true,
    });

    //This code is needed to disable validation in some cases. For example when autoclearing fields after adding new
    //values - filling payments for contract
    $('select').change(function() {
        if(stageSelectClearOnClick){
            stageSelectClearOnClick = false
        }
        else {
            $(this).valid();
        }
    });

    var stagesQty = 0;
    var stageText;
    var cost;
    var duration;
    var payment;
    var stageSelectClearOnClick = false;


    $('#addStage').click(function() {
        if(addContractForm.valid())
        {
            stageText = $('#selectStage').text()
            cost = $('#cost').val()
            duration = $('#duration').val()
            payment = $('#selectPayment').text()

            stagesQty++;

            //Showing "Stages list label after adding the first one"
            if (stagesQty == 1)
            {
                $('#stageListLabel').removeClass('hidden')
            }
            console.log('Stage adding. Stage name: ' + stageText + '. New stages quantity: ' + stagesQty);
            $('#stagesList').append('<a href="#" class="list-group-item" data-toggle="collapse" data-target="#Stage' + stagesQty + '"'
                + 'data-parent="#menu"><span class="glyphicon glyphicon-chevron-right"></span>   ' + stageText + '</a>'
                + '<div id="Stage' + stagesQty + '" class="sublinks collapse">'
                + '<a class="list-group-item small">Cost: ' + cost + '$</a>'
                + '<a class="list-group-item small">Duration: ' + duration + ' weeks</a>'
                + '<a class="list-group-item small">Payment: ' + payment + '</a>'
                + '</div>');

            //Basic code for changing arrow direction on collapse/uncollapse bootstrap panels. Usually added
            //in document-ready section of scripts, but for dynamic panels needs to be initialized each time
            //you add a new element.
            $('.collapse').on('shown.bs.collapse', function(){
            $(this).parent().find("a[data-target='#" + $(this).attr("id") + "'] span.glyphicon-chevron-right")
                .removeClass("glyphicon-chevron-right")
                .addClass("glyphicon-chevron-up");
                }).on('hidden.bs.collapse', function(){
                    $(this).parent().find("a[data-target='#" + $(this).attr("id") + "'] span.glyphicon-chevron-up")
                        .removeClass("glyphicon-chevron-up")
                        .addClass("glyphicon-chevron-right");
                    });

            stageSelectClearOnClick = true;
            $selectStage[0].selectize.clear();
            $('#cost').val('');
            $('#duration').val('');
            stageSelectClearOnClick = true;
            $selectPayment[0].selectize.clear();
            console.log('Stage added');
        };
    });

    var contractsQty = 0;
    var paymentsQty = 0;
    var paymentDate;
    var paymentAmount;
    var contractName;
    var contractType;
    var contracts = [];


    $('#addPayment').click(function() {
        $('.save-alert').fadeOut();
        if(addContractForm.valid())
        {
            contractName = $('#contractName').val();
            contractType = $('#selectContractType').val();
            paymentDate = $('#paymentDate').val();
            paymentAmount = $('#paymentAmount').val();

            paymentsQty++;

            if (paymentsQty == 1)
            {
                contracts.push({'name': contractName, 'type': contractType, 'payments': {}});
                console.log('New contract data created:');
                console.log(contracts);
                $('#paymentsListLabel').removeClass('hidden');
                $('#paymentsTable').removeClass('hidden');
            }

            console.log('Payment adding. Payment date: ' + paymentDate + ', payment amount: ' + paymentAmount +
            '. New payments quantity: ' + paymentsQty);

            $('#paymentsTableBody').append('<tr payment-id="' + paymentsQty + '">'
                + '<td>' + paymentsQty + '</td>'
                + '<td>' + paymentAmount + '</td>'
                + '<td>' + paymentDate + '</td>'
                + '<td><span class="remove-payment glyphicon glyphicon-remove hoverable"/></tr>');

            contracts[contractsQty]['payments'][paymentsQty] = {'date': paymentDate, 'amount': paymentAmount};
            console.log(contracts[contractsQty]['payments'][paymentsQty]);
            $('#paymentDate').val('');
            $('#paymentAmount').val('');
            console.log('Payment added');
        }
    });

    //Delete certain payment within current contract
    $("#paymentsTableBody").on("click", ".remove-payment", function() {
        var paymentId = $(this).parents('tr').attr('payment-id');
        console.log(paymentId);
        $('tr[payment-id=' + paymentId + ']').empty();
        delete contracts[contractsQty]['payments'][paymentId]
    });

    //Clear all enter payments within current contract
    $('#clearPayments').click(function() {
        $('.save-alert').fadeOut();
        console.log('#clearPayments clicked');
        $('#paymentsTableBody').empty();
        paymentsQty = 0;
        contracts[contractsQty]['payments'] = [];
    });

    $('#saveContract').click(function() {
        console.log('#saveContract clicked');
        if($('#paymentDate').val() || $('#paymentAmount').val()){
            $('.save-alert').removeClass('hidden');
            $('.save-alert').fadeOut();
            $('.save-alert').fadeIn();
            return;
        }
        $('.save-alert').fadeOut();
        $('.contract-attr').prop('disabled', true);
        $('#saveContract').prop('disabled', true);
        $('.payment-attr').prop('disabled', true);
        stageSelectClearOnClick = true;
        $selectContractType[0].selectize.clear();
        $('#contractName').val('');
        $('#paymentDate').val('');
        $('#paymentAmount').val('');
        $('#paymentsTableBody').empty();
        paymentsQty = 0;
        contractsQty++;
        console.log(contracts);
    });

    $.fn.serializeObject = function(){
        console.log('Serializing');
        var o = {};
        var a = this.serializeArray();
        console.log(a);
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };


    //Got to next form field when pressing Enter
    $(document).on("keypress", "input" , function(e){
        //Only do something when the user presses enter
        if( e.keyCode ==  13 )
        {
            gotoNextTabIndex(this);
        }
    });

    //Function to navigate through form fields according tabIndex attribute
    var gotoNextTabIndex = function(element){
        //Autoclick on addPayment when amount is filled and used clicked Enter
        if(element.id == 'paymentAmount'){
            $('#addPayment').click()
            return;
        }
        var nextElement = $('[tabindex="' + (element.tabIndex+1)  + '"]');
        if(nextElement.length){
            nextElement.focus()
        }
        else{
            $('[tabindex="1"]').focus();
        }
    };

    //TODO. Extend selectize with calling gotoNextTabIndex when selectized field was changed
    var selectCountry = $selectCountry[0].selectize;
    var handler = function() { gotoNextTabIndex(this.$control_input[0]); };
    selectCountry.on('change', handler);

    //Focus on first form field when opening form
    /*TODO Form could be hidden and shown again when user is on the first page.
    Consider setting focus on the first page field.*/
    $('#myModal').on('shown.bs.modal', function (e) {
        $('[tabindex="1"]').focus();
    })
});


