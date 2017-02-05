'use strict'

$(document).ready(function() {
    var paymentForm = $("#paymentForm");

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
                createDatatable(response);
            },
            error: function () {
                alert('Failed to load projects data');
            },
        });
    }

    //Function to created table
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
                        var key = columns[col]['data'].replace('.amount','');
                        td.id = rowData[key].id
                        console.log(rowData[key].split);

                        $(td).append(' <span class="show-payment glyphicon glyphicon-search pull-right"></span>');
                        $(td).addClass('payment');
                        //Trigger event for bootstrap popover can be set for each element or one for all elements
                        //$(td).attr('data-trigger','hover');
                        $(td).attr('data-html', 'true');
                        $(td).attr('data-content','Planned date: ' + rowData[key].date);
                        $(td).attr('data-placement','bottom');
                        $(td).attr('data-container','body');

                        //Showing extra data on tooltip for split payments
                        if(rowData[key].split){
                            $(td).addClass( "text-warning" );
                            $(td).attr('data-content', $(td).attr('data-content') + '<br/> Payment is split:')
                            var childPayments = rowData[key].childPayments
                            console.log(childPayments)
                            for (var i = 0; i < childPayments.length; i++) {
                                console.log(childPayments[i]);
                                $(td).attr('data-content', $(td).attr('data-content') + '<br/> #' + (i+1) +' Date:  '
                                + childPayments[i].date + ', amount: ' + childPayments[i].amount);
                            }
                        }
                        //glyphicon-warning-sign
                        //<a href="#" data-toggle="tooltip" title="" data-original-title="Default tooltip">you probably</a>

                    }
                },
            }],
        });

        //Add bootstrap colors for payment values in the table
        $('#projects tr:nth-of-type(odd)').addClass( "text-primary" );
        $('#projects tr:nth-of-type(even)').addClass( "text-success" );
        //Trigger event for bootstrap popover can be set for each element or one for all elements like here
        $('.payment').popover({
                trigger: "hover",
        })
    }

    //Showing modal with info and actions for each payment when zoom icon is clicked
    $("#projects").on("click", ".show-payment", function() {
        //Clearn modal from previous data
        $("#childPaymentsTableBody tr").remove();
        var cell = $(this).parent();
        console.log('Showing payment #' + cell.attr('id'));
        //For confirming and splitting this payment
        paymentForm.attr('payment_id', cell.attr('id'));
        var cellIndex = projectTable.cell( cell ).index();
        var rowData = projectTable.row( cellIndex['row'] ).data();
        console.log(rowData);
        var columnTitle = projectTable.column( cellIndex['column'] ).title().replace(' ','');
        if(rowData[columnTitle].split){
            var childPayments = rowData[columnTitle]['childPayments'];
            //TODO. This part of code is duplicate and used createdCell option of datatable.
            //Might consider making a function for it.
            for (var i = 0; i < childPayments.length; i++) {
                console.log(childPayments[i]);
                $('#childPaymentsTableBody').append('<tr id="childPaymentRow' + (i + 1) + '">'
                    + '<td>' + (i + 1) + '</td>'
                    + '<td>' + childPayments[i].date + '</td>'
                    + '<td>' + childPayments[i].amount + '</td></tr>');
            }
            $('#splitInfo').removeClass('hidden');
            $('#confirmTab').addClass('disabled');
            $('#splitTab').addClass('disabled');
            $('#confirmTab a').removeAttr('data-toggle');
            $('#splitTab a').removeAttr('data-toggle');
        }
        else {
            $('#splitInfo').addClass('hidden');
            $('#confirmTab').removeClass('disabled');
            $('#splitTab').removeClass('disabled');
            $('#confirmTab a').attr('data-toggle','tab');
            $('#splitTab a').attr('data-toggle','tab');
        }

        //Might consider serializing it instead of
        $('#projectName').html(rowData['Project name']);
        $('#manager').html(rowData['Manager']);
        $('#currentState').html(rowData['Current state']);
        $('#contractType').html(rowData['Contract type']);
        $('#contractName').html(rowData['Contract name']);
        $('#paymentAmount').html(rowData[columnTitle]['amount']);
        $('#plannedDate').html(rowData[columnTitle]['date']);
        $('#confirmedDate').html('Not confirmed');

        //Switching to first tab
        $('#infoTab a[href="#info"]').tab('show');

        $('#paymentModal').modal('show');
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

    $('#confirmPayment').click(function() {
        console.log('Confirming payment');
        var paymentData = {'paymentId': paymentForm.attr('payment_id'),'confirmDate': $('#confirmDate').val()}
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
    });

    $('#save').click(function() {
        console.log('Saving split payment');
        var paymentData = new FormData($('#paymentForm')[0]);
        console.log(paymentData);
        $.ajax({
            type: 'POST',
            url: "save_document",
            data: paymentData,
            cache: false,
            contentType: false,
            processData: false,
            success: function (response) {
                console.log('New document request returned successfully');
                console.log(response);
            },
            error: function () {
                console.log('New document request failed');
            },
        });
    });


});
