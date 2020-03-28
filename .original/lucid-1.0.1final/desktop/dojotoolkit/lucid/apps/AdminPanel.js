dojo.provide("lucid.apps.AdminPanel");
dojo.require("dijit.layout.SplitContainer");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.ProgressBar");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid._data.editors");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.Menu");
dojo.require("dijit.Dialog");
dojo.require("dojox.widget.FileInputAuto");
lucid.addDojoCss("dojox/grid/resources/Grid.css");
lucid.addDojoCss("dojox/widget/FileInput/FileInput.css");

//require parts of admin panel
dojo.require("lucid.apps.AdminPanel._base");
dojo.require("lucid.apps.AdminPanel.apps");
dojo.require("lucid.apps.AdminPanel.groups");
dojo.require("lucid.apps.AdminPanel.permissions");
dojo.require("lucid.apps.AdminPanel.quota");
dojo.require("lucid.apps.AdminPanel.shares");
dojo.require("lucid.apps.AdminPanel.themes");
dojo.require("lucid.apps.AdminPanel.users");

//localization
dojo.requireLocalization("lucid", "apps");
dojo.requireLocalization("lucid", "system");
dojo.requireLocalization("lucid", "common");
dojo.requireLocalization("lucid", "permissions");
dojo.requireLocalization("lucid.ui", "accountInfo");
dojo.requireLocalization("lucid.ui", "menus");
