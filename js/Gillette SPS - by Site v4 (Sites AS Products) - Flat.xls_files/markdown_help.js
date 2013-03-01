(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['markdown_help.html'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<h1>Sourcemap-flavored markdown</h1>\n\n<p>We use an extended version of <a href=\"http://daringfireball.net/projects/markdown/syntax\">markdown</a> to help format your data.</p>\n\n<p>In addition to the normal host of markdown features, we support special plugins, or \"shortcodes\".  Shortcodes can do anything from displaying simple data to creating complicated interactive graphs.  You can even build your own shortcodes!</p>\n\n<h2>Examples</h2\n<p>The simplest approach may be just to show your data's title and location, like so:\n<code>\n    [title]\n    [location]\n</code>\nThis translates to:</p>\n\n<p>\n\"Data Title\"</br>\n\"Location\"</br>\n</p>\n";});
})();