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