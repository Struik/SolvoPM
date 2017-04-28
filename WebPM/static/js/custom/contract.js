'use strict'

$(document).ready(function() {
    var confirmDateForm = $('#confirmContractDateModal');
    var contractDatePicker = $('#contractDatePicker');
    var confirmContractDateButton = $('#confirmContractDate');
    var rollbackContractDateButton = $('#rollbackContractDate');

    //For todays date
    var currentDate = new Date();
    Date.prototype.today = function() {
        return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "." + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "." + this.getFullYear().toString().substr(2);
    }



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
            var changedData = {'contractId': contractDates.contract_id, 'contractDate': $('#contractDate').val(),
                                                                                'contractDateType': contractDateType};
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
            var changedData = {'contractId': contractDates.contract_id, 'contractDate': '',
                                                                                'contractDateType': contractDateType};
            changeContractDate(changedData);
        };
    });

});


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
                            .attr('data-content', gettext('Unavailable before previous date is not filled'));
             //Enabling popovers. Might use the way to move it to the start of the file
             //http://stackoverflow.com/questions/16990573/how-to-bind-bootstrap-popover-on-dynamic-elements
            $('[data-toggle="popover"]').popover({
                trigger: "hover",
            });
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