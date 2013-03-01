(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['configure.html'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"field-edit-container configure-";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" id=\"configureElement-";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n    <div class=\"configure-group\">\n        <form class=\"customElement\">\n            <fieldset>\n\n                <legend class=\"configure-heading\">\n                <a class=\"configure-toggle \" data-toggle=\"collapse\" data-parent=\"#configureElement-";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" href=\"#collapse-";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n                    Untitled element <i class=\"icon-pencil\"></i>\n                </a>\n                    \n                </legend>\n                <div id=\"collapse-";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"configure-body  customElementAcordion\">\n                    <label>Name of Field</label>\n                    <input type=\"text\" class=\"input-block-level input-name\">\n\n                    <label>Field Description</label>\n                    <textarea rows=\"3\" class=\"input-block-level\"></textarea>\n\n                    <label>Type</label>\n                    <select>\n                        <option value=\"text\">Text</option>\n                        <option value=\"multu\">Multi</option>\n                        <option value=\"boolean\">Boolean</option>\n                        <option value=\"dateTime\">Date Time</option>\n                    </select>\n\n\n                    <label class=\"checkbox\">\n                    <input type=\"checkbox\"> Is Required\n                    </label>\n\n                    <label class=\"checkbox\">\n                    <input type=\"checkbox\" class=\"filter-checkbox\"> Filter with this field\n                    </label>\n\n                    <div class=\"optional-filter\">\n                        <label>Filter Type</label>\n                        <select>\n                            <option value=\"avg\">Average</option>\n                            <option value=\"min\">Min</option>\n                            <option value=\"max\">Max</option>\n                            <option value=\"total\">Total</option>\n                        </select>\n                    </div>\n                    <label class=\"\">\n                    Color: <input type=\"minicolors\" value=\"#2D78AF\" /> \n                    </label>\n\n                </fieldset>\n            </div>\n             <button type=\"button\" class=\"btn confgure_element_create add\">Add Another</button>\n            <button type=\"button\" class=\"btn confgure_element_create delete\" id=\"remove-";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">Delete</button>\n        </form>\n\n</div>\n\n\n<script type=\"text/javascript\">\n    $.minicolors.init()\n</script>\n";
  return buffer;});
})();