'use strict'

$(document).ready(function() {
    window.confirmDateForm = $('#confirmContractDateModal');
    var contractDatePicker = $('#contractDatePicker');
    var stageStartDatePicker = $('#stageStartDatePicker');
    var stageFinishDatePicker = $('#stageFinishDatePicker');
    var confirmDateButton = $('#confirmDate');
    var rollbackDateButton = $('#rollbackDate');
    var stagesTable = $('#stagesTable');
    var prevStageDateValue;


    //For todays date
    var currentDate = new Date();
    Date.prototype.today = function() {
        return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "." + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "." + this.getFullYear().toString().substr(2);
    }


    //Enabling select nodes with selectize plugin
    var $selectCity = $('#selectStageType').selectize({
        create: function (input, callback){
            newRefValue(input, callback, this);
        },
    });


    //Enabling datetimepicker fields
    contractDatePicker.datetimepicker({
        format: 'DD.MM.YY',
        allowInputToggle: true,
    });
    stageStartDatePicker.datetimepicker({
        format: 'DD.MM.YY',
        allowInputToggle: true,
    });
    stageFinishDatePicker.datetimepicker({
        format: 'DD.MM.YY',
        allowInputToggle: true,
        useCurrent: false,
    });
    //Linking two date inputs so Finish date cannot be earlier than Start date and vice versa
    stageStartDatePicker.on("dp.change", function (e) {
        stageFinishDatePicker.data("DateTimePicker").minDate(e.date);
    });
    stageFinishDatePicker.on("dp.change", function (e) {
        stageStartDatePicker.data("DateTimePicker").maxDate(e.date);
    });


    // For changing the collapsed icon in the panels
    $('.collapse').on('shown.bs.collapse', function() {
        $(this).parent().find(".glyphicon-chevron-down")
            .removeClass("glyphicon-chevron-down")
            .addClass("glyphicon-chevron-up");
    }).on('hidden.bs.collapse', function(){
        $(this).parent().find(".glyphicon-chevron-up")
            .removeClass("glyphicon-chevron-up")
            .addClass("glyphicon-chevron-down");
    });


    //Collapse panel when user clicked on any place within the panel header
    $(document).on("click", ".panel-heading *", function() {
        $(this).parents('.panel').children('.collapse').collapse('toggle')
    });


    //Contract panel handling
    //
    //


    //Showing modal form with selected date confirmation or rollback buttons
    $(document).on("click", "td.change-contract-date:not(.not-allowed)", function() {
        confirmDateForm.attr('form-action-type', 'saveContractDate');
        var dateField = $(this).children('a');
        confirmDateForm.attr('contract-date-id', dateField.attr('contract-date-id'));

        //If date is already present then show it on the datepicker and enable 'Rollback date' button
        if (dateField.text()){
            console.log('Date is present');
            contractDatePicker.data("DateTimePicker").date(dateField.text());
            rollbackDateButton.removeClass('hidden');
            //Can't rollback if next date is filled
            if ($( "a[contract-date-id='" + (parseInt(dateField.attr('contract-date-id')) + 1) + "']" ).text()){
                console.log('Next date is not empty');
                rollbackDateButton.prop('disabled', true);
                rollbackDateButton.parent().popover('enable');
            }
            else {
                console.log('Next date is empty');
                rollbackDateButton.prop('disabled', false);
                rollbackDateButton.parent().popover('disable');
            }
        }
        //If date is empty then set current date on the datepicker and hide 'Rollback date' button
        else {
            console.log('Date is empty');
            rollbackDateButton.addClass('hidden');
            contractDatePicker.data("DateTimePicker").date(currentDate.today());
        }
        confirmDateForm.modal('show');
    });


    //Filling fields with contract data from JSON
    $('#contractStatus').html(contract.fields.status);
    $('#contractTotalSum').html(contractData.contractFinance.Total);
    $('#contractConfirmedSum').html(contractData.contractFinance.Confirmed);
    //    $('#contractTravelCostSum').html(contractData.contractFinance.Confirmed);


    for (var key in contractDateMapping) {
        var value = contractDates[contractDateMapping[key]['db_field']];
        var elementId = contractDateMapping[key]['element_id'];
        fillContractDates(elementId, key, value, prevContractDateValue);
        prevContractDateValue = value;
    }


    //Call server on contract date changing
    confirmDateButton.click(function() {
        //TODO. Change to form/field validation
        if(true)
        {
            console.log ('Action type is: ' + confirmDateForm.attr('form-action-type'));
            window[confirmDateForm.attr('form-action-type')]('change');
        };
    });


    //Call server on contract date rollback. Same request as for date changing with empty value
    rollbackDateButton.click(function() {
        //TODO. Change to form/field validation
        if(true)
        {
            console.log ('Action type is: ' + confirmDateForm.attr('form-action-type'));
            window[confirmDateForm.attr('form-action-type')]('rollback');
        };
    });

    //Stages panel handling
    //
    //

    //Filling fields with stages data from JSON
    $('#stagesTotal').html(stagesData.length);
    var projectDates;
    if (stagesData.length){
        projectDates = contractData.stagesSummary.minDate + ' - ' + contractData.stagesSummary.maxDate;
    }
    $('#projectDates').html(projectDates);
    $('#currentStage').html(contractData.stagesSummary.currentStage);
    $('#allowance').html(stagesData.allowanceDuration);

    var stagesDataTable = stagesTable.DataTable({
        data: stagesData,
        columns: [
            { "data": "id" },
            { "data": "stageType" },
            { "data": "status" },
            { "data": "plannedStartDate" },
            { "data": "actualStartDate" },
            { "data": "plannedFinishDate" },
            { "data": "actualFinishDate" },
            { "data": "status" },
            { "data": "status" },
        ],
        paging: false,
        ordering: false,
        searching: false,
        info: false,
        columnDefs: [{
            //Icons for changing plan dates
            targets: [3, 5],
            createdCell: function (td, cellData, rowData, row, col) {
                $(td).attr('stage-date-db-field', stageDateMapping[col]);
                $(td).append(' <span class="glyphicon hoverable glyphicon-pencil"></span>');
                $(td).addClass('text-center').addClass('change-stage-date').addClass('plan-date')
                                                                                            .addClass('td-hoverable');
            },
        },
        {
            //Icons for date adding
            targets: [4, 6],
            createdCell: function (td, cellData, rowData, row, col) {
                $(td).attr('stage-date-db-field', stageDateMapping[col]);
                $(td).addClass('text-center').addClass('change-stage-date').addClass('real-date')
                                                                                            .addClass('td-hoverable');
                //Checking wheter stage date is present or it is a first real date in stage's table
                if (cellData){
                    $(td).append(' <span class="glyphicon hoverable glyphicon-pencil"></span>');
                    $(td).addClass('text-center').addClass('change-stage-date').addClass('td-hoverable');
                }
                else {
                    $(td).append('<span class="glyphicon hoverable glyphicon-plus"></span>');
                    if (!prevStageDateValue && !(row == 0 && col == 4)){
                        $(td).addClass('not-allowed').attr('data-container','body')
                            .attr('data-container','body').attr('data-toggle','popover').attr('data-placement','bottom')
                            .attr('data-content', gettext('Unavailable before real starting date is filled'));
                    }
                }
                prevStageDateValue = cellData;
            }
        }],
    });

    //Showing modal form with selected date confirmation or rollback buttons
    $(document).on("click", "td.change-stage-date:not(.not-allowed)", function() {
        confirmDateForm.attr('form-action-type', 'saveStageDate');
        confirmDateForm.attr('stage-date-db-field', $(this).attr('stage-date-db-field'));
        var cell = $(this);
        var cellIndex = stagesDataTable.cell( cell ).index();
        console.log(cellIndex);
        var rowData = stagesDataTable.row( cellIndex['row'] ).data();
        console.log(rowData);
        confirmDateForm.attr('stage-id', rowData.id);
        var dateField = $(this);
        //If date is already present then show it on the datepicker and enable 'Rollback date' button
        if (dateField.text()){
            console.log('Date is present');
            contractDatePicker.data("DateTimePicker").date(dateField.text());
            if (dateField.hasClass('real-date')){
                rollbackDateButton.removeClass('hidden');
            }
            else {
                //Not showing rollback for planned dates
                rollbackDateButton.addClass('hidden');
            }
        }
        //If date is empty then set current date on the datepicker and hide 'Rollback date' button
        else {
            console.log('Date is empty');
            rollbackDateButton.addClass('hidden');
            contractDatePicker.data("DateTimePicker").date(currentDate.today());
        }
        confirmDateForm.modal('show');
    });


    //Enabling bootstrap popovers (should be at the end)
    $('[data-toggle="popover"]').popover({
                trigger: "hover",
    });

});


