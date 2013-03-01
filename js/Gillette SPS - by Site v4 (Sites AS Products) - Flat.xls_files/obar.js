(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['obar.html'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  return "\n            <li class=\"list-error\">\n                <a class=\"view error\" href=\"#\" name=\"error\"> <i class=\"icon icon-exclamation-sign\"></i></a>\n            </li>\n            ";}

function program3(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n            <li class=\"list-";
  foundHelper = helpers.property;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.property; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n                <a class=\"view ";
  foundHelper = helpers.property;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.property; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" href=\"#\" name=\"";
  foundHelper = helpers.property;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.property; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"><i class=\"icon icon-";
  stack1 = depth0.value;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.icon;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\"></i></a>\n            </li>\n            ";
  return buffer;}

  buffer += "<div class=\"navbar\">\n    <div class=\"navbar-inner\">\n        <a class=\"brand\" href=\"/set/";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n        <ul class=\"nav pull-right\">\n            <li><p class=\"date\">";
  foundHelper = helpers.date;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.date; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p></li>\n            <form id=\"window-search\" class=\"navbar-search pull-left\">\n                <input id=\"window-search-bar\" type=\"text\" class=\"search-query\" placeholder=\"Search\">\n            </form>\n            ";
  stack1 = depth0.errors;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  stack1 = depth0.views;
  foundHelper = helpers.eachProperty;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data)}) : helperMissing.call(depth0, "eachProperty", stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            \n            <li class=\"list-settings\">\n                <a href=\"/set/edit/";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "?format=modal\"  data-toggle=\"modal\" data-target=\"#edit_modal\" data-title=\"Upload a Spreadsheet\"><i class=\"icon icon-cogs\"></i></a>\n            </li>\n        </ul>\n    </div>\n</div>\n\n";
  return buffer;});
})();