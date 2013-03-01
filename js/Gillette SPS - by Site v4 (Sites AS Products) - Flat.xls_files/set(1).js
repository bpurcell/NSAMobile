/* Sourcemap.Set ---------------------------------------------------------------

Sourcemap's canonical "set" object.

A set is a collection of "things", arranged by their "types" (i.e., Facilities, 
Processes, Materials, and Shipments.

------------------------------------------------------------------------------ */

Sourcemap.Set = function(data){
    self = this;
    this.data = data;
    this.styles = {};

    this.broadcast = Sourcemap.broadcast;
    this.listen = Sourcemap.listen;

    this.initIndex()
        .initSchema()
        .initGraph()
        .initFilters()
        .initBounds()
        .initTiers()
        .initStyles()
        .initListeners();
}

// Convert type objects into iterable arrays
Sourcemap.Set.prototype.initIndex = function(){
    this.things = {};
    this.types = {};
    for (var type in this.data.types){
        var things = this.data.types[type];
        this.types[type] = [];
        for (var t in things){
            this.types[type].push(things[t])
            this.things[t] = things[t];
        }
    }
    return this;
}

// To help us display this data in a spreadsheet, we pass a schema down from the
// server, which lists all available column keys and names.
Sourcemap.Set.prototype.initSchema = function(){
    this.schema = Sourcemap.ordinal(this.data.schema);
    
    // Create lookup table for display names and columns
    this.names  = {};
    this.columns= {};
    for (var type in this.schema){
        if (this.schema.hasOwnProperty(type)){
            var columns = this.schema[type].columns;
            this.columns[type] = [] 
            for (var id in columns){
                var attr = columns[id];
                if (typeof(attr) !== "object") continue;
                this.names[attr.key] = attr.value;
                this.columns[type].push(attr.key);
            }
        } 
    }

    // Make pointers to site names.  This is used for shipment lookups.
    /*
    this.names = { site : {} };
    for (var id in this.types.site){
        var site = this.types.site[id];
        if (site.name && site.name !== '')
            this.names.site[site.name] = site;
    }
    */
    return this;
}

Sourcemap.Set.prototype.initGraph = function(){

    // Temporary ID used for client-side (i.e. non-mongo) data. 
    this.tempid = 0;

    this.graph = {
        base : this.makeGraph(),
        geo  : this.makeGraph(true)
    };

    // Make pointers to base nodes and edges, for simplicity and visibility 
    for (var prop in this.graph.base)
        if (this.graph.base.hasOwnProperty(prop)) this[prop] = this.graph.base[prop];

    return this;
}

