dojo.provide("lucid.ui.applets.User");
dojo.require("dijit.form.Button");

dojo.declare("lucid.ui.applets.User", lucid.ui.Applet, {
    dispName: "User",
    postCreate: function(){
        var button = new dijit.form.Button({
            label: " ",
            onClick: dojo.hitch(lucid.app, "launch", "AccountInfo")
        });
        lucid.user.get({onComplete: function(data){
            button.attr("label", data.name || data.username);
        }});
        this.containerNode.appendChild(button.domNode);
        this.inherited(arguments);
    }
});
