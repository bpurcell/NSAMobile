/* Sourcemap.Window ------------------------------------------------------------

The Sourcemap window manager.  This manages the various views that pull data from
Sourcemap.Data.

------------------------------------------------------------------------------ */

Sourcemap.Window = function(o){
    if (!Sourcemap.initalized) Sourcemap.init();
    this.element = this.current = o.element;
    this.orientation = "vertical"; 
    this.theme   = o.theme;
    this.frames = {};
    this.views = [];
    this.id = 0;
    this.viewport = [this.element.height(), this.element.width()];
    this.set = Sourcemap.Sets.first();
    this.splitters = [];
    this.windowid = o.id || 0; 
   
    // Check to see if splitter is available.  If not, load it.
    if (!jQuery().split) this.initSplit();
   
    if (o.bar) this.initBar();

    // Trigger resize methods on window resize
    $(window).resize(function(){Sourcemap.broadcast('window:resized');});

    this
        .initView()
        .initListeners()
        .initLabelBox();

    return this;
};

// Initialize management bar if requested
Sourcemap.Window.prototype.initBar = function(){
    var self = this;

    this.bar = $('<div />')
        .addClass('sourcemap-window-bar');

    // If no default view is set, go into flex mode
    
    var views = {
    };
 
    var data = {
            title : this.set.data.name,
            errors : this.set.data.errors,
            date : Sourcemap.mongoidToDate(this.set.data._id.$id),
            id : this.set.data._id.$id,
            views : {
                //map : { icon : 'globe' },
                tree : { icon : 'random' },
                spreadsheet: { icon : 'table' },
                filter: { icon : 'bar-chart' }
                //pane : { icon : 'picture' },
                //settings: { icon : 'cogs' }
            }
        },

        html = Handlebars.templates['obar.html'](data),
        windowid = this.windowid;
    
    this.bar.html(html);
  
    // Add toggle listeners
    Sourcemap.listen('window:view_added', function(evt, type){
        this.bar.find('li.list-' + type).addClass('active'); 
    }, this);

    Sourcemap.listen('window:view_removed', function(evt, type){
        this.bar.find('li.list-' + type).removeClass('active'); 
    }, this);
 
    // Set up toggle behavor
    this.bar
        .find('a.view').each(function(){
            $(this).click(function(e){
                e.preventDefault();
                var name = $(e.target).attr('name'),
                    active = $(e.target).parent().hasClass('active');
                toggle(name, active); 
            });
        });
    function toggle(name, active){
        var filters = Object.keys(self.set.filters).length;
        if (active) self.remove(name);
        else self.add(name);
    }

    // Set up search behavior
    this.bar.find('#window-search').submit(function(e){e.preventDefault()});
    this.bar.find('#window-search-bar')
        .keydown(function(evt){
            var value = $(evt.target).val();
            if (evt.keyCode == 13) {
                if (value)
                    Sourcemap.broadcast('search:activate', value);
                else
                    Sourcemap.broadcast('search:deactivate');
                return;
            }
        })
        .keyup(function(evt){
            var value = $(evt.target).val();
            if (evt.keyCode == 8 && value.length === 0)
                Sourcemap.broadcast('search:deactivate');
        })
        .change(function(evt){
            var value = $(evt.target).val();
            if (!value)
                Sourcemap.broadcast('search:deactivate');

        });

    // Finally, append 
    this.bar.appendTo(this.element);
    this.current = $('<div />')
        .addClass('sourcemap-window-content')
        .appendTo(this.element);

    this.element = this.current;

    this.viewport[0] -= this.bar.height();

};

Sourcemap.Window.prototype.initView = function(){
    switch (this.set.data.default_view){
        case undefined:
            this.add('map')
                .add('pane');
            break;
        case "1":
            this.add('map')
                .add('pane');
            break;
        case "2":
            this.add('map')
                .add('pane')
                .add('tree', '40%');
            break;
        case "3":
            this.add('tree')
                .add('pane')
                .add('map', '60%', { orientation : 'vertical'});
            break;
        case "4":
            this.add('map')
                .add('pane')
                .add('spreadsheet', '40%')
                .add('filter', '30%');
            break;
        case "5":
            this.add('map')
                .add('pane')
                .add('spreadsheet', '40%')
                .add('filter', '30%');
            break;
        case "6":
            this.add('filter')
                .add('pane')
                .add('map', '70%', { orientation : 'vertical'});
            break;
        default:
            break;

    }
    return this;

};


