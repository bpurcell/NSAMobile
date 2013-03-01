/* Sourcemap.View.Filter --------------------------------------------------

Filter control.  Allows users to view filters. 

------------------------------------------------------------------------------ */

Sourcemap.View.Filter = function(o){
    // Extend parent class
    Sourcemap.View.call(this, o);
    
    var init = $.proxy(function(){this.init();},this);
    init();
};

Sourcemap.View.Filter.prototype.options = {
    donut : {
        minimum : 0.10, // Minimum displayed value, given as a fraction of the maximum
        values  : 6,  // Maximum number of values to be included in chart 
        other : false
    }, 
    bar : {
        minimum : 0.12,
        values  : 6, 
        other : false 
    }
};

Sourcemap.View.Filter.prototype.init = function(){
    this.changes = {};
    this.initFilters()
        .initGraphs()
        .initListeners();
};

Sourcemap.View.Filter.prototype.initFilters = function(){
    var self = this;
    this.active = false;
    this.cache = {};
    this.element
        .attr({ id : 'Filter-' + this.id });
    this.elements = {};

    this.main = this.buildMain().appendTo(this.element);

    return this;
};

// Set up main interface
Sourcemap.View.Filter.prototype.buildMain = function(){
    var container = $('<div />').attr({ id : 'filter-main' }).addClass('infographic');

    var tmpl= '<ul>'+
                  '<li id="metricheader">'+
                      '<div class="content">'+
                          '<p class="title">Metrics</p><br/>' +
                      '</div>'+
                  '</li>'+
                  '{{#eachProperty filters}}' +
                  '<li class="filter" id="filter-{{property}}">'+
                      '<div class="content">'+
                          '<p class="title pull-left">{{value.display_name}}</p>' +
                          '<div id="filter-graph-{{property}}" class="graph pull-right"></div>' +
                          '<ul class="stats pull-left">'+
                              '<li>Average: <span class="avg"></span></li>'+
                              '<li>Minimum: <span class="min"></span></li>'+
                              '<li>Maximum: <span class="max"></span></li>'+
                              '<li>Total: <span class="tot"></span></li>'+
                          '</ul>'+
                          '<p class="summary"></p>' +
                      '</div>'+
                  '</li>'+
              '{{/eachProperty }}</ul>';

    var html = (Handlebars.compile(tmpl))(this.set);
   
    // Set up click behavior & statistical summaries
    var self = this;
    container
        .html(html)
        .find('li.filter')
            .each(function(){
                var filter = $(this).attr('id').replace('filter-', ''),
                    data = self.getData(filter);

                if (data.length === 0) return;
                var values = data.map(function(d){ return d.value; });

                $(this).click($.proxy(function(evt){
                    if (filter !== this.active)
                        Sourcemap.broadcast('filter:activated', filter);
                    else
                        Sourcemap.broadcast('filter:deactivated', filter);
                }, self));

                var total = values.reduce(function(a, b) { return a + b; }),
                    format= d3.format(',');

                $(this).find('.avg').text(format(Math.round(total / values.length)));
                $(this).find('.min').text(format(Math.min.apply(null, values)));
                $(this).find('.max').text(format(Math.max.apply(null, values)));
                $(this).find('.tot').text(format(Math.round(total)));
            });
    return container;
};

Sourcemap.View.Filter.prototype.fade = function(filter, out){
    if (!filter) return;
    if (filter === this.active && out) return;

    var elements = this.elements[filter],
        color = this.graphs[filter].color, 
        mono  = this.graphs[filter].mono; 
        val   = out ? mono : color;
    
    elements.transition().attr("fill", val);
}; 

Sourcemap.View.Filter.prototype.initGraphs = function(){
    
    // Set up graphs 
    this.graphs = {}; 
    for (var name in this.set.filters){
        var type;

        // Build colors
        this.build(name);

        if (this.set.filters[name].additive) type = "donut";
        else type = "bar";
        
        this.graphs[name] = {};
        this[type](name, '#filter-graph-' + name);
    }

    return this;
};

