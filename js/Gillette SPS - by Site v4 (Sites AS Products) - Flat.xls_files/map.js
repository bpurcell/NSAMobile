/* Sourcemap.View.Map -------------------------------------------------------------

This file contains most of the client-side mapping functionality.

Maps are a type of Sourcemap.View, and share all of the common methods (redraw,
add, remove, etc).

------------------------------------------------------------------------------ */

Sourcemap.View.Map = function(o){
    // Extend parent class
    Sourcemap.View.call(this, o);
    
    var init = $.proxy(function(){this.init();},this);
    Sourcemap.checkDependencies(['d3', 'L'], init);
};

Sourcemap.View.Map.prototype.themes = {
    'default' : {
        radius : {
            min: 5,
            mid: 10,
            max: 35
        },
        stroke: 10,
        gradients: false,
        shadow: false,
        arrow: {
            min : 1,
            mid: 1.5,
            max : 8
        },
        lines : {
            precision: 3
        },
        hitboxes: true,
        panels: true,
        labels: {
            mid : '12px',
            filter: '18px'
        },
        waypoints: true,
        padding : 200,
        featurehide: false,
        multiworld: true,
        clustering: true,
        cluster: {
            radius : 14,
            threshold: 38
        }
    },
    plain : {
        panels : false,
        gradients: false,
        shadow: true,
        labels : false
    }
};

Sourcemap.View.Map.prototype.init = function(){
    if (!this.set) return;

    if (this.theme !== "default")
        this.options = $.extend(this.themes['default'], this.themes[this.theme]);
    else 
        this.options = this.themes['default'];

    this.reload = this.draw;
    this.refresh = function(){this.style(true);}; 

    this.cache = {};

    this.initMap()
        .initGraph()
        .initListeners()
        .initLegend()
        .draw();
}

Sourcemap.View.Map.prototype.initListeners = function(){
    Sourcemap.listen('thing:disambiguate', function(evt, feature){
        var self = this;
        
        if (this.disambiguationBox) this.disambiguationBox.remove();
        
        // To make things easy, we'll clone the labelBox and co-opt it.
        var element = this._window.labelBox.clone()
            .appendTo(this.element)

        var tmpl= "<ul class='nav nav-pills nav-stacked '>"
                + "{{#things}}"
                + "<li class='type button'>"
                + "<a href='#{{ref._id.$id}}'>"
                + "{{ref.name}}"
                + "</a>"
                + "</li>"
                + "{{/things}}"
                + "</ul>";

        // Prevent non-features from showing up in list
        var features = $.map(feature.cluster, function(d){ if (d.ref.type) return d; });

        var filter = this._window.filter;
        if (filter){
            features.sort(function(a,b){
                var one = parseFloat(a.ref.attributes[filter], 10);  
                var two = parseFloat(b.ref.attributes[filter], 10);
                if (isNaN(one)) one = -Infinity;
                if (isNaN(two)) two = -Infinity;
                return two - one;
            });
        }                 

        var html = (Handlebars.compile(tmpl))( { things: features });  
        element.children().first()
            .html(html)
            .find('a')
            .each(function(index, ele){
                // Append values to label if needed
                var id = $(ele).attr('href').split('#')[1];
              
                var thing = self.set.things[id]; 
                
                if (filter){
                    var value = Sourcemap.scale(thing.attributes[filter]);
                    if (value !== ''){
                        $('<span />')
                            .text(' (' + Sourcemap.scale(thing.attributes[filter]) + ')')
                            .appendTo(this);
                    }
                }

                // Set up click behavior
                $(this).click(function(evt){
                    evt.stopPropagation();
                    Sourcemap.broadcast('thing:selected', thing);
                    element.remove(); 
                });
            });
        element.addClass("tooltip-topArrow");
        element.show();
        
        self.disambiguationBox = element;
    
        $(document).one('mousedown', function(evt){
            if (!$.contains(element[0], evt.target))
                element.remove();
        });

    }, this);

    Sourcemap.listen('set:data_changed', function(evt, thing){
        this.cache = {};
    }, this);
    
    // Workaround for chrome svg use element bug
    Sourcemap.listen('set:styles_changed', function(evt, thing){
        var self = this;
        for (var name in this.clones){
            var type = name.split('-')[0] === 'canvas' ? 'canvas' : 'svg';
            update(this.clones[name], type);
        }
        
        return;

        function update(element, type){
            var interval = setInterval(function(){
                if (type === 'canvas'){
                    self.clearCanvas(element);
                    var context = element[0][0].getContext('2d');
                    context.drawImage(self.canvas[0][0], 0, 0);
               } else if (type === 'svg'){
                    var href = d3.select(element[0][0]).select('use').attr('href');
                    d3.select(element[0][0]).select('use').attr('href',href);
                } 
            }, 200);

            setTimeout(function(){
                clearInterval(interval);
            }, 1000);
        }

    }, this);

    Sourcemap.listen('set:styles_changed', function(evt, thing){
        // Update labels
        this.drawLabels();
    }, this);

    var size = function(){ this.map.invalidateSize(); }

    Sourcemap.listen('window:resized', size, this);
    Sourcemap.listen('window:view_added', size, this);
    Sourcemap.listen('window:view_removed', size, this);
    return this;
}

