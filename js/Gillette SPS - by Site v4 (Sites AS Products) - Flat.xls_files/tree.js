/* Sourcemap.View.Tree --------------------------------------------------------

Interactive Tree Diagram.

Other than tiles, clustering, and geographic coordinates, the tree really shares 
a lot of functionality with the map.  Therefore, we just extend the map class
and prototype on some new methods.

------------------------------------------------------------------------------ */

Sourcemap.View.Tree = function(o){
    // Extend parent class
    Sourcemap.View.call(this, o);
    
    var init = $.proxy(function(){this.init()},this);
    Sourcemap.checkDependencies(['d3', 'L', 'dagre'], init);
};

Sourcemap.View.Tree.prototype = Sourcemap.create(Sourcemap.View.Map.prototype); 

Sourcemap.View.Tree.prototype.init = function(){
    if (!this.set) return;

    if (this.theme !== "default")
        this.options = $.extend(this.themes['default'], this.themes[this.theme])
    else 
        this.options = this.themes['default']

    this.reload = this.draw;
    this.refresh = function(){this.style(true)}; 

    this.cache = {};

    this.initMap()
        .initGraph()
        .initData()
        .draw()
        .setBounds();
}

Sourcemap.View.Tree.prototype.themes = {
    'default' : {
        radius : {
            min: 10,
            max: 35
        },
        stroke: 10,
        gradients: false,
        shadow: false,
        arrow: {
            min : 2,
            max : 200
        },
        lines : {
            precision: 3
        },
        hitboxes: true,
        panels: true,
        labels: true,
        featurehide: false,
        multiworld: false,
        clustering: false
    },
    plain : {
        panels : false,
        gradients: false,
        shadow: true,
        labels : false
    }
}

Sourcemap.View.Tree.prototype.initMap = function(){
    
    // The element needs an ID here (Otherwise leaflet won't load)
    var id = "tree-" + this.id,
        sw = new L.LatLng(-20, -20),
        ne = new L.LatLng(20, 20),
        bounds = new L.LatLngBounds(sw, ne),
        center = bounds.getCenter(sw, ne);

    this.element
        .attr({ id : id })
        .css({ 
            overflow : 'hidden', 
            position: 'absolute'
        })

    this.map = new L.Map(id, {
            zoomControl : this.options.panels,
            attributionControl : this.options.panels,
            zoomAnimation : false,
            maxBounds : bounds
            // layers : [ new L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}') ]
        })
        .setView(new L.LatLng(0, -0), 5)
        .on('click', function(evt) {
             Sourcemap.broadcast('clickoff', evt);
         });
    
    return this;
}

Sourcemap.View.Tree.prototype.initGraph = function(){
    var self = this;
    
    // Append SVG
    this.svgId = 'graph-' + this.id;
    this.svg = d3.select(this.map.getPanes().overlayPane).append("svg").attr("id", this.svgId);

    self.map.on("layeradd", $.proxy(this.changeLayer, this));
    self.map.on("zoomend", $.proxy(function(e){ 
        this.setBounds(); 
    }, this));
   
    this.initialized = true;
    return this;
}

// Prepares data for sorting
// TODO: rewrite this whole thing 
Sourcemap.View.Tree.prototype.initData = function(){
    var index = {};
    var mapNodes = function(d, i){
            index[d.id] = i;
            return { ref: d, index: i };
        };

    var nodes = $.map(this.set.nodes, mapNodes),
        links = makeLinks(this.set.edges, nodes);

    // For the purposes of this diagram, we convert each link into a node and two links.
    function makeLinks(edges, nodes){
        var links = [];
        for (var i in edges){
            var link = edges[i],
                node = { ref : link, index: nodes.length },
                sourceId = link.from.id,
                targetId = link.to.id,
                id = link.id;

            index[id] = nodes.length;
            nodes.push(node);
            links.push({ source : index[sourceId], target : index[id], ref: link });
            links.push({ source : index[id], target : index[targetId], ref: link });
        }
        return links;
    }

    var keys = {};
    links.forEach(function(d) {
        var source = keys[d.source],
        target = keys[d.target];
        if (!source) source = keys[d.source] = { label: d.source, edges: [], ref: nodes[d.source].ref };
        if (!target) target = keys[d.target] = { label: d.target, edges: [], ref: nodes[d.target].ref };
        source.edges.push(d);
        target.edges.push(d);
    });
    
    nodes = d3.values(keys);
    links.forEach(function(d) {
        d.source = keys[d.source];
        d.target = keys[d.target];
    });

    this.data = { nodes: nodes, edges: links };
    return this;
}

