$(document).ready(function(){
    //Only one unique stage is allowed within one project
    $.validator.addMethod('uniqueStage', function (value, element, param) {
        //Looks complicated because of selectize which puts select real value in generated nodes
        var selectValue = $(element).siblings().find('div .item').text();
        if($('#stagesList').find("a:contains(" + selectValue + ")").length > 0){
            return false;
        }
        return true;
    }, 'This stage is already added');


    var exForm = $("#projectAddForm");

    //Enabling jquery steps addon on project adding form
    exForm.steps({
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
            console.log('2');
            // Always allow going backward even if the current step contains invalid fields!
            if (currentIndex > newIndex)
            {
                //To remove success styles
                //$(".body:eq(" + newIndex +  ") .has-success").removeClass("has-success");
                return true;
            }

            var form = $(this);

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
            //return true;
        },
        onFinishing: function (event, currentIndex)
        {
            var form = $(this);
            console.log('3');
            // Disable validation on fields that are disabled.
            // At this point it's recommended to do an overall check (mean ignoring only disabled fields)
            //form.validate().settings.ignore = ":disabled";

            // Start validation; Prevent form submission if false
            //return form.valid();
            return true;
        },
        onFinished: function (event, currentIndex)
        {
            var form = $(this);
            console.log('4');

            //Submit form input
            //Submit isn't ready yet
            //form.submit();

            var projectData = exForm.serializeObject();
            projectData['contracts'] = contracts;
            console.log(projectData);
            console.log(JSON.stringify(projectData));

            $.ajax({
                type: 'POST',
                url: "new_project",
                data: {'projectData': JSON.stringify(projectData)},
                dataType: "json",
//                contentType: "application/json",
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


    //Enabled dynamic and static (values wise) select nodes with selectize plugin
    $('.selectize.fixed-values').selectize({
        sortField: 'text',
        onChange: function(value) {
            gotoNextTabIndex(this.$control_input[0]);
        },
    });

    //Country change needs special logic which is called via onChange event
    //Couldn't find a way to reinitialize it when select node is already selectized
    $('.selectize:not(.fixed-values)').selectize({
        create: function (input, callback){
            newRefValue(input, callback, this);
        },
        sortField: 'text',
        onChange: function(value) {
            gotoNextTabIndex(this.$control_input[0]);
        },
    });

    //This variables are needed to have possibility to programmatically clear and update selectized fields.
    //One variable for each select
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

    selectCity = $selectCity[0].selectize;
    selectCity.disable();

    //Separate selectize initialisation on country select node
    //Populating cities select field with values on country change
    //Variable cities is defined in html template
    var $selectCountry = $('#selectCountry').selectize({
        onChange: function(value) {
            console.log('Country changed');
            if (!value.length) return;
            var country = $('#selectCountry').text()
            selectCity.disable();
            selectCity.clearOptions();
            for (var i = 0; i < projects.Cities.length; i++) {
                if (projects.Cities[i].fields.country == value) {
                    selectCity.addOption({value: projects.Cities[i].pk, text: projects.Cities[i].fields.name});
                }
            }
            selectCity.enable();
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
    exForm.validate({
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
    $('.wizard .steps').addClass("modal-header");
    $('.wizard .content').addClass("modal-body");
    $('.wizard .actions').addClass("modal-footer");
    $(".steps ul li").each(function (i) {
        var title = $(this).find("a").contents().filter(function() {
            return this.nodeType == 3;
        }).text();
        $(this).append("<h4 class='modal-title'>" + title + "</h4>")
    })
    $('.actions ul').addClass("pager");
    $('a[href="#cancel"]').addClass("pull-left");

    //Enabling datetimepicker fields
    $('#paymentDatePicker').datetimepicker({
        format: 'DD.MM.YYYY',
        //minDate: moment(),
        allowInputToggle: true,
    });



    $('#next').click(function() {
        console.log('Next!');
        /*console.log(projectForm.valid());*/
    });

    $('li').click(function() {
        console.log('Next!');
    });

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
        if(exForm.valid())
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
        if(exForm.valid())
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

    exForm.submit(function() {
        alert('12312');
        console.log(exForm.serializeObject());

        return false;
    });

    //Function to add new value in DB references when it's added via select field on the form
    //parentReference is an extra argument for references which have foreign key to other reference
    var newRefValue = function(input, callback, object, parentReference){
        var selectId = object.$input[0].id;
        console.log(selectId);
        var referenceName = $('#' + selectId).attr('reference_id');
        var newValue = {'referenceName': referenceName, 'value': input}
        if (parentReference){
            console.log('Parent ref: ' + JSON.stringify(parentReference));
            newValue['parentReference'] = JSON.stringify(parentReference);
        }
        console.log('Adding new value to the reference');
        console.log(newValue);
        $.ajax({
            type: 'POST',
            url: "new_ref_value",
            data: newValue,
            dataType: "json",
            success: function (result) {
                console.log('Response on adding new value to reference request:');
                console.log(result['refId']);
                if (result) {
                    callback({ 'value': result['refId'], 'text': input });
                }
            }
        });
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

//    $("#paymentDatePicker").on("dp.change", function(e) {
//        alert('hey');
//    });

    //Plugin for thousand separators and input number formatting
    //$('#paymentAmount').maskNumber();

});