//Filling contract date fields and designing control elements depending on current value and preceding date
function fillContractDates(elementId, key, value, prevValue){
    $('#' + elementId).attr('contract-date-id', key);
    if(value){
        $('#' + elementId).html(value);
        $('#' + elementId).next().addClass('glyphicon-pencil');
    }
    else {
        $('#' + elementId).next().addClass('glyphicon-plus');
        if(!prevValue){
            $('#' + elementId).parent().addClass('not-allowed').attr('data-container','body')
                            .attr('data-container','body').attr('data-toggle','popover').attr('data-placement','right')
                            .attr('data-content', gettext('Unavailable before previous date is filled'));
             //Enabling popovers. Might use the way to move it to the start of the file
             //http://stackoverflow.com/questions/16990573/how-to-bind-bootstrap-popover-on-dynamic-elements
        }
    }
}

//Preparing data for contract date changing
function saveContractDate(action){
    switch(action){
        case 'change':
            console.log('Confirming contract date');
            var contractDateDbField = contractDateMapping[confirmDateForm.attr('contract-date-id')]['db_field'];
            var contractStatus = contractDateMapping[confirmDateForm.attr('contract-date-id')]['status'];
            var changedData = {'contractId': contractDates.contract_id, 'contractDate': $('#contractDate').val(),
                                            'contractStatus': contractStatus, 'contractDateDbField': contractDateDbField};
            saveDateRequest('change_contract_date', changedData);
            break;
        case 'rollback':
            console.log('Rollbacking contract date');
            var contractDateDbField = contractDateMapping[confirmDateForm.attr('contract-date-id')]['db_field'];
            var contractStatus = '';
            //Sending empty status if rollbacking first date else looking for previous status
            if (confirmDateForm.attr('contract-date-id') > 1){
                contractStatus = contractDateMapping[confirmDateForm.attr('contract-date-id') - 1]['status'];
            }
            var changedData = {'contractId': contractDates.contract_id, 'contractDate': '',
                                            'contractStatus': contractStatus, 'contractDateDbField': contractDateDbField};
            saveDateRequest('change_contract_date', changedData);
            break;
        default:
            console.log('Unknown action');
            return;
    }
}

