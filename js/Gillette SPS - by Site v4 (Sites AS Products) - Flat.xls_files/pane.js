/* Sourcemap.View.Pane -------------------------------------------------------------

Info pane.  This is floating element that's used to display information about things 
and sets.

------------------------------------------------------------------------------ */

Sourcemap.View.Pane = function(o){
    // Extend parent class
    Sourcemap.View.call(this, o);
    
    var init = $.proxy(function(){this.init()},this);
    Sourcemap.checkDependencies(['Showdown', 'slides'], init);
};

Sourcemap.View.Pane.prototype.init = function(){
    this.classes = this.element.attr('class');
    
    this.initPane()
        .initListeners();

    this.converter = new Showdown.converter();
}

Sourcemap.View.Pane.prototype.initPane = function(){
    var self = this;
    
    this.element
        .empty()
        .attr('class', this.classes);

    this.closebox = $('<div />')
        .addClass('box closebox')
        .click(function(evt){
            self.close();
            Sourcemap.broadcast('clickoff');
        })
        .appendTo(this.element);
    
    this.editbox = $('<div />')
        .addClass('box editbox')
        .click(function(evt){
            self.edit();
        });
        //.appendTo(this.element);
    
    this.content = $('<div />')
        .addClass('content')
        .appendTo(this.element);
    
    return this;
}

// All of the pane's interaction should be driven by event listeners.
// If you find yourself accessing the pane directly from another view,
// please add an event listener instead!
Sourcemap.View.Pane.prototype.initListeners = function(){
    Sourcemap.listen('thing:selected', function(evt, thing){
        this.current = thing;
        this.open(thing.description);
    }, this);

    Sourcemap.listen('clickoff', function(evt, thing){
        this.current = false;
        this.close();
    }, this);

    return this;
}
// Initalize pane editor.
Sourcemap.View.Pane.prototype.edit = function(){
    var self = this;

    // Clear out content and replace with markdown editor
    this.content.empty();

    this.editor = editor = $('<textarea />')
        .addClass('editor')
        .val(this.current.description || '')
        .keydown(grow)
        .trigger('keydown')
        .appendTo(this.content);

    function grow(){
        while($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))) {
            $(this).height($(this).height()+1);
        }
    }
    
    var helpicon = $('<i />').addClass('icon icon-question-sign pull-right').click(function(){
        self.help();
    })

    var legend = $('<ul />')
        .html('Shortcodes:').append(helpicon)
        .addClass('shortcodes')
        .appendTo(this.content);
    var plugins = Sourcemap.View.Pane.Plugins;
    for (var name in plugins){
        $('<li />')
            .text(name)
            .click(addShortcode)
            .appendTo(legend);
    }
    
    function addShortcode(evt){
        var name = $(evt.target).text();
        var string = ' [' + name + '] ';
        editor.val(editor.val() + string);
    }

    var title = this.current.name ? '"' + this.current.name + '"' : 'this point';

    // Show save buttons
    $('<button />')
        .text('Save to ' + title)
        .css({'width' : '11em', 'margin-top' : '30px'})
        .addClass('btn btn-primary')
        .click(function(){ self.save(false, $(this)) })
        .appendTo(legend);

    $('<br />').appendTo(legend);

    $('<button />')
        .text('Save Everywhere')
        .css({'width' : '11em', 'margin-top' : '5px'})
        .addClass('btn btn-disabled')
        .click(function(){ self.save(true, $(this)) })
        .appendTo(legend);
}

// Pop up our markdown help
Sourcemap.View.Pane.prototype.help = function(){
    var element = $('<div />')
        .css('padding', '20px 40px')
        .html(Handlebars.templates['markdown_help.html']());

    $('.modal').first().empty().append(element).modal('show');
}

// Save edits. 
Sourcemap.View.Pane.prototype.save = function(all, element){
    // Save this as a template
    if (all){
        // TODO: Batch update
        return;
    }

    var url = "/thing/update/",
        id  = this.current._id.$id,
        data= { description : $(this.editor).val() };
    
    element.addClass('active');

    $.ajax({
        url: url + id + '?format=json',
        data: data,
        type: 'POST',
        success: cb, 
        failure: cb 
    });

    function cb(response){
        element.removeClass('active');
        Sourcemap.broadcast('thing:save_success.set', id, response); 
    }

}


