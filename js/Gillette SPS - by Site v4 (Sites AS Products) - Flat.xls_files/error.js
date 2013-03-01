/* Sourcemap.View.Pane -------------------------------------------------------------

Info pane.  This is floating element that's used to display information about things 
and sets.

------------------------------------------------------------------------------ */

Sourcemap.View.Error = function(o){
    // Extend parent class
    Sourcemap.View.call(this, o);
    this.init()
};

Sourcemap.View.Error.prototype.init = function(){
    this.classes = this.element.attr('class');
    
    this.initPane()
        .initErrors();

    this.converter = new Showdown.converter();
}

Sourcemap.View.Error.prototype.initErrors = function(){
    this.errors = this.set.data.errors
    this.open(this.errors);
}


Sourcemap.View.Error.prototype.initPane = function(){
    var self = this;
    this.element
        .empty()
        .attr('class', this.classes);

    this.closebox = $('<div />')
        .addClass('closebox')
        .click(function(evt){
            self.close();
        })
        .appendTo(this.element);

    this.content = $('<div />')
        .addClass('content')
        .appendTo(this.element);
    
    return this;
}

Sourcemap.View.Error.prototype.open = function(errors){
    var self = this;
    this.initPane();

    // Clear existing
    this.content.empty();
    
    var html = '';

    // Just the title + location
    var container = $("<div></div>");
    var name = $('<h2></h2>')
    .html('Errors')
    .addClass('title');
    container.append(name);
    
    html = container.html();
    
    $.each( errors, function( key, value ) {
      html += value  + '<br />';
    });
    
    this.content.append(html);
    this.element.show();
    Sourcemap.broadcast('error:open');

    return;


}

Sourcemap.View.Error.prototype.close = function(){
    this.content.empty();
    this.element.hide();
}
