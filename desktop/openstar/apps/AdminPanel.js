define([
	"qscript/lang/Class", // declare
	 "dojo/data/ItemFileReadStore",
	 "dojo/data/ItemFileWriteStore",
	 "dijit/form/_FormValueWidget",
	 "qfacex/dijit/button/Button",
	 "qfacex/dijit/input/TextBox",
	 "qfacex/dijit/selection/RadioButton",
   "qfacex/dijit/button/DropDownButton",
   "qfacex/dijit/selection/FilteringSelect",
   "qfacex/dijit/numeric/NumberSpinner",
	 "qfacex/dijit/toolbar/Toolbar",
	 "qfacex/dijit/menu/Menu",
	 "qfacex/dijit/menu/MenuItem",
	 "dijit/TooltipDialog",
	 "qfacex/dijit/container/ContentPane",
	 "dojox/gfx",
	 "dojox/gfx/Moveable",
	 "dojox/grid/DataGrid",
	 "dojox/grid/cells",
	 "dojox/form/FileInputAuto",
	 "openstar/system2/Runtime",
	 "openstar/desktop2/Application",
	 "qfacex/dijit/container/deprecated/Window",
	 "qfacex/dijit/infomation/StatusBar",
	 "openstar/services/general",
	 "openstar/services/filesystem",
	 "openstar/services/admin",
	 "openstar/services/theme",
	 "openstar/services/app",
	 "openstar/services/crosstalk",
	 "openstar/services/user",
	 "openstar/ui/dialog",
	 "dojo/i18n!openstar/nls/common",
	 "dojo/i18n!./nls/apps",
	 "dojo/i18n!openstar/nls/system",
	 "dojo/i18n!openstar/nls/messages",
	 "dojo/i18n!openstar/nls/permissions",
	 "dojo/i18n!openstar/desktop/nls/menus",
	 "dojo/i18n!./nls/accountInfo"	 
],function(Class,ItemFileReadStore,ItemFileWriteStore,_FormValueWidget,Button,TextBox,RadioButton,DropDownButton,FilteringSelect,NumberSpinner,Toolbar,Menu,MenuItem,TooltipDialog,ContentPane,gfx,Moveable,DataGrid,cells,FileInputAuto,Runtime,_App,Window,StatusBar,srvGeneral,srvFilesystem,srvAdmin,srvTheme,srvApp,srvCrosstalk,srvUser,dialog,nlsCommon,nlsApps,nlsSystem,nlsMessages,nlsPermissions,nlsMenus,nlsAccountInfo) {

	var AdminPanel =  Class.declare({
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
				windows: []
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				kill: function(){
					if(!this.win.closed){ this.win.close(); }
					if(this._userMenu){ this._userMenu.destroy(); }
					dojo.forEach(this.windows, function(win){
						if(!win.closed) win.close();
					});
				},
				init: function(args){
					var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					//make window
					this.win = new Window({
			      app: this,
						title: app["Administration Panel"],
						iconClass: this.iconClass,
						onClose: dojo.hitch(this, "kill"),
						design: "sidebar"
					});
					var pane = new ContentPane({
						minSize: 120,
						style: "width: 120px;",
						region: "left",
						splitter: true
					});
					var menu = new Menu({});
					menu.domNode.style.width="100%";
					var item = new MenuItem({label: sys.home,
				       iconClass: "icon-16-actions-go-home",
				       onClick: dojo.hitch(this, this.home)});
					menu.addChild(item);
					var item = new MenuItem({label: sys.apps,
				       iconClass: "icon-16-categories-applications-other",
				       onClick: dojo.hitch(this, this.apps)});
					menu.addChild(item);
					var item = new MenuItem({label: sys.users,
				       iconClass: "icon-16-apps-system-users",
				       onClick: dojo.hitch(this, this.users)});
					menu.addChild(item);
					var item = new MenuItem({label: sys.groups,
				       iconClass: "icon-16-apps-system-users",
				       onClick: dojo.hitch(this, this.groups)});
					menu.addChild(item);
					var item = new MenuItem({label: sys.permissions,
				       iconClass: "icon-16-apps-system-users",
				       onClick: dojo.hitch(this, this.permissions)});
					menu.addChild(item);
					var item = new MenuItem({label: sys.quota,
				       iconClass: "icon-16-devices-drive-harddisk",
				       onClick: dojo.hitch(this, this.quota)});
					menu.addChild(item);
					var item = new MenuItem({label: sys.themes,
				       iconClass: "icon-16-apps-preferences-desktop-theme",
				       onClick: dojo.hitch(this, this.themes)});
					menu.addChild(item);
					pane.setContent(menu.domNode);
					this.win.addChild(pane);
					this.main = new ContentPane({region: "center"});
					this.win.addChild(this.main);
					this.toolbar = new Toolbar({region: "top"});
					this.win.addChild(this.toolbar);
					this.win.show();
					this.win.startup();
					this.win.onClose = dojo.hitch(this, this.kill);
					setTimeout(dojo.hitch(this, this.home), 100);
				},
				home: function(){
					var sys =nlsSystem;// i18n.getLocalization("desktop", "system",this.lang);
					this.toolbar.destroyDescendants();
					srvAdmin.users.online(dojo.hitch(this, function(data){
						var h = sys.usersOnline+": <div dojoType='dijit.ProgressBar' progress='"+data.online+"' maximum='"+data.total+"'></div>";
						srvAdmin.diskspace(dojo.hitch(this, function(data){
							h += sys.diskUsage+": <div dojoType='dijit.ProgressBar' progress='"+(data.total-data.free)+"' maximum='"+data.total+"'></div>"
							this.main.setContent(h);
						}));
					}));
				},
				permDialog: function(grid, lbl, permissions, callback){
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var permsNls = nlsPermissions;//i18n.getLocalization("desktop", "permissions",this.lang);
					var row = grid.getItem(this.__rowIndex);
					var perms = permissions(row);
					this.__rowIndex = null;
					var win = new Window({
			        	app  : this,
						title: sys.permsFor.replace("%s", lbl(row))
					});
					this.windows.push(win);
					var main = new ContentPane({region: "center"});
					var tab = document.createElement("table");
					dojo.style(tab, "width", "100%");
					dojo.style(tab, "height", "100%");
					dojo.style(tab, "overflow-y", "auto");
					tab.innerHTML = "<tr><th>"+sys.name+"</td><th>"+sys.description+"</th><th>"+sys.allow+"</th><th>"+sys.deny+"</th><th>"+sys["default"]+"</th></tr>";
					var radioWidgets = {};
					srvAdmin.permissions.list(dojo.hitch(this, function(list){
						dojo.forEach(list, function(item){
							var tr = document.createElement("tr");
							
							var td = document.createElement("td");
							td.innerHTML = item.name;
							tr.appendChild(td);
							var td = document.createElement("td");
							td.innerHTML = permsNls[item.name] || item.description;
							tr.appendChild(td);
							
							var td = document.createElement("td");
							var allow = new RadioButton({
								name: item.name+this.instance+lbl(row)
							});
							allow.setChecked(perms[item.name] == true);
							td.appendChild(allow.domNode);
							tr.appendChild(td);
							var td = document.createElement("td");
							var deny = new RadioButton({
								name: item.name+this.instance+lbl(row)
							});
							deny.setChecked(perms[item.name] == false);
							td.appendChild(deny.domNode);
							tr.appendChild(td);
							var td = document.createElement("td");
							var def = new RadioButton({
								name: item.name+this.instance+lbl(row)
							});
							def.setChecked(typeof perms[item.name] == "undefined");
							td.appendChild(def.domNode);
							tr.appendChild(td);
							
							tab.appendChild(tr);
							radioWidgets[item.name] = {
								def: def,
								deny: deny,
								allow: allow
							};
						}, this);
						main.setContent(tab);
						win.addChild(main);
						var bottom = new ContentPane({region: "bottom"});
						var cont = document.createElement("div");
						var cancel = new Button({
							label: "Cancel",
							onClick: dojo.hitch(win, "close")
						})
						cont.appendChild(cancel.domNode);
						var save = new Button({
							label: cmn.save,
							onClick: dojo.hitch(this, function(){
								var newPerms = {};
								dojo.forEach(list, function(item){
									if(radioWidgets[item.name].def.checked == true) return;
									if(radioWidgets[item.name].deny.checked == true) newPerms[item.name] = false;
									if(radioWidgets[item.name].allow.checked == true) newPerms[item.name] = true;
								});
								callback(row, newPerms);
								win.close();
							})
						})
						cont.appendChild(save.domNode);
						dojo.addClass(cont, "floatRight");
						bottom.setContent(cont);
						win.addChild(bottom);
						win.show();
					}));
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


	Class.extend(AdminPanel, {
		"-public-"	:	{
			"-fields-"	:	{
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				apps: function(){
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var apps = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
					var mnus = nlsMenus;//i18n.getLocalization("desktop.ui", "menus",this.lang);
					this.toolbar.destroyDescendants();
					var button = new Button({
						label: sys.installAppPackage,
						onClick: dojo.hitch(this, "installPackage")
					});
					this.toolbar.addChild(button);
					
					srvApp.list(dojo.hitch(this, function(data){
						for(var i=0;i<data.length;i++){
							data[i].filetypes = data[i].filetypes.join(", ");
							data[i].compatible = data[i].compatible.join(", ");
							data[i].name = apps[data[i].name] || data[i].name;
							data[i].category = mnus[data[i].category.toLowerCase()];
							delete data[i].files;
						};
						var layout = [{
							cells: [[]]
						}];
						//make headers
						for(var field in data[0]){
							var args = {
								name: sys[field],
								field: field
							};
							layout[0].cells[0].push(args);
						}
						
						this._appStore = new ItemFileWriteStore({
							data: {
								identifier: "sysname",
								items: data
							}
						});
						var grid = this._appGrid = new DataGrid({
							structure: layout,
			                store: this._appStore,
			                query: {sysname: "*"},
			                autoWidth:true,
			                autoHeight:true
						});
						if(this._con) dojo.disconnect(this._con);
						this._con = dojo.connect(this.main, "resize", grid, "resize");
						dojo.connect(this._appStore, "onDelete", this, function(a){
							srvApp.remove(a.sysname[0]); //that feels really hackish
						})
						this.main.setContent(this._appGrid.domNode);
						this._appGrid.render();
						//dojo.style(this._appGrid.domNode,"left:0px;top:0px");
						var menu = this._appMenu = new Menu({});
						dojo.forEach([
							{
								label: cmn["delete"],
								onClick: dojo.hitch(this, function(e){
									var row = this._appGrid.getItem(this.__rowIndex);
									dialog.yesno({
										title: sys.appDelConfirm,
										scene:this.scene,
										message: sys.delFromSys.replace("%s", row.name),
										onComplete: dojo.hitch(this, function(a){
											if(a == false) return;
											this._appStore.deleteItem(row);
										})
									})
								})
							}
						], function(item){
							var menuItem = new dijit.MenuItem(item);
							menu.addChild(menuItem);
						});
						this._appGrid.onRowContextMenu = dojo.hitch(this, function(e){
							this.__rowIndex = e.rowIndex;
							this._appMenu._contextMouse();
							this._appMenu._openMyself(e);
						});
						document.body.appendChild(menu.domNode);
						this.win.layout();
					}));
				},
				installPackage: function(){
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var win = new Window({
			      app  : this,
						title: sys.installAppPackage,
						width: "300px",
						height: "200px"
					});
					this.windows.push(win);
					var main = new ContentPane({region: "center"});
					var div = document.createElement("div");
					dojo.addClass(div, "tundra");
					div.innerHTML = sys.installAppInstructions;
					var uploader = new FileInputAuto({
						name: "uploadedfile",
						url: srvGeneral.xhr("core.app.install.package"),
						onComplete: dojo.hitch(this, function(data,ioArgs,widgetRef){
							if(data.status && data.status == "success"){
								widgetRef.overlay.innerHTML = sys.appInstallSuccess;
								//check for compatibility
								if(!data.compatible){
								    dialog.alert({
								        title: sys.notCompatible,
								        scene:this.scene,
								        message: sys.notCompatibleText
								    });
								}
								this.apps.call(this, []);
							}else{
								widgetRef.overlay.innerHTML = cmn.error+": "+data.error;
								console.log('error',data,ioArgs);
							}
							dojo.publish("updateMenu", []);
						})
					});
					div.appendChild(uploader.domNode);
					main.setContent(div);
					win.addChild(main);
					var bottom = new ContentPane({region: "bottom"});
						var cont = document.createElement("div");
						var close = new Button({
							label: cmn.close,
							onClick: dojo.hitch(win, "close")
						});
						cont.appendChild(close.domNode);
						dojo.addClass(cont, "floatRight");
						bottom.setContent(cont);
						win.addChild(bottom);
					win.show();
					dojo.style(uploader.inputNode, "width", "163px");
					uploader.startup();
				}
			
			}
		}
	});


	Class.extend(AdminPanel, {
		"-public-"	:	{
			"-fields-"	:	{
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				groups: function(){
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					this.toolbar.destroyDescendants();
					var button = new DropDownButton({
						label: sys.createNewGroup,
						dropDown: this.createGroupDialog()
					});
					this.toolbar.addChild(button);
					srvAdmin.groups.list(dojo.hitch(this, function(data){
						for(var i=0;i<data.length;i++){
							data[i].permissions = dojo.toJson(data[i].permissions);
						};
						//make headers (need to do it manually unfortunatly)
						var layout = [{
							cells: [[
								{name: sys.name, field: "name"},
								{name: sys.description, field: "description", editable: true, type: dojox.grid.cells.Cell}
							]]
						}];
						this._groupStore = new ItemFileWriteStore({
							data: {
								identifier: "id",
								items: data
							}
						});
						var grid = this._groupGrid = new DataGrid({
							structure: layout,
			                store: this._groupStore,
			                query: {id: "*"},
			                autoWidth:true,
			                autoHeight:true
						});
						if(this._con) dojo.disconnect(this._con);
						this._con = dojo.connect(this.main, "resize", grid, "resize");
						dojo.connect(this._groupStore, "onDelete", this, function(a){
							srvAdmin.groups.remove(a.id[0]); //that feels really hackish
						})
						dojo.connect(this._groupStore, "onSet", this, function(item, attribute, oldVal, newVal){
							if(attribute == "permissions") return;
							var id = this._groupStore.getValue(item, "id");
							if(id == false) return;
							var args = {id: id};
							args[attribute] = newVal;
							srvAdmin.groups.set(args);
						})
						this.main.setContent(this._groupGrid.domNode);
						this._groupGrid.render();
						var menu = this._groupMenu = new Menu({});
						dojo.forEach([
							{
								label: cmn["delete"],
								onClick: dojo.hitch(this, function(e){
									var row = this._groupGrid.getItem(this.__rowIndex);
									dialog.yesno({
										title: sys.groupDelConfirm,
										scene:this.scene,
										message: sys.delFromSys.replace("%s", row.name),
										onComplete: dojo.hitch(this, function(a){
											this._groupStore.deleteItem(row);
										})
									})
								})
							},
							{
								label: sys.alterPermissions,
								onClick: dojo.hitch(this, "permDialog",
									grid,
									dojo.hitch(this, function(row){
										return this._groupStore.getValue(row, "name");
									}),
									dojo.hitch(this, function(row){
										return dojo.fromJson(this._groupStore.getValue(row, "permissions"));
									}),
									dojo.hitch(this, function(row, newPerms){
										this._groupStore.setValue(row, "permissions", dojo.toJson(newPerms));
										srvAdmin.groups.set({
											id: this._groupStore.getValue(row, "id"),
											permissions: newPerms
										})
									})
								)
							},
							{
								label: sys.manageGroupMembersGeneric,
								onClick: dojo.hitch(this, "groupMemberDialog")
							},
							{
								label: sys.modifyQuotaGeneric,
								onClick: dojo.hitch(this, function(){
									var row = this._groupGrid.getItem(this.__rowIndex);
									var info = {
										name: this._groupStore.getValue(row, "name"),
										size: this._groupStore.getValue(row, "quota")
									};
									this.makeQuotaWin(info, dojo.hitch(this, function(value){
										this._groupStore.setValue(row, "quota", value);
									}));
								})
							}
						], function(item){
							var menuItem = new dijit.MenuItem(item);
							menu.addChild(menuItem);
						});
						this._groupGrid.onRowContextMenu = dojo.hitch(this, function(e){
							this.__rowIndex = e.rowIndex;
							this._groupMenu._contextMouse();
							this._groupMenu._openMyself(e);
						});
						document.body.appendChild(menu.domNode);
						this.win.layout();
						//dojo.style(this._groupGrid.domNode,"left:0px;top:0px;width:100%");
					}));
				},
				
				createGroupDialog: function(){
					var sys = nlsSystem;//dojo.i18n.getLocalization("desktop", "system");
					var cmn = nlsCommon;//dojo.i18n.getLocalization("desktop", "common");
					
					var dialog = new TooltipDialog({});
					var errBox = document.createElement("div");
					dialog.containerNode.appendChild(errBox);
					
					var line = document.createElement("div");
				    var p = document.createElement("span");
				    p.innerHTML = sys.name+": ";
				    line.appendChild(p);
					var name = new TextBox({});
					line.appendChild(name.domNode);
					dialog.containerNode.appendChild(line);
					
					var line = document.createElement("div");
				    var p = document.createElement("span");
				    p.innerHTML = sys.description+": ";
				    line.appendChild(p);
					var description = new TextBox({});
					line.appendChild(description.domNode);
					dialog.containerNode.appendChild(line);
					
					var line = document.createElement("div");
				    var p = document.createElement("span");
					var button = new Button({
						label: cmn.create,
						onClick: dojo.hitch(this, function(){
							var n = name.getValue();
							var d = description.getValue();
							this._groupStore.fetch({
								query: {name: n},
								onComplete: dojo.hitch(this, function(list){
									if(list.length != 0){
										errBox.textContent = sys.groupAlreadyExists;
										return;
									}
									errBox.textContent = "";
									srvAdmin.groups.add({
										name: n,
										description: d,
										onComplete: dojo.hitch(this, function(id){
											name.setValue("");
											description.setValue("");
											this._groupStore.newItem({
												id: id,
												name: n,
												description: d,
												permissions: "[]",
												quota: -1
											})
										})
									})
								})
							})
						})
					});
					line.appendChild(button.domNode);
					dialog.containerNode.appendChild(line);
					
					return dialog;
				},
				
				groupMemberDialog: function(group){
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var row = this._groupGrid.getItem(this.__rowIndex);
					var window = new Window({
			        	app  : this,
						title: sys.manageGroupMembers.replace("%s", this._groupStore.getValue(row, "name")),
						width: "400px",
						height: "200px"
					})
					this.windows.push(window);
					var makeUI = function(list){
						var client = new ContentPane({
							region: "center",
							style: "overflow-x: auto"
						})
						var div = document.createElement("div");
						var idList = [];
						var makeItem = dojo.hitch(this, function(item){
							idList.push(item.id);
							var drow = document.createElement("div");
							dojo.style(drow, "position", "relative");
							drow.innerHTML = "<span>"+item.username+"</span>";
							var right = document.createElement("span");
							dojo.style(right, "position", "absolute");
							dojo.style(right, "right", "0px");
							dojo.style(right, "top", "0px");
							dojo.addClass(right, "icon-16-actions-list-remove");
							drow.appendChild(right);
							dojo.connect(right, "onclick", this, function(){
								srvAdmin.groups.removeMember(
									this._groupStore.getValue(row, "id"),
									item.id
								);
								div.removeChild(drow);
								dojo.forEach(idList, function(id, i){
									if(id == item.id) idList.splice(i, 1);
								})
							})
							div.appendChild(drow);
						})
						
						dojo.forEach(list, makeItem, this)
						
						client.setContent(div);
						window.addChild(client);
						
						var top = new ContentPane({
							region: "top"
						});
						var tdiv = document.createElement("div");
						var s = new FilteringSelect({
							store: this._userStore,
							autoComplete: true,
							labelAttr: "username",
							searchAttr: "username"
						});
						var b = new Button({
							label: cmn.add,
							onClick: dojo.hitch(this, function(){
								srvAdmin.groups.addMember(
									this._groupStore.getValue(row, "id"),
									s.getValue()
								);
								var hasItem = false;
								dojo.forEach(idList, function(id){
									if(id == s.getValue()) hasItem = true;
								});
								if(!hasItem) this._userStore.fetch({
									query: {id: s.getValue()},
									onItem: makeItem
								})
								s.setDisplayedValue("");
								s.reset();
							})
						})
						tdiv.appendChild(s.domNode);
						tdiv.appendChild(b.domNode);
						top.setContent(tdiv);
						window.addChild(top);
						window.show();
						window.startup();
					}
					srvAdmin.groups.getMembers(this._groupStore.getValue(row, "id"), dojo.hitch(this, function(list){
						if(typeof this._userStore == "undefined"){
							this.makeUserStore(dojo.hitch(this, makeUI, list));
						}
						else dojo.hitch(this, makeUI, list)();
					}));
				}
			
			}
		}
	})

	Class.extend(AdminPanel, {
		"-public-"	:	{
			"-fields-"	:	{
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				permissions: function(){
					this.toolbar.destroyDescendants();
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var permNls = nlsPermissions;// i18n.getLocalization("desktop", "permissions",this.lang);
					
					srvAdmin.permissions.list(dojo.hitch(this, function(data){
						var layout = [{
							cells: [[]]
						}];
						for(var key in data){
							var item = data[key];
							item.description = permNls[item.name] || item.description;
						}
						//make headers
						for(var field in data[0]){
							var args = {
								name: sys[field],
								field: field
							};
							if(field == "initial"){
								args.type = cells.Bool;
			                    args.editable = true;
							}
							layout[0].cells[0].push(args);
						}
						
						this._permStore = new ItemFileWriteStore({
							data: {
								identifier: "id",
								items: data
							}
						});
						dojo.connect(this._permStore, "onSet", this, function(item, attribute, oldVal, newVal){
							var id = this._permStore.getValue(item, "id");
							if(id == false || attribute != "initial") return;
							srvAdmin.permissions.setDefault(id, newVal);
						})
						var grid = this._permGrid = new DataGrid({
							structure: layout,
			                store: this._permStore,
			                query: {id: "*"},
			                autoWidth:true,
			                autoHeight:true
						});
						if(this._con) dojo.disconnect(this._con);
						this._con = dojo.connect(this.main, "resize", grid, "resize");
						this.main.setContent(this._permGrid.domNode);
						this._permGrid.render();
						//dojo.style(this._permGrid.domNode,"left:0px;top:0px");
						this.win.layout();
					}));
				}
			}
		}
	});


	Class.extend(AdminPanel, {
		"-public-"	:	{
			"-fields-"	:	{
				_quotaUI: {}
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				quota: function(){
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					this.toolbar.destroyDescendants();
					//buttons
					this.toolbar.addChild(new Button({
						label: cmn.save,
						iconClass: "icon-16-actions-document-save",
						onClick: dojo.hitch(this, function(){
							var values = {};
							for(var key in this._quotaUI){
								values[key] = this._quotaUI[key]();
							}
							srvAdmin.quota.set(values);
						})
					}));
					
					this.main.setContent(cmn.loading);
					srvAdmin.quota.list(dojo.hitch(this, function(items){
						var div = document.createElement("div");
						dojo.forEach(items, function(item){
							var row = document.createElement("div");
							var title = document.createElement("b");
							title.innerHTML = sys[item.type+"s"] || item.type;
							row.appendChild(title);
							row.appendChild(document.createElement("hr"));
							var ui = this.makeQuotaRow(item);
							row.appendChild(ui.node);
							div.appendChild(row);
							this._quotaUI[item.type] = ui.getValue;
						}, this);
						this.main.setContent(div);
						this.win.layout();
					}))
				},
				makeQuotaRow: function(item, showDefault){
					var sys = dojo.i18n.getLocalization("desktop", "system");
					var row = document.createElement("div");
							
					//widgets
					var val = item.size < 1 ? 26214400 : item.size;
					var unit = "B";
					dojo.forEach([
						"KB",
						"MB",
						"GB"
					], function(item){
						if(!(val % 1024)){
							unit = item;
							val = val/1024;
						}
					});
					var valueWid = new NumberSpinner({
						value: val,
						constraints: {
							min: 1
						}
					})
					var unitWid = new FilteringSelect({
						autoComplete: true,
						searchAttr: "value",
						style: "width: 120px;",
						value: unit,
						store: new ItemFileReadStore({
							data: {
								identifier: "value",
								items: [
									{value: "B"},
									{value: "KB"},
									{value: "MB"},
									{value: "GB"}
								]
							}
						})
					});
					var onChange = function(v){
						if(!v) return;
						valueWid.setDisabled(this.value != "custom");
						unitWid.setDisabled(this.value != "custom");
					}
					var cb_custom = new RadioButton({
						name: this.sysname+this.instance+"radio"+item.type,
						value: "custom",
						onChange: onChange
					});
					cb_custom.setAttribute("checked", item.size > 0);
					var cb_unlimited = new RadioButton({
						name: this.sysname+this.instance+"radio"+item.type,
						value: "unlimited",
						onChange: onChange
					})
					cb_unlimited.setAttribute("checked", item.size == 0);
					var cb_default;
					if(showDefault){
						cb_default = new RadioButton({
							name: this.sysname+this.instance+"radio"+item.type,
							value: "default",
							onChange: onChange
						});
						cb_default.setAttribute("checked", item.size == -1);
					}
					valueWid.setDisabled(item.size <= 0);
					unitWid.setDisabled(item.size <= 0);
					//put widgets in body
					var row1 = document.createElement("div");
					row1.appendChild(cb_custom.domNode);
					row1.appendChild(valueWid.domNode);
					row1.appendChild(unitWid.domNode);
					row.appendChild(row1);
					var row2 = document.createElement("div");
					row2.appendChild(cb_unlimited.domNode);
					var unLabel = document.createElement("span");
					unLabel.innerHTML = sys.unlimited;
					row2.appendChild(unLabel);
					row.appendChild(row2);
					if(showDefault){
						var row3 = document.createElement("div");
						var defLabel = document.createElement("span");
						defLabel.innerHTML = sys["default"];
						row3.appendChild(cb_default.domNode);
						row3.appendChild(defLabel);
						row.appendChild(row3);
					}
					
					return {
						node: row,
						getValue: function(){
							if(cb_unlimited.checked) return 0;
							if(showDefault && cb_default.checked) return -1;
							var val = valueWid.getValue();
							dojo.forEach([
								{unit: "GB", size: 1073741824},
								{unit: "MB", size: 1048576},
								{unit: "KB", size: 1024}
							], function(item){
								if(unitWid.getValue() == item.unit)
									val = val*item.size;
							});
							return val;
						}
					};
				},
				makeQuotaWin: function(item, callback){
					var cmn = nlsCommon;//dojo.i18n.getLocalization("desktop", "common");
					var sys = nlsSystem;//dojo.i18n.getLocalization("desktop", "system");
					item.type = item.name;
					var ui = this.makeQuotaRow(item, true);
					var win = new Window({
			        	app  : this,
						title: sys.modifyQuota.replace("%s", item.name),
						width: "400px",
						height: "100px"
					});
					var cpane = new ContentPane({region: "center"});
					cpane.setContent(ui.node);
					win.addChild(cpane);
					//bottom part
					var bottom = new ContentPane({region: "bottom"});
					var cont = document.createElement("div");
					var cancel = new dijit.form.Button({
						label: "Cancel",
						onClick: dojo.hitch(win, "close")
					})
					cont.appendChild(cancel.domNode);
					var save = new dijit.form.Button({
						label: cmn.save,
						onClick: dojo.hitch(this, function(){
							callback(ui.getValue());
							win.close();
						})
					})
					cont.appendChild(save.domNode);
					dojo.addClass(cont, "floatRight");
					bottom.setContent(cont);
					win.addChild(bottom);
					this.windows.push(win);
					win.show();
				}
			
			}
		}
	});

	Class.extend(AdminPanel, {
		"-public-"	:	{
			"-fields-"	:	{
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				themes: function(){
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var apps = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
					var mnus = nlsMenus;//i18n.getLocalization("desktop.ui", "menus",this.lang);
					this.toolbar.destroyDescendants();
					var button = new dijit.form.Button({
						label: sys.installThemePackage,
						onClick: dojo.hitch(this, "installThemePackage")
					});
					this.toolbar.addChild(button);
					
					srvTheme.list(dojo.hitch(this, function(data){
						for(var i=0;i<data.length;i++){
							//var src = dojo.moduleUrl("openstar.resources.themes."+data[i].sysname, data[i].preview);
							var src = require.toUrl("openstar/resources/themes/"+data[i].sysname+"/" data[i].preview);
							data[i].preview = "<img style='width: 150px; height: 130px;' src='"+src+"' />";
						};
						var layout = [{
							cells: [[]]
						}];
						//make headers
						for(var field in data[0]){
							if(field == "sysname"
							|| field == "wallpaper") continue;
							var args = {
								name: sys[field] || field,
								field: field
							};
							if(field == "preview") args.width = 10;
							layout[0].cells[0].push(args);
						}
						this._themeStore = new dojo.data.ItemFileWriteStore({
							data: {
								identifier: "sysname",
								items: data
							}
						});
						var grid = this._themeGrid = new DataGrid({
							structure: layout,
			                store: this._themeStore,
			                query: {sysname: "*"},
			                autoWidth:true,
			                autoHeight:true
						});
						if(this._con) dojo.disconnect(this._con);
						this._con = dojo.connect(this.main, "resize", grid, "resize");
						dojo.connect(this._themeStore, "onDelete", this, function(a){
							srvTheme.remove(a.sysname[0]); //that feels really hackish
						})
						this.main.setContent(this._themeGrid.domNode);
						this._themeGrid.render();
						//dojo.style(this._themeGrid.domNode,"left:0px;top:0px");
						var menu = this._themeMenu = new dijit.Menu({});
						dojo.forEach([
							{
								label: cmn["delete"],
								onClick: dojo.hitch(this, function(e){
									var row = this._themeGrid.getItem(this.__rowIndex);
									dialog.yesno({
										title: sys.themeDelConfirm,
										scene:this.scene,
										message: sys.delFromSys.replace("%s", row.name),
										onComplete: dojo.hitch(this, function(a){
											if(a == false) return;
											this._themeStore.deleteItem(row);
										})
									})
								})
							}
						], function(item){
							var menuItem = new MenuItem(item);
							menu.addChild(menuItem);
						});
						this._themeGrid.onRowContextMenu = dojo.hitch(this, function(e){
							this.__rowIndex = e.rowIndex;
							this._themeMenu._contextMouse();
							this._themeMenu._openMyself(e);
						});
						document.body.appendChild(menu.domNode);
						this.win.layout();
					}));
				},
				installThemePackage: function(){
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var win = new Window({
			        	app  : this,
						title: sys.installThemePackage,
						width: "300px",
						height: "200px"
					});
					this.windows.push(win);
					var main = new ContentPane({region: "center"});
					var div = document.createElement("div");
					dojo.addClass(div, "tundra");
					div.innerHTML = sys.installThemeInstructions;
					var uploader = new FileInputAuto({
						name: "uploadedfile",
						url: srvGeneral.xhr("core.theme.package.install"),
						onComplete: dojo.hitch(this, function(data,ioArgs,widgetRef){
							if(data.status && data.status == "success"){
								widgetRef.overlay.innerHTML = sys.themeInstallSuccess;
			                    //check for compatibility
								if(!data.compatible){
								    dialog.alert({
								        title: sys.notCompatible,
								        scene:this.scene,
								        message: sys.notCompatibleText
								    });
								}
								this.themes.call(this, []);
							}else{
								widgetRef.overlay.innerHTML = cmn.error+": "+data.error;
								console.log('error',data,ioArgs);
							}
						})
					});
					div.appendChild(uploader.domNode);
					main.setContent(div);
					win.addChild(main);
					var bottom = new dijit.layout.ContentPane({region: "bottom"});
						var cont = document.createElement("div");
						var close = new dijit.form.Button({
							label: cmn.close,
							onClick: dojo.hitch(win, "close")
						})
						cont.appendChild(close.domNode);
						dojo.addClass(cont, "floatRight");
						bottom.setContent(cont);
						win.addChild(bottom);
					win.show();
					dojo.style(uploader.inputNode, "width", "163px");
					uploader.startup();
				}
			
			}
		}
	});

	Class.extend(AdminPanel, {
		"-public-"	:	{
			"-fields-"	:	{
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				users: function(){
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var usr = nlsAccountInfo;//i18n.getLocalization("desktop.ui", "accountInfo",this.lang);
					this.toolbar.destroyDescendants();
					var button = new DropDownButton({
						label: sys.createNewUser,
						dropDown: this.newUserDialog()
					});
					this.toolbar.addChild(button);
					srvAdmin.users.list(dojo.hitch(this, function(data){
						for(var i=0;i<data.length;i++){
							data[i].permissions = dojo.toJson(data[i].permissions);
							data[i].groups = dojo.toJson(data[i].groups);
			                data[i].logged = !!parseInt(data[i].logged);
						};
						var layout = [{
							cells: [[]]
						}];
						//make headers
						for(var field in data[0]){
							if(field == "permissions" || field == "groups" || field == "quota") continue;
							var args = {
								name: sys[field] || usr[field],
								field: field
							};
							if(field == "name" || field == "username" || field == "email"){
			                    args.type = cells.Cell;
			                    args.editable = true;
			                }
			                if(field == "logged"){
			                    args.type = cells.Bool;
			                }
							layout[0].cells[0].push(args);
						}
						
						this._userStore = new ItemFileWriteStore({
							data: {
								identifier: "id",
								items: data
							}
						});
			            console.log("asdf");
						var grid = this._userGrid = new DataGrid({
							structure: layout,
			                store: this._userStore,
			                query: {id: "*"},
			                autoWidth:true,
			                autoHeight:true
						});
						if(this._con) dojo.disconnect(this._con);
						this._con = dojo.connect(this.main, "resize", grid, "resize");
						dojo.connect(this._userStore, "onDelete", this, function(a){
							srvAdmin.users.remove(a.id[0]); //that feels really hackish
						})
						dojo.connect(this._userStore, "onSet", this, function(item, attribute, oldVal, newVal){
							if(attribute == "permissions") return;
							var id = this._userStore.getValue(item, "id");
							if(id == false) return;
							var args = {id: id};
							args[attribute] = newVal;
							srvUser.set(args);
						})
						this.main.setContent(this._userGrid.domNode);
						this._userGrid.render();
						dojo.style(this._userGrid.domNode,"left:0px;top:0px");
						var menu = this._userMenu = new Menu({});
						dojo.forEach([
							{
								label: cmn["delete"],
								onClick: dojo.hitch(this, function(e){
									var row = this._userGrid.getItem(this.__rowIndex);
									dialog.yesno({
										title: sys.userDelConfirm,
										scene:this.scene,
										message: sys.delFromSys.replace("%s", row.username),
										onComplete: dojo.hitch(this, function(a){
											if(a == false) return;
											var id = this._userStore.getValue(row, "id");
											this._userStore.deleteItem(row);
											srvCrosstalk.publish("accountremoval", {}, id, null, null, dojo.hitch(this, function(id){
												setTimeout(dojo.hitch(this, function(){
													srvCrosstalk.exists(id, dojo.hitch(this, function(notsent){
														if(notsent)
															srvCrosstalk.cancel(id);
													}));
												}), 2500);
											}));
										})
									})
								})
							},
							{
								label: usr.changePassword,
								onClick: dojo.hitch(this, function(e){
									var row = this._userGrid.getItem(this.__rowIndex);
									var win = new Window({
			        					app  : this,
										title: sys.chUsersPassword.replace("%s", row.username),
										width: "250px",
										height: "200px"
									});
									this.windows.push(win);
									
									var client = new ContentPane({
										region: "center"
									});
									var div = document.createElement("div");
									var errBox = document.createElement("div");
									div.appendChild(errBox);
									var input1, input2;
									dojo.forEach([
										{
											label: usr.newPassword,
											widget: input1 = new TextBox({
												type: "password"
											})
										},
										{
											label: usr.confirmNewPassword,
											widget: input2 = new TextBox({
												type: "password"
											})
										}
									], function(item){
										var row = document.createElement("div");
										var label = document.createElement("span");
										label.textContent = item.label+": ";
										row.appendChild(label);
										row.appendChild(item.widget.domNode);
										div.appendChild(row);
									})
									
									client.setContent(div);
									win.addChild(client);
									
									var bottom = new ContentPane({
										region: "bottom"
									});
									var div = document.createElement("div");
									dojo.addClass(div, "floatRight");
									var button = new dijit.form.Button({
										label: cmn.ok,
										onClick: dojo.hitch(this, function(){
											if(input1.getValue() != input2.getValue()) return errBox.textContent = usr.passwordsDontMatch;
											this._userStore.setValue(row, "password", input1.getValue());
											win.close();
										})
									})
									div.appendChild(button.domNode);
									var cancel = new Button({label: cmn.cancel, onClick: dojo.hitch(win, "close")});
									div.appendChild(cancel.domNode);
									bottom.setContent(div);
									win.addChild(bottom);
									win.show();
									win.startup();
								})
							},
							{
								label: sys.alterPermissions,
								onClick: dojo.hitch(this, "permDialog",
									grid,
									dojo.hitch(this, function(row){
										return this._userStore.getValue(row, "username");
									}),
									dojo.hitch(this, function(row){
										return dojo.fromJson(this._userStore.getValue(row, "permissions"));
									}),
									dojo.hitch(this, function(row, newPerms){
										this._userStore.setValue(row, "permissions", dojo.toJson(newPerms));
										srvUser.set({
											id: this._userStore.getValue(row, "id"),
											permissions: newPerms
										})
									})
								)
							},
							{
								label: sys.modifyQuotaGeneric,
								onClick: dojo.hitch(this, function(){
									var row = this._userGrid.getItem(this.__rowIndex);
									var info = {
										name: this._userStore.getValue(row, "username"),
										size: this._userStore.getValue(row, "quota")
									};
									this.makeQuotaWin(info, dojo.hitch(this, function(value){
										this._userStore.setValue(row, "quota", value);
										var id = this._userStore.getValue(row, "id");
										srvCrosstalk.publish("quotaupdate", {}, id, null, null, dojo.hitch(this, function(id){
											setTimeout(dojo.hitch(this, function(){
												srvCrosstalk.exists(id, dojo.hitch(this, function(notsent){
													if(notsent)
														srvCrosstalk.cancel(id);
												}));
											}), 2500);
										}));
									}));
								})
							}
						], function(item){
							var menuItem = new MenuItem(item);
							menu.addChild(menuItem);
						});
						this._userGrid.onRowContextMenu = dojo.hitch(this, function(e){
							this.__rowIndex = e.rowIndex;
							this._userMenu._contextMouse();
							this._userMenu._openMyself(e);
						});
						document.body.appendChild(menu.domNode);
						this.win.layout();
					}));
				},
				newUserDialog: function(){
					var usr = nlsAccountInfo;//i18n.getLocalization("desktop.ui", "accountInfo",this.lang);
					var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var dialog = new TooltipDialog({});
					var error = document.createElement("div");
					dialog.containerNode.appendChild(error);
					
					var line = document.createElement("div");
				    var p = document.createElement("span");
				    p.innerHTML = usr.name+": ";
				    line.appendChild(p);
					var name = new dijit.form.TextBox();
				    line.appendChild(name.domNode);
					dialog.containerNode.appendChild(line);
					
					var line = document.createElement("div");
				    var p = document.createElement("span");
				    p.innerHTML = usr.username+": ";
				    line.appendChild(p);
					var username = new dijit.form.TextBox();
				    line.appendChild(username.domNode);
					dialog.containerNode.appendChild(line);
					
					var line = document.createElement("div");
				    var p = document.createElement("span");
				    p.innerHTML = usr.email+": ";
				    line.appendChild(p);
					var email = new dijit.form.TextBox();
				    line.appendChild(email.domNode);
					dialog.containerNode.appendChild(line);
					
					var line = document.createElement("div");
				    var p = document.createElement("span");
				    p.innerHTML = usr.password+": ";
				    line.appendChild(p);
					var password = new dijit.form.TextBox({type: "password"});
				    line.appendChild(password.domNode);
					dialog.containerNode.appendChild(line);
					
					var line = document.createElement("div");
				    var p = document.createElement("span");
				    p.innerHTML = usr.confirmPassword+": ";
				    line.appendChild(p);
					var confpassword = new dijit.form.TextBox({type: "password"});
				    line.appendChild(confpassword.domNode);
					dialog.containerNode.appendChild(line);
					
					var line = document.createElement("div");
				    var button = new dijit.form.Button({
						label: cmn.create,
						onClick: dojo.hitch(this, function(){
							
							if(username.getValue() == "") return error.textContent = usr.enterUsername;
							if(username.getValue().indexOf("..") != -1){
								error.textContent = usr.cannotContain.replace("%s", "..");
								return;
							}
							if(username.getValue().indexOf("/") != -1){
								error.textContent = usr.cannotContain.replace("%s", "/");
								return;
							}
							if(username.getValue().indexOf("\\") != -1){
								error.textContent = usr.cannotContain.replace("%s", "\\");
								return;
							}
							if(!dojox.validate.isEmailAddress(email.getValue())) return error.textContent = usr.enterValidEmail;
							if(password.getValue() == "") return error.textContent = usr.enterPassword;
							if(password.getValue() != confpassword.getValue()) return error.textContent = usr.passwordsDontMatch;
							error.textContent = "";
							srvAdmin.users.create({
								name: name.getValue(),
								username: username.getValue(),
								email: email.getValue(),
								password: password.getValue(),
								onComplete: dojo.hitch(this, function(id){
									if(id == false) return error.textContent = usr.usernameAllreadyTaken;
									error.textContent = usr.userCreated;
									this._userStore.newItem({
										name: name.getValue(),
										username: username.getValue(),
										groups: "[]",
										permissions: "[]",
										email: email.getValue(),
										id: id,
										quota: -1
									});
									name.setValue("");
									username.setValue("");
									email.setValue("");
									password.setValue("");
									confpassword.setValue("");
								})
							});
						})
					});
				    line.appendChild(button.domNode);
					dialog.containerNode.appendChild(line);
					dialog.startup();
					return dialog;
				},
				makeUserStore: function(callback){
					srvAdmin.users.list(dojo.hitch(this, function(data){
						for(var i=0;i<data.length;i++){
							data[i].permissions = dojo.toJson(data[i].permissions);
							data[i].groups = dojo.toJson(data[i].groups);
						};
						this._userStore = new ItemFileWriteStore({
							data: {
								identifier: "id",
								items: data
							}
						});
						callback();
					}));
				}
			}
		}
	});


// Runtime.addDojoCss("dojox/widget/FileInput/FileInput.css");
runtime.addDojoCss("dojox/form/resources/FileInput.css");

return AdminPanel;


});