// Identify all data points with a given filter (attribute).  This is meant to be a
// mapreduce swiss army knife for charts.
//
// "name" is the name of the filter
// "minimum" is the minimum size displayed, relative to the maximum 
// "other" is a boolean that decides whether or not to reduce all the remaining values.
Sourcemap.View.Filter.prototype.getData = function(name, minimum, values, other){
    if (!this.dataCache) this.dataCache = {};
    if (this.dataCache[name]) return this.dataCache[name];

    // Map
    var data = $.map(this.set.things, function(d){
        if (d.attributes && typeof(d.attributes[name]) === "undefined") return;
        var value = parseFloat(d.attributes[name], 10);
        if (isNaN(value)) return; // throw new Error('Data in ' + name + ' is not enumerable.');
        return { id: d._id.$id, name: d.name, value: value, ref: d}
    });

    // Sort by ascending
    data.sort(function(a,b){ return b.value - a.value }); 
    
    // Find cutoff
    var remaining = [];
    if (data[0] && data[0].value){
        var count;
        minimum = data[0].value * minimum;
        for (count = 0; count < data.length; count++)
            if (data[count].value < minimum ) break;

        remaining = remaining.concat(data.splice(count));
    }

    if (data.length > values)
        remaining = remaining.concat(data.splice(values));
    
    if (remaining.length && other){
        remaining = $.map(remaining, function(d){ return d.value; }).reduce(function(a, b){ return a + b });
        data.push({ name : 'Other', value: remaining, ref: remaining });
    }
    
    this.dataCache[data] = data;
    return data;
};

// Set up a bar chart given a filter name and selector
Sourcemap.View.Filter.prototype.bar = function(name, selector){
   var margin = {top: 30, right: 10, bottom: 10, left: 30},
       width = 200 - margin.right - margin.left,
       height = 150 - margin.top - margin.bottom;

   var format = d3.format(",.0f");

   var x = d3.scale.ordinal()
       .rangeRoundBands([0, width], 0.1);

   var y = d3.scale.linear()
       .range([0, height]);

   var xAxis = d3.svg.axis()
       .scale(x)
       .orient("top")
       .tickSize(-height);

   var yAxis = d3.svg.axis()
       .scale(y)
       .orient("left")
       .tickSize(0);

   var svg = d3.select(selector).append("svg")
       .attr("width", width + margin.right + margin.left)
       .attr("height", height + margin.top + margin.bottom)
       .append("g")
           .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var o = this.options.bar;

    var data = this.getData(name, o.minimum, o.values, o.other),
        styles = this.cache[name];

    data = data.sort(function(a,b){return b.value - a.value; });
   
    // Set the scale domain.
    x.domain(data.map(function(d) { return d.id; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    var bar = svg.selectAll("g.bar")
        .data(data)
        .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.id) + ", 0)"; });

    this.graphs[name].color = color = function(d, i) { return styles[d.id].fill; };
    this.graphs[name].mono  = mono  = function(d, i) { return '#aaa'; };

    this.elements[name] = bar.append("rect")
        .attr("fill", mono)
        .attr("y", function(d) { return height - y(d.value); })
        .attr("height", function(d) { return y(d.value); })
        .attr("width", x.rangeBand())
        .attr("name", function(d){ return d.name; })
        .on("click", function(d){
            Sourcemap.broadcast('thing:selected', d.ref);
        })
        .on("mouseover", $.proxy(function(d){
            this._window.showLabel(d); 
        }, this))
        .on("mouseout", $.proxy(function(d){
            this._window.hideLabel(d); 
        }, this));

    bar.append("text")
        .attr("class", "value")
        .attr("x", x.rangeBand() / 2)
        .attr("y", function(d) { return height - y(d.value); })
        .attr("dy", 12)
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")
        .style("font-size", "10px")
        .attr("fill", "#444")
        .text(function(d) { return Sourcemap.scale(d.value); });

    svg.append("g")
        .attr("class", "x axis")
        .style("fill", "none")
        .call(xAxis);
};

