define([
	"qscript/lang/Class", // declare
	"dojo/data/ItemFileWriteStore",
	"dijit/form/_FormValueWidget",
	"qfacex/dijit/button/Button",
	"qfacex/dijit/input/TextBox",
	"qfacex/dijit/toolbar/Toolbar",
	"qfacex/dijit/menu/Menu",
	"qfacex/dijit/menu/MenuItem",
	"qfacex/dijit/container/ContentPane",
	"dojox/gfx",
	"dojox/gfx/Moveable",
	"dojox/grid/DataGrid",
	"openstar/desktop2/Application",
	"qfacex/dijit/container/deprecated/Window",
	"qfacex/dijit/infomation/StatusBar",
	"openstar/services/filesystem",
	"openstar/ui/dialog",
	"dojo/i18n!openstar/nls/common",
	"dojo/i18n!./nls/apps",
	"dojo/i18n!openstar/nls/system",
	"dojo/i18n!openstar/nls/messages"

],function(Class,ItemFileWriteStore,_FormValueWidget,Button,TextBox,Toolbar,Menu,MenuItem,ContentPane,gfx,Moveable,DataGrid,_App,Window,StatusBar,srvFilesystem,dialog,nlsCommon,nlsApps,nlsSystem,nlsMessages) {

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
				kill: function(){
				    clearTimeout(this.timer);
				    if (!this.win.closed){
				        this.win.close();
				    }
				},
				init: function(args){
				    var nls = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
			        var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
				    //make window
				    this.win = new Window({
			        	app  : this,
				        title: app["Task Manager"],
				        width: "400px",
				        height: "450px",
						iconClass: this.iconClass,
						onClose: dojo.hitch(this, "kill")
				    });
					var content = this.content = new ContentPane({region: "center"});
			        var store = this.store = new ItemFileWriteStore({
			            data: {
			                id: "instance",
			                items: this.scene.getInstancesStatus()
			            }
			        });
				    
			        this.grid = new DataGrid({
				        region: "center",
			            structure: [{
							cells: [[
								{field: "instance", name: sys.instance},
			                    {field: "sysname", name: sys.sysname},
			                    {field: "name", name: nls.name},
			                    {field: "status", name: sys.status}
							]]
						}],
			            store: store,
			            query: {instance: "*"}
				    });
					content.setContent(this.grid.domNode);
				    this.win.addChild(content);
				    this.win.show();
				    this.win.startup();
				    this.timer = setTimeout(dojo.hitch(this, "update"), 1000);
			        this.grid.startup();
				},
				
			    update: function(){
			        var processes = this.scene.getInstancesStatus();
			        dojo.forEach(processes, function(instance){
			            this.store.fetchItemByIdentity({
			                identity: instance.instance,
			                onItem: dojo.hitch(this, function(item){
			                    if(!this.store.isItem(item)){
			                        this.store.newItem(instance);
			                        return;
			                    }
			                    for(var key in instance){
			                        if(this.store.getValue(item, key) != instance[key])
			                        this.store.setValue(item, key, instance[key]);
			                    }
			                })
			            });
			        }, this);
			        this.store.fetch({
			            query: {instance: "*"},
			            onItem: dojo.hitch(this, function(item){
			                var exists = false;
			                var id = this.store.getIdentity(item);
			                dojo.forEach(processes, function(instance){
			                    if(id==instance.instance)
			                        exists=true;
			                });
			                if(!exists){
			                    this.store.deleteItem(item);
			                }
			            })
			        })
			        //make menu
			        var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
			        var menu = this.menu = new Menu({});
			        var killApp = new MenuItem({
			            label: sys.kill,
			            onClick: dojo.hitch(this, function(){
			               var row = this.grid.getItem(this.__rowIndex);
			               var id = this.store.getValue(row, "instance");
			               this.executeKill(id);
			            })
			        });
			        menu.addChild(killApp);
			        menu.startup();
			        this.grid.onRowContextMenu = dojo.hitch(this, function(e){
			            this.__rowIndex = e.rowIndex;
			            this.menu._contextMouse();
			            this.menu._openMyself(e);
			        });


			        this.timer = setTimeout(dojo.hitch(this, "update"), 1000);
			    },

				executeKill: function(id){
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
				    if (this.desktop.getInstance(id).status != "killed"){
				        if(this.desktop.kill(id)){
				        dialog.notify({
				          scene:this.scene,
				          message:sys.killSuccess.replace("%s", id)
				         });
					}
					else {
						dialog.notify({
							message: sys.killFail.replace("%s", id),
							scene:this.scene,
							type: "error"
						});
					}
				    }
				    else {
				        dialog.notify({
				            type: "warning",
				            scene:this.scene,
				            message: sys.allreadyKilled
				        });
				
				    }
			//	    this.home();
				
				}/*,
				home: function(){
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
				    var data = this.desktop.getInstances();
				    var html = "<table style='width: 100%;'><thead><tr style='background-color: #dddddd;'><td>"+sys.name+"</td><td>"+sys.instance+"</td><td>"+sys.id+"</td><td>"+sys.status+"</td><td>"+sys.actions+"</td></tr></thead><tbody>";
					var desktop = this.desktop;
				    for (var x = 0; x < data.length; x++){
				        if (typeof(data[x]) == "object"){
				            // Error handler, for some reason, it sometimes fucksup.
				            if (data[x].status != "killed"){
				                html += "<tr><td>" + (app[data[x].name] || data[x].name) + "</td><td>" + data[x].instance + "</td><td>" + data[x].sysname + "</td><td>" + sys[data[x].status] + "</td><td><a href='javascript:void(0);' onClick='desktop.instances[" + this.instance + "].executeKill("+ data[x].instance + ")'>"+sys.kill+"</a></td></tr>";
				
				            }
				
				        }
				
				    }
				    this.main.setContent(html);
				    this.timer = setTimeout(dojo.hitch(this, this.home), 1000);
				}*/
			
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