// Creates a graph from set data.  
Sourcemap.Set.prototype.makeGraph = function(waypoints){
    var index = {}; 
    var mongo = {};
    
    var graph = {
        nodes : get(['site']),
        edges : get(['shipment'])
    }

    if (waypoints) graph = interpolate(graph);

    // Set up pointer arrays
    for (var i in graph.nodes){
        var node  = graph.nodes[i];
        node.to   = []; // Nodes
        node.from = []; 
        node.incoming = []; // Edges 
        node.outgoing = []; 
    }
    
    // Process pointer arrays
    for (i in graph.edges){ 
        var edge = graph.edges[i];

        // Map ids to actual nodes 
        var to   = index[edge.to_id];
        var from = index[edge.from_id];

        // Add pointers to nodes and edges
        if (from) {
            edge.from = from;
            edge.from_name = from.ref.name || 'Untitled';
            from.to.push(to);
            from.outgoing.push(edge);
        }
        if (to){
            edge.to = to;
            edge.to_name = to.ref.name || 'Untitled';
            to.from.push(from);
            to.incoming.push(edge);
        }
    }
    
    // And roots and leaves
    graph.roots  = getEnds('from'); 
    graph.leaves = getEnds('to'); 
    graph.index  = index;
    graph.mongo  = mongo;  // TODO: Is this needed?

    return graph;

    // Returns a list from the server data.
    function get(types){
        var output = [];

        for (var i in types){
            if (self.types[types[i]]){
                var refs = self.types[types[i]];
                output = output.concat(refs.map(map));
            }
        }
        return output;
        
        function map(ref){
            var thing = {
                id : self.tempid++,
                ref: ref
            };

            if (ref.from_id) thing.from_id = mongo[ref.from_id.$id].id;
            if (ref.to_id) thing.to_id = mongo[ref.to_id.$id].id;

            index[self.tempid - 1] = thing;
            mongo[ref._id.$id] = thing;

            return thing;
        }
    }
    
    // Given waypoints, add nodes and edges into the graph
    function interpolate(graph){
        
        var nodes = graph.nodes;
        var edges = []; 

        for (var i in graph.edges){
            var edge = graph.edges[i],
                waypoints = edge.ref.waypoints;

            if (!waypoints || waypoints.length === 0){
                var e = {
                    id : self.tempid++,
                    ref : edge.ref,
                    from_id : edge.from_id, 
                    to_id   : edge.to_id
                };
                edges.push(e);
                index[self.tempid - 1] = e;
                continue;
            }

            var order = []
            // Create a new "fake" node for each waypoint
            for (var w in waypoints){
                var node = {
                    id : self.tempid++,
                    ref : {
                        attributes : {}, 
                        geometry : { coordinates : waypoints[w], type : "Point" },
                        style: { hidden : true }
                    }
                };
                index[self.tempid -1] = node;
                nodes.push(node);
                order.push(node);
            }

            // Create new "fake" edges
            for (var c = 0; c <= waypoints.length; c++){
                var ed = {
                    id : self.tempid++,
                    ref : edge.ref,
                    from_id : c === 0 ? mongo[edge.ref.from_id.$id].id : order[c - 1].id,
                    to_id   : c === waypoints.length ? mongo[edge.ref.to_id.$id].id : order[c].id
                };
                edges.push(ed);
                index[self.tempid - 1] = ed;
            }
        }

        return { nodes: nodes, edges: edges };
    }
    
    function getEnds(direction){
        var ends = [];
        for (var i in graph.nodes){
            var node = graph.nodes[i];
            if (node[direction].length === 0) ends.push(node);        
        }
        return ends;
    }

    function makeSegments(edge, nodes){
        var edges = [];

        for (var i in nodes){
            var node = nodes[i];
           
            // Create a new edge with proper "to" and "from"
            var segment = {
                _id : { $id : mongoize(self.tempid++) }, 
                ref : edge,
                from_id : node.from[0], 
                to_id : node.to[0] 
            }
   
            process(segment)
            edges.push(segment);
        }

        return edges;
    }
}

// Extend filters by defaults
Sourcemap.Set.prototype.initFilters = function(){
    var defaults = {
        "name" : "filter",
        "unit" : "kg",
        "color": "#000000",
        "invert": "off",
        "max": "off",
        "calc" : function(thing, attr) {
            var val      = "",
                quantity = thing.attributes[attr],
                weight   = thing.attributes.weight || 1,
                factor   = parseFloat(thing.attributes.factor),
                unit     = thing[unit] || '';

            if(thing.type == "shipment")
                weight =  weight * parseFloat(thing.gc_distance());
            if(!isNaN(quantity) && !isNaN(factor))
                val = weight * quantity * parseFloat(factor);
            return val;
        },
        "description": "This is a filter."
    }
    
    this.filters = {};
    for (var name in this.data.filters){
        this.filters[name] = $.extend({}, defaults, this.data.filters[name]);
        this.filters[name].display_name = this.names[name];
    }
    return this;
}

// Determine latlon bounds for each hemisphere (-180 < lng < 0, 0 <= lng <= 180)
Sourcemap.Set.prototype.initBounds = function(){
    var world = {
        left : { x : [], y: [], count: 0 },
        right: { x : [], y: [], count: 0 },
        both : { x : [], y: [], count: 0 }
    };

    for (var id in this.nodes){
        var ref = this.nodes[id].ref;
        if (!ref.geometry || !ref.geometry.coordinates)
            ref.geometry = { coordinates: [0,0] };

        var x = ref.geometry.coordinates[0],
            y = ref.geometry.coordinates[1],
            w = [x < 0 ? world.left : world.right, world.both];

        for (var i in w){
            w[i].x.push(x);
            w[i].y.push(y);
            w[i].count++;
        }
    }

    var bounds = {};
    for (var hemisphere in world){
        var b = world[hemisphere];

        if (b.count === 0) continue; 
        
        bounds[hemisphere] = [
            Math.max.apply(Math, b.y), 
            Math.min.apply(Math, b.x), 
            Math.min.apply(Math, b.y),
            Math.max.apply(Math, b.x) 
        ];
    }

    this.bounds = bounds;
    return this;
}

