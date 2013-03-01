/* Sourcemap.View.Spreadsheet ------------------------------------------------

Interactive Spreadsheet.  This is used to display and edit tabular data. 

Tabular data can either be provided by the server (via Sourcemap.Data.Tabular),
or generated on the client side from a Set.

------------------------------------------------------------------------------ */

Sourcemap.View.Spreadsheet = function(o){
    // Extend parent class
    Sourcemap.View.call(this, o);
    
    var init = $.proxy(function(){this.init()},this);
    Sourcemap.checkDependencies(['Handsontable'], init);
};

Sourcemap.View.Spreadsheet.prototype.options = {
    css : {
        color: '#fffffff'
    },
    handsontable : {
        contextMenu: {
            callback: function (key, options) {
                var sheet = options.selector.split(' ')[0],
                    selected = $(sheet).handsontable('getSelected'),
                    header = $(sheet).handsontable('getColHeader', selected[1]);

                this
                switch(key){
                    case 'about':
                        setTimeout(function() {
                           // Timeout is used to make sure the menu collapsed before alert is shown
                           alert("Information about Sourcemap Spreadsheet Editor goes here");
                        }, 100);
                        break;
                    default:
                        break;
                }
            },
            items: {
                "row_below": {},
                "remove_row": {
                    name: 'Remove this row',
                    callback: function(){}
                },
                "hsep1": "---------",
                "col_right": {
                    callback : function(evt){
                        var tmpl= "<div class='modal'>"
                                +"<div class='modal-header'>"
                                +"<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>x</button>"
                                +"<div class='modal-header-inner'><h3 id='myModalLabel'>Add a new column</h3></div>"
                                +"</div>"
                                +"<div class='modal-body'>"
                                +"<div class='modal-content-container'>"
                                + "<input id='add-col-input'></input>"
                                + "</div>"
                                + "</div>"
                                +"</div>",
                            html = (Handlebars.compile(tmpl))({});
                            button = $("<button class='btn btn-primary spreadsheet-button' />")
                                .text("Add")
                                .click($.proxy(function(){
                                    var val = $('#add-col-input').val(),
                                        type = this.activeType;
                                        
                                    Sourcemap.broadcast('spreadsheet:add_column', val, type);
                                    html
                                        .modal('hide')
                                        .remove(); 
                                }, this));
                        $(html)
                            .addClass('modal')
                            .hide()
                            .appendTo(this)
                            .append(button);
                      
                        $(html).modal({show : true});
                    }
                },
                "remove_col": {
                    name: 'Remove this column',
                    callback: function(){}
                },
                "hsep2": "---------",
                "about": {name: 'About this menu'}
            }
        },
        cells: function (row, col, prop) {
            // Read-only by default
            return { readOnly : true };
        },
        onBeforeChange: function(changes, source){
            if (!source || source === 'loadData') {
                return; //don't save this change
            }
            Sourcemap.broadcast('spreadsheet:changed', changes);

            for (var i in changes){
                var change = changes[i];
                if (!change) continue; 
                
                // Create changes object
                if (!self.changes) self.changes = {};
               
                // Get ID and attribute
                var data = $(this).handsontable('getData')[change[0]],
                    attr = change[1].replace('attributes.', ''),
                    cols = $(this).handsontable('getColHeader'),
                    oldv = change[2],
                    newv = change[3],
                    type = $('.dataTable-tab.active').text(), // Currently active
                    pos = 0,
                    attr_title;
                
                for (var s in self.schema) {
                    if (self.schema[s].name == type) {
                        type = s;
                        attr_title = self.schema[s].columns[attr];
                        break;
                    }
                }  
                // Get position from attr
                for (var h in cols)
                    if (attr_title == cols[h]) pos = parseInt(h, 10);
               
                if (!self.tempId) self.tempId = 0;
                if (data._id && data._id.$id === null)
                    data._id.$id = self.tempId++;
                else if (!data._id)
                    data._id = { $id : self.tempId++ }
                var id = data._id.$id;  
                data.type = type;
                        
                var toSite   = "to_name",
                    fromSite = "from_name"; 
                if (attr == toSite || attr == fromSite){
                    // Hack to get the correct value from dropdown cells
                    setTimeout($.proxy(getCell, this), 100);
                    continue;
                }

                $.proxy(writeChange, this)();
            }
            
            // Hack to get the correct value from autocomplete 
            // Note:  This is bad.  Let's just use a different event instead (onChange?)
            function getCell(){
                var changes = self.changes,
                    name = $(this).handsontable('getDataAtCell', change[0], pos); 
                if (!self.names.site[name]) return;

                newv = self.names.site[name]._id.$id;
                if (attr == toSite) 
                    attr = 'to_id';
                else
                    attr = 'from_id';
                
                $.proxy(writeChange, this)();
            }
            
            function writeChange(){
                var changes = self.changes,
                    schema  = self.schema;
                if (oldv !== newv){
                    if (!changes[id]) changes[id] = {};
                    if (!schema[type].columns[attr] && attr !== 'to_id' && attr !== 'from_id'){ 
                        if (!changes[id].attributes) 
                            changes[id].attributes = {}; 
                        changes[id].attributes[attr] = newv;
                    } else
                        changes[id][attr] = newv;

                    changes[id].type = type;
                    changes[id].id = id;
                    $.proxy(colorCell, this)();
                }
            }

            function colorCell(){
                // Color element green if the value differs from the original
                $(this).handsontable('render');
                var element = $(this).handsontable('getCell', change[0], pos);
                $(element).addClass('changed');
            }
        }
    }
}

