(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['things.html'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n        <tr>\n            <td>";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "</td>\n            <td><i>";
  foundHelper = helpers.type;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.type; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</i><br/></td>\n            <td>\n                <b>";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</b><br/>\n                ";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n            </td>\n        </tr>\n        ";
  return buffer;}

  buffer += "<table class=\"table table-hover table-striped list-data\">\n    <thead>\n        <tr>\n            <td>";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "id", {hash:{}}) : helperMissing.call(depth0, "I18n", "id", {hash:{}});
  buffer += escapeExpression(stack1) + "</td>\n            <td>";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "type", {hash:{}}) : helperMissing.call(depth0, "I18n", "type", {hash:{}});
  buffer += escapeExpression(stack1) + "</td>\n            <td>";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "description", {hash:{}}) : helperMissing.call(depth0, "I18n", "description", {hash:{}});
  buffer += escapeExpression(stack1) + "</td>\n        </tr>\n    </thead>\n    <tbody>\n        ";
  foundHelper = helpers.results;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)}); }
  else { stack1 = depth0.results; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  if (!helpers.results) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </tbody>\n</table>\n";
  return buffer;});
})();