Sourcemap.View.Map.prototype.initMap = function(){
    // The element needs an ID here (Otherwise leaflet won't load)
    var id = "map-" + this.id;
    this.element
        .attr({ id : id })
        .css({ 
            overflow : 'hidden', 
            position: 'absolute'
        })

    // TODO:  Look into proper attributions
    var esriUrl = 'http://server.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}',
        esriAttribution = this.options.panels ? 
            'Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2013 ESRI' : '',
        cloudmadeUrl = this.options.labels ? 
            'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/44909/256/{z}/{x}/{y}.png':
            'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/84960/256/{z}/{x}/{y}.png';
        cloudmadeAttribution = this.options.panels ? 
            'Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2013 CloudMade' :'';
        mapboxUrl = 'http://a.tiles.mapbox.com/v3/examples.map-2k9d7u0c/{z}/{x}/{y}.png',
        mapboxAttribution = this.options.panels ? 
            'Map data &copy; 2013 MapBox, Imagery &copy; 2013 CloudMade' :'';

    var base     = new L.tileLayer(cloudmadeUrl, {
        name : 'base', 
        detectRetina: true,
        attribution: cloudmadeAttribution
        }),
        satellite= new L.Google('SATELLITE', {
            name: 'satellite', 
            detectRetina: true
        }), 
        terrain  = new L.tileLayer(esriUrl, {
            name: 'terrain', 
            attribution: esriAttribution,
            detectRetina: true
        });

    this.map = new L.Map(id, {
            layers : [base],
            zoomControl : this.options.panels,
            attributionControl : this.options.panels
        })
        .setView(new L.LatLng(0, -0), 2)
        .on('click', function(evt) {
             Sourcemap.broadcast('clickoff', evt);
         });

    this.currentLayer = 'base';
    this.element.addClass('layer-' + this.currentLayer);
   
    this.zoomToMapExtent();

    if (this.options.panels){
        var layers = {
            "Satellite": satellite,
            "Terrain": terrain,
            "Base": base
        };

        // This mess of selectors is the result of having no way to 
        // extend the control classes in Leaflet.
        var layerControl = L.control.layers(layers, null, {position: 'topleft', collapsed: false});
        layerControl.addTo(this.map);
        var fakeLayerControl = $('<a class="leaflet-control-layers-toggle" href="#" title="Layers"><i class="icon-reorder"></i></a>')
            .click(function(d){
                $('.leaflet-control-layers-expanded').toggle();
            });
        var fakeExtentControl = $('<a class="leaflet-control-extent" href="#" title="Zoom to map extent"><i class="icon-fullscreen"></i></a>')
            .click($.proxy(function(d){
                this.zoomToMapExtent(true);
            }, this));

        $('.leaflet-control-container .leaflet-top.leaflet-left .leaflet-control-zoom')
            .prepend(fakeExtentControl)
            .prepend(fakeLayerControl);
    }

    return this;
};

Sourcemap.View.Map.prototype.zoomToMapExtent = function(reload){
    var bounds, center, zoom;
    if (this.extent){
        center = this.extent.center;
        zoom   = this.extent.zoom;
    } else {
        var b = this.set.bounds,
            n = b.both[0],
            s = b.both[2],
            h;
        
        bounds = this.boundsToLeaflet(b.both),
        center = bounds.getCenter(),
        zoom = this.map.getBoundsZoom(bounds);

        // We should try the bounds in both possible directions (i.e., over the date line)
        // to get the best possible extent.
        var d1, d2;
        if (b.left && b.right){
            d1 = b.right[3] - b.left[1],
            d2 = (b.left[3] + 180) + (180 - b.right[1]);

            if (Math.abs(d2-d1) < 100){

                var one = { distance : d1, center : this.findCenter(d1) };
                var two = { distance : d2, center : this.findCenter(d2) };

                // Whichever cuts off fewer lines is the better one.
                if (one.center.crosses < two.center.crosses) h = one;
                else h = two;

                // If they're equal, the smaller extent is better.
                if (one.center.crosses === two.center.crosses)
                    h = one.distance > two.distance ? one : two;


                center = new L.LatLng(s + (n - s) / 2, h.center.lng);
            }
        }
        this.extent = { center: center, zoom: zoom };
    }

    this.map.setView(center, zoom, reload ? false : true)
}

// Converts our bounds array into a leaflet-friendly bounds object
Sourcemap.View.Map.prototype.boundsToLeaflet = function(bounds){
    var sw = new L.LatLng(bounds[2], bounds[1]),
        ne = new L.LatLng(bounds[0], bounds[3]);
        
    return new L.LatLngBounds(sw, ne);
}

Sourcemap.View.Map.prototype.initLegend = function(){
    $('<div />').addClass('legend').appendTo(this.element);
    return this;
};

// Minimize the number of line-crosses with the given extent 
Sourcemap.View.Map.prototype.findCenter = function(dist){
    var total = {},
        min = Infinity,
        count = this.countCrosses,
        edges = this.set.edges,
        last;

    for (var i = -180; i<180; i++){
        var left  = count(i, edges),
            right = count(i + dist > 180 ? i + dist - 360: i + dist, edges),
            c = left + right;
        
        if (!total[c]) total[c] = [];

        var group = total[c];
        if (last !== c) group.push([i]); 
        else group[group.length-1].push(i);

        last = c;
        if (c < min) min = c;
    }

    var arr = total[min],
        longest = arr.sort(function (a, b) { return b.length - a.length; })[0],
        lng = longest[Math.round((longest.length-1)/2)],
        l = lng + (dist / 2),
        value = l > 180 ? l - 360 : l;
  
    return { crosses : count(lng, edges), lng : value };
}

Sourcemap.View.Map.prototype.countCrosses = function(longitude, edges){
    var crosses = 0;
    for (var i in edges){
        var edge = edges[i],
            to   = edge.to.ref.geometry.coordinates,
            from = edge.from.ref.geometry.coordinates,
            pt1  = [to[0], to[1]],
            pt2  = [from[0], from[1]];

        var results = Sourcemap.intersect([pt1, pt2], [[longitude, 90], [longitude, -90]]);
        if (results)
            crosses++;
    }
    return crosses;
}