Sourcemap.Window.prototype.initListeners = function(){
    Sourcemap.listen('window:add', function(evt, windowid, type, options){
        if (windowid == this.windowid)
        this.add(type);
    }, this);
    Sourcemap.listen('window:remove', function(evt, type){
        this.remove(type);
    }, this);
    Sourcemap.listen('window:resized', function(evt, type){
        this.resize();
    }, this);

    Sourcemap.listen('window:view_added', function(evt, type){
    }, this);

    return this;
};

// Add a view to the window
Sourcemap.Window.prototype.add = function(type, size, o){
    
    // Hard-coded display rules.  These will probably change.
    switch(type){
        case "spreadsheet":
            size = size || '40%';
            break;
        case "map":
            break;
        case "error":
        case "pane":
            o = { orientation : 'floating'};
            break;
        case "filter":
            size = size || '30%';
            break;
        case "default":
            break;
    }
    
    o = o || {}; 
    target = o.target || this.current;
    orientation = o.orientation || this.orientation;
    type = type.capitalize();
    
    // Create new element for view
    var element = $('<div />')
        .addClass(type + ' view')
        .attr({ id : type + '-' + this.windowid + '-' + this.id });
                
    if (!Sourcemap.View[type])
        throw new Error('View type ' + type + ' could not be loaded.  Perhaps there is an error?');
    
    var options = { 
        element : element,
        theme   : this.theme,    
        id      : this.windowid + '-' + this.id
    };

    if (orientation == "floating" && this.id !== 0){
        if (!this.floatSpace)
            this.floatSpace = $('<div />').appendTo(this.element).addClass('float-space');
        this.floatSpace
            .append(element).find(element)
            .addClass(type)
            .addClass('floating');
    } else {
        // Wrap element in frame
        element = $('<div />')
            .addClass('frame')
            .append(element);

        this.current = element.appendTo(target);

        // Split window intelligently
        if (target.hasClass('frame')){
            size = size ? 100 - parseInt(size, 10) + "%" : '50%';
            $(target)
                .split({
                    orientation: orientation,
                    position: size 
                });
            this.splitters.push([target, orientation, size]);
        }

        this.orientation = orientation == "horizontal" ? "vertical" : "horizontal";
    }

    // Allow access to window
    options._window = this;
    
    var view = new Sourcemap.View[type](options);

    // Track configuration options
    if (!Sourcemap.Data.Dashboard) Sourcemap.Data.Dashboard = [];

    Sourcemap.Data.Dashboard.push({
        name : type,
        id : this.id,
        window : this.windowid
    });
    
    this.id++;
    this.views.push(view);

    Sourcemap.broadcast('window:view_added', type.toLowerCase(), element);
    
    return this;
};

// Remove a view from the window
Sourcemap.Window.prototype.remove = function(type, size, orientation, target){
    target = target || this.current;
    orientation = orientation || this.orientation;
    type = type.capitalize();
    
    var element = $('div.'+ type + '.view');
    var parent = element.parent();
    if (parent[0] == this.current[0]) this.current = $(parent).parent();
    
    element.remove();
    if (parent.children().length === 0){
        var sparent = parent.parent();
        var parent_height = $(sparent).height();
        var parent_width = $(sparent).width();
        $(parent).remove();
        var child = $(sparent).find(".view")[0];
        var hspliter = $(sparent).find(".hspliter")[0];
        var vspliter = $(sparent).find(".vspliter")[0];
        if (hspliter) {
            this.orientation = "horizontal";
            $(hspliter).remove();
            $(child).height(parent_height);
        }
        if (vspliter) {
            this.orientation = "vertical";
            $(vspliter).remove();
            $(child).width(parent_width);
        }
        if (this.current[0] == parent) {
            this.current = sparent;
        }
    } else {
        var hspliter = $(parent).find(".hspliter")[0];
        var vspliter = $(parent).find(".vspliter")[0];
        if (hspliter) {
            $(hspliter).remove();
        }
        if (vspliter) {
            $(vspliter).remove();
        }  
        // eliminate one tier
        var child = parent.children()[0];
        
        if (this.current[0] == child) {
            this.current = parent;
        }
        
        if ($(child).children().length == 1) {
            var childschild = $(child).children()[0];
            parent.append(childschild);
            $(child).remove();
            $(childschild).removeClass("left_panel").removeClass("bottom_panel").removeClass("right_panel").removeClass("frame");            
        }
   
    }
    for (var x in this.views) {
        if (this.views[x] instanceof Sourcemap.View[type]) {
            delete this.views[x];
        }
    }
    Sourcemap.broadcast('window:view_removed', type.toLowerCase(), element);
    return this;
};

// Change arrangement of windows
Sourcemap.Window.prototype.change = function(view){
    console.log('changed to '+ view)
};

