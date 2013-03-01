//
// Populate templates from data-attributes
//
$(window).on('load', function(){
    $('[data-template]').each(function(){
        try {
            var ele  = $(this),
                name = ele.attr('data-template'),    
                tmpl = Handlebars.templates[name];
            
            if (!tmpl) throw new Error('Could not find template "' + name + '".');
            
            var data = $(this).attr('data-source');
     
            if (!data){
                var endpoint = $(this).attr('data-endpoint');
                if (!endpoint) throw new Error('No data specified for template "' + name + '".');
                $.get(endpoint + '?format=json').done(populate)
            } else populate(data);

            function populate(data){
                var html = tmpl(data);
                ele.html(html);
            }
        } catch(err){
            Sourcemap.log(err);
        }
    });
});