//Preparing data for stage date changing
function saveStageDate(action){
    switch(action){
        case 'change':
            console.log('Confirming stage date');
            var stageId = confirmDateForm.attr('stage-id');
            var stageStatus = gettext('Scheduled');
            var stageDateDbField = confirmDateForm.attr('stage-date-db-field');
            if (stageDateToStatusMapping[stageDateDbField]){
                stageStatus = stageDateToStatusMapping[stageDateDbField];
            }
            var changedData = {'stageId': stageId, 'stageDate': $('#contractDate').val(),
                                            'stageStatus': stageStatus, 'stageDateDbField': stageDateDbField};
            saveDateRequest('change_stage_date', changedData);
            break;
        case 'rollback':
            console.log('Rollbacking stage date');
            var stageId = confirmDateForm.attr('stage-id');
            var stageStatus = gettext('Scheduled');
            var stageDateDbField = confirmDateForm.attr('stage-date-db-field');
            var changedData = {'stageId': stageId, 'stageDate': '', 'stageStatus': stageStatus,
                                                                        'stageDateDbField': stageDateDbField};
            saveDateRequest('change_stage_date', changedData);
            break;
        default:
            console.log('Unknown action');
            return;
    }
}


function saveDateRequest(url, data){
    console.log(data);
    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: function (response) {
            console.log('Date saved successfully');
            location.reload();
        },
        error: function () {
            console.log('Date changing failed');
        },
    });
}