Sourcemap.Window.prototype.resize = function(){
    
    var newSize = [this.element.height(), this.element.width()],
        hfactor = newSize[0] / this.viewport[0],
        wfactor = newSize[1] / this.viewport[1];

    for (var i in this.splitters){
        var s = this.splitters[i],
            frame = s[0],
            position = s[1];

        if (position === 'horizontal'){
            var t = frame.children('.top_panel'),
                b = frame.children('.bottom_panel');
            $.each([t,b], setHeight );
            frame.find('.hspliter').css({top : parseInt(t.height()*hfactor, 10)});
        } else {
            var l = frame.children('.left_panel'),
                r = frame.children('.right_panel');
            $.each([l,r], setWidth);
            frame.find('.vspliter').css({left :parseInt(l.width()*wfactor, 10)});
        }
    }

    function setHeight(){ this.height(parseInt(this.height()*hfactor, 10)); }
    function setWidth(){ this.width(parseInt(this.width()*wfactor, 10)); }

    this.viewport = newSize;

    $('spliter_panel').trigger('spliter.resize');
};

// Labelbox methods
Sourcemap.Window.prototype.initLabelBox = function(){
    this.labelBox = $('<div />')
        .addClass('label-box')
        .appendTo(this.element);

    this.labelInner = $('<div />')
        .addClass('tooltip-inner')
        .appendTo(this.labelBox);

    this.labelArrow = $('<div />')
        .addClass('tooltip-arrow')
        .appendTo(this.labelBox);

    $(this.element).bind('mousemove', $.proxy(function(e){
        this.labelBox.css({
           left:  e.pageX  + 6,
           top:   e.pageY - 20 
        });
    }, this));
    return this;
};

Sourcemap.Window.prototype.showLabel = function(d){

    // Choose correct context
    var self = this._window ? this._window : this;
    
    clearTimeout(self.timeout);
    
    var label;
    if (d.ref && d.ref.style && d.ref.style.base && d.ref.style.base.label)
        label = d.ref.style.base.label; 
    else if (d.ref && d.ref.to && d.ref.from)
        label = d.ref.from.name + ' to ' + d.ref.to.name;
    else if (d.name)
        label = d.name;
    else
        label = "Unknown title";

    self.labelInner
        .text(label)
    self.labelBox
        .show()
};

Sourcemap.Window.prototype.hideLabel =  function(d){
    // Choose correct context
    var self = this._window ? this._window : this;
   
    self.timeout = setTimeout(function(){
        self.labelBox.hide();
    }, 80);
}



