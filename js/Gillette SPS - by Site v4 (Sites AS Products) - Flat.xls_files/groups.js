(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['groups.html'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n        <tr>\n            <td><a href=\"/group/";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a></td>\n            <td><a href=\"/group/";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.desc;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.desc; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a></td>\n        </tr>\n        ";
  return buffer;}

  buffer += "<table class=\"table table-hover\">\n    <thead>\n        <tr>\n            <td>";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "name", {hash:{}}) : helperMissing.call(depth0, "I18n", "name", {hash:{}});
  buffer += escapeExpression(stack1) + "</td>\n            <td>";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "description", {hash:{}}) : helperMissing.call(depth0, "I18n", "description", {hash:{}});
  buffer += escapeExpression(stack1) + "</td>\n        </tr>\n    </thead>\n    <tbody>\n        ";
  foundHelper = helpers.results;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)}); }
  else { stack1 = depth0.results; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  if (!helpers.results) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </tbody>\n</table>\n\n<div class=\"modal large\" id=\"editModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"messageModalLabel\" aria-hidden=\"true\" style=\"display:none\">\n    <div class=\"modal-header\">\n        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n        <h3 id=\"myModalLabel\">Edit this group</h3>\n    </div>\n\n    <div class=\"modal-body\"></div>\n</div>\n";
  return buffer;});
})();