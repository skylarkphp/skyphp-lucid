define([
  "qscript/lang/Class", // declare
  "dojo/_base/lang",
  "dojo/data/ItemFileWriteStore",
  "dijit/form/_FormValueWidget",
  "qfacex/dijit/button/Button",
  "qfacex/dijit/input/TextBox",
  "qfacex/dijit/toolbar/Toolbar",
  "qfacex/dijit/container/ContentPane",
  "dojox/gfx",
  "dojox/gfx/Moveable",
  "dojox/grid/DataGrid",
  "openstar/desktop2/Application",
  "qfacex/dijit/container/deprecated/Window",
  "qfacex/dijit/infomation/StatusBar",
  "openstar/services/filesystem",
  "openstar/services/Registry",
  "openstar/ui/dialog",
  "dojo/i18n!./Todo/nls/labels",
  "dojo/i18n!./nls/apps",
  "dojo/i18n!openstar/nls/system",
  "dojo/i18n!openstar/nls/messages"
],function(Class,lang,ItemFileWriteStore,_FormValueWidget,Button,TextBox,Toolbar,ContentPane,gfx,Moveable,DataGrid,_App,Window,
  StatusBar,srvFilesystem,SrvRegistry,dialog,nlsLabels,nlsApps,nlsSystem,nlsMessages) {

	return Class.declare({
		"-parent-"		:	_App,
		
		"-interfaces-"	:	[],
		
		"--mixins--"	:	[],

		"-protected-"	:	{
			"-fields-"	:	{
			
			},
			
			"-methods-"	:	{
			
			}
		},
		
		"-public-"	:	{
			"-fields-"	:	{
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
			    init: function(args){
			      var labels = nlsLabels; //i18n.getLocalization("openstar.apps.Todo", "labels",this.lang);
			      var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
			      var win = this.win = new Window({
			      	app  : this,
			        title: app["Todo"],
			        width: "450px",
			        height: "250px",
			        onClose: lang.hitch(this, "kill")
			      });
			      var toolbar = new Toolbar({
			        region: "top"
			      });
			      var newTask = new Button({
			        label: labels.newTask,
			        iconClass: "icon-16-actions-list-add",
			        onClick: lang.hitch(this, "newTask")
			      });
			      toolbar.addChild(newTask);
			      var removeTask = new Button({
			        label: labels.removeTask,
			        iconClass: "icon-16-actions-list-remove",
			        onClick: lang.hitch(this, "removeTask")
			      });
			      toolbar.addChild(removeTask);
			      win.addChild(toolbar);
			      
			      var store = this.store = new SrvRegistry({
			        name: "tasks",
			        appname: this.sysname,
			        data: {
			          identifier: "id",
			          items: []
			        }
			      });
			      dojo.connect(store, "onSet", this, function(){ this.grid.setSortIndex(0, true); store.save(); });
			      dojo.connect(store, "onDelete", function(){ store.save(); });
			      dojo.connect(store, "onNew", function(){ store.save(); });

			      var grid = this.grid = new DataGrid({
			        store: store,
			        query: {id: "*"},
			        structure: [{
			          cells: [[
			            {field: "complete", name: labels.complete, editable: true, type: dojox.grid.cells.Bool, sort: "desc"},
			            {field: "description", name: labels.description, width: "auto", editable: true, type: dojox.grid.cells.Cell},
			            {field: "category", name: labels.category, editable: true, type: dojox.grid.cells.ComboBox, options: [], hidden: true} //hidden until we get this implemented
			          ]]
			        }]
			      });
			      var content = this.content = new ContentPane({region: "center"});
			      content.setContent(grid);
			      win.addChild(content);
			      win.show();
			      grid.startup();
			      setTimeout(lang.hitch(grid, "setSortIndex", 0, true), 200);
			    },
			    newTask: function(){
			      var labels = nlsLabels;//i18n.getLocalization("openstar.apps.Todo", "labels",this.lang);
			      this.store.newItem({
			        id: (new Date()).toString(),
			        complete: false,
			        description: labels.newTask,
			        category: ""
			      });
			    },
			    removeTask: function(){
			      this.grid.removeSelectedRows();
			    },
			    kill: function(){
			      if(!this.win.closed)
			        this.win.close();
			    }
			
			}
		},
		"-constructor-"	:	{
			"initialize"	:	[
				function(info){
					this.overrided(info);
				}				
			
			]
			
		}
	});

});

