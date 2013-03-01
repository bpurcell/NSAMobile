/* Sourcemap -------------------------------------------------------------

Sourcemap javascript functionality.

------------------------------------------------------------------------------ */

Sourcemap = (typeof(Sourcemap) !== "undefined") ? Sourcemap : {};

Sourcemap.init = function(){
    Sourcemap.checkDependencies(['Handlebars', 'd3'], Sourcemap.initSets);
    Sourcemap.initialized = true;
    Sourcemap.broadcast('initialized');
}

Sourcemap.initSets = function(){
    // Build sets from data
    for (var id in Sourcemap.Data.Set){
        if (id.length < 16) continue; // If not mongo id

        var data = Sourcemap.Data.Set[id];
        Sourcemap.Sets[id] = new Sourcemap.Set(data);
        Sourcemap.broadcast('set:added', Sourcemap.Sets[id]);
    }

    // Reload set on data change
    Sourcemap.listen('set:data_changed', function(evt, id){
        var data = Sourcemap.Data.Set[id];
        if (Sourcemap.Sets[id]) Sourcemap.Sets[id].remove();
        Sourcemap.Sets[id] = new Sourcemap.Set(data);
        Sourcemap.broadcast('set:updated', id);
    }, this);
}

// TODO: Combine this with Sourcemap.client_options
Sourcemap.options = {
    dir : '/assets/js/',
    log : true 
}

Sourcemap.libraries = {
    Handlebars : '0-handlebars.js',
    d3 : '/lib/d3/d3.v2.js',
    L : [
        '/lib/leaflet/leaflet.js',
        '/lib/leaflet/leaflet-gmaps.js' // gmaps plugin
    ],
    Showdown : '/lib/showdown/showdown.js',
    io : '/lib/socket.io/socket.io.js',
    Handsontable : [
        '/lib/handsontable/jquery.tableSort.js',
        '/lib/handsontable/jquery.contextMenu.js',
        '/lib/handsontable/jquery.ui.position.js', 
        '/lib/handsontable/jquery.contextMenu.css',
        '/lib/handsontable/jquery.handsontable.js'
    ],
    slides : '/lib/slides/slides.min.jquery.js',
    dagre  : '/lib/dagre/dagre.min.js'
}

Sourcemap.log = function(message) {
    if(typeof console !== 'undefined' && console && console.log) 
        console.log(message);
    return true;
}

Sourcemap.broadcast = function(evt) {
    var a = []; for(var i=0; i<arguments.length; i++) a.push(arguments[i]);
    var args = a.slice(1);
    $(document).trigger(evt, args);
    if (Sourcemap.options.log)
        Sourcemap.log('Broadcast: '+evt);
}

Sourcemap.alert = function(message){
    $('<div />')
        .text(message)
        .addClass('alert fade-in sourcemap-alert')
        .append($('button').addclass('close').attr({'data-dismiss' : 'alert'}))
        .appendTo('body');               
}

Sourcemap.listen = function(evts, callback, scope, once) {
    if(evts instanceof Array)
        evts = evts.join(" ");
    if(callback instanceof Function) {
        if (once){
            var cb = callback;
            callback = function(){
                Sourcemap.unlisten(evts);
                cb();
            }
        }
        if(scope) {
            $(document).bind(evts, $.proxy(callback, scope));
        } else {
            $(document).bind(evts, callback);
        }
    }
    return true;
}

Sourcemap.unlisten = function(evts) {
    if(evts instanceof Array)
        evts = evts.join(" ");
    $(document).unbind(evts);
    return true;
}

Sourcemap.listen_once = function(evts, callback, scope){
    Sourcemap.listen(evts, callback, scope, true);
}

// Makes sure our deps are loaded.  If they aren't, attempt to load them.
Sourcemap.checkDependencies = function(dependencies, cb){
    var missing = [];
    for (var i in dependencies){
        var dep = dependencies[i];
        if (typeof window[dep] === "undefined"){
            var scripts = this.libraries[dep];
            if ($.isArray(scripts)){
                for (var c in scripts)
                    missing.push(scripts[c])
            } else
                missing.push(scripts);

        }
    }
    if (missing.length === 0)
        cb();
    else
        this.loadScript(missing, cb);

}