// Make tiers.  
// TODO:  This stuff should probably happen on the server
Sourcemap.Set.prototype.initTiers = function(){
    // Check for cycles
    if (this.cycleCheck(this)){
        // Assign tier to each node
        for (var i in this.roots){
            var root = this.roots[i];
            var paths = this.getPaths(root, 'to');
            for (i in paths){
                var path = paths[i];
                for (var c in path){
                    var node = path[c];
                    if (node.tier && node.tier > c) continue;
                    node.tier = parseInt(c, 10) + 1;
                    node.ref.tier = node.tier;
                }
            }
        }

        // Generate 'tiers' object
        var tiers = {};
        for (i in this.nodes){
            var tier = this.nodes[i].tier;
            if (!tiers[tier]) tiers[tier] = [];
            tiers[tier].push(this.nodes[i]);
        }

        this.tiers = tiers;
    }
    return this;
}

// Detects cycles
Sourcemap.Set.prototype.cycleCheck = function(){
    var vector = [];
    var stack = [];
    for(var i in this.edges) {
        if(this.edges[i].from_id === this.edges[i].to_id) {
            var name = this.edges[i].name || this.edges[i].id;
            console.log("Warning: Edge '" + name + "' is circular.");
            return false;
        }
        var n = this.edges[i].from_id;
        var v = [];
        var st = [{"n": n, "v": v}];
        while(st.length) {
            var sti = st.pop();
            n = sti.n;
            v = sti.v;
            var new_v = $.extend([], v);
            new_v.push(n);
           
            var outgoing = this.index[n].outgoing;
            for(var c in outgoing) {
                var out_edge = outgoing[c];
                if(new_v.indexOf(out_edge.to_id) >= 0) {
                    console.log("Warning: '" + this.index[n].name + "' to '" + out_edge.to.title + "' is circular.");
                    return false;
                }
                st.push({"n": out_edge.to_id, "v": new_v});
            }
        }
    }
    return true;
}

// Returns a list of all possible paths taken from a node
// direction = 'to' or 'from'
Sourcemap.Set.prototype.getPaths = function(start, direction){
    var paths = [];
    var queue = [[start]];
    while (queue.length){
        var arr = queue.pop();
        var node = arr[arr.length-1];
        var nodes = node[direction];
        if (nodes.length){
            for (var i in nodes){
                var to = nodes[i];
                var clone = arr.slice(0);
                clone.push(to);
                queue.push(clone);
            }
        } else 
            paths.push(arr.slice(0));
    }
    return paths;
}
 
Sourcemap.Set.prototype.initStyles = function(){
    for (var i in this.things){
        var thing = this.things[i];
        var base = thing.styles ? thing.styles : {}; 
        thing.styles = { base : base }
        thing.style = {}
    }
    this.customColors = false;

    // TODO: This is an ECMAscript 5 thing and won't work on IE8 :(
    var palette;
    if (this.tiers){
        var numTiers = Object.keys(this.tiers).length - 1;
      
        palette = d3.scale.linear()
            .domain([0, numTiers / 2, numTiers])
            .range(["#35a297", "#b01560", "#e2a919"])

    } else 
        palette = function(index){ return this.data.color ? this.data.color[0] : "#35a297" };

    for (i in this.nodes){
        var n = this.nodes[i],
            index = n.tier - 1,
            styles= {
                fill  : palette(index),
                stroke : palette(index),
                textColor : '#646464',
                opacity : 1,
                radius : 10, 
                label : n.ref.name || ''
            };
    
        // Allow server override
        var cbase = n.ref.styles.base;
        if (cbase.fill || cbase.stroke) this.customColors = true;
        n.ref.styles.base = $.extend(styles, cbase);
    }

    for (i in this.edges){
        var e = this.edges[i],
            totier = e.to.tier ? e.to.tier - 1  : 0,
            fromtier = e.from.tier ? e.from.tier - 1 : 0,
            color = palette(d3.interpolate(totier, fromtier)(0.5))
            estyles = { 
                fill   : color,
                opacity : 1,
                stroke : color,
                label : e.ref.name || ''
            };

        // Allow server override
        var ebase = e.ref.styles.base;
        if (ebase.fill || ebase.stroke) this.customColors = true;
        e.ref.styles.base = $.extend(estyles, ebase);
    }
        
    this.buildStyle();
    return this;
}

