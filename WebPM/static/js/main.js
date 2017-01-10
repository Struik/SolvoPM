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
            form.submit();
        }
    });

    //Enabled dynamic and static (values wise) select nodes with selectize plugin
    $('select.fixed-values').selectize({
        sortField: 'text'
    });
    $('select:not(.fixed-values)').selectize({
        create: true,
        sortField: 'text'
    });
    //This variables are needed to have possibility to programmatically clear selectized fields.
    //One variable for each select
    var $selectStage = $('#selectStage').selectize();
    var $selectPayment = $('#selectPayment').selectize();



    //Fix for jquery validate highlightning ("has-success" class). Bootstrap classes "has-success" and "has-error"
    //require a node to have "form-control" class (or other combo of conditions which are not my case).
    //Selectize plugin generates own nodes including <div> with class "selectize-input" which is shown when any value
    //is selected. When there is no value selected then <select> is shown which has "form-control" class from the base
    //html. Thus "has-error" (plus "has-danger") class works correctly and lights borders with red but "has-success"
    //wasn't visible
    $('div .selectize-input').addClass('form-control');

    //Enabling jquery validation addon project adding form
    exForm.validate({
        //Fix to make selectize and validation working together.
        ignore: ':hidden:not([class~=selectized]),:hidden > .selectized, .selectize-control .selectize-input input',
        //debug: true,
        rules: {
            projectName: {
                required: true,
                minlength: 3,
            },
            companyName: {
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
        //Fix for selectized fields so labels with error description are placed under the field
        errorPlacement: function(error, element) {
            if (element.hasClass("selectized")){
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
    $('.steps1 ul').addClass("modal-title");
    $('.steps1 ul').addClass("nav-pills");
    $(".steps ul li").each(function (i) {
        var title = $(this).find("a").contents().filter(function() {
            return this.nodeType == 3;
        }).text();
        $(this).append("<h4 class='modal-title'>" + title + "</h4>")
    })
    $('.actions ul').addClass("pager");
    $('a[href="#cancel"]').addClass("pull-left");


    /*projectForm.modalSteps();

    projectForm.on('shown.bs.modal', function () {
        $('#myInput').focus()
    })*/



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


    $('#newStage').click(function() {
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
            console.log('Stage added');

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
        };
    });
});