Sourcemap.View.Tree.prototype.draw = function(){
    var self = this;
    var nodePadding = 5;

    this.svg.selectAll("g").remove();
    
    var svg = this.svg;

    this.g = svgGroup = svg
        .append("g");

    var edges = svgGroup
        .selectAll("path .edge")
        .data(this.data.edges)
        .enter()
            .append("path")
            .attr("class", "edge");

    var hitboxes = svgGroup
        .selectAll("path .edge")
        .data(this.data.edges)
        .enter()
            .append("path")
            .attr("class", "edge");

    var nodes = svgGroup
        .selectAll("g .node")
        .data(this.data.nodes)
        .enter()
            .append("g")
            .attr("class", "node")
            .attr("id", function(d) { return "node-" + d.label; });

    nodes.append("path")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("viewBox", "-5 -5 10 10")  
        .attr("d", self.getSymbol)
        .style("cursor", "pointer")
        .style('stroke-linejoin', 'bevel') 
        .style('stroke-width', 2)
        .style('stroke', function(d){ return d.ref.ref.style.base.stroke })
        .style('fill', function(d){ return d.ref.ref.style.base.fill })
        .style('opacity', function(d){ return d.ref.ref.style.base.opacity })
        .style('fill-opacity', 1)
        .on("click", $.proxy(function(d){ this.select(d.ref) }, this))
        .on('mouseover', $.proxy(function(d){ 
                if (d.ref.ref.type == "shipment") this._window.showLabel(d.ref);
            }, this))
        .on('mouseout', $.proxy(function(d){ 
                if (d.ref.ref.type == "shipment") this._window.hideLabel();
            }, this));

    var labels = nodes
        .append("text")
            .attr("text-anchor", "middle")
            .attr("x", 0)
            .attr('fill', '#555' )
            .attr('font-size', 11)
            .attr('font-weight', 'bold')
            .attr('font-family', 'Arial, Helvetica,sans');

    labels.append("tspan")
        .attr("x", 0)
        .attr("dy", "1em")
        .text(function(d) {
            if (d.ref.ref.type === "shipment")
                return '';
            return d.ref.ref.style.base.label; 
        });

    labels.each(function(d) {
        var bbox = this.getBBox();
        d.bbox = bbox;
        d.width = 16;
        d.height = 24;
    });

    labels
        .attr("x", function(d) { return -d.bbox.width / 2; })
        .attr("y", function(d) { return d.bbox.height; });

    // Space the layers out by overall size of graph 
    var edgeNum = this.set.edges.length * 1.5;
    var nodeNum = this.set.nodes.length * 1.5;

    var rankSep = Math.max(50, Math.max(edgeNum, nodeNum));
    // Create the layout and get the graph
    dagre.layout()
        .nodeSep(24)
        .edgeSep(5)
        .rankSep(rankSep)
        .nodes(this.data.nodes)
        .edges(this.data.edges)
        .run();
    
    var transform = function(d) {
        var y = d.dagre.y; 
        var x = d.dagre.x;

        return 'translate('+ y +','+ x +')'; 
    };

    nodes.attr("transform", transform);

    function spline(e) {
        var points = e.dagre.points.slice(0);
            source = e.source.dagre,
            target = e.target.dagre;

        points.unshift(source);
        points.push(target);

        return d3.svg.line()
            .y(function(d) { return d.x; })
            .x(function(d) { return d.y; })
            .interpolate("basis")
            (points);
    }

    edges
        .attr('id', function(e) { return e.dagre.id; })
        .attr("d", function(e) { return spline(e); })
        .style('fill-opacity', 0)
        .style('stroke', function(d){ return d.ref.ref.style.base.stroke })
        .style('stroke-width', 2)
        .style("pointer-events", "none")
    
    hitboxes 
        .attr("d", function(e) { return spline(e); })
        .style('fill-opacity', 0)
        .style('opacity', 0.0)
        .style('stroke-width', 10)
        .style('stroke', '#000')
        .style("cursor", "pointer")
        .style("pointer-events", "visibleStroke")
        .on('mouseover', $.proxy(function(d){ this._window.showLabel(d.ref) }, this))
        .on('mouseout', $.proxy(function(d){ this._window.hideLabel(d.ref) }, this));

    this.edges = edges;
    this.nodes = nodes;

    return this;
}

Sourcemap.View.Tree.prototype.scaleNodes = function(d){
    if (!d.ref.ref.style.base.filter || !d.ref.ref.style.base.additive) return '';
    if (!d.ref.ref.style.base.scale) return ''; 
    var scale = parseFloat(d.ref.ref.style.base.scale, 10),
        max = 3.8,
        min = 0.5;

    var result = scale * (max-min) + min;
    return 'scale(' + result + ')';
};
    
