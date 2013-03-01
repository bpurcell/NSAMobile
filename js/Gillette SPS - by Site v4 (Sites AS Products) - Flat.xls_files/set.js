(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['set.html'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n<div class=\"navbar setnav row-fluid\">\n    <div class=\"navbar-inner\">\n        <a class=\"brand\" href=\"#\">";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "datasets", {hash:{}}) : helperMissing.call(depth0, "I18n", "datasets", {hash:{}});
  buffer += escapeExpression(stack1) + "</a>\n        <ul class=\"nav pull-right\" id=\"setTabs\">\n            <li class=\"wide active\">\n                <a href=\"#wide\"><i class=\"icon-sign-blank\"></i></a>\n            </li>\n            <li class=\"thumb-lg\">\n                <a href=\"#\"><i class=\"icon-th-large\"></i></a>\n            </li>\n            <li class=\"thumb-sm\">\n                <a href=\"#thumb-sm\"><i class=\"icon-th\"></i></a>\n            </li>\n            <li class=\"list\">\n                <a href=\"#list\"><i class=\"icon-th-list\"></i></a>\n            </li>\n            <li>\n                <a href=\"/set/new_dataset\"> <i class=\"icon-plus\"></i> ";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "create_new", {hash:{}}) : helperMissing.call(depth0, "I18n", "create_new", {hash:{}});
  buffer += escapeExpression(stack1) + "</a>\n            </li>\n        </ul>\n\n    </div>\n</div>\n\n<div class=\"row-fluid sets wide mustache\" id=\"set-container\">\n\n    <div class=\"arrow left\">\n        <i class=\"icon-angle-left\"></i>\n    </div>\n    ";
  foundHelper = helpers.results;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},inverse:self.noop,fn:self.program(2, program2, data)}); }
  else { stack1 = depth0.results; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  if (!helpers.results) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(2, program2, data)}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n    <div class=\"arrow right\">\n        <i class=\"icon-angle-right\"></i>\n    </div>\n\n</div>\n\n<script type=\"text/javascript\">\n    $(document).on({\n        click: function () {\n            $(\".active\").removeClass(\"active\");\n            $(this).addClass(\"active\");\n            $(\"#set-container\").removeClass().addClass(\"row-fluid sets \"+$(this).attr(\"class\"));\n        }\n    }, \"#setTabs li\");\n    \n    $(document).on({\n        click: function () {\n            var id = $(this).attr(\"id\");\n                window.location = \"/set/\"+id;\n        }\n    }, \".thumb-lg .set, .thumb-sm .set\");\n    \n    $(document).on({\n        click: function () {\n            var id = $(this.parent().parent()).attr(\"id\");\n                window.location = \"/set/\"+id;\n        }\n    }, \".list .image\");\n\n    //Time to display the wide set view in its own little fake paginator dealio\n    //First, lets figure out some basic settings. we ALWAYS start on num-0, soooo....\n    startSet = (\"num-0\");\n    currentSet = $(\".active-set\");\n    newSet = startSet.split(\"-\")[1];\n    totalSets = ($('.set').length);\n\n    $(document).on({\n        click: function () {\n            if($(this).hasClass(\"right\")){\n                newSet = (parseInt(newSet) +1 );\n                $(\".active-set\").removeClass(\"active-set\");\n                if(newSet > totalSets-1){\n                    $(\".num-0\").addClass(\"active-set\");\n                    newSet = 0;\n                }else{\n                    $(\".num-\"+newSet).addClass(\"active-set\");\n                }\n            }else{\n                newSet = (parseInt(newSet) -1 );\n                $(\".active-set\").removeClass(\"active-set\");\n                if(newSet < 0){\n                    $(\".num-\"+(totalSets-1)).addClass(\"active-set\");\n                    newSet = totalSets-1;\n                }else{\n                    $(\".num-\"+newSet).addClass(\"active-set\");\n                }\n            }\n        }\n    }, \".arrow\");\n\n\n    //Since tthis isn't a php fpr each, this function fills in the necessary num-n class for each set as it's loaded onto the page\n    countSets = 0;\n    $( \".set\" ).each(function( index ) {\n        $(this).addClass(\"num-\"+(parseInt(countSets)));\n        if(countSets == 0){\n            $(\".num-0\").addClass(\"active-set\");\n        }\n        countSets++\n    });\n\n    // Set the cookie if we change views\n    $('.navbar.setnav.row-fluid ul.nav li').each(function(){\n        var cl = $(this).attr('class');\n        if (!cl) return;\n\n        // var d = new Date().setTime(date.getTime() + (30 * 60 * 1000));\n        $(this).click(function(d){\n            $.cookie(\"default-set-view\", cl); // , { expires: d });\n        });    \n    });\n\n    // See we have a cookie to tell is which view to use.\n    var view = Sourcemap.cookie(\"default-set-view\");\n    if (view){\n        $('.navbar.setnav.row-fluid ul.nav li.' + view +' a').trigger('click');\n    }\n\n</script>\n";
  return buffer;}
