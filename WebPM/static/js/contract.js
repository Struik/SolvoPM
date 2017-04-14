$(document).ready(function() {
    // For changing the collapsed icon in the panels
    $('.collapse').on('shown.bs.collapse', function(){
        $(this).parent().find(".glyphicon-chevron-down")
            .removeClass("glyphicon-chevron-down")
            .addClass("glyphicon-chevron-up");
    }).on('hidden.bs.collapse', function(){
        $(this).parent().find(".glyphicon-chevron-up")
            .removeClass("glyphicon-chevron-up")
            .addClass("glyphicon-chevron-down");
    });
});