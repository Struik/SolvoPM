'use strict'

$(document).ready(function() {
    var paymentForm = $("#paymentForm");

    //Enabling jquery steps addon on payment info form
    paymentForm.steps({
        headerTag: "h3",
        bodyTag: "section",
        transitionEffect: 1,
        autoFocus: true,
        enableKeyNavigation: false,
        enablePagination: false,
    });

    //Enabling bootstrap classes on payment info form
    $('.wizard .steps').addClass("modal-header");
    $('.wizard .content').addClass("modal-body");
    $('.wizard .actions').addClass("modal-footer");
    $('.steps ul li').each(function (i) {
        var title = $(this).find("a").contents().filter(function() {
            return this.nodeType == 3;
        }).text();
        $(this).append('<h4 class="modal-title">' + title + '<span class="glyphicon glyphicon-arrow-left pull-right '
                                                                                    + 'previous-step"></span></h4>');
    });
    $('.actions ul').addClass("pager");

    $(document).on("click", ".previous-step", function() {
        console.log('dsadsadssa');
        paymentForm.steps('previous');
    });


    var projectTable;
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
                        alert('No data found, nothing to display');
                        return;
                    }
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
        //ES6 structure below (Array...), might not be supported by some browsers
        //Indexes of static columns
        var staticColumns = [...Array(5).keys()];
        console.log('staticColumns: ' + staticColumns)
        var allColumns = [...Array(columns.length).keys()];
        console.log('allColumns: ' + allColumns)
        //Indexes of columns for which search function shouldn't work
        var columnsNoSearch = allColumns.slice();
        columnsNoSearch.splice(0, 3)
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
            projectsHeaderFirst.append('<th rowspan="2">' + columns[i].caption + '</th>');
        }
        for (var i = staticColumns.length; i < (paymentsColumns.length + staticColumns.length); i++){
            if (i % 2){
                projectsHeaderFirst.append('<th colspan="2">' + columns[i].caption + '</th>');
                projectsHeaderSecond.append('<th parent-title="' + columns[i].caption + '">Plan</th>');
            }
            else{
                projectsHeaderSecond.append('<th parent-title="' + columns[i].caption + '">Fact</th>');
            }
        }


        //(plugin datatables.js)
        //Creating datatable, table headers and table data are generated in required way (array) on server side
        projectTable = $('#projects').DataTable({
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
            columnDefs: [{
                //Searching on some columns may distort the table. Thus leaving search only for stable columns
                targets: columnsNoSearch,
                searchable: false,
            },
            {
                //Bootstrap popovers (tooltip) for each payment in the table
                targets: paymentsColumns,
                "createdCell": function (td, cellData, rowData, row, col) {
                    if(cellData) {
                        var key = columns[col]['data'].replace('.planned','');
                        //td.id = rowData[key].id
                        //console.log(rowData[key].split);

                        $(td).append(' <span class="show-month glyphicon glyphicon-search pull-right"></span>');
                        $(td).addClass('payment');
                        //$(td).wrapInner( "<strong></strong>" );
                        //Trigger event for bootstrap popover can be set for each element or one for all elements
                        //$(td).attr('data-trigger','hover');
                        $(td).attr('data-html', 'true');
                        //$(td).attr('data-content','Planned date: ' + rowData[key].date);
                        $(td).attr('data-placement','bottom');
                        $(td).attr('data-container','body');

                        //Adding colors depending on payment status (considering all payments in this month/key)
                        var isConfirmed = true;
//                        var payments = rowData[key].payments
//                        for (var i = 0; i < payments.length; i++) {
//                            if (!payments[i].confirmed)
//                            {
//                                isConfirmed = false;
//                                break;
//                            }
//                        }
                        if (isConfirmed) {
                            //$(td).addClass( 'bg-success' );
                        }


                        //Showing extra data on tooltip for split payments and adding colors depending on payment status
//                        if(rowData[key].split){
//                            $(td).addClass( "bg-warning" );
//                            $(td).attr('data-content', $(td).attr('data-content') + '<br/> Payment is split according '
//                                                + 'document: ' + rowData[key].agreementName + '. <br/> Child payments:')
//                            var childPayments = rowData[key].childPayments
//                            console.log(childPayments)
//                            for (var i = 0; i < childPayments.length; i++) {
//                                console.log(childPayments[i]);
//                                $(td).attr('data-content', $(td).attr('data-content') + '<br/> #' + (i+1) +' Date:  '
//                                + childPayments[i].date + ', amount: ' + childPayments[i].amount);
//                            }
//                        }
//                        else if(rowData[key].confirmed){
//                            $(td).addClass( "bg-success" );
//                        }
                    }
                },
            }],
        });

        //Trigger event for bootstrap popover can be set for each element or one for all elements like here
        $('.payment').popover({
                trigger: "hover",
        })

        $('#splitTab').popover({
                trigger: "hover",
        })

    }

    //Extra validator method for jquery validation plugin
    $.validator.addMethod('checkPaymentSum', function (value, element, param) {
        var childSum = parseInt(value);
        var addedChildPayments = document.getElementsByClassName("childPaymentAmount");
        for (var i = 0; i < addedChildPayments.length; i++) {
            childSum += parseInt(addedChildPayments[i].textContent);
        }
        console.log('Child sum: ' + childSum);
        if (childSum > parseInt($('#paymentAmount').text())){
            return false;
        }
        return true;
    }, 'Specified amounts exceed initial payment amount');

    //Enabling jquery validation addon on payment form
    paymentForm.validate({
        //Fix to make selectize and validation working together.
        ignore: 'div.form-tab:not(.active) input',
        onsubmit: false,
        //debug: true,
        rules: {
            confirmDate: {
                required: true,
            },
            fileName: {
                required: true,
            },
            documentName: {
                required: true,
                minlength: 5,
            },
            childPaymentDate: {
                required: true,
            },
            childPaymentAmount: {
                required: true,
                checkPaymentSum: true,
            },
        },
        //Playing with highlighting error fields. Some effects might be excess and should be removed
        highlight: function (element, errorClass, validClass) {
            $(element).parents('.form-group').addClass("has-error has-danger");
            $(element).parents('.form-group').removeClass("has-success");
            $(element).fadeOut(function() {
                $(element).fadeIn();
            });
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

    //Showing modal form with info and actions for each payment when zoom icon is clicked
    $("#projects").on("click", ".show-month", function() {
        $("#paymentsTableBody tr").remove();
        var cell = $(this).parents('td');
        var cellIndex = projectTable.cell( cell ).index();
        console.log(cellIndex);
        var rowData = projectTable.row( cellIndex['row'] ).data();
        console.log(rowData);
        var columnTitle = projectTable.column( cellIndex['column'] ).parentTitle().replace(' ','');
        console.log(columnTitle);
        console.log(projectTable.column( cellIndex['column'] ));
        var payments = rowData[columnTitle]['payments'];
        var paymentClass;
        for (var i = 0; i < payments.length; i++) {
            console.log(payments[i]);
            if (payments[i].confirmed){
                paymentClass = 'bg-success';
            }
            else {
                paymentClass = ''
            }

            $('#paymentsTableBody').append('<tr id="' + payments[i].id + '" class="' + paymentClass + '">'
                + '<td>' + (i + 1) + '</td>'
                + '<td class="amount">' + payments[i].amount + '</td>'
                + '<td class="planned">' + payments[i].date + '</td>'
                + '<td class="confirmed">' + payments[i].confirmedDate + '</td>'
                + '<td><span class="show-payment glyphicon glyphicon-pencil"/></td></tr>');
        }

        //Might consider serializing it instead of
        $('#projectName').html(rowData['Project name']);
        $('#manager').html(rowData['Manager']);
        $('#currentState').html(rowData['Current state']);
        $('#contractType').html(rowData['Contract type']);
        $('#contractName').html(rowData['Contract name']);
        $('#planned').html(rowData[columnTitle]['planned']);
        $('#confirmed').html(rowData[columnTitle]['confirmed']);

        $('#paymentModal').modal('show');

    });

    //Showing page with payment actionson modal form page
    $("#paymentsTable").on("click", ".show-payment", function() {
        var row = $(this).parents('tr');
        $('#paymentInfo').attr('payment-id', row.attr('id'));
        $('#paymentInfoAmount').html(row.children('.amount').text());
        $('#paymentInfoPlanned').html(row.children('.planned').text());
        $('#paymentInfoConfirmed').html(row.children('.confirmed').text());
        if(row.children('.confirmed').text()){
            console.log('Is not confirmed');
            //$('#splitInfo').removeClass('hidden');
            $('.confirm-action').addClass('hidden');
            $('.unconfirm-action').removeClass('hidden');
        }
        else {
            console.log('Is not confirmed');
            $('.confirm-action').removeClass('hidden');
            $('.unconfirm-action').addClass('hidden');
        }
        paymentForm.steps('next');
    });

    //Enabling datetimepicker fields
    $('#confirmDatePicker').datetimepicker({
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

//    $('#projects').on( 'click', 'tr', function () {
//        var cell = projectTable.row( this ).data();
//        console.log(cell);
//    });

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

    var paymentsQty = 0;
    var paymentDate;
    var paymentAmount;
    var paymentId;
    var splitPayment = {'paymentId': '', 'childPayments': ''};


    $('#addPayment').click(function() {
        if(paymentForm.valid())
        {
            paymentId = paymentForm.attr('payment_id');
            paymentDate = $('#childPaymentDate').val();
            paymentAmount = $('#childPaymentAmount').val();

            paymentsQty++;

            if (paymentsQty == 1)
            {
                splitPayment['paymentId'] = paymentId;
                splitPayment['childPayments'] = [];
                console.log('Splitting payment:');
                console.log(splitPayment);
                $('#paymentsListLabel').removeClass('hidden');
                $('#childPaymentsTable').removeClass('hidden');
            }

            console.log('Payment adding. Payment date: ' + paymentDate + ', payment amount: ' + paymentAmount +
            '. New payments quantity: ' + paymentsQty);

            $('#childPaymentsTableBody').append('<tr id="paymentRow' + paymentsQty + '" name>'
                + '<td>' + paymentsQty + '</td>'
                + '<td>' + paymentDate + '</td>'
                + '<td  class="childPaymentAmount">' + paymentAmount + '</td></tr>');

            splitPayment['childPayments'].push({'id': paymentsQty, 'date': paymentDate, 'amount': paymentAmount});
            console.log(splitPayment);
            $('#childPaymentDate').val('');
            $('#childPaymentAmount').val('');
            console.log('Child payment added');
        };
    });

    $('#save').click(function() {
        console.log('Saving split payment');
        var paymentData = new FormData($('#paymentForm')[0]);
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
    });


});