// Set up event listeners that change styles dynamically
Sourcemap.Set.prototype.initListeners = function(){
    var self = this;
    
    this.listen('thing:selected.set', function(evt, thing){
        clickoff();
        this.selected = thing;
       
        if(!thing.styles.selected) thing.styles.selected = {};
      
        if (thing.type === "shipment")
            thing.styles.selected.stroke = "#000000";
        thing.styles.selected.fill = "#ffffff";

        this.buildStyle();
        this.broadcast('set:styles_changed', this, thing);
    }, this);

    // Analagous to "unselect all"
    this.listen('clickoff.set', function(evt, thing){
        if (clickoff()){
            this.buildStyle();
            this.broadcast('set:styles_changed', this);
        }
    }, this);

    // Update saved things
    this.listen('thing:save_success.set', function(evt, id, response){
        if (response.set && response.set.$id !== this.data._id.$id) return;

        if (this.things[id])
            this.replace(id, response);
        else
            this.insert(response);

        this.broadcast('set:data_changed', response.set.$id);
    }, this);

    this.listen('set:save_success.set', function(evt, id){
        $.ajax({
            url : '/set/changed/' + id
        });
    },this);

    Sourcemap.listen('search:activate', function(evt, string, options){
        this.search(string);
    }, this);
    Sourcemap.listen('search:deactivate', function(evt){
        this.stopSearch();
    }, this);

    function clickoff(){
        if (self.selected){
            delete self.selected.styles.selected;
            delete self.selected;
            return true;
        }
        return false;
    }

};

// Remove listeners in preparation for delete
Sourcemap.Set.prototype.remove = function(){
    Sourcemap.unlisten('thing:selected.set'); 
    Sourcemap.unlisten('thing:save_success.set'); 
    Sourcemap.unlisten('set:save_success.set'); 
    Sourcemap.unlisten('clickoff.set'); 
};

// Replace old thing with new thing
Sourcemap.Set.prototype.replace = function(id, thing){
    var replacement = $.extend(this.things[id], thing),
        newId = thing._id.$id,
        type = thing.type;
    delete this.data.types[type][id];
    this.data.types[type][newId] = replacement;
};

// Insert thing into set
Sourcemap.Set.prototype.insert = function(thing){
    var id   = thing._id.$id,
        type = thing.type;

    if (!this.data.types[type]) this.data.types[type] = {};
    this.data.types[type][id] = thing;
    this.types[type] = thing;
};

Sourcemap.Set.prototype.buildStyle = function(){
    this.style = {};
    if (!this.order) this.order = {};
    this.order.base = ['base', 'filter', 'selected', 'search'];
    
    for (var type in this.order){
        var order = this.order[type];
        for (var i in this.things){
            var thing = this.things[i];
            if (!thing.style[type]) thing.style[type] = {};
            for (var p in thing.style[type])
                if (thing.style[type].hasOwnProperty(p)) delete thing.style[type][p];
            for (var c in order){
                var layer = thing.styles[order[c]];
                for (var prop in layer)
                    if (layer.hasOwnProperty(prop)) thing.style[type][prop] = layer[prop];
            }
        }
    }

    return;
}

// Activate search
Sourcemap.Set.prototype.search = function(string){
    var things = this.things;
        matches= 0;
    for (var i in things){

        var thing = things[i],
            stuff = [ thing ]
            id    = thing._id.$id,
            json  = JSON.stringify(stuff).toLowerCase(),
            string = string.toLowerCase();
        var match = json.indexOf(string) == -1;
        if (match) matches++;

        thing.styles.search = match ? {opacity: 0} : {opacity: 1};
    }

    if (matches > 0){
        this.buildStyle();
        Sourcemap.broadcast('set:styles_changed');
    }
}

Sourcemap.Set.prototype.stopSearch = function(){
    var things = this.things;
    for (var i in things){
        var thing = things[i];
        delete thing.styles.search;
    }
    this.buildStyle();
    Sourcemap.broadcast('set:styles_changed');
}