Sourcemap.View.Map.prototype.initGraph = function(){
    var self = this;
   
    this.graph = this.options.waypoints ? this.set.graph.geo : this.set.graph.base;

    // Extend new styles to set
    this.set.order.satellite = ['base', 'selected', 'filter', 'search', 'satellite']; 
    this.set.order.terrain = ['base', 'selected', 'filter', 'search', 'terrain'];
    for (var i in this.set.things){
        var s = this.set.things[i].styles;
        s.satellite = { stroke : '#ffffff', textColor : '#ffffff' };
        s.terrain = { stroke : '#666666', textColor: '#666666' };
    }

    this.overlay = d3.select(this.map.getPanes().overlayPane);
    this.svg = this.overlay.append("svg").attr("id", 'graph-' + this.id);
    this.canvas = this.overlay.append("canvas").attr("id", 'canvas-' + this.id);

    self.map.on("layeradd", $.proxy(this.changeLayer, this));
    self.map.on("viewreset", $.proxy(this.draw, this));
    self.map.on("zoomanim", $.proxy(function(){
        this.clearCanvas();
        $(this.overlay[0][0]).hide();
    }, this)); 
    self.map.on("zoomend", $.proxy(function(){
        $(this.overlay[0][0]).fadeIn();
    }, this)); 
    self.map.on("move", $.proxy(this.setBoundsTimer, this));
  
    this.initialized = true;
    return this;
}

Sourcemap.View.Map.prototype.clearCanvas = function(element){
    element = element || this.canvas;

    var context = element[0][0].getContext('2d');
    var width = element.attr('width')
    var height = element.attr('height')

    context.clearRect(0, 0, width, height);
    return;
}

Sourcemap.View.Map.prototype.changeLayer = function(e){
    this.currentLayer = e.layer.options.name;
    this.set.buildStyle();
    this.cache = {};

    $('.leaflet-control-layers-expanded').hide();

    $(this.element).removeClass(function (index, css) {
        return (css.match (/\blayer-\S+/g) || []).join(' ');
    }).addClass('layer-' + this.currentLayer);
    
    this.draw();
    return;
}

// Creates and draws all the features on the map.
Sourcemap.View.Map.prototype.draw = function(){
    var self = this;
    if (!this.initialized) throw new Error('Tried to draw the map, but it\'s not initialized yet.');

    if (this.set && !this.set.customColors)
        this.element.addClass('default-colors');

    if (this.options.multiworld)
        this.removeClone();

    this.svg.selectAll("g").remove();
    
    // Add g "layers"
    this.layers = {};
    this.layerNames = layers = ['points', 'arrows', 'lines', 'polygons'].reverse();

    this.resolution = this.getResolution();

    var level = 'zoom_' + this.map._zoom;
    
    // Attempt to use cached features for zoom level; otherwise generate them.
    // TODO: Caching in localstorage
    // if (!this.cache[level]) this.cache[level] = this.makeFeatures();
    // var features = this.cache[level];
    var features = this.makeFeatures();

    for (var i in layers)
        this.layers[layers[i]] = this.svg.append("g");

    this.paths = {};

    // Set up placeholder for paths
    var visible = features;
    if (this.options.featurehide) visible = this.getVisibleFeatures();
    
    for (var name in this.layers){
        var l = this.layers[name];
        this.paths[name] = l.selectAll("path")
            .data(visible[name].features)
            .enter().append("path");
    }

    // Apply line hitboxes
    if (this.options.hitboxes){
        this.layers.hitboxes = this.svg.insert("g", ":first-child")
            .selectAll('path')
            .data(features.lines.features)
            .enter()
            .append('path')
    }
    this.g = this.svg.selectAll("g");

    if (this.options.shadow)
        this.makeShadow();

    this.style();
   
    delete this.cache.dimensions;
    this.setBoundsTimer();
}

// Determine which features are visible in the given viewport.  This will help us
// size the SVG correctly and improve overall performance.
Sourcemap.View.Map.prototype.getVisibleFeatures = function(){
    var bounds = this.map.getBounds(),
        visible = {};
    for (var type in this.features){
        visible[type] = new this.constructors.Collection();
        
        var collection = this.features[type].features;
        for (var i in collection){
            var feature = collection[i];
                coords  = feature.geometry.coordinates;
             
            if (feature.geometry.type == "Point"){
                if (contains(coords, bounds)) 
                    visible[type].features.push(feature);
            } else if (feature.geometry.type = "LineString"){
                var coord1 = feature.ref.to.geometry.coordinates,
                    coord2 = feature.ref.from.geometry.coordinates;
                if (contains(coord1, bounds) || contains(coord2, bounds)) 
                    visible[type].features.push(feature);
            } 
        }
    }

    function contains(coords, bounds){
        var minll = bounds.getSouthWest(),
            maxll = bounds.getNorthEast();

        if (coords[0] > minll.lng && coords[0] < maxll.lng &&
            coords[1] > minll.lat && coords[1] < maxll.lat)
            return true;
        return false;
    }

    return visible;
}

// Calculates resolution, i.e. Pixels per Longitude
Sourcemap.View.Map.prototype.getResolution = function(){
    var one  = this.project([0, 1]);
        zero = this.project([0, 0]);
    return Math.abs(one[1] - zero[1]);
}

// Sizes and positions the svg layer according to its contents
Sourcemap.View.Map.prototype.setBoundsTimer = function(){
  
    // Prevent from executing too often
    if (this.timer) return;

    this.setBounds();

    this.timer = setTimeout($.proxy(function(){ 
        this.timer = false;
        this.setBounds();
    }, this), 500);
};

