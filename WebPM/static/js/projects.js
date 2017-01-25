$(document).ready(function() {
    //ES6 structure, might not be supported by some browsers
    var staticColumns = [...Array(5).keys()];
    console.log(staticColumns)
    var columnsNoSearch = [...Array(columns.length).keys()];
    columnsNoSearch.splice(0, 3)
    console.log(columnsNoSearch)

    //(plugin datatables.js)
    //Creating datatable, table headers and table data are generated in required way (array) on server side
    var projectTable = $('#projects').DataTable({
        processing: true,
        serverSide: true,
        columns: columns,
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
        }],
    });

    $('#projects tr:nth-of-type(odd)').addClass( "text-primary" );
    $('#projects tr:nth-of-type(even)').addClass( "text-success" );
} );