Sourcemap.View.Spreadsheet.prototype.init = function(){
    for (var id in Sourcemap.Data.Tabular){
        this.tabular = Sourcemap.Data.Tabular[id];
        this.file_id = id;
        break;
    }
    
    this.initListeners()
        .initSpreadsheet();
}

Sourcemap.View.Spreadsheet.prototype.toggleEdit = function(on){
    for (var type in this.sheets){
        this.sheets[type].handsontable('updateSettings', {
            minSpareRows : 1,
            cells: on ? write : read 
        });
    }
    return;
    function write(){ return { readOnly : false };}
    function read(){ return { readOnly : true };}
}

Sourcemap.View.Spreadsheet.prototype.getType = function(tab_name){
    var schema = this.schema;
    for (var x in schema)
        if (schema[x].name == tab_name) return x;  
}

Sourcemap.View.Spreadsheet.prototype.initSpreadsheet = function(){
    var self = this;
    this.element
        .css(this.options.css)

    var div = '<div />';
    var btn = '<button />';
    var ahref = '<a />';

    for (var i in Sourcemap.Data.Set) {
        var id = i;
    }

    var elements = {
        header: $(div),
        tabs:   $('<ul />')
            .addClass("spreadsheet_header")
            .addClass("nav nav-tabs pull-left"), 
        addnew: $(btn)
            .addClass("btn pull-left")
            .addClass("spreadsheet_header")
            .html('<i class="icon-plus"></i>&nbsp;Add data') 
            .hide()
            .click($.proxy(addNew, this)),
        edit: $(btn)
            .addClass("spreadsheet_header")
            .addClass("btn pull-left")
            .html('Edit') 
            .click($.proxy(
                function (evt) { 
                    var s = $("#save"); 
                    var e = $(evt.currentTarget);
                    if (!s.is(":visible")) {
                        $(s).show();
                        $(e).hide();
                        this.toggleEdit(true);
                    }  
                }, this)), 
        save: $(btn)
            .addClass("spreadsheet_header")
            .addClass("btn pull-left btn-success")
            .attr("id", "save")
            .html('Save')
            .hide() 
            .click($.proxy(function () { Sourcemap.broadcast('set:save'); }, this)), 
        upload: $(btn)
            .addClass("spreadsheet_header")
            .addClass("btn pull-left")
            .html('Upload a Spreadsheet') 
            .attr("data-toggle", "modal")
            .attr("href", "/file/m/document?related_to=set&related_id="+id+"&redirect=set/"+id)
            .attr("data-target", "#uploadModal")
            .attr("data-title", "Upload a Spreadsheet"),
        download: $(ahref)
            .attr("href", "/file/download/"+id+"/xls")
            .attr("class", "btn")
            .attr("data-title", "Download a Spreadsheet")
            .addClass("spreadsheet_header")
            .addClass("btn pull-left")
            .html("<i class='icon icon-save'></i> XLS") ,
        downloadkml: $(ahref)
            .attr("href", "/file/download/"+id+"/kml")
            .attr("class", "btn")
            .attr("data-title", "Download a KML")
            .addClass("spreadsheet_header")
            .addClass("btn pull-left")
            .html("<i class='icon icon-save'></i> KML") ,
        sheets: $(div),
        update: $(div)
    };

    function addNew(evt){
        var available = [];
        for (var type in this.schema)
            if (!this.sheets[type]) available.push(type);
        
        var tmpl= "<div class='modal'>"
                +"<div class='modal-header'>"
                +"<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>x</button>"
                +"<div class='modal-header-inner'><h3 id='myModalLabel'>Add a new data type</h3></div>"
                +"</div>"
                +"<div class='modal-body'>"
                +"<div class='modal-content-container'>"
                + "<select id='add-type-dropdown'>"
                + "{{#types}}<option name={{.}}>{{.}}</option>{{/types}}"
                + "</select>"
                + "</div>"
                + "</div>",
            html = (Handlebars.compile(tmpl))({ types: available });
            button = $("<button class='btn btn-primary spreadsheet-button' />")
                .text("Add")
                .click(function(){
                    var val = $('#add-type-dropdown').val();
                    Sourcemap.broadcast('spreadsheet:add_sheet', val);
                    html
                        .modal('hide')
                        .remove(); 
                });

        html
            //.addClass('modal')
            .hide()
            .appendTo(window)
            .append(button);

        //var html = (Handlebars.compile(tmpl))(data);
        $(html).modal({show : true});
    }

    // Append to DOM
    this.elements = {};
    for (var name in elements)
        this.elements[name] = this.element.append(elements[name]).find(elements[name]).addClass(name);

    // Trigger edit mode if we're working with an empty set
    if (!Object.keys(this.set.things).length)
        elements.edit.trigger('click');

    // Wrap sheets and tabs, so that we can style them properly
    var wrap = $(div).addClass('tabbable').addClass('');
    $(elements.sheets).addClass('tab-content').next().andSelf().wrapAll(wrap);
    
    if (this.tabular){
        this.initTabular();
        this.elements.save = $('<li />')
            .addClass('save-buttonv btn-primary')
            .html('<i class="icon-save"></i> save')
            .click(function(){
                self.elements.save.addClass('active btn-success');
                $(this).html('<i class="icon-ok"></i> saved!');
                var cb = function(){ 
                    self.elements.save.removeClass('active btn-success').html('<i class="icon-save"></i> save')
                    };
                self.save_parsed(cb, cb);
            })
            .appendTo(".nav-tabs");

    }
    if (this.set)
        this.initSet();
    
    this.elements.tabs.children().first().find('a').trigger('click');
    this.initialized = true;
    return this;
};

Sourcemap.View.Spreadsheet.prototype.initSet = function(){
    this.sheets = {};
    this.index = 0;
    this.schema = this.set.schema;
  
    var order = $
        .map(this.schema, function(d){ return d; })
        .sort(function(a, b){ a.ordinal - b.ordinal })
        .map(function(d){ return d.key });

    for (var i in order){
        var type = order[i];
        this.sheets[type] = this.addSheet(type, this.set, this.index++);
    }

    return this;
};


// Attempt to POST data to update_parsed endpoint
// TODO: Unify save and save_parsed
Sourcemap.View.Spreadsheet.prototype.save_parsed = function(success, failure){
    var url = "/file/update_parsed";
   
    var data = [];
    for (var type in this.sheets){
        var sheet = this.sheets[type].handsontable('getData').slice(0);
        sheet.splice(0,0,type);
        data.push(sheet);
    }

    var id = this.tabular._id.$id;
    $.ajax({
        url: url,
        data: { 
            parsed_data : JSON.stringify(data), 
            parsed_data_id: id,
            parsed_file_id: this.file_id 
        },
        type: "POST",
        success: function(evt){
            console.log('saved');
            success();
        },
        failure : function(evt){
            console.log('save failed');
            failure();
        }
    });
};


// Attempt to POST to update endpoint
Sourcemap.View.Spreadsheet.prototype.save = function(success, failure){
    var url  = "/thing/update/",
        set  = this.set,
        self = this;
    success = success || function(){};
    failure = failure || function(){};
    
    // Create array of changes
    var changes = [];
    for (var id in set.changes)
        changes.push([id, set.changes[id]]);

    (function chainSave(changes, success, failure){
        if (changes.length > 0){
            var change = changes.shift(),
                id   = change[0].length === 24 ? change[0] : 'null',
                data = change[1],
                tempId = data.id;
            delete data.id;
            
            data.set = set.data._id.$id;
            $.ajax({
                url: url + id + '?format=json',
                data: data,
                type: 'POST',
                success: function(response){
                    delete set.changes[tempId];
                    // Update ID
                    var newId = response._id.$id,
                        pos = self.findPositionByID(tempId)[0],
                        type = response.type;
                        sheetData = self.sheets[type].handsontable('getData')[pos];
                    
                    sheetData._id.$id = newId;

                    self.set.things[newId] = self.set.things[id];
                    self.sheets[type].handsontable('setDataAtCell', pos, 0, newId);
                    var element = self.sheets[type].handsontable('getCell', pos, 0);
                    $(element).addClass('changed');

                    Sourcemap.broadcast('thing:save_success', newId, response);
                    if (changes.length > 0)
                        chainSave(changes, success, failure);
                    else
                        success.apply(this);
                },
                failure: function(response){
                    Sourcemap.broadcast('thing:save_failure', id, response);
                    failure.apply(this);
                }
            });
        }
        return;
    }(changes, success, failure));
};

Sourcemap.View.Spreadsheet.prototype.initTabular = function(){

    this.sheets = {};
    var index = 0;
    for (var i in this.tabular){
        var sheet = this.tabular[i];
        if (!$.isArray(sheet) || i === "keys") continue;

        var type = sheet.shift();
        this.sheets[type] = this.addSheet(type, headers, sheet, index++);
    }
    return this;
};

// Handles left-click and broadcasts an event
Sourcemap.View.Spreadsheet.prototype.clickHandler = function(evt, element){
    var target = $(evt.target),
        select = element.handsontable('getSelected');

    if (select){
        var id     = $(element.handsontable('getCell', select[0], 0)).text(),
            thing  = this.set.things[id];
        if (thing)
            Sourcemap.broadcast('thing:selected', thing);
        else 
            Sourcemap.broadcast('clickoff');
    }    

}

Sourcemap.View.Spreadsheet.prototype.makeHeaders = function(type, set){
    set = set || this.set;
   
    var colHeaders = ['id', 'type']; 
        columns = [ 
            { data : '_id.$id' },
            { data : 'type' }
        ];
    
    function tofromrenderer(instance, td, row, col, prop, value, cellProperties) {
      Handsontable.AutocompleteCell.renderer.apply(this, arguments);
      td.style.fontStyle = 'italic';
      td.title = 'Type to show the list of options';
    }

    // Build list of all possible site names
    var siteNames = [];
    for (var s in this.set.types.site) siteNames.push(this.set.types.site[s].name);

    var filterable = $.map(this.set.data.filters, function(d, key){ return key });

    // Apply hard-coded schema
    for (var i in this.set.columns[type]){
        var name = this.set.columns[type][i];
        
        colHeaders.push(this.set.names[name]);
       
        if ($.inArray(name, filterable) !== -1)
            name = "attributes." + name;

        var obj = { data : name };
        if (i == 'to_name' || i == 'from_name'){
            obj.source = siteNames;
            obj.type = { 
                editor : Handsontable.AutocompleteEditor, 
                renderer : tofromrenderer 
            }
        }
        columns.push(obj);
    }

    if (!this.colHeaders) this.colHeaders = {};
    if (!this.columns) this.columns = {};
    this.colHeaders[type] = colHeaders;
    this.columns[type] = columns;
}

Sourcemap.View.Spreadsheet.prototype.addSheet = function(type, set, index){
   
    this.makeHeaders(type, set);

    // Construct sheet element 
    var sheetId = 'sheet-' + index;
    var element = $('<div />')
        .attr({id : sheetId})
        .addClass('dataTable-sheet', type)
        .data('type', type)
        .hide();

    element.click($.proxy(function(evt){
        this.clickHandler(evt, element)
    }, this))

    // Append sheet element to DOM and initalize handsontable
    this.sheets[type] = this.elements.sheets
        .append(element).find(element)
        .handsontable($.extend(this.options.handsontable, { 
            data : set.types[type] || [[]],
            colHeaders : this.colHeaders[type],
            columns : this.columns[type]
        }))

    if (!this.options.show_ids)
        this.sheets[type].addClass('hide-ids');
        
    // Add tabs, in order
    var anchor = $('<a />')
        .attr({ href : '#sheet-' + index })
        .text(this.schema[type].name.value)
        .click($.proxy(function(evt){
            evt.preventDefault();
            var id = $(evt.target).attr('href');
            id = id.substr(1, id.length);
            this.showSheet(id);
        }, this));
    var tab = $('<li />')
        .attr({
            id : 'tab-sheet-' + index,
            rel : 'sheet-' + index })
        .addClass('dataTable-tab button alternate ' + type)
        .append(anchor);

    this.elements.tabs.prepend(tab);
    
    element
        .height($(this.element).height() - 50) // Height of tabs
        .css({ overflow : 'auto' });
  
    element.find('table').first()
        .addClass('tablesorter')
        .tablesorter();
    return element;
};

Sourcemap.View.Spreadsheet.prototype.showSheet = function(id){
    // Hide all sheets
    for (var i in this.sheets)
        $(this.sheets[i]).hide();

    // Set selected tab
    $(this.elements.tabs).find('li').each(function(){
        $(this).removeClass('active');
        if ($(this).attr('rel') == id)
            $(this).addClass('active');
    });

    // Show target sheet
    var element = $('#' + id).show();

    // Hack to fix header width issues. This will apparently be fixed in handsontable 0.8.0
    this.activeType = element.data('type');

}

Sourcemap.View.Spreadsheet.prototype.initListeners = function(){
    Sourcemap.listen('tabular:added', function(data){
        this.tabular = data;
        this.init();
    }, this);

    Sourcemap.listen('spreadsheet:add_sheet', function(evt, type){
        this.addSheet(type, this.set, this.index++);
        this.elements.tabs.find('.dataTable-tab.' + type + ' a').click();
    }, this);

    Sourcemap.listen('spreadsheet:add_column', function(evt, header, type){
        if (!this.headers[type]) this.headers[type] = [];
        this.headers[type].push(header);

        this.makeHeaders(type)
        this.sheets[type].handsontable('updateSettings', {
            'colHeaders' : this.colHeaders[type],
            'columns'    : this.columns[type]
        });
    }, this);

    Sourcemap.listen('set:save', function(){
        var set = this.set;
        this.save(
            function(){ Sourcemap.broadcast('set:save_success', set.data._id.$id) }, 
            function(){ Sourcemap.broadcast('set:save_failure') }
        );
    }, this);

    Sourcemap.listen('thing:save_success', function(evt, id, response){
      
        var type = response.type,
            newId= response._id.$id,
            pos  = this.findPositionByID(newId)[0],
            element = $(this.sheets[type].handsontable('getCell', pos, 0)); 
       
        this.showSheet(this.sheets[type].attr('id'));

        element.parent().find('td').each(function(){
            var color = $(this).css('background-color');
            $(this).removeClass('changed');
            // Cool but unnecessary fade effect courtesy D3
            if (color && color.toLowerCase() !== "rgba(0, 0, 0, 0)"){
                d3.select(this)
                    .style({'background-color': color})
                    .transition()
                    .style({'background-color': '#FFFFFF'})
            }
        });

    }, this);

    Sourcemap.listen('thing:save_failure', function(evt, id){
        console.log(thing);
    }, this);

    Sourcemap.listen('thing:selected', function(evt, thing){
        // Highlight row & scrollto on selection
        var id   = thing._id.$id,
            type = thing.type,
            sel  = this.sheets[type].handsontable('getSelected'),
            pos  = this.findPositionByID(id)[0];
     
        // Select proper tab
        this.showSheet(this.sheets[type].attr('id'));

        if (!sel || sel[0] !== pos){
            this.sheets[type].handsontable('selectCell', pos, 2);
            var cell = $(this.sheets[type]).handsontable('getCell', pos, 2);
            $(this.sheets[type]).scrollTo(cell, 500);
        }
    }, this);

    return this;
}

// Given a thing ID, find its position in a sheet
Sourcemap.View.Spreadsheet.prototype.findPositionByID = function(id){
    
    // Build lookup table
    // TODO: Instead of calling this weird function, let's just hook this up to any
    // data_changed or sort events and call this.lookupTable directly.

    this.lookupTable = {};
    for (var sheet in this.sheets){
        if (sheet % 1 === 0) continue;
        var ele = this.sheets[sheet],
            len = ele.handsontable('countRows');
        for (var i=0; i < len; i++){
            var idd = $(ele.handsontable('getCell', i, 0)).text();
            this.lookupTable[idd] = [i, sheet];
        }
    }

    return this.lookupTable[id]; 
}