Sourcemap.View.Map.prototype.setBounds = function(){
    var bounds = this.map.getBounds(),
        minll = bounds.getSouthWest(),
        maxll = bounds.getNorthEast(),
        leftVisible, rightVisible;

    if (minll.lng < -180) leftVisible = true;
    if (maxll.lng > 180) rightVisible = true; 
    var visible = leftVisible || rightVisible;
    
    // If the neighboring world to the left or right is visible, we'll render the entire screen and clone it accordingly.
    var bl = visible ? this.project([-180, -90]) : this.project([Math.max(minll.lng, -180), Math.max(minll.lat, -92)]);
    var tr = visible ? this.project([180, 90])   : this.project([Math.min(maxll.lng, 180), Math.min(maxll.lat, 92)]);

    var dimensions = [
        tr[0] - bl[0] + this.options.padding,
        bl[1] - tr[1],
        bl[0] + "px",
        tr[1] + "px"
    ];

    // Only manipulate the DOM if the dimensions have changed
    var cached = this.cache.dimensions;

    if (!cached || cached.toString() != dimensions.toString()){
        this.setDimensions([this.svg, this.canvas], dimensions); 
        this.g.attr("transform", "translate(" + -bl[0] + "," + -tr[1] + ")");
        this.cache.dimensions = dimensions; 
        this.drawLabels();
    }

    if (this.options.multiworld){
        if (leftVisible) this.cloneWorld('left', dimensions.slice(0));
        else this.removeClone('left');

        if (rightVisible) this.cloneWorld('right', dimensions.slice(0));
        else this.removeClone('right');
    }

}

// Clone SVG and Canvas elements to the left or right in order to span the date line.
Sourcemap.View.Map.prototype.cloneWorld = function(direction, dimensions){
    if (!this.clones) this.clones = {}; 

    var width = Math.abs(this.project([-180,0])[0] - this.project([180,0])[0])
        svgHost = this.svg.attr('id'),
        canvasHost= this.canvas.attr('id');
    
    var svgId = svgHost + '-' + direction;
    var canvasId = canvasHost + '-' + direction;
    if (this.clones[svgId]) return;

    var svg = this.overlay.insert('svg', '#' + svgHost).attr('id', svgId);
    
    width = direction === "left" ? -(parseFloat(width, 10)) : parseFloat(width, 10);
    svg.append('svg:use').attr('xlink:href', '#' + svgHost);
    dimensions[2] = (parseFloat(dimensions[2], 10) + width).toString() + "px";

    canvas = this.overlay.insert('canvas', '#' + canvasHost).attr('id', canvasId);
    this.setDimensions([svg, canvas], dimensions, width);
    var context = canvas[0][0].getContext('2d');
    context.drawImage(this.canvas[0][0], 0, 0);
    
    this.clones[canvasId] = canvas;
    this.clones[svgId] = svg;
}

// Remove clone elements from the screen when they aren't needed.
Sourcemap.View.Map.prototype.removeClone = function(direction){
    if (!direction){
        var directions = ['left', 'right'];
        for (var i in directions)
            this.removeClone(directions[i]);
    }
    
    var svgId = this.svg.attr('id') + '-' + direction;
    var canvasId = this.canvas.attr('id') + '-' + direction;
    
    if (this.clones && this.clones[svgId]){
        
        $('#' + svgId + ',#' + canvasId).remove();
        delete this.clones[svgId];
        delete this.clones[canvasId];
    }
}

Sourcemap.View.Map.prototype.setDimensions = function(element, array, width){
    if ($.isArray(element) && element.length > 1){
        for (var i in element) this.setDimensions(element[i], array, width);
        return;
    }
 
    if (element[0][0].tagName.toLowerCase() === 'canvas' && L.Browser.retina){
        // Use double resolution for retina display
        element
            .style("width", array[0])
            .style("height", array[1]);

        array = array.slice(0);
        array[0] *= 2;
        array[1] *= 2;
        array[2] = width || 0;
        array[3] = 0;
    }

    element
        .attr("width" , array[0])
        .attr("height", array[1])
        .style("margin-left" , array[2])
        .style("margin-top", array[3]);
}


// Determines the minimum and maximum values of the current filtered attribute. 
// This is used for determining point radii and arrow sizes.
//
// The map needs its own scaling functions (on top of the ones in set.js) because of
// clustering:  Because this is the only view where geographic clustering matters,
// it's also the only place we do this type of scaling across points.
Sourcemap.View.Map.prototype.getScale = function(){
    var sizes  = [],
        filter = this._window.filter,
        map    = function(c){
            var num = parseFloat(c.ref.attributes[filter], 10);
            return num ? num : 0; 
        },
        reduce = function(a, b){ return a + b; };
   
    if (!filter) return;

    var obj = this.set.filters[filter],
        additive = obj.additive,
        total = obj.total;

    for (var type in this.features){
        var features = this.features[type].features;
        for (var f in features){
            var feature = features[f];
            if (!additive){
                if (feature.scale) delete feature.scale;
                continue;
            }
            if (feature.cluster){
                var array = $.map(feature.cluster, map);
                if (!array.length) continue;
                result = array.reduce(reduce);
                feature.scale = result / total;
            } else if (feature.ref.attributes[filter]){
                var size = parseFloat(feature.ref.attributes[filter], 10);
                feature.scale = size / total;
            } else {
                if (feature.scale) delete feature.scale;
            }
        }
    }
}

