dojo.provide("lucid.apps.Contacts.ContactForm");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Form");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.requireLocalization("lucid.apps.Contacts", "Contacts");

dojo.declare("lucid.apps.Contacts.ContactForm", dijit.form.Form, {
    widgetsInTemplate: true,
    templateString: null,
    templatePath: dojo.moduleUrl("lucid.apps.Contacts.templates", "ContactForm.html"),
    postCreate: function(){
        var values = {};
        dojo.forEach(this.store.getAttributes(this.item), function(key){
            values[key] = this.store.getValue(this.item, key);
        }, this);
        this.attr('value', values);
        this.doTranslations();
    },
    doTranslations: function(){
        var nls = dojo.i18n.getLocalization("lucid.apps.Contacts", "Contacts");
        for(var key in this){
            if(key.indexOf("LabelNode") === -1) continue;
            var str = key.match(/[a-z]+/)[0];
            console.log(this[key], str, nls[str]);
            if(nls[str])
                this[key].childNodes[0].data = nls[str]+":";
        }
        this.saveButton.attr("label", nls.save);
        this.cancelButton.attr("label", nls.cancel);
        this.contactTab.attr("title", nls.contact);
        this.addressTab.attr("title", nls.address);
    },
    onSubmit: function(){
        var values = this.getValues();
        for(var key in values){
            var value = values[key];
            this.store.setValue(this.item, key, value);
        }
        setTimeout(dojo.hitch(this.store, "save"), 200);
    },
    onCancel: function(){
    }
});
