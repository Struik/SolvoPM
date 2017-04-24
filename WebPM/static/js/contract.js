'use strict'

$(document).ready(function() {

    //For todays date
    var currentDate = new Date();
    Date.prototype.today = function() {
        return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "." + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "." + this.getFullYear().toString().substr(2);
    }

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
        console.log($(this));
        //If date is already present then show it on the datepicker and enable 'Rollback date' button
        if ($(this).text().length){
            console.log('Date is present');
            $('#rollbackContractDate').removeClass('hidden');
            $('#contractDatePicker').data("DateTimePicker").date($(this).text().trim());
        }
        //If date is empty then set current date on the datepicker and hide 'Rollback date' button
        else {
            console.log('Date is empty');
            $('#rollbackContractDate').addClass('hidden');
            $('#contractDatePicker').data("DateTimePicker").date(currentDate.today());
        }
        $('#confirmContractDateModal').modal('show');
    });

    //Filling fields with data from JSON
    var contractDates = JSON.parse(contractData.contractDates)[0]['fields']
    console.log(contractDates)
    $('#contractTotalSum').html(contractData.contractFinance.Total);
    $('#contractConfirmedSum').html(contractData.contractFinance.Confirmed);
//    $('#contractTravelCostSum').html(contractData.contractFinance.Confirmed);
    $('#contractApprovedDate').html(contractDates.approvedDate);
    $('#contractSentDate').html(contractDates.sentDate);
    $('#contractReceivedDate').html(contractDates.receivedDate);
    $('#contractStoredDate').html(contractDates.storedDate);

});