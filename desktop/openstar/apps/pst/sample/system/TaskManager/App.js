define([
	 "dojo", // dojo
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
	 "openstar/desktop2/window/dialog",
	 "dojo/i18n!./nls/app"
	 
],function(dojo,ItemFileWriteStore,_FormValueWidget,Button,TextBox,Toolbar,Menu,MenuItem,ContentPane,gfx,Moveable,DataGrid,_App,Window,StatusBar,dialog,nlsApp) {

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
				    //make window
				    this.win = new Window({
			        	app  : this,
				        title: nlsApp.title,
				        width: "400px",
				        height: "450px",
						iconClass: "icon-16-apps-utilities-system-monitor",
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
								{field: "instance", name: nlsApp.instance},
			                    {field: "sysname", name: nlsApp.sysname},
			                    {field: "name", name: nlsApp.name},
			                    {field: "status", name: nlsApp.status}
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
			        var menu = this.menu = new Menu({});
			        var killApp = new MenuItem({
			            label: nlsApp.kill,
			            onClick: dojo.hitch(this, function(){
			               var row = this.grid.getItem(this.__rowIndex);
			               var id = this.store.getValue(row, "instance");
			               this.executeKill(id);
			            })
			        });
			        menu.addChild(killApp);

		        	var popup = new MenuItem({
			            label: "popup",
			            onClick: dojo.hitch(this, function(){
		       				dialog.inputTest({
								title:"test",
								message: "what is your name?",
								"scene"	: this.scene
							});
			            })
			        });
			        menu.addChild(popup);
			        

			        menu.startup();
			        this.grid.onRowContextMenu = dojo.hitch(this, function(e){
			            this.__rowIndex = e.rowIndex;
			            this.menu._openMyself(e);
			        });


			        this.timer = setTimeout(dojo.hitch(this, "update"), 1000);
			    },

				executeKill: function(id){
				    if (this.scene.getInstance(id).status != "killed"){
				        if(this.scene.kill(id)){
				        dialog.notify({
				          scene:this.scene,
				          message:nlsApp.killSuccess.replace("%s", id)
				         });
					}
					else {
						dialog.notify({
							message: nlsApp.killFail.replace("%s", id),
							scene:this.scene,
							type: "error"
						});
					}
				    }
				    else {
				        dialog.notify({
				            type: "warning",
				            scene:this.scene,
				            message: nlsApp.allreadyKilled
				        });
				
				    }
				
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

