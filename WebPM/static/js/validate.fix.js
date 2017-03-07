jQuery.extend(jQuery.validator.messages, {
    required: gettext('This field is required'),
    digits: gettext('Please enter only digits'),
    maxlength: $.validator.format( gettext('Please enter no more than {0} characters')),
    minlength: $.validator.format( gettext('Please enter at least {0} characters')),
});