// Set up a donut chart given a filter name a selector
Sourcemap.View.Filter.prototype.donut = function(name, selector){
    
    var width = 180,
        height = 150,
        outerRadius = Math.min(width, height) / 2,
        innerRadius = outerRadius * 0.5,
        o = this.options.donut,
        data = this.getData(name, o.minimum, o.values, o.other),
        color = d3.scale.linear().domain([0, 10]).range([this.set.filters[name].color, '#555']); 
        mono = d3.scale.linear().domain([0, 10]).range(['#eee', '#555']),
        arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);

    // Save color and mono fills, so that we can refer back to them later
    this.graphs[name].color = colorf = function(d, i) { return color(i); };
    this.graphs[name].mono  = monof = function(d, i) { return '#ddd'; };

    this.graphs[name].vis = vis = d3.select(selector)
        .append("svg")
            .data([data.map(function(d){return [d.value, d.ref, d.name]; })])
            .attr("width", width)
            .attr("height", height);

    var arcs = vis.selectAll("g.arc")
        .data(d3.layout.pie().value(function(d){ return d[0]; }))
        .enter().append("g")
            .attr("class", "arc")
            .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    this.elements[name] = arcs.append("path")
        .attr("fill", monof)
        .attr("d", arc)
        .on("click", function(d){
            if (d.data[1].styles)
                Sourcemap.broadcast('thing:selected', d.data[1]); 
        })
        .on("mouseover", $.proxy(function(d){
            this._window.showLabel({ name : d.data[2], ref : d.data[1] }); 
        }, this))
        .on("mouseout", $.proxy(function(d){
            this._window.hideLabel(); 
        }, this));

    arcs.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style('font-size', "12")
         .style("pointer-events", "none")
        .attr("display", function(d) { return d.value > 0.15 ? null : "none"; })
        .text(function(d, i) { return Sourcemap.scale(d.value); });

    return;
};

Sourcemap.View.Filter.prototype.initListeners = function(){
    Sourcemap.listen('filter:activated', function(evt, filter){

        Sourcemap.broadcast('filter:deactivated');
        
        var additive = this.set.filters[filter].additive ? ' filter-additive' : '';
        this._window.element.addClass('filter-enabled' + additive);
        this.activate(filter); 
    }, this);
    Sourcemap.listen('filter:deactivated', function(evt, filter){
       this._window.element.removeClass('filter-enabled').removeClass('filter-additive');
        this.deactivate(); 
    }, this);
};

Sourcemap.View.Filter.prototype.activate = function(name){
    if (!this.cache[name]) this.build(name);
    var styles = this.cache[name];

    // Apply calculated styles to set and rebuild
    for (var id in this.set.things){
        var thing = this.set.things[id];
        thing.styles.filter = styles[id];
    }

    this.active = this._window.filter = name;
    this.fade(name);
    this.set.buildStyle();
    Sourcemap.broadcast('set:styles_changed');
};

// Preprocess filter colors
Sourcemap.View.Filter.prototype.build = function(name){
    var things  = this.set.things,
        filter  = this.set.filters[name],
        range   = this.range(things, name, filter.calc),
        total   = range.pop();

    // Save total and range to filter object
    filter.total = total;
    filter.range = range;

    var color = d3.scale.linear()
        .domain([range[0], range[1]/2, range[1]])
        .range(["green", "yellow", "red"]);

    if (!this.cache[name]) this.cache[name] = {};

    for (var id in things){
        var thing = things[id],
            value = thing.attributes ? parseFloat(thing.attributes[name], 10) : false;
        if (!filter) throw new Error('Filter unavailable.');
       
        if (value && !isNaN(value)){
            this.cache[name][id] = {
                fill  : filter.color,
                stroke: filter.color,
                label : Sourcemap.scale(value),
                filter : name 
            };
            if (filter.additive){
                this.cache[name][id].additive =  true;
                this.cache[name][id].scale = value/total; 
            }
            else 
                this.cache[name][id].fill = this.cache[name][id].stroke = color(value); 
        } else {
            this.cache[name][id] = { 
                fill : '#cccccc',
                stroke : '#cccccc',
                filter : name 
            };
            
            if (filter.additive){
                this.cache[name][id].additive =  true;
            }
        }
    }
};

Sourcemap.View.Filter.prototype.range = function(things, name, calc){
    var values = $.map(things, function(d){
            var num = parseFloat(d.attributes[name], 10)
            if (!isNaN(num)) return num; 
        });

    if (values.length === 0) return [0, 0, 0];

    var min = Math.min.apply(Math, values),
        max = Math.max.apply(Math, values);
        tot = values.reduce(function(a, b) { return a + b });

    return [min, max, tot];
};

Sourcemap.View.Filter.prototype.deactivate = function(){
    var things = this.set.things,
        active = this.active;

    this.active = this._window.filter = false;
    this.fade(active, true);
    
    for (var i in things){
        var thing = things[i];
        delete thing.styles.filter; 
    }
    this.set.buildStyle();
    Sourcemap.broadcast('set:styles_changed');
};

Sourcemap.View.Filter.prototype.close = function(){
    this.content.empty();
    this.element.hide();
};
