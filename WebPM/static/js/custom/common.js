'use strict'

//Function to add new value in DB references when it's added via select field on the form
//parentReference is an extra argument for references which have foreign key to other reference
var newRefValue = function(input, callback, object, parentReference){
    var selectId = object.$input[0].id;
    console.log(selectId);
    var referenceName = $('#' + selectId).attr('reference_id');
    var newValue = {'referenceName': referenceName, 'value': input}
    if (parentReference){
        console.log('Parent ref: ' + JSON.stringify(parentReference));
        newValue['parentReference'] = JSON.stringify(parentReference);
    }
    console.log('Adding new value to the reference');
    console.log(newValue);
    $.ajax({
        type: 'POST',
        url: "new_ref_value",
        data: newValue,
        dataType: "json",
        success: function (result) {
            console.log('Response on adding new value to reference request:');
            console.log(result['refId']);
            if (result) {
                callback({ 'value': result['refId'], 'text': input });
            }
        }
    });
};


//Fix for jquery validate highlightning ("has-success" class). Bootstrap classes "has-success" and "has-error"
//require a node to have "form-control" class (or other combo of conditions which are not my case).
//Selectize plugin generates own nodes including <div> with class "selectize-input" which is shown when any value
//is selected. When there is no value selected then <select> is shown which has "form-control" class from the base
//html. Thus "has-error" (plus "has-danger") class works correctly and lights borders with red but "has-success"
//wasn't visible
//It's fun reading comments few weeks later and getting no clue what do they mean
$('div .selectize-input').addClass('form-control');


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