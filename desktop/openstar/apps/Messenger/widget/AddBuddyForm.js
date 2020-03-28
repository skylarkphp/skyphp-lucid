/*
	Copyright (c) 2004-2008, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["openstar.apps.Messenger.widget.AddBuddyForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["openstar.apps.Messenger.widget.AddBuddyForm"] = true;
dojo.provide("openstar.apps.Messenger.widget.AddBuddyForm");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");

dojo.declare("openstar.apps.Messenger.widget.AddBuddyForm", dijit.form.Form, {
    widgetsInTemplate: true,
    templateString: null,
    templateString:"<form dojoAttachPoint='containerNode' dojoAttachEvent='onreset:_onReset,onsubmit:_onSubmit'>\n   <label for=\"${id}_username\">Buddy's Username:</label>\n   <input dojoType=\"dijit.form.TextBox\" name=\"username\" />\n   <div style=\"text-align: right; margin-top: 5px;\">\n      <div dojoType=\"dijit.form.Button\" class=\"dijitInline\" label=\"Cancel\" dojoAttachEvent=\"onClick:onCancel\"></div>\n      <div dojoType=\"dijit.form.Button\" class=\"dijitInline\" iconClass=\"icon-22-actions-list-add\" label=\"Add\" dojoAttachEvent=\"onClick:onSubmit\"></div>\n   </div>\n</form> \n",
    onSubmit: function(){
    },
    onCancel: function(){
    }
});

}
