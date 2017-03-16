//Localization fix for jquery validate plugin
jQuery.extend(jQuery.validator.messages, {
    required: gettext('This field is required'),
    digits: gettext('Please enter only digits'),
    maxlength: $.validator.format( gettext('Please enter no more than {0} characters')),
    minlength: $.validator.format( gettext('Please enter at least {0} characters')),
});

//Localization fix for selectize plugin. Jnly for 'option_create' setting yet
Selectize.prototype.setupTemplates = function() {
    var self = this;
    var field_label = self.settings.labelField;
    var field_optgroup = self.settings.optgroupLabelField;

    var templates = {
        'optgroup': function(data) {
            return '<div class="optgroup">' + data.html + '</div>';
        },
        'optgroup_header': function(data, escape) {
            return '<div class="optgroup-header">' + escape(data[field_optgroup]) + '</div>';
        },
        'option': function(data, escape) {
            return '<div class="option">' + escape(data[field_label]) + '</div>';
        },
        'item': function(data, escape) {
            return '<div class="item">' + escape(data[field_label]) + '</div>';
        },
        'option_create': function(data, escape) {
            return '<div class="create">' + gettext("Add") + ' <strong>' + escape(data.input) + '</strong>&hellip;</div>';
        }
    };

    self.settings.render = $.extend({}, templates, self.settings.render);
};