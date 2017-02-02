'use strict'

$(document).ready(function() {
    var projectTable;
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
        //ES6 structure, might not be supported by some browsers
        var staticColumns = [...Array(5).keys()];
        console.log('staticColumns: ' + staticColumns)
        var allColumns = [...Array(columns.length).keys()];
        console.log('allColumns: ' + allColumns)
        var columnsNoSearch = allColumns.slice();
        columnsNoSearch.splice(0, 3)
        console.log('columnsNoSearch: ' + columnsNoSearch)
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
            fixedColumns: {
                leftColumns: staticColumns.length,
                rightColumns: 0
            },
            //Option for merging same rows (plugin dataTables.rowsGroup.js)
            rowsGroup: staticColumns,
            paging: false,
            ordering: false,
            //Searching on some columns may distort the table. Thus leaving search only for stable columns
            columnDefs: [{
                targets: columnsNoSearch,
                searchable: false,
            },
            {
                targets: paymentsColumns,
                "createdCell": function (td, cellData, rowData, row, col) {
                    if(cellData) {
                        var key = columns[col]['data'].replace('.amount','');
                        td.id = rowData[key].id
                        console.log(rowData[key].split);

                        $(td).append(' <span class="show-payment glyphicon glyphicon-search pull-right"></span>');
                        $(td).addClass('payment');
                        $(td).attr('data-html', 'true');
                        $(td).attr('data-content','Planned date: ' + rowData[key].date);
                        $(td).attr('data-placement','bottom');
                        $(td).attr('data-container','body');
                        //$(td).attr('data-trigger','hover');
                        if(rowData[key].split){
                            $(td).addClass( "text-warning" );
                            $(td).attr('data-content', $(td).attr('data-content') + '<br/> Payment is split:')
                            var payments = rowData[key].splitPayments
                            console.log(payments)
                            for (var i = 0; i < payments.length; i++) {
                                console.log(payments[i]);
                                $(td).attr('data-content', $(td).attr('data-content') + '<br/> #' + (i+1) +' Date:  '
                                + payments[i].date + ', amount: ' + payments[i].amount);
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
        $('.payment').popover({
                trigger: "hover",
        })
    }

    $("#projects").on("click", ".show-payment", function() {
        var cell = $(this).parent();
        var row = $(this).closest('tr');
        console.log('Showing payment #' + cell.attr('id'));
        console.log(projectTable.row( row ).data());
        console.log(projectTable.cell( cell ).index() );
        console.log(projectTable.data());
        var a = 1;
        console.log(a);
        $('#paymentInfo').modal('show');
    });

    $('#paymentDatePicker').datetimepicker({
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
});
