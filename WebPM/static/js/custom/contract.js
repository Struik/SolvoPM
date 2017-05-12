'use strict'

$(document).ready(function() {
    var confirmDateForm = $('#confirmContractDateModal');
    var contractDatePicker = $('#contractDatePicker');
    var confirmContractDateButton = $('#confirmContractDate');
    var rollbackContractDateButton = $('#rollbackContractDate');
    var stagesTable = $('#stagesTable');
    var prevStageDate;


    //For todays date
    var currentDate = new Date();
    Date.prototype.today = function() {
        return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "." + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "." + this.getFullYear().toString().substr(2);
    }

    //Contract panel handling
    //
    //

    //Enabling datetimepicker fields
    contractDatePicker.datetimepicker({
        format: 'DD.MM.YY',
        allowInputToggle: true,
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


    //Showing modal form with selected date confirmation or rollback
    $(document).on("click", "td.change-contract-date:not(.not-allowed)", function() {
        var dateField = $(this).children('a');
        confirmDateForm.attr('contract-date-id', dateField.attr('contract-date-id'));
        //If date is already present then show it on the datepicker and enable 'Rollback date' button
        if (dateField.text()){
            console.log('Date is present');
            contractDatePicker.data("DateTimePicker").date(dateField.text());
            rollbackContractDateButton.removeClass('hidden');
            //Can't rollback if next date is filled
            if ($( "a[contract-date-id='" + (parseInt(dateField.attr('contract-date-id')) + 1) + "']" ).text()){
                console.log('Next date is not empty');
                rollbackContractDateButton.prop('disabled', true);
                rollbackContractDateButton.parent().popover('enable');
            }
            else {
                console.log('Next date is empty');
                rollbackContractDateButton.prop('disabled', false);
                rollbackContractDateButton.parent().popover('disable');
            }
        }
        //If date is empty then set current date on the datepicker and hide 'Rollback date' button
        else {
            console.log('Date is empty');
            rollbackContractDateButton.addClass('hidden');
            contractDatePicker.data("DateTimePicker").date(currentDate.today());
        }
        confirmDateForm.modal('show');
    });


    //Filling fields with contract data from JSON
    $('#contractStatus').html(contract.fields.status);
    $('#contractTotalSum').html(contractData.contractFinance.Total);
    $('#contractConfirmedSum').html(contractData.contractFinance.Confirmed);
    //    $('#contractTravelCostSum').html(contractData.contractFinance.Confirmed);


    for (var key in contractDateFields) {
        var value = contractDates[contractDateFields[key]['db_field']];
        var elementId = contractDateFields[key]['element_id'];
        fillContractDates(elementId, key, value, prevContractDateValue);
        prevContractDateValue = value;
    }


    //Call server on contract date changing
    confirmContractDateButton.click(function() {
        //TODO. Change to form/field validation
        if(true)
        {
            console.log('Confirming contract date');
            var contractDateType = contractDateFields[confirmDateForm.attr('contract-date-id')]['db_field'];
            var contractStatus = contractDateFields[confirmDateForm.attr('contract-date-id')]['status'];
            var changedData = {'contractId': contractDates.contract_id, 'contractDate': $('#contractDate').val(),
                                            'contractStatus': contractStatus, 'contractDateType': contractDateType};
            changeContractDate(changedData);
        };
    });


    //Call server on contract date rollback. Same request as for date changing with empty value
    rollbackContractDateButton.click(function() {
        //TODO. Change to form/field validation
        if(true)
        {
            console.log('Rollbacking contract date');
            var contractDateType = contractDateFields[confirmDateForm.attr('contract-date-id')]['db_field'];
            var contractStatus = '';
            //Sending empty status if rollbacking first date
            if (confirmDateForm.attr('contract-date-id') > 1){
                contractStatus = contractDateFields[confirmDateForm.attr('contract-date-id') - 1]['status'];
            }
            var changedData = {'contractId': contractDates.contract_id, 'contractDate': '',
                                            'contractStatus': contractStatus, 'contractDateType': contractDateType};
            changeContractDate(changedData);
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
                console.log()
                console.log(rowData);
                console.log(cellData);
                $(td).append(' <span class="glyphicon hoverable glyphicon-pencil"></span>');
                $(td).addClass('text-center').addClass('change-stage-date').addClass('plan-date')
                                                                                            .addClass('td-hoverable');
            },
        },
        {
            //Icons for date adding
            targets: [4, 6],
            createdCell: function (td, cellData, rowData, row, col) {
                $(td).addClass('text-center').addClass('change-stage-date').addClass('real-date')
                                                                                            .addClass('td-hoverable');
                if (cellData){
                    $(td).append(' <span class="glyphicon hoverable glyphicon-pencil"></span>');
                    $(td).addClass('text-center').addClass('change-stage-date').addClass('td-hoverable');
                }
                else {
                    $(td).append('<span class="glyphicon hoverable glyphicon-plus"></span>');
                    if (!prevStageDate){
                        $(td).addClass('not-allowed').attr('data-container','body')
                            .attr('data-container','body').attr('data-toggle','popover').attr('data-placement','bottom')
                            .attr('data-content', gettext('Unavailable before real starting date is filled'));
                    }
                }
                prevStageDate = cellData;
            }
        }],
    });

    //Showing modal form with selected date confirmation or rollback
    $(document).on("click", "td.change-stage-date:not(.not-allowed)", function() {
        var cell = $(this);
        var cellIndex = stagesDataTable.cell( cell ).index();
        console.log(cellIndex);
        var rowData = stagesDataTable.row( cellIndex['row'] ).data();
        console.log(rowData);
        var dateField = $(this);
        //If date is already present then show it on the datepicker and enable 'Rollback date' button
        if (dateField.text()){
            console.log('Date is present');
            contractDatePicker.data("DateTimePicker").date(dateField.text());
            if (dateField.hasClass('real-date')){
                rollbackContractDateButton.removeClass('hidden');
            }
            else {
                //Not showing rollback for planned dates
                rollbackContractDateButton.addClass('hidden');
            }
        }
        //If date is empty then set current date on the datepicker and hide 'Rollback date' button
        else {
            console.log('Date is empty');
            rollbackContractDateButton.addClass('hidden');
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

function changeContractDate(changedData){
    console.log(changedData);
    $.ajax({
        type: 'POST',
        url: "change_contract_date",
        data: changedData,
        success: function (response) {
            console.log('Contract date changed successfully');
            location.reload();
        },
        error: function () {
            console.log('Contract date changing failed');
        },
    });
}