Sourcemap.View.Pane.prototype.open = function(markdown){
    var self = this;
  
    this.initPane();

    markdown = markdown || "";

    // Clear existing
    this.content.empty();

    // Put a title and location at the top.  Some shortcodes will override this.
    var name = this.current.name || "",
        loc  = this.current.address || "";
    this.content.html("<div class='pane_header'><h2 class='title'>" + name + "</h2><h3 class='location'>" + loc + "</h3></div>");

    // Create HTML from markdown
    var html = this.converter.makeHtml(markdown);

    // Default Summary Function
    html += '[summary="all"]';

    // Search for shortcodes
    html = html.replace(/\[(.*?)\]/g, $.proxy(handle, this)); 

    this.content.append(html);
    
    this.element.show();
    Sourcemap.broadcast('pane:open');

    return;

    function handle(shortcode){
        try{
            var name = shortcode.split('=')[0].split('[')[1],
                values = [];
            if (shortcode.indexOf('=') !== -1)
                values = shortcode.split('=')[1].split(']')[0].split(',');
            for (var i in values)
                values[i] = values[i].substr(0, values[i].length-1).substr(1);
            if (Sourcemap.View.Pane.Plugins[name]) 
                return Sourcemap.View.Pane.Plugins[name](values, this);
        } catch (err){
            Sourcemap.log('Malformed shortcode: ' + shortcode);
        }
        return "";
    }

}

Sourcemap.View.Pane.prototype.close = function(){
    this.content.empty();
    this.element.hide();
}

/* Sourcemap.View.Pane.plugins -------------------------------------------------

Plugins that allow different types of content to have custom functionality.

This will eventually be split off into a subdirectory!

------------------------------------------------------------------------------ */

Sourcemap.View.Pane.Plugins = {}

// Quick summary view.
Sourcemap.View.Pane.Plugins.summary = function(values, pane){
    var thing = pane.current;
    if (!thing) return '';

    var container = $("<div></div>"),
        element = $('<div class="pane_body" />'),
        columns = pane.set.columns[thing.type],
        names = pane.set.names,
        exclude = ['site', 'name', 'description', 'address','waypoints','waypoint'];

    for (var k in columns){
        if (!thing.attributes) thing.attributes = {};
        var attribute = columns[k];
        if ($.inArray(attribute, exclude) !== -1) continue;

        var data = thing.attributes[attribute] || thing[attribute];
        
        if (typeof(data) === "undefined") continue;
        element.append($('<b>' + names[attribute] + '</b> : ' + data + '<br />'));
    }
    container.append(element);
    return container.html();
}

Sourcemap.View.Pane.Plugins.slideshow = function(values, pane){
    // Add a slideshow
    var id = 'slides';
    var div = '<div />';
    var img = '<img />';

    var container = $(div)
        .addClass('slides_container');


    var element = $(div)
        .attr({id : id})
        .addClass('slideshow')
        .append(container)

    var arrows = ['prev', 'next']
    for (var a in arrows){
        var name = arrows[a];
        $('<a href="#" />')
            .addClass(name)
            .appendTo(element);
    }

    var wrap = $(div)
        .append(element);

    for (var i in values){
        var dets = values[i].split('|');
        var title = $(div).addClass('slideshow-title').html('<p>' + values[i].split('|')[1] + '</p>');
        var image = $(img).attr({ src : values[i].split('|')[0] });
        var slide = $(div).append(image).append(title);
        container.append(slide);
    }

    Sourcemap.listen_once('dialog:open', function(){
        var controls = $('#' + id).find('.next, .prev, .pagination');

        // Sorry
        var fadein = function(e){ controls.each(function(){ $(this).fadeIn(); }); };
        var fadeout = function(e){ controls.each(function(){ $(this).fadeOut(); }); };

        $('#' + id).slides({
            preload: true,
            preloadImage: 'img/loading.gif',
            play: 5000,
            pause: 2500,
            paginationClass: 'pagination',
            hoverPause: true,
            effect: 'fade',
            crossfade: true
        }).hover(fadein, fadeout);

    }, this);

    return wrap.html();
};



// Quick summary view.
Sourcemap.View.Pane.Plugins.small_frame = function(values, pane){
    var thing = pane.current;
    if (!thing) return '';

    var container = $('<div />'),
        iframe = $("<iframe />")
            .attr('src', values)
            .height('400')
            .width('500px');
  
    container.append(iframe);
    return container.html();
}

// Full-pane iframe 
Sourcemap.View.Pane.Plugins.iframe = function(values, pane){
    var container = $('<div />')
        iframe = $("<iframe />")
            .attr('src', values)
            .height('400')
            .width('500px');

    // Force iframe to become full pane size
    pane.element.addClass('nopadding');
   
    pane.element.empty();
    iframe.appendTo(pane.element);

    return;
}

// Handlebars template 
Sourcemap.View.Pane.Plugins.template = function(values, pane){
    var html = '';

    for (var i in values){
        var name = values[i];
            tmpl = Handlebars.templates['pane/' + name];
        if (tmpl) html += tmpl(pane.current);
        else Sourcemap.log('Template ' + name + ' could not be found.');
    }

    pane.content.empty();
    return html; 
}
