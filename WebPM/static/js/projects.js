$(document).ready(function() {
    var columns = [
        { 'title':'Project name' },
        { 'title':'Manager' },
        { 'title':'Current state' },
        { 'title':'Contract type' },
        { 'title':'Contract name' }
    ];

//    for(key in Object.keys(paymentsByMonth)) {
//        columns.push({'title': Object.keys(paymentsByMonth)[key]});
//    }

    var projectTable = $('#projects').DataTable({
        columns: columns,
        //data: paymentsData,
        rowsGroup: [0, 1, 2, 3, 4],
        paging: false,
    });

} );