Sourcemap.Window.prototype.initSplit = function(){

    /*!
     * JQuery Spliter Plugin
     * Copyright (C) 2010 Jakub Jankiewicz <http://jcubic.pl> 
     *
     * This program is free software: you can redistribute it and/or modify
     * it under the terms of the GNU Lesser General Public License as published by
     * the Free Software Foundation, either version 3 of the License, or
     * (at your option) any later version.
     *
     * This program is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     * GNU Lesser General Public License for more details.
     * 
     * You should have received a copy of the GNU Lesser General Public License
     * along with this program.  If not, see <http://www.gnu.org/licenses/>.
     */
    (function($, undefined) {
        var count = 0;
        var spliter_id = null;
        var spliters = [];
        var current_spliter = null;
        $.fn.split = function(options) {
            var panel_1;
            var panel_2;
            var settings = {
                limit: 100,
                orientation: 'horizontal',
                position: '50%'
            };
            options && $.extend(settings, options);
            var cls;
            var children = this.children();
            if (settings.orientation == 'vertical') {
                panel_1 = children.first().addClass('left_panel');
                panel_2 = panel_1.next().addClass('right_panel');
                cls = 'vspliter';
            } else if (settings.orientation == 'horizontal') {
                panel_1 = children.first().addClass('top_panel')
                panel_2 = panel_1.next().addClass('bottom_panel');
                cls = 'hspliter';
            }
            var width = this.width();
            var height = this.height();
            var id = count++;
            this.addClass('spliter_panel');
            var spliter = $('<div/>').addClass(cls).mouseenter(function() {
                spliter_id = id;
            }).mouseleave(function() {
                spliter_id = null;
            }).insertAfter(panel_1);
            var position;
            var self = $.extend(this, {
                position: (function() {
                    if (settings.orientation == 'vertical') {
                        return function(n) {
                            if (n === undefined) {
                                return position;
                            } else {
                                position = n;
                                var sw = spliter.width()/2;
                                spliter.css('left', n-sw);
                                panel_1.width(n-sw);
                                panel_2.width(self.width()-n-sw);
                            }
                        };
                    } else if (settings.orientation == 'horizontal') {
                        return function(n) {
                            if (n === undefined) {
                                return position;
                            } else {
                                var sw = spliter.height()/2;
                                spliter.css('top', n-sw);
                                panel_1.height(n-sw);
                                panel_2.height(self.height()-n-sw);
                                position = n;
                            }
                        };
                    } else {
                        return null;
                    }
                })(),
                orientation: settings.orientation,
                limit: settings.limit,
                destroy: function() {
                    spliter.unbind('mouseenter');
                    spliter.unbind('mouseleave');
                    if (settings.orientation == 'vertical') {
                        panel_1.removeClass('left_panel');
                        panel_2.removeClass('right_panel');
                    } else if (settings.orientation == 'horizontal') {
                        panel_1.removeClass('top_panel');
                        panel_2.removeClass('bottom_panel');
                    }
                    self.unbind('spliter.resize');
                    spliters[id] = null;
                    spliter.remove();
                    var not_null = false;
                    for (var i=spliters.length; i--;) {
                        if (spliters[i] !== null) {
                            not_null = true;
                            break;
                        }
                    }
                    //remove document events when no spliters
                    if (!not_null) {
                        $(document.documentElement).bind('.spliter');
                        spliters = [];
                    }
                }
            });
            
            self.bind('spliter.resize', function() {

                var pos = self.position();
                if (self.orientation == 'vertical' && 
                    pos > self.width()) {
                    pos = self.width() - self.limit-1;
                } else if (self.orientation == 'horizontal' && 
                           pos > self.height()) {
                    pos = self.height() - self.limit-1;
                }
                if(pos < self.limit) pos = self.limit + 1;
                self.position(pos);
            });
            //inital position of spliter
            var m = settings.position.match(/^([0-9]+)(%)?$/);
            var pos;
            if (settings.orientation == 'vertical') {
                if (!m[2]) {
                    pos = settings.position;
                } else {
                    pos = (width * +m[1]) / 100;
                }
                if (pos > width-settings.limit) {
                    pos = width-settings.limit;
                }
            } else if (settings.orientation == 'horizontal') {
                //position = height/2;
                if (!m[2]) {
                    pos = settings.position;
                } else {
                    pos = (height * +m[1]) / 100;
                }
                if (pos > height-settings.limit) {
                    pos = height-settings.limit;
                }
            }
            if (pos < settings.limit) {
                pos = settings.limit;
            }
            self.position(pos);
            if (spliters.length === 0) { // first time bind events to document
                $(document.documentElement).bind('mousedown.spliter', function() {
                    if (spliter_id !== null) {
                        current_spliter = spliters[spliter_id];
                        $('<div class="splitterMask"></div>').insertAfter(current_spliter);
                        if (current_spliter.orientation == 'horizontal') {
                            $('body').css('cursor', 'row-resize');
                        } else if (current_spliter.orientation == 'vertical') {
                            $('body').css('cursor', 'col-resize');
                        }
                        return false;
                    }
                }).bind('mouseup.spliter', function(evt) {
                    current_spliter = null
                    ;$('div.splitterMask').remove();
                    $('body').css('cursor', 'auto');
                    if ($(evt.target).hasClass('hspliter') || $(evt.target).hasClass('vspliter'))
                        Sourcemap.broadcast('window:resized');
                }).bind('mousemove.spliter', function(e) {
                    if (current_spliter !== null) {
                        var limit = current_spliter.limit;
                        var offset = current_spliter.offset();
                        if (current_spliter.orientation == 'vertical') {
                            var x = e.pageX - offset.left;
                            if(x <= current_spliter.limit) {
                                x = current_spliter.limit + 1;
                            }
                            else if (x >= current_spliter.width() - limit) {
                                x = current_spliter.width() - limit - 1;
                            }
                            if (x > current_spliter.limit &&
                                x < current_spliter.width()-limit) {
                                current_spliter.position(x);
                                current_spliter.find('.spliter_panel').trigger('spliter.resize');
                                return false;
                            }
                        } else if (current_spliter.orientation == 'horizontal') {
                            var y = e.pageY-offset.top;
                            if(y <= current_spliter.limit) {
                                y = current_spliter.limit + 1;
                            }
                            else if (y >= current_spliter.height() - limit) {
                                y = current_spliter.height() - limit - 1;
                            }
                            if (y > current_spliter.limit &&
                                y < current_spliter.height()-limit) {
                                current_spliter.position(y);
                                current_spliter.trigger('spliter.resize');
                                return false;
                            }
                        }
                    }
                });
            }
            spliters.push(self);
            return self;
        };
    })(jQuery);
}