// Create or refresh styles
Sourcemap.View.Map.prototype.style = function(refresh){

    var names = this.layerNames, i;
    this.isRefresh = refresh ? true : false;
    this.getScale();

    if (refresh)
        for (i in names) this.paths[names[i]].transition().call($.proxy(this.build[names[i]], this));
    else
        for (i in names) this.paths[names[i]].call($.proxy(this.build[names[i]], this));
   
    if (this.options.labels) this.drawLabels();

}

// Draw labels to canvas layer.
Sourcemap.View.Map.prototype.drawLabels = function(){
    this.clearCanvas();

    var self = this;
    var features = this.features.points.features.concat(this.features.arrows.features);
    var context = this.canvas[0][0].getContext('2d');
    context.textAlign = 'center';
    
    var margin = [
        parseInt(this.canvas.style('margin-left'), 10), 
        parseInt(this.canvas.style('margin-top'), 10)
    ];

    for (var i in features){
        var feature = features[i],
            label = getLabel(feature),
            x = getX(feature) - margin[0],
            y = getY(feature) - margin[1];
        context.fillStyle = getLabelColor(feature); 
        context.font = 'bold ' + getLabelSize(feature) + ' Helvetica, Arial, sans';
        context.fillText(label, x, y)
    }
    
    function getX(d){
        var result = self.project(d.geometry.coordinates)[0];
        if (L.Browser.retina) result *= 2; 
        return result;
    }
    function getY(d){
        var offset = 12,
            size = false,
            rad = self.options.radius,
            pos;
       
        if (d.properties.filter && d.properties.additive)
            pos = d.scale * (rad.max-rad.min) + rad.min + offset;
        else if (d.cluster && d.cluster.length - d.total > 1 && !d.properties.filter) pos = 4; 
        else pos = rad.mid + offset;

        if (d.properties.filter) pos += 8;

        var result = self.project(d.geometry.coordinates)[1] + pos; 
        if (L.Browser.retina) result *= 2; 
        return result;
    }
    
    function getLabelSize(d) {
        var size;
        if (d.properties.filter) 
            size = self.options.labels.filter;
        else 
            size = self.options.labels.mid;

        if (L.Browser.retina) size = size.split('px')[0]*2 +'px'

        return size;
    }
    
    function getLabel(d) {
        if (d.properties.hidden) return '';

        // Display nothing for un-filtered arrows
        if (!d.properties.filter && typeof(d.bearing) !== 'undefined') return ''; 

        var cluster = d.cluster ? d.cluster.slice(d.total) : [];
        if (cluster.length > 1){ 

            if (!d.properties.filter) return cluster.length;
            else {
                var arr = $.map(cluster, function(c){ 
                        var num = parseFloat(c.ref.attributes[d.properties.filter], 10);
                        if (num && !isNaN(num)) return num; 
                    }),
                    tot = function(a, b){ return a + b; },
                    max = function(a, b){ return Math.max(a, b); };
                
                if (arr.length === 0) return '';
               
                // Additive label.  Add all the values together.
                if (d.properties.additive) return Sourcemap.scale(arr.reduce(tot));

                // Non-additive label.  Bubble highest value to the top.
                else return Sourcemap.scale(arr.reduce(max));
            }
        }

        if (d.properties.filter && !d.ref.attributes[d.properties.filter]) return '';
        return d.properties.label ? String(d.properties.label).substr(0, 15) : ''; 
    }
    function getLabelColor(d){ 
       return d.properties.textColor || '#646464'; 
    }
}

// Build methods for features.  This is where we assign styles and behaviors.
Sourcemap.View.Map.prototype.build = {
    points : function(points){
        var layer = this.currentLayer;
        points
            .style("fill", $.proxy(function(d){ return this.build.getColor(d, 'fill', layer); }, this))
            .style("stroke", $.proxy(function(d){ return this.build.getColor(d, 'stroke', layer); }, this))
            .style("opacity", this.build.getOpacity)
            .style("pointer-events", this.build.getPointerEvents)
            .style("stroke-width", this.build.getWidth)
            .style("cursor", "pointer")
            .attr("d", $.proxy(this.arcPath, this))
            .attr('id', function(d){ return 'feature-' + d.id })
        if (this.isRefresh) return;
        points
            .on("click", this.select);

    },

    lines : function(lines){
        var layer = this.currentLayer;
        lines
            .style("fill", "none")
            .style("opacity", this.build.getOpacity)
            .style("stroke-width", this.build.getWidth)
            .style("stroke", this.options.gradients ? 
                $.proxy(this.makeGradient, this) : 
                $.proxy(function(d){ return this.build.getColor(d, 'stroke', layer); }, this))
            .attr("d", $.proxy(this.arcPath, this))
            .attr('id', function(d){ return 'feature-' + d.id });
        if (this.options.hitboxes){
            this.layers.hitboxes
                .style("fill", "none")
                .style("opacity", '0')
                .style("pointer-events", this.build.getPointerEvents)
                .style("stroke-width", 10)
                .style("stroke", '#000000')
                .style("cursor", 'pointer')
                .attr("d", $.proxy(this.arcPath, this))
        }
        if (!this.isRefresh){
            var elements = this.options.hitboxes ? this.layers.hitboxes : lines;
            elements 
                .on("click", this.select);
            if (this.options.hitboxes)
                lines
                    .style('pointer-events', 'none');

        }
    },

    arrows : function(arrows){
        var layer = this.currentLayer;
        arrows
            .attr("viewBox", "-5 -5 10 10")
            .attr("d", $.proxy(this.build.getArrowPath, this))
            .attr('id', function(d){ return 'feature-' + d.id })
            .attr("transform", $.proxy(this.build.getArrow, this))
            .attr("vector-effect", "non-scaling-stroke")
            .style("stroke", $.proxy(function(d){ return this.build.getColor(d, 'stroke', layer); }, this))
            .style("fill", $.proxy(function(d){ return this.build.getColor(d, 'fill', layer); }, this))
            .style("stroke-width", this.build.getWidth)
            .style('stroke-linejoin', 'bevel')
            .style("opacity", this.build.getOpacity)
            .style("cursor", "pointer")
            .style("pointer-events", this.build.getPointerEvents);
        if (this.isRefresh) return;
        arrows
            .on("click", this.select);
   
     },
    
    polygons : function(polygons){ 
        polygons
            .style("fill", "none")
            .style("stroke", this.build.getStroke)
            .style("stroke-width", this.build.getWidth)
            .attr('id', function(d){ return 'feature-' + d.id })
            .attr("d", $.proxy(this.arcPath, this));
    },
   
    getColor  : function(d, property, layer){
        if (d.properties.hidden) return '';
        layer = layer || 'base';

        // Map-reduce clusters
        if (d.cluster){
            
            // Bubble select styles to the top of the cluster.  These take priority. 
            for (var i in d.cluster){
                var styles = d.cluster[i].ref.styles;
                if (!styles) continue;
                var selected = styles.selected;
                if (selected && selected[property]) return selected[property]; 
            }

            var arr = $.map(d.cluster, d.properties.filter ? mapValues : mapTiers),
                max = Math.max.apply(window,arr),
                pos = arr.indexOf(max);
                base= d.cluster[pos].ref.style[layer];
               
            if (base) return base[property];
        }

        // Otherwise, just return the property.
        return d.properties[property];
            
        function mapValues(c){
            var num = parseFloat(c.ref.attributes[d.properties.filter], 10);
            return num ? num : 0
        }
        function mapTiers(c){
            var num = parseFloat(c.ref.tier, 10);
            return num ? num : 0;
        }
    },
    getOpacity:function(d){ 
        var opacity = d.properties.opacity;
        if (opacity === '') opacity = 1;
        return opacity; 
    },
    getPointerEvents :function(d){ return d.properties.opacity === 0 ? "none" : "auto"; },
    getWidth:  function(d){ return d.properties.width || '2px'; },
    getArrowPath : function(d){
        var str = "m-2.5,0l-5,-5l5,0l-5,5l-2.5,0";
        return "M-2.5,0L-5,-5L5,0L-5,5L-2.5,0";
    },
    getArrow:  function(d){
        var g = this.project(d.geometry.coordinates);
        
        // Set scale according to additive properties
        var arrow = this.options.arrow,
            size = arrow.mid,
            min = arrow.min,
            max = arrow.max;

        if (d.properties.filter && d.scale){
            size = d.scale * (max-min) + min;
            if (isNaN(size)) size = this.options.arrow.mid;
        }

        if (d.bearing)
            return 'translate(' + g[0] + ',' + g[1] + ') rotate(' + (270 + d.bearing) + ') scale(' + size + ')'; 
        else 
            return 'scale(0)';
    }
}

Sourcemap.View.Map.prototype.select = function(d){
    d3.event.stopPropagation();

    if (d.cluster && d.cluster.length - d.total > 1)
        Sourcemap.broadcast('thing:disambiguate', d);
    else
        Sourcemap.broadcast('thing:selected', d.ref); 
    
}

Sourcemap.View.Map.prototype.arcPath = function(d){
    if (d.properties.hidden) return;

    // Set pointRadius according to additive properties
    var size = false,
        min = this.options.radius.min,
        max = this.options.radius.max;

    if (d.properties.filter && d.scale) size = d.scale * (max-min) + min;

    var path = d3.geo.path()
        .projection($.proxy(this.project, this))
        .pointRadius(size || this.options.radius.mid);
    var arc = d3.geo.greatArc()
        .precision(this.options.lines.precision);

    if (d.source && d.target)
        return this.splitPath(path(arc(d)), d);
    else 
        return path(d);
}

Sourcemap.View.Map.prototype.project = function(x){
    switch (typeof(x[0])){
        case "object":
            var to = x[1];
            var from = x[0];
            var topt = this.map.latLngToLayerPoint(new L.LatLng(to[1], to[0]));
            var frompt  = this.map.latLngToLayerPoint(new L.LatLng(from[1], from[0]));
            return [[topt.x, topt.y],[frompt.x, frompt.y]];
        case "number":
            var point = this.map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
            return [point.x, point.y];
    }
    return false;
}

// Turns Sourcemap.Set objects into an array of features that we can map.
// This gets called any time the data or the zoom level changes, so it's important
// that we avoid any expensive operations, and cache profusely.
Sourcemap.View.Map.prototype.makeFeatures = function(){
    if (!this.zoom) this.zoom = this.map._zoom;
    this.features = {};
    this.featureId = this.set.tempid + 1;

    // Lookup table for features
    this.featureMap = {};

    this.makePoints()
        .makeLines()
        .makePolygons();

    return this.features;
};

