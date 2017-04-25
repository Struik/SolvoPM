'use strict'

$(document).ready(function() {

    //For todays date
    var currentDate = new Date();
    Date.prototype.today = function() {
        return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "." + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "." + this.getFullYear().toString().substr(2);
    }


    var contractDateFields = {'contractApprovedDate': 'approvedDate', 'contractSentDate': 'sentDate',
                                        'contractReceivedDate': 'receivedDate', 'contractStoredDate':'storedDate'}


    //Enabling datetimepicker fields
    $('#contractDatePicker').datetimepicker({
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
    $("#summaryTable").on("click", ".change-contract-date", function() {
        var dateField = $(this).children('a');
        //Contract date type will be sent to server when added/changed/rollbacked
        $('#confirmContractDateModal').attr('contract-date-type', contractDateFields[dateField.attr('id')]);
        //If date is already present then show it on the datepicker and enable 'Rollback date' button
        if (dateField.text()){
            console.log('Date is present');
            $('#rollbackContractDate').removeClass('hidden');
            $('#contractDatePicker').data("DateTimePicker").date(dateField.text());
        }
        //If date is empty then set current date on the datepicker and hide 'Rollback date' button
        else {
            console.log('Date is empty');
            $('#rollbackContractDate').addClass('hidden');
            $('#contractDatePicker').data("DateTimePicker").date(currentDate.today());
        }
        $('#confirmContractDateModal').modal('show');
    });


    //Filling fields with contract data from JSON
    $('#contractTotalSum').html(contractData.contractFinance.Total);
    $('#contractConfirmedSum').html(contractData.contractFinance.Confirmed);
    //    $('#contractTravelCostSum').html(contractData.contractFinance.Confirmed);

    for (var key in contractDateFields) {
        fillContractDates(key, contractDates[contractDateFields[key]]);
    }

    //Call server on contract date saving
    $('#confirmContractDate').click(function() {
        //TODO. Change to form/field validation
        if(true)
        {
            console.log('Confirming contract date');
            changeContractDate();
        };
    });

});

function fillContractDates(elementId, value){
    if (value){
        $('#' + elementId).html(value);
        $('#' + elementId).next().addClass('glyphicon-pencil');
    }
    else {
        $('#' + elementId).next().addClass('glyphicon-plus');
    }
}

function changeContractDate(){
    var changedData = {'contractId': contractDates.contract_id, 'contractDate': $('#contractDate').val(),
                                'contractDateType': $('#confirmContractDateModal').attr('contract-date-type')}
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