function program2(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "  \n        <div class=\"set\" id=\"";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\">\n            <div class=\"image\">\n                <img src=\"/file/set_photo/";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" alt=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n            </div>\n            <div class=\"details\">\n                <h3><a href=\"/set/";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a></h3> \n                <p>By: <strong>";
  foundHelper = helpers.created_by;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.created_by; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</strong></br>\n                    Group: <strong>";
  foundHelper = helpers.group_name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.group_name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</strong></br>\n                     Created: <span id=\"date-";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" style=\"font-weight:bold\"></span>\n                    <script type=\"text/javascript\"> \n                        $(\" #date-";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\").append(Sourcemap.mongoidToDate(\"";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\"));\n                    </script></strong>\n                    </p>\n                <div class=\"menu well well-small\">\n                    <ul class=\"nav nav-list\">\n                        <li><a data-toggle=\"modal\"  data-title=\"<i class='icon-plus-sign'></i> Submit a report\" data-target=\"#modal\" class=\"upload-trigger remote-modal-trigger\" data-type=\"upload_profile-photo\" href=\"/thing/report/";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "?redirect=dashboard\"> <i class=\"icon-plus-sign\"></i> ";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "submit_a_report", {hash:{}}) : helperMissing.call(depth0, "I18n", "submit_a_report", {hash:{}});
  buffer += escapeExpression(stack1) + "</a></li>\n                        <li><a href=\"/set/";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\"> <i class=\"icon-fullscreen\"></i> ";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "view_dataset", {hash:{}}) : helperMissing.call(depth0, "I18n", "view_dataset", {hash:{}});
  buffer += escapeExpression(stack1) + "</a></li>\n                        <li><a href=\"/set/edit/";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\"> <i class=\"icon-cogs\"></i> ";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "edit_title", {hash:{}}) : helperMissing.call(depth0, "I18n", "edit_title", {hash:{}});
  buffer += escapeExpression(stack1) + "</a></li>\n                        <li><a href=\"/file/download/";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "/xls\"> <i class=\"icon-download-alt\"></i> ";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "download", {hash:{}}) : helperMissing.call(depth0, "I18n", "download", {hash:{}});
  buffer += escapeExpression(stack1) + " Excel</a></li>\n                        <li><a href=\"/file/download/";
  stack1 = depth0._id;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.$id;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "/kml\"> <i class=\"icon-download-alt\"></i> ";
  foundHelper = helpers.I18n;
  stack1 = foundHelper ? foundHelper.call(depth0, "download", {hash:{}}) : helperMissing.call(depth0, "I18n", "download", {hash:{}});
  buffer += escapeExpression(stack1) + " KML</a></li>\n                    </ul>\n                </div>\n\n                ";
  stack1 = depth0.description;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </div>\n        </div>\n";
  return buffer;}
function program3(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n                    <p class=\"description\">";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n                ";
  return buffer;}

function program5(depth0,data) {
  
  
  return "\n<p>There are no datasets in this group. <a href=\"/set/new_dataset\">Create one</a></p>\n";}

  stack1 = depth0.results;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(5, program5, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;});
})();