Sourcemap.View.Map.prototype.makePoints = function(){
    var points = new this.constructors.Collection(),
        lines = {};
    
    for (var id in this.graph.nodes){
        var node = this.graph.nodes[id];
        if (this.options.clustering){
            var threshold = this.options.cluster.threshold / this.resolution,
                cluster = false;
            
            // If the distance is below the threshold of any feature produced this far,
            // add a reference to the feature and change its position accordingly
            for (var i in points.features){
                var feature = points.features[i],
                    source  = node.ref.geometry.coordinates,
                    target  = feature.ref.geometry.coordinates,
                    distance = d3.geo.greatArc().distance({source: source, target: target}) * 92.18; //earth's radius in longitude at equator
                if (distance < threshold) cluster = feature;
            }

            if (cluster){
                if (!cluster.cluster){
                    cluster.cluster = [cluster];
                    cluster.total = cluster.ref.type ? 0 : 1;
                    this.featureMap[cluster.id] = cluster;
                }
                // Average geometry into cluster
                var cg = cluster.ref.geometry.coordinates,
                    ng = node.ref.geometry.coordinates,
                    l = cluster.cluster.length,
                    avg = [(cg[0] * l + ng[0]) / (l+1), (cg[1] * l + ng[1]) / (l+1)],
                    geo = $.extend({}, cluster.geometry);

                geo.coordinates = avg;
                cluster.geometry = geo;

                // Put type-less nodes at the front of the array.  This allows us to quickly
                // split out irrelevant data (i.e. waypoints).
                if (node.ref.type)
                    cluster.cluster.push(node);
                else {
                    cluster.cluster.splice(0,0,node);
                    cluster.total += 1;
                }
                this.featureMap[node.id] = cluster;
                continue;
            }
        }
        var newFeature = new this.constructors.Feature(this.featureId++, node, node.ref.geometry, this.currentLayer);
        this.featureMap[node.id] = newFeature;
        points.features.push(newFeature);
    }

    this.features.points = points;
    return this;
}

Sourcemap.View.Map.prototype.makeLines = function(){
    var lines = new this.constructors.Collection(),
        arrows = new this.constructors.Collection(),
        mapped = {};

    for (var id in this.graph.edges){
        var edge = this.graph.edges[id],
         
            // Build geometry from mapped features, i.e. clusters
            from = this.featureMap[edge.from_id].geometry.coordinates,
            to   = this.featureMap[edge.to_id].geometry.coordinates;
            hash       = to.toString() + '_' + from.toString();
            geometry = new this.constructors.Geometry([from, to]); 
            feature = new this.constructors.Feature(this.featureId++, edge, geometry, this.currentLayer);
        
        feature.source = from;
        feature.target = to;
        feature.distance = d3.geo.greatArc().distance({source: from, target: to}) * 6371;

        var arrow = this.makeArrow(feature);
        
        if (this.options.gradients){
            // Make arrow the correct "middle" color
            var color1 = feature.ref.to.style.fill,
                color2 = feature.ref.from.style.fill,
                palette= d3.scale.linear()
                   .domain([0, 2])
                   .range([color1, color2]);
            arrow.properties.fill = palette(1);            
        }

        if (this.options.clustering){
            var cluster = mapped[hash];
            
            if(cluster){
                var cFeature = cluster[0],
                    cArrow   = cluster[1];

                if (!cFeature.cluster) {
                    cFeature.cluster = [cFeature];
                    cFeature.total = 1;
                }
                if (!cArrow.cluster) {
                    cArrow.cluster = [cArrow];
                    cArrow.total = 1;
                }

                // Put type-less nodes at the front of the array.  This allows us to quickly
                // split out irrelevant data (i.e. waypoints).
                if (edge.ref.type){
                    cFeature.cluster.push(feature);
                    cArrow.cluster.push(feature);
                } else {
                    cFeature.cluster.splice(0,0,feature);
                    cArrow.cluster.splice(0,0,feature);
                    cFeature.total += 1;
                    cArrow.total += 1;
                }
                continue; 
            } 
            mapped[hash] = [feature, arrow];
        }
        
        arrows.features.push(arrow);
        lines.features.push(feature);
    }

    this.features.arrows = arrows;
    this.features.lines  = lines;
    return this;
}

Sourcemap.View.Map.prototype.makePolygons = function(){
    this.features.polygons = polygons = new this.constructors.Collection();
    return this;
}

Sourcemap.View.Map.prototype.constructors = {
    Collection : function(){
        return {
            type : "FeatureCollection",
            features : []
        }
    },
    Feature : function(id, thing, geometry, layer){
        return {
            type : "Feature",
            id   : id,
            ref  : thing.ref,
            geometry : thing.ref.geometry,
            properties : thing.ref.style[layer] || thing.ref.style // Pointer to styles
        }
    },
    Geometry : function(array){
        // TODO: polygon support, better validation
        if (array.length !== 2 || typeof array[0] !== typeof array[1])
            throw new Error('Malformed geometry.');

        var type,
            coordinates;
            
        if (typeof array[0] === 'object'){
            type = 'LineString';
        } else {
            type = 'Point';
        }
        return {
            type : type,
            coordinates : array 
        }
    }
}

// Special effects 
// ----------------------------------------------------------------------- */

// Set up gradient effect for lines
Sourcemap.View.Map.prototype.makeGradient = function(d){
    return "url(#gradient-" + d.id + ")"; 
}