Sourcemap.View.Tree.prototype.getSymbol = function(d){
    if (d.ref.ref.type == "shipment") return 'M-2.5,0,L-5,-5L5,0L-5,5,L-2.5,0';
    return d3.svg.symbol().type('circle').size(400)();
};


// Approximates latlon bounds based on the size of the unscaled svg
Sourcemap.View.Tree.prototype.getBounds = function(){
    var bbox = this.g[0][0].getBBox();

    // Calculate container points
    var container = $(this.map.getContainer()).offset(),
        overlay   = $(this.svg[0][0]).offset(),
        relative  = [ container.left - overlay.left, container.top - overlay.top ];
   
    var bottomLeft = this.map.containerPointToLatLng(new L.Point(bbox.y + bbox.height, 0));
    var topRight   = this.map.containerPointToLatLng(new L.Point(0, bbox.x + bbox.width));

    var bounds = new L.LatLngBounds(bottomLeft, topRight);
    return bounds; 
}

Sourcemap.View.Tree.prototype.setBounds = function(){

    var bbox = this.g[0][0].getBBox(),
        bottomLeft = this.project([-10, -10]), // Bounds are -10,-10 to 10,10
        topRight   = this.project([10, 10]),
        width = -(topRight[1] - bottomLeft[1]), 
        height = -(bottomLeft[0] - topRight[0]),
        middle = [width / 2, height / 2],
        scale;
    
    this.svg
       .transition()
       .attr("width", width + 20) 
       .attr("height", height + 20) 
       .style("margin-left", bottomLeft[0] + "px")
       .style("margin-top", topRight[1] + "px");

    // Scale the g into the svg container.
    // Vertically or horizontally?
    // TODO: cleanup
    var vertical = (height / bbox.height) * 0.9, 
        horizontal = (width / bbox.width) * 0.9,
        offset,
        translate,
        ideal = this.getPointScale();

    if (vertical < horizontal){
        // Vertically
        if (vertical > ideal){
            scale = ideal;
            offset = (width - bbox.width * scale) / 2 + 60;
            var voffset = (height - bbox.height* scale) / 2;
            translate = offset + "," + voffset;
        } else {
            scale = vertical;
            offset = (width - bbox.width * scale) / 2;
            translate = offset + ", 0";
        }
    } else {
        // Horizontally
        if (horizontal > ideal){
            scale = ideal;
            offset = (height - bbox.height * scale) / 2;
            var woffset = (width - bbox.width * scale) / 2 + 60;
            translate = woffset + "," + offset;
        } else {
            scale = horizontal;
            offset = (height- bbox.height * scale) / 2;
            translate = "60, " + offset;
        }
    }

    if (scale == ideal){
        this.map.options.maxZoom = this.map.getZoom(); 
        if (!this.loaded) this.element.find('.leaflet-control-zoom').hide(); 
    }

    this.svg.select("g")
        .transition()
            .attr("transform", "translate(" + translate + ") scale( " + scale + ")");

    this.loaded = true;

    return this;
}

// Returns the ideal scale for the g container, so that node sizes match the map.
Sourcemap.View.Tree.prototype.getPointScale = function(){

    // First, get a node's radius
    var bbox = this.nodes.select('path')[0][0].getBBox(),
        radius = bbox.height/2;

    // Now, let's determine the scale at which the radius goes over the min size
    var scale = this.options.radius.min / radius;

    return scale;
}

Sourcemap.View.Tree.prototype.style = function(refresh){
    if (!this.edges || !this.nodes) return; 
    var self = this;
    
    this.nodes
        .selectAll('path')
        .transition()
        .attr('transform', self.scaleNodes) 
        .attr("d", self.getSymbol) 
        .style('fill', function(d){ return d.ref.ref.style.base.fill })
        .style('stroke', function(d){ return d.ref.ref.style.base.stroke })
        .style('opacity', function(d){ return d.ref.ref.style.base.opacity })
   

    this.nodes
        .selectAll('tspan')
        .each(function(t){
            if (t.ref.ref.type === "shipment") return;

            // This funky logic is to prevent the text from re-rendering, and causing ugliness.
            var select = d3.select(this);
            if (select.text() === t.ref.ref.style.base.label) return;
            else select.text(t.ref.ref.style.base.label);
        });
    
    this.edges
        .style('stroke', function(d){ return d.ref.ref.style.base.stroke })
        .style('opacity', function(d){ return d.ref.ref.style.base.opacity })
}
