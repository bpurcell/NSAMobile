/* Sourcemap.View  ----------------------------------------------------

View parent class.

All views share three methods:  init, reload, and refresh.

Init is meant to be called once, as the view is loaded into the DOM, Reload 
should rebuild all data from scratch, and refresh should simply update
styles.

----------------------------------------------------------------------- */

Sourcemap.View = function(o){
    if (!o || !o.element)
        throw new Error('Error: No element provided.');

    this._window = o._window;

    // Establish view in given element
    this.element = o.element;
    this.id = o.id;
    this.theme = o.theme || "default";

    // Use whatever set is available.
    this.set = Sourcemap.Sets.first();
    if (!this.set){
        this.loading = $('<div />')
            .addClass('loading')
            .text('Waiting for set data...')
            .appendTo(this.element);
    }

    // View-agnostic reload method
    this.reload  = function(){ };
    this.refresh = function(){ };

    // Set up listeners
    Sourcemap.listen('set:added', reload, this);
    Sourcemap.listen('tabular:added', reload, this);
    Sourcemap.listen('set:styles_changed', refresh, this);
    Sourcemap.listen('set:updated', reload, this);
   
    function reload(){
        if (this.loading && this.loading.length > 0) this.loading.remove()
        this.set = Sourcemap.Sets.first();
        if (this.set && !this.set.customColors){
            this.element.addClass('default-colors');
        }
        this.reload();
    }

    function refresh(){
        this.refresh();
    }
    
};

