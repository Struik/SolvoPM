'use strict'

$(document).ready(function() {
    var infoForm = $("#infoForm");

    //Enabling jquery steps addon on info form
    infoForm.steps({
        headerTag: "h3",
        bodyTag: "section",
        transitionEffect: 1,
        autoFocus: true,
        enableKeyNavigation: false,
        enablePagination: false,
        onStepChanging: function (event, currentIndex, newIndex)
        {
            //Not showing goto previous form page button for the first page
            if(newIndex != 0){
                $('.previous-step').removeClass('hidden')
            }
            else {
                $('.previous-step').addClass('hidden')
            }
            return true;
        },
        onStepChanged: function (event, currentIndex, newIndex)
        {
            //Always open confirm panel when going to payment info form
            if(currentIndex == 1){
                console.log('Hidden?')
                if ($('#collapse-confirm').attr('aria-expanded') !== 'true'){
                    console.log('was hidden');
                    $('#panel-confirm-title').click();
                }
            }
        }
    });

    //Enabling bootstrap classes on info form
    $('#infoModal .wizard .steps').addClass("modal-header");
    $('#infoModal .wizard .content').addClass("modal-body");
    $('#infoModal .wizard .actions').addClass("modal-footer");
    $('#infoModal .steps ul li').each(function (i) {
        var title = $(this).find("a").contents().filter(function() {
            return this.nodeType == 3;
        }).text();
        $(this).append('<h4 class="modal-title">' + title + '<span class="glyphicon glyphicon-arrow-left pull-right '
                                                                    + 'previous-step hoverable hidden"></span></h4>');
    });
    $('#infoModal .actions ul').addClass("pager");
    //Button for moving to the first step with month info
    $(document).on("click", ".previous-step", function() {
        infoForm.steps('previous');
    });
    //Move to the first step when modal is closed
    $('#infoModal').on('hide.bs.modal', function (e) {
        infoForm.steps('previous');
    })

    //Changing heading color when showing panel body
    $('.collapse').on('show.bs.collapse', function(){
        $(this).parents('.panel').addClass("panel-expanded");
    }).on('hide.bs.collapse', function(){
        $(this).parents('.panel').removeClass("panel-expanded");
    });

    var projectTable;
    //Global variable for storing full payments data so it's available for all functions on the page
    var paymentsFullData;
    //Drawing table with datatable plugin
    getProjectData();

    //Function to get project data from server and call table creation
    function getProjectData(){
        console.log('Requesting project data');
        $.ajax({
            type: 'GET',
            url: "get_projects_data",
            success: function (response) {
                console.log('Project data returned');
                    if (response == 'No data'){
                        console.log('No data found, nothing to display');
                        return;
                    }
                paymentsFullData = response['paymentsFullData']
                createDatatable(response);
            },
            error: function () {
                alert('Failed to load projects data');
            },
        });
    }

    //Function to create table with projects and payment schedule
    function createDatatable(projectData){
        console.log(projectData)
        var columns = projectData['columns']
        var data =  projectData['payments']
        //Variable will be used for createdCell option in datatables
        var key;
        //ES6 structure below (Array...), might not be supported by some browsers
        //Indexes of static columns
        var staticColumns = [...Array(4).keys()];
        console.log('staticColumns: ' + staticColumns)
        var allColumns = [...Array(columns.length).keys()];
        console.log('allColumns: ' + allColumns)
        //Indexes of columns for which search function shouldn't work
        var columnsNoSearch = allColumns.slice();
        columnsNoSearch.splice(0, 4)
        console.log('columnsNoSearch: ' + columnsNoSearch)
        //Indexes of columns with payment data
        var paymentsColumns = allColumns.slice()
        paymentsColumns.splice(0, staticColumns.length)
        console.log('paymentsColumns: ' + paymentsColumns)

        //Creating headers before datatables plugin because rowspan and colspan classes are needed
        //which cannot be assigned automatically on datatable initialisation
        var projectsHeaderFirst = $("#projectsHeaderFirst");
        var projectsHeaderSecond = $("#projectsHeaderSecond");
        for (var i = 0; i < staticColumns.length; i++){
            projectsHeaderFirst.append('<th rowspan="2" class="static-columns text-center">' + columns[i].caption + '</th>');
        }
        for (var i = staticColumns.length; i < (paymentsColumns.length + staticColumns.length); i++){
            if (i % 2){
                projectsHeaderFirst.append('<th colspan="2" class="text-center">' + columns[i].caption + '</th>');
                projectsHeaderSecond.append('<th parent-title="' + columns[i].caption + '"></th>');
            }
            else{
                //projectsHeaderFirst.append('<th class="header-left">' + columns[i].caption + '</th>');
                projectsHeaderSecond.append('<th parent-title="' + columns[i].caption + '"></th>');
            }
        }

//        debugger;
        //(plugin datatables.js)
        //Creating datatable, table headers and table data are generated in required way (array) on server side
        projectTable = $('#projectsTable').DataTable({
//            dom: 'Bfrtip',
//            buttons: [
//                'copyHtml5',
//                'csvHtml5'
//            ],
            processing: true,
            columns: columns,
            data: data,
            scrollX: true,
            //Static columns are cool
            fixedColumns: {
                leftColumns: staticColumns.length,
                rightColumns: 0
            },
            //Option for merging same rows (plugin dataTables.rowsGroup.js)
            rowsGroup: staticColumns,
            paging: false,
            ordering: false,
            searching: false,
            info: false,
            autoWidth: false,
            columnDefs: [{
                //Searching on some columns may distort the table. Thus leaving search only for stable columns
                targets: columnsNoSearch,
                searchable: false,
            },
            {
                //Bootstrap popovers (tooltip) for each payment in the table
                targets: paymentsColumns,
                render:     $.fn.dataTable.render.number( ' ', '.', 0 ),
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).addClass('payment');
                    var column = columns[col]['data'].split('.')

                    console.log(rowData[column[0]]);

                    //Skip processing if planned and confirmed are empty
                    if(isNaN(parseInt(rowData[column[0]].planned)) && isNaN(parseInt(rowData[column[0]].confirmed))){
                        console.log('empty');
                        key = '';
                        return;
                    }

                    if(typeof(cellData) === 'number' && column[1] === 'planned'){
                        key = column[0];
                        $(td).addClass('text-center').addClass('show-month').addClass('td-hoverable');
                        if(column[1] === 'planned'){
                            $(td).addClass('td-planned');
                        }
                    }

                    if(column[1] === 'confirmed'){
                        console.log('OOO')
                        $(td).append(' <span class="glyphicon glyphicon-search hoverable pull-right"></span>');
                        $(td).addClass('td-confirmed').addClass('show-month').addClass('td-hoverable');
                    }

                    if(rowData[key].planned === rowData[key].confirmed && rowData[key].planned){
                        $(td).addClass('bg-success');
                    }
                },
            }],
        });
    }

    //Extra validator method for jquery validation plugin
    $.validator.addMethod('checkChildSumIsMore', function (value, element, param) {
        var sum = parseInt(value) + (parseInt($('#childPaymentSum').text()) || 0);
        console.log(sum);
        console.log(parseInt($('#paymentInfoAmount').text()))
        if (sum > parseInt($('#paymentInfoAmount').text())){
            return false;
        }
        return true;
    }, gettext('Specified amount exceeds initial payment amount'));

    //Enabling jquery validation addon on payment form
    infoForm.validate({
        //Fix to make selectize and validation working together.
        ignore: 'div.form-tab:not(.active) input',
        onsubmit: false,
        //debug: true,
        rules: {
            confirmDate: {
                required: true,
            },
            postponefileName: {
                required: true,
            },
            postponeDocumentName: {
                required: true,
                minlength: 5,
            },
            postponePaymentDate: {
                required: true,
            },
            splitFileName: {
                required: true,
            },
            splitDocumentName: {
                required: true,
                minlength: 5,
            },
            childPaymentDate: {
                required: true,
            },
            childPaymentAmount: {
                required: true,
                digits: true,
                checkChildSumIsMore: true,
            },
            cancelfileName: {
                required: true,
                minlength: 5,
            },
            cancelDocumentName: {
                required: true,
            },
        },
        //Playing with highlighting error fields. Some effects might be excess and should be removed
        highlight: function (element, errorClass, validClass) {
            $(element).parents('.form-group').addClass("has-error has-danger");
            $(element).parents('.form-group').removeClass("has-success");
            $(element).fadeOut(function() {
                $(element).fadeIn();
            });
            console.log(document.activeElement);
        },
        //Changing red lightning border on corrected error field to green
        unhighlight: function (element, errorClass, validClass) {
            $(element).parents('.form-group').removeClass("has-error has-danger").addClass("has-success");
        },
        //Fix for datepicker or fileinput fields so labels with error description are placed under the field
        errorPlacement: function(error, element) {
            if (element.hasClass("datepicker") || element.hasClass("fileinput")){
                element.parents('.form-group').append(error);
            }
            else
            {
                error.insertAfter(element);
            }
        },
    });

    //Handling hovering over cells in tables with payments
    //For main table #projectsTable
    $("#projectsTable").on("mouseenter", ".td-planned", function() {
        $(this).addClass('bg-info').next('td').addClass('bg-info');
    });
    $("#projectsTable").on("mouseenter", ".td-confirmed", function() {
        $(this).addClass('bg-info').prev('td').addClass('bg-info');
    });
    $("#projectsTable").on("mouseleave", ".td-planned", function() {
        $(this).removeClass('bg-info').next('td').removeClass('bg-info');
    });
    $("#projectsTable").on("mouseleave", ".td-confirmed", function() {
        $(this).removeClass('bg-info').prev('td').removeClass('bg-info');
    });

    $("#infoForm").on("mouseenter", ".tr-hoverable", function() {
        $(this).addClass('bg-info');
    });
    $("#infoForm").on("mouseleave", ".tr-hoverable", function() {
        $(this).removeClass('bg-info');
    });

    //Showing modal form with info and actions for each payment when zoom icon is clicked
    $("#projectsTable").on("click", ".show-month", function() {
        $("#monthInfoPaymentsTableBody tr").remove();
        var cell = $(this);
        var cellIndex = projectTable.cell( cell ).index();
        console.log(cellIndex);
        var rowData = projectTable.row( cellIndex['row'] ).data();
        console.log(rowData);
        var columnTitle = projectTable.column( cellIndex['column'] ).parentTitle().replace(' ','');
        console.log(columnTitle);
        console.log(projectTable.column( cellIndex['column'] ));
        var paymentIds = rowData[columnTitle]['paymentIds'];
        var paymentClass;
        var payment;
        for (var i = 0; i < paymentIds.length; i++) {
            payment = paymentsFullData[paymentIds[i]];
            console.log(payment);
            if (payment.confirmed){
                paymentClass = 'bg-success';
            }
            else if (payment.canceled){
                paymentClass = 'bg-danger';
            }
            //Not showing split payments. TODO Got to fix numerical order
            else if (payment.split){
                continue;
            }
            else {
                paymentClass = ''
            }

            $('#monthInfoPaymentsTableBody').
                append('<tr id="' + paymentIds[i] + '" class=" tr-hoverable show-payment ' + paymentClass + '">'
                + '<td>' + (i + 1) + '</td>'
                + '<td>' + payment.amount + '</td>'
                + '<td>' + payment.date + '</td>'
                + '<td>' + payment.confirmedDate + '</td>'
                + '<td><span class="glyphicon glyphicon-pencil hoverable"/></td></tr>');
        }

        //Might consider serializing it instead of
        $('#monthInfoProjectName').html(rowData[gettext('Project name')]);
        $('#monthInfoContractType').html(rowData[gettext('Contract type')]);
        $('#monthInfoContractName').html(rowData[gettext('Contract name')]);
        $('#monthInfoPlanned').html(rowData[columnTitle]['planned']);
        $('#monthInfoConfirmed').html(rowData[columnTitle]['confirmed']);

        $('#infoModal').modal('show');

    });

    //Showing page with payment actions on modal form page
    $("#infoForm").on("click", ".show-payment", function() {
        var row = $(this);
        var paymentId = row.attr('id');
        console.log(paymentsFullData[paymentId]);
        $('#paymentInfo').attr('payment-id', paymentId);
        $('#paymentInfoAmount').html(paymentsFullData[paymentId].amount);
        $('#parentPaymentAmount').html(paymentsFullData[paymentId].amount);
        $('#paymentInfoPlanned').html(paymentsFullData[paymentId].date);
        $('#paymentInfoConfirmed').html(paymentsFullData[paymentId].confirmedDate);

        $('.confirmed-alert').addClass('hidden');
        $('.unconfirm-action').addClass('hidden');
        $('.confirm-panel').removeClass('hidden');
        $('.postponed-alert').addClass('hidden');
        $('.postpone-panel').removeClass('hidden');
        $('.inherited-alert').addClass('hidden');
        $('.split-alert').addClass('hidden');
        $('.split-panel').removeClass('hidden');
        $('.canceled-alert').addClass('hidden');
        $('.cancel-panel').removeClass('hidden');

        if(paymentsFullData[paymentId].confirmed){
            console.log('Is confirmed');
            $('.confirmed-alert').removeClass('hidden');
            $('.unconfirm-action').removeClass('hidden');
            $('.confirm-panel').addClass('hidden');
            $('.postpone-panel').addClass('hidden');
            $('.split-panel').addClass('hidden');
            $('.cancel-panel').addClass('hidden');
        }

        if(paymentsFullData[paymentId].postponed){
            console.log('Is postponed');
            $('#downloadPostponeAgreement').attr('href','download_agreement?id=' + paymentsFullData[paymentId].postponeAgreementId);
            $('#postponeAgreementName').html(paymentsFullData[paymentId].postponeAgreementName);
            $('#initialDate').html(paymentsFullData[paymentId].initialDate);
            $('.postponed-alert').removeClass('hidden');
        }

        if(paymentsFullData[paymentId].parentPayment){
            console.log('Has parent');
            $('#downloadSplitAgreement').attr('href','download_agreement?id=' + paymentsFullData[paymentsFullData[paymentId].parentPayment].splitAgreementId);
            $('#splitAgreementName').html(paymentsFullData[paymentsFullData[paymentId].parentPayment].splitAgreementName);
            $('.inherited-alert').removeClass('hidden');
            $('.inherited-alert').attr('parent-id', paymentsFullData[paymentId].parentPayment);
        }

        if(paymentsFullData[paymentId].canceled){
            console.log('Is canceled');
            $('#downloadCancelAgreement').attr('href','download_agreement?id=' + paymentsFullData[paymentId].cancelAgreementId);
            $('#cancelAgreementName').html(paymentsFullData[paymentId].cancelAgreementName);
            $('.canceled-alert').removeClass('hidden');
            $('.confirm-panel').addClass('hidden');
            $('.postpone-panel').addClass('hidden');
            $('.split-panel').addClass('hidden');
            $('.cancel-panel').addClass('hidden');
        }

        infoForm.steps('setStep', 1);
    });

    //Showing page with payment actions on modal form page
    $("#infoForm").on("click", "a.show-split-payment", function(e) {
        e.preventDefault();
        $("#splitPaymentChildsTableBody tr").remove();
        var parentPaymentId =  $('.inherited-alert').attr('parent-id');
        $('#splitPaymentInfo').attr('payment-id', parentPaymentId);
        $('#splitPaymentInfoAmount').html(paymentsFullData[parentPaymentId].amount);
        $('#splitPaymentInfoPlanned').html(paymentsFullData[parentPaymentId].date);
        $('#splitPaymentInfoDocument').attr('href','download_agreement?id=' + paymentsFullData[parentPaymentId].splitAgreementId);
        $('#splitPaymentInfoDocument').html(paymentsFullData[parentPaymentId].splitAgreementName);
        var payment;

        for (var i = 0; i < paymentsFullData[parentPaymentId].childPayments.length; i++) {
            payment = paymentsFullData[parentPaymentId].childPayments[i];

            $('#splitPaymentChildsTableBody').append('<tr id="' + payment.id + '" class="tr-hoverable show-payment">'
                + '<td>' + (i + 1) + '</td>'
                + '<td>' + payment.amount + '</td>'
                + '<td>' + payment.date + '</td>'
                + '<td><span class="glyphicon glyphicon-pencil hoverable"/></td></tr>');
        }

        infoForm.steps('next');
    });


    //Enabling datetimepicker fields
    $('#confirmDatePicker').datetimepicker({
        format: 'DD.MM.YYYY',
//        maxDate: moment(),
        allowInputToggle: true,
    });

    $('#postponeDatePicker').datetimepicker({
        format: 'DD.MM.YYYY',
        minDate: moment(),
        allowInputToggle: true,
    });

    $('#splitDatePicker').datetimepicker({
        format: 'DD.MM.YYYY',
        minDate: moment(),
        allowInputToggle: true,
    });

    $(document).on('change', ':file', function() {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });

    //Handling buttons for uploading files
    $(document).ready( function() {
        $(':file').on('fileselect', function(event, numFiles, label) {
            var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;

            if( input.length ) {
                input.val(log);
            } else {
                if( log ) alert(log);
            }
        });
    });

    $.fn.serializeObject = function(){
        console.log('Serializing');
        var o = {};
        var a = this.serializeArray();
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

    //Plugin for datatables to implement title() function which gets certain column's title
    $.fn.dataTable.Api.register( 'column().title()', function () {
        var colheader = this.header();
        return $(colheader).text().trim();
    });
    //Plugin for datatables to implement parent-title() function which gets parent (colspanned) column's title
    $.fn.dataTable.Api.register( 'column().parentTitle()', function () {
        var colheader = this.header();
        return $(colheader).attr('parent-title');
    });

    $('#confirmPayment').click(function() {
        if($('#confirmDate').valid())
        {
            console.log('Confirming payment');
            var paymentData = {'paymentId': $('#paymentInfo').attr('payment-id'),'confirmDate': $('#confirmDate').val()}
            console.log(paymentData);
            $.ajax({
                type: 'POST',
                url: "confirm_payment",
                data: paymentData,
                success: function (response) {
                    console.log('Payment confirmed successfully');
                    location.reload();
                },
                error: function () {
                    console.log('Payment confirmation failed');
                },
            });
        };
    });

    $('#unconfirmPayment').click(function() {
        console.log('Unconfirming payment');
        var paymentData = {'paymentId': $('#paymentInfo').attr('payment-id')}
        console.log(paymentData);
        $.ajax({
            type: 'POST',
            url: "unconfirm_payment",
            data: paymentData,
            success: function (response) {
                console.log('Payment unconfirmed successfully');
                location.reload();
            },
            error: function () {
                console.log('Payment unconfirmation failed');
            },
        });
    });

    $('#postponePayment').click(function() {
        //Using '&&' will stop calculation on first false so other elements will not be marked on the form as invalid
        if($('#postponefileName').valid() & $('#postponeDocumentName').valid() & $('#postponePaymentDate').valid())
        {
            console.log('Postponing payment');
            var paymentData = new FormData($('#infoForm')[0]);
            paymentData.append('paymentId', $('#paymentInfo').attr('payment-id'));
            console.log(paymentData);
            $.ajax({
                type: 'POST',
                url: "postpone_payment",
                data: paymentData,
                cache: false,
                contentType: false,
                processData: false,
                success: function (response) {
                    console.log('Payment postponed successfully');
                    location.reload();
                },
                error: function () {
                    console.log('Payment postponing failed');
                },
            });
        };
    });

    $('#cancelPayment').click(function() {
        //Using '&&' will stop calculation on first false so other elements will not be marked on the form as invalid
        if($('#cancelfileName').valid() & $('#cancelDocumentName').valid())
        {
            console.log('Cancelling payment');
            var paymentData = new FormData($('#infoForm')[0]);
            paymentData.append('paymentId', $('#paymentInfo').attr('payment-id'));
            console.log(paymentData);
            $.ajax({
                type: 'POST',
                url: "cancel_payment",
                data: paymentData,
                cache: false,
                contentType: false,
                processData: false,
                success: function (response) {
                    console.log('Payment canceled successfully');
                    location.reload();
                },
                error: function () {
                    console.log('Payment cancelling failed');
                },
            });
        };
    });

    var paymentsQty = 0;
    var paymentDate;
    var paymentAmount;
    var paymentId;
    var paymentSum = 0;
    var paymentRemainder = 0;
    var splitPayment = {'paymentId': '', 'childPayments': ''};


    $('#addChildPayment').click(function() {
        if($('#splitFileName').valid() & $('#splitDocumentName').valid() & $('#childPaymentDate').valid() &
                                                                        $('#childPaymentAmount').valid())
        {
            console.log('Adding split payment');
            $('.sum-alert').addClass('hidden');
            paymentId = $('#paymentInfo').attr('payment-id');
            paymentDate = $('#childPaymentDate').val();
            paymentAmount = $('#childPaymentAmount').val();

            paymentsQty++;
            paymentSum += parseInt(paymentAmount);
            $('#childPaymentSum').text(paymentSum);
            paymentRemainder = parseInt($('#paymentInfoAmount').text()) - paymentSum;
            $('#remainder').text(paymentRemainder);

            if (paymentsQty == 1)
            {
                splitPayment['paymentId'] = $('#paymentInfo').attr('payment-id');
                splitPayment['childPayments'] = [];
                console.log('Splitting payment:');
                console.log(splitPayment);
                $('#paymentsListLabel').removeClass('hidden');
                $('#childPaymentsTable').removeClass('hidden');
                $('#splitPaymentHint').removeClass('hidden');
            }

            console.log('Payment adding. Payment date: ' + paymentDate + ', payment amount: ' + paymentAmount +
            '. New payments quantity: ' + paymentsQty + '. New payments sum: ' + paymentSum);

            $('#childPaymentsTableBody').append('<tr id="paymentRow' + paymentsQty + '" name>'
                + '<td>' + paymentsQty + '</td>'
                + '<td  class="childPaymentAmount">' + paymentAmount + '</td>'
                + '<td>' + paymentDate + '</td></tr>');

            splitPayment['childPayments'].push({'id': paymentsQty, 'date': paymentDate, 'amount': paymentAmount});
            console.log(splitPayment);
            $('#childPaymentAmount').val('');
            $('#childPaymentDate').val('');
            console.log('Child payment added');
        };
    });

    $('#save').click(function() {
        if(parseInt($('#childPaymentSum').text()) < parseInt($('#paymentInfoAmount').text())){
            $('.sum-alert').removeClass('hidden');
            $('.sum-alert').fadeOut();
            $('.sum-alert').fadeIn();
        }
        else {
            console.log('Saving split payment');
            var paymentData = new FormData($('#infoForm')[0]);
            paymentData.append('splitPayment', JSON.stringify(splitPayment));
            console.log(paymentData);
            $.ajax({
                type: 'POST',
                url: "split_payment",
                data: paymentData,
                cache: false,
                contentType: false,
                processData: false,
                success: function (response) {
                    console.log('Payment split successfully');
                    location.reload();
                },
                error: function () {
                    console.log('Payment splitting failed');
                },
            });
        };
    });


});
