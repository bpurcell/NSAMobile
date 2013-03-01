(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['activities.html'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n                ";
  foundHelper = helpers.results;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},inverse:self.noop,fn:self.program(2, program2, data)}); }
  else { stack1 = depth0.results; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  if (!helpers.results) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(2, program2, data)}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  return buffer;}
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                 <tr id=\"";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" data-toggle=\"modal\"  data-target=\"#modal\" data-title=\"Message\" data-remote=\"message/activity/";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" class=\"remote-modal-trigger\" >\n                    <td class=\"type\"> \n                        ";
  stack1 = depth0.subject;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        </td>\n                </tr>\n                ";
  return buffer;}
function program3(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n                            ";
  foundHelper = helpers.subject;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.subject; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n                        ";
  return buffer;}

function program5(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n                            ";
  foundHelper = helpers.message;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.message; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n                        ";
  return buffer;}

  buffer += "<div class=\"span12 messages user-toggle\">\n    <h3><i class=\" icon-envelope\"><span class=\"notification-count activity_count\" ></span></i> ";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "newsfeed", {hash:{}}) : helperMissing.call(depth0, "I18n", "newsfeed", {hash:{}});
  buffer += escapeExpression(stack1) + "</h3>\n    <div  style=\"max-height:400px;overflow:auto;\">\n    <table class=\"table table-hover\">\n        <tbody>\n            ";
  stack1 = depth0.results;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </tbody>\n    </table>\n    </div>\n</div>\n";
  return buffer;});
})();