// Set up arrows
Sourcemap.View.Map.prototype.makeArrow = function(d){
    var arrow = {
        type : "Feature",
        id   : d.id,
        ref  : d.ref,
        properties : d.ref.style[this.currentLayer] || {} // Pointer to styles
    }

    if (!d.source || !d.target) return;

    var to   = d.target, 
        from = d.source,
        mid  = gc(to, from);

    function r(number){
        return number.toFixed(7) 
    }

    if (r(to[0]) === r(from[0]) && r(to[1]) === r(from[1])){
        arrow.bearing = false;
    } else{
        arrow.bearing = bearing([mid.x, mid.y], to);
    }

    arrow.geometry = { type : "Point", coordinates : [mid.x, mid.y] };

    return arrow;

    function gc(pt1, pt2) {
        var lat1 = pt1[1];
        var lon1 = pt1[0];
        var lat2 = pt2[1];
        var lon2 = pt2[0];
        lat1 = radians(lat1);
        lon1 = radians(lon1);
        lat2 = radians(lat2);
        lon2 = radians(lon2);
        var dLon = lon2 - lon1;
        var Bx = Math.cos(lat2) * Math.cos(dLon);
        var By = Math.cos(lat2) * Math.sin(dLon);
        var lat3 = Math.atan2(Math.sin(lat1)+Math.sin(lat2),
            Math.sqrt((Math.cos(lat1)+Bx)*(Math.cos(lat1)+Bx) + By*By));
        var lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);
       
        return {"y": degrees(lat3), "x": degrees(lon3)};
    }

    function bearing(pt1, pt2){
        var lat1 = pt1[1];
        var lon1 = pt1[0];
        var lat2 = pt2[1];
        var lon2 = pt2[0];
        lat1 = radians(lat1);
        lon1 = radians(lon1);
        lat2 = radians(lat2);
        lon2 = radians(lon2);
        var dLon = lon2 - lon1;     // Longitude is east-west distance... note this returns directional value (might be bigger than pi but cos symetric around 0)
        // Note : we switch sin and cos for latitude b/c 0 latitude is at equator
        var y = Math.sin(dLon)*Math.cos(lat2);  // This calculates y position in cartesian coordinates with radius earth=1
        var x = Math.cos(lat1)*Math.sin(lat2) -
            Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
        var brng = degrees(Math.atan2(y, x));     // Note bearing is the differential direction of the arc given in degrees relative to east being 0
        
        return brng;  // Using the plane carie (sp?) projection EPSG:4326 (sending long to x and lat to y) brng is also differential direction of arc in projection
    }

    function radians(deg) {
        return deg*Math.PI/180;
    }

    function degrees(rad) {
        return rad*180.0/Math.PI;
    }
}

Sourcemap.View.Map.prototype.makeShadow = function(){
    var dropShadowFilter = this.g.append('svg:filter')
      .attr('id', 'dropShadow')
    dropShadowFilter.append('svg:feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3);
    dropShadowFilter.append('svg:feOffset')
      .attr('dx', 0)
      .attr('dy', 3)
      .attr('result', 'offsetblur');
    dropShadowFilter.append('svg:feColorMatrix')
       .attr("type", "matrix")
       .attr('values', "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .3 0")

    var feMerge = dropShadowFilter.append('svg:feMerge');
      feMerge.append('svg:feMergeNode');
      feMerge.append('svg:feMergeNode')
      .attr('in', "SourceGraphic");

    this.g.attr('filter', 'url(#dropShadow)');
}


// Workaround for dateline-splitting paths
// via https://groups.google.com/forum/?fromgroups=#!topic/d3-js/_K5jsbjIGLI
Sourcemap.View.Map.prototype.splitPath = function(path, da){
    var avgd = 0, i, d;
    var c, pc, dx, dy;
    var points = path.split("L");
    if (points.length < 2) return path;

    var newpath = [ points[0] ];
    var coords = points.map(function(d, i) {
        // remove M and split
        return d.substr(i > 0 ? 0 : 1).split(","); 
    });

    // Calc average dist between points
    for (i = 1; i < coords.length; i++) {
        pc = coords[i-1]; c = coords[i];
        dx = c[0] - pc[0]; dy = c[1] - pc[1];
        d = Math.sqrt(dx*dx + dy*dy);
        c.push(d);  // push dist as last elem of c
        avgd += d;
    }
    avgd /= coords.length - 1;

    // Apply gradients
    if (this.options.gradients === true){
        if (!$('#gradient-' + d.id).length){ 
            var gradient = this.g.append("svg:defs")
                .append("svg:linearGradient")
                .attr("x1", coords[0][0])
                .attr("y1", coords[0][1])
                .attr("x2", coords[coords.length-1][0])
                .attr("y2", coords[coords.length-1][1])
                .attr('gradientUnits', 'userSpaceOnUse');

            gradient.attr("id", "gradient-" + da.id)
                .attr("spreadMethod", "pad");

            gradient.append("svg:stop")
                .attr("offset", '0%')
                .attr("stop-color", da.ref.from.style.stroke)
                .attr("stop-opacity", 1);

            gradient.append("svg:stop")
                .attr("offset", '100%')
                .attr("stop-color", da.ref.to.style.stroke)
                .attr("stop-opacity", 1);
        }
    }

    // For points with long dist from prev use M instead of L
    for (i = 1; i < coords.length; i++) {
        c = coords[i];
        if (c[2] > 2 * avgd){

            // Determine the latitude if and where this line crosses the dateline
            var pt = Sourcemap.intersect([da.target, da.source], [[180, 90], [180, -90]]);
            if (pt){
                var pt1  = this.project([180, pt[1]]);
                    pt2  = this.project([-180, pt[1]]);
                
                if (Math.abs(pt1[0] - coords[i][0]) < Math.abs(pt2[0] - coords[i][0])){
                    var temp = pt1;
                    pt1 = pt2;
                    pt2 = temp;
                }
                // Fall back to cheesy method if latitude is too far off
                if (Math.abs(pt1[1]-coords[i][1]) > 40 && coords[i+1]){
                    var middle = (parseInt(coords[i][1], 10) + parseInt(coords[i+1][1], 10)) / 2;
                    pt1[1] = middle;
                    pt2[1] = middle;
                }
                newpath.push("L" + pt1[0] + "," + pt1[1]);
                // Jump to other side
                newpath.push("M" + pt2[0] + "," + pt2[1]);
                newpath.push("L" + points[i]);
                continue;
            } 
            newpath.push("M" + points[i]);
            
        } else {
            newpath.push("L" + points[i]);
        }
    }
    return newpath.join('');
}
