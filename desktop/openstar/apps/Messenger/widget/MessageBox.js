/*
	Copyright (c) 2004-2008, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["openstar.apps.Messenger.widget.MessageBox"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["openstar.apps.Messenger.widget.MessageBox"] = true;
dojo.provide("openstar.apps.Messenger.widget.MessageBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.layout.BorderContainer");

dojo.declare("openstar.apps.Messenger.widget.MessageBox", [dijit._Widget, dijit._Templated, dijit._Contained], {
    templateString:"<div style=\"height: 20px;\">\n    <!--<div dojoType=\"dijit.layout.BorderContainer\" gutters=\"false\" style=\"position: absolute; top: 0px; left: 0px; width: 100%; height: 20px;\">\n        <div dojoType=\"dijit.layout.ContentPane\" region=\"center\">-->\n            <input dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"inputBox\" style=\"width: 100%\" /> \n        <!--</div>\n        <div dojoType=\"dijit.layout.ContentPane\" region=\"right\" style=\"width: 80px\">\n            <div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"sendButton\" label=\"Send\" dojoAttachEvent=\"onClick:_onClick\"></div>\n        </div>\n    </div>-->\n</div>\n\n",
    widgetsInTemplate: true,
    postCreate: function(){
        this.inherited(arguments);
        dojo.connect(this.inputBox.domNode, "onkeyup", this, "_onKey");
    },
    onSend: function(value){
        
    },
    _onSend: function(value){
        if(value != "")
            this.onSend(value);
        this.inputBox.attr("value", "");
    },
    _onKey: function(e){
        if(e.keyCode == dojo.keys.ENTER)
            this._onSend(this.inputBox.attr("value"));
    },
    _onClick: function(){
        this._onSend(this.inputBox.attr("value"));
    }
});

}