// Loads a script and executes a callback.  If an array of scripts if given,
// we'll chain the loads and execute the callback on the final one.
Sourcemap.loadScript = function(script, cb){
    if ($.isArray(script)){
        if (script.length > 0){
            var file = script.shift();
            Sourcemap.getFile(file, function(){
                if (script.length > 0)
                    Sourcemap.loadScript(script, cb);
                else 
                    if (cb) cb.apply(this);
            });
        }
    } else 
        Sourcemap.getFile(script, cb);
    return;
};

// Extends $.getScript to allow loading of external CSS or JS
Sourcemap.getFile = function(url, cb){
    var path = path || this.options.dir;
    if (url.substr(0,4) === 'http') path = '';
    var ext = url.split('.').pop();
    if (ext !== "css")
        $.getScript(path + url, cb);
    else { 
        $(document.createElement('link')).attr({
            href: path + url,
            media: 'screen',
            type: 'text/css',
            rel: 'stylesheet'
        }).appendTo('head');
        cb();
    }
};

// Returns a key value pair in an accessible format 
Sourcemap.keyPair = function(obj){
    for (var key in obj) 
        if (obj.hasOwnProperty(key)) return { key : key, value : obj[key] };
}

// Recursively turns a list into an object with ordinals.
Sourcemap.ordinal = function(list){
    var result = {};

    if (!$.isArray(list)) traverse(list);        
    else {
        for (var i in list){
            var obj = list[i];
            traverse(obj);
        }
    }

    return result;

    function traverse(obj){
        for (var prop in obj){
            if (obj.hasOwnProperty(prop)){
                var value = obj[prop];
                if (typeof(value) === "object")
                    result[prop] = Sourcemap.ordinal(value);
                else
                    result[prop] =  { value: obj[prop] };
                if (i) result[prop].ordinal = i;
                result[prop].key = prop;
            }
        }
    }
}

// Capitalization helper
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};
// Splice helper
String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

// Cookie helper
Sourcemap.cookie = function(name){
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

// Converts mongoid to date
Sourcemap.mongoidToDate = function(id) {
    date = new Date( parseInt( id.toString().substring(0,8), 16 ) * 1000 );
    return date.toDateString();
}

// Set up CSRF
$.ajaxSetup({
    data: { csrf_sm_token : Sourcemap.cookie('csrf_sm_cookie')}
});

// Wrapper for jQuery's serializeArray.  Returns something a little more compact. 
Sourcemap.serialize = function(element){
    var output = {},
        array = $(element).serializeArray();
    for (var i in array){
        var pair = array[i];
        output[pair.name] = pair.value;
    }
    return output;
}

// Significant digits helper
Sourcemap.scale = function(number){
    number = parseFloat(number, 10);
    if (isNaN(number)) return '';

    var prefixes = ['', 'K','M','B','T','P'],
        string   = toLongString(Math.round(number)),
        position = Math.floor(string.length/3);

    // Too small.  Possible cases include 10, 1, 0, 0.1, 0.11, 0.1000001
    if (position === 0){
        if (number === 0) return "0";
        if (number < 0.01) return "<.01";

        string = number.toString();
        if (string.split('.').length === 1) return string;

        string = number.toPrecision(2);
        if (string.length > 3) string = string.substr(1,3);
        return string;
    }

    // Too big
    var l = prefixes.length-1;
    if (position > l) 
        return string.slice(0, -l*3) + prefixes[l];

    // Just right
    var loc = string.length - position*3,
        result = parseFloat(string.splice(loc, 0, '.')).toPrecision(2),
        rounded = loc % 3 !== 0 ? result : result.toString().slice(1);

    return rounded + prefixes[position];

    // Avoids scientific notation display
    // Via http://stackoverflow.com/questions/1685680/
    function toLongString(x) {
        var e;
        if (Math.abs(x) < 1.0) {
            e = parseInt(x.toString().split('e-')[1], 10);
            if (e) {
                x *= Math.pow(10,e-1);
                x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
            }
        } else {
            e = parseInt(x.toString().split('+')[1], 10);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10,e);
                x += (new Array(e+1)).join('0');
            }
        }
        return '' + x;
    }
}

// Object creator.  
Sourcemap.create = function(o) {
    function F() {}
    F.prototype = o;
    return new F();
} 

/* Sourcemap.Data -------------------------------------------------------------

AJAX-y data helpers.  Since this file is loaded on every page, these helpers are 
accessible across the whole site.

------------------------------------------------------------------------------ */

Sourcemap.Data = {};

// Add data to a data store
Sourcemap.Data.add = function(data, type){
    if (!Sourcemap.Data[type]) Sourcemap.Data[type] = {};
    Sourcemap.Data[type] = data;
    Sourcemap.broadcast(type.toLowerCase() + ':added');
};

// Returns raw data from an endpoint.
// If template is specified, returns the handlebars-templated version.
Sourcemap.Data.get = function(name, target, endpoint, template, paginate){
    paginate = paginate || true;
    target = $(target);

    $.ajax({
        url : endpoint,
        success : onSuccess 
    });

    function onSuccess(data){
        if (!template) target.html(data);
        else {
            Sourcemap.checkDependencies(['Handlebars'], function(){
                format(data, template, endpoint)
            });
        }
    }
    
    function format(data, template, endpoint){
        // Set up pagination
        var pt = ""
            +'<div class="row-fluid">'
                +'<div class="span12">'
                    +'<div id="{{name}}-pagination" class="pagination pagination-centered">'
                        +'<ul>'
                            +'{{#pages}}'
                            +'<li><a href="{{url}}">{{page}}</a></li>'
                            +'{{/pages}}'
                        +'</ul>'
                    +'</div>'
                +'</div>'
            +'</div>',
            o = data.meta,
            pages = []; 
        
        if (!o) o = {};
        if (!o.limit) o.limit = 36;
        o.pages = Math.ceil(o.count / o.limit);
        if (o.pages == 1) paginate = false;
        
        for (var i=1; i < o.pages+1; i++)
            pages.push({ page : i, url: endpoint + "&page=" + i}) 

        // Turn results into array (if it comes to us as an object)
        if (!$.isArray(data.results)){
            var results = [];
            for (var id in data.results)
                if (data.results.hasOwnProperty(id)) results.push(data.results[id]);
            data.results = results;
        }

        // Render template
        if (!Handlebars.templates[template]) 
            throw new Error('Could not find template ' + template + '.');

        var html = Handlebars.templates[template](data);
        
        if (paginate)
            html += (Handlebars.compile(pt))({ pages: pages, name: name });

        $(target).html(html);

        // AJAX-y reloading
        $('#' + name + '-pagination a').click(function(e){
            e.preventDefault();
            $(target).html('');
            endpoint = $(e.target).attr('href');
            Sourcemap.Data.get(name, target, endpoint, template); 
        });

        return html;
    }
}

/* Sourcemap.Sets -------------------------------------------------------------

Set management.  Not to be confused with Sourcemap.Set.

------------------------------------------------------------------------------ */

Sourcemap.Sets = {};

Sourcemap.Sets.first = function(){
    for (var set in this){
        if (this.hasOwnProperty(set) && this[set] instanceof Sourcemap.Set)
            return this[set];
    }
}


/* Sourcemap.Socket -------------------------------------------------------------

Socket IO setup and functionality. 

------------------------------------------------------------------------------ */

Sourcemap.Socket = function(){
    Sourcemap.checkDependencies(['io'], initSocket);

    function initSocket(){
        var o = Sourcemap.client_options;
        if (typeof(io) !== "undefined"){
            var server = o.socket_server || 'localhost:3000';
            var socket = io.connect(server);

            // Override Sourcemap.log with socket functionality
            Sourcemap.log = function(message) {
                if(typeof console !== 'undefined' && console && console.log) 
                    console.log('Socket: ' + message);

                var ts = new Date().getTime() / 1000; 
                socket.emit('message', { message : message, user_id : o.user_id, ts : ts });
                return true;
            }
        } else {
            Sourcemap.log('Socket IO is not availble.  Using non-realtime functions.')
        }
    }
    return;
}();
