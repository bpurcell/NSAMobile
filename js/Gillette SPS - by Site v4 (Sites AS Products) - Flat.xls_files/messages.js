(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['messages.html'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n                    ";
  foundHelper = helpers.results;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},inverse:self.noop,fn:self.program(2, program2, data)}); }
  else { stack1 = depth0.results; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  if (!helpers.results) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(2, program2, data)}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  return buffer;}
function program2(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n                    <tr id=\"";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" data-toggle=\"modal\"  data-target=\"#modal\" data-title=\"Message\" data-remote=\"message/";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" class=\"remote-modal-trigger\" >\n                        <td class=\"type\">";
  foundHelper = helpers.from;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.from; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</td>\n                        <td class=\"details\">\n                            ";
  stack1 = depth0.subject;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        </td>\n                    </tr>\n                    ";
  return buffer;}
function program3(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n                            ";
  foundHelper = helpers.subject;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.subject; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n                            ";
  return buffer;}

function program5(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n                            ";
  foundHelper = helpers.message;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.message; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n                            ";
  return buffer;}

  buffer += "<div class=\"span12 messages user-toggle\">\n    <h3><i class=\" icon-envelope\"><span class=\"notification-count direct_unread_count\" ></span></i> ";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "messages", {hash:{}}) : helperMissing.call(depth0, "I18n", "messages", {hash:{}});
  buffer += escapeExpression(stack1) + " </h3>\n    <div  style=\"max-height:400px;overflow:auto;\">\n        <table class=\"table table-hover\">\n            <thead>\n                <tr>\n                    <td>";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "from", {hash:{}}) : helperMissing.call(depth0, "I18n", "from", {hash:{}});
  buffer += escapeExpression(stack1) + "</td>\n                    <td>";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "message", {hash:{}}) : helperMissing.call(depth0, "I18n", "message", {hash:{}});
  buffer += escapeExpression(stack1) + "</td>\n                </tr>\n            </thead>\n            <tbody>\n                ";
  stack1 = depth0.results;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </tbody>\n        </table>\n    </div>\n</div>\n";
  return buffer;});
})();