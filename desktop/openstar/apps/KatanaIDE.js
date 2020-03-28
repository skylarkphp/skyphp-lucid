define([
	 "dojo", //dojo
	 "dojo/fx",
	 "dojo/data/ItemFileReadStore",
	 "dojo/data/ItemFileWriteStore",
	 "dijit/_Widget",
	 "dijit/_Templated",
	 "dijit/form/_FormValueWidget",
	 "qfacex/dijit/button/Button",
	 "qfacex/dijit/input/TextBox",
	 "dijit/form/Form",
	 "qfacex/dijit/selection/FilteringSelect",
	 "dijit/form/ValidationTextBox",
	 "dijit/form/SimpleTextarea",
	 "qfacex/dijit/selection/ToggleButton",
	 "qfacex/dijit/button/DropDownButton",
	 "qfacex/dijit/toolbar/Toolbar",
	 "dijit/TooltipDialog",
	 "qfacex/dijit/tree/Tree",
	 "dijit/tree/ForestStoreModel",
	 "qfacex/dijit/menu/Menu",
	 "qfacex/dijit/menu/MenuItem",
	 "qfacex/dijit/menu/MenuSeparator",
	 "qfacex/dijit/container/ContentPane",
	 "qfacex/dijit/container/TabContainer",
	 "dojox/gfx", 
 	 "dojox/fx", 
	 "dojox/validate",
	 "dojox/validate/web",
	 "dojox/grid/DataGrid",
	 "dojox/data/dom",
	 "openstar/system2/Runtime",
	 "openstar/desktop2/Application",
	 "qfacex/dijit/container/deprecated/Window",
	 "qfacex/dijit/infomation/StatusBar",
	 "openstar/services/general",
	 "openstar/services/filesystem",
	 "openstar/services/Registry",
	 "openstar/services/app",
	 "openstar/ui/dialog",
	 "dojo/i18n!openstar/nls/common",
	 "dojo/i18n!./nls/apps",
	 "dojo/i18n!openstar/nls/system",
	 "dojo/i18n!openstar/nls/messages",
	 "dojo/i18n!openstar/ui/widget/nls/filearea",
	 "dojo/i18n!openstar/desktop/nls/menus",
	 "dojo/i18n!./KatanaIDE/nls/ide"
	 
],function(dojo,dojofx,ItemFileReadStore,ItemFileWriteStore,_Widget,_Templated,_FormValueWidget,Button,TextBox,Form,FilteringSelect,
	ValidationTextBox,SimpleTextarea,ToggleButton,DropDownButton,Toolbar,TooltipDialog,Tree,ForestStoreModel,Menu,MenuItem,MenuSeparator,
	ContentPane,TabContainer,gfx,dojoxfx,validate,validate,DataGrid,dojoxDom,Runtime,_App,Window,StatusBar,srvGeneral,srvFilesystem,SrvRegistry,
	srvApp,dialog,nlsCommon,nlsApps,nlsSystem,nlsMessages,nlsFilearea,nlsMenus,nlsIde) {


var KatanaIDE = dojo.declare("openstar.apps.KatanaIDE", _App, {
	files: [], //file information
	appInfo: {}, //application information
	metaUi: {}, //metadata form UI
	windows: [],
	init: function(args){
		var cm = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
		var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
		var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
		var ideLocale = nlsIde;//i18n.getLocalization("openstar.apps.KatanaIDE", "ide",this.lang);
		this.windows = [];
		this.win = new Window({
        	app  : this,
			title: app["Katana IDE"],
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill")
		});
		
		this.store = new SrvRegistry({
			name: "settings",
			appname: this.sysname,
			data: {
				identifier: "key",
				items: [
					{key: "useEditorLite", value: false}
				]
			}
		});
		
		var right = this.tabArea = new TabContainer({
			region: "center"
		});
		dojo.connect(right, "selectChild", this, function(wid){
			if(!wid.ide_info) return;
			this.setMeta(this.appInfo[wid.ide_info.appName]);
		});
		srvApp.list(dojo.hitch(this, function(apps){
			for(var i in apps){
				if(apps[i].filename) continue;
				this.appInfo[apps[i].sysname] = apps[i];
				var files = apps[i].files;
				apps[i].id = apps[i].sysname;
				delete apps[i].files;
				var makeChildren = function(files, parent){
					var children = [];
					for(var f in files){
						var fName = typeof files[f] == "object" ? f : files[f];
						var fileItem = {
							id: apps[i].sysname+(parent ? parent+"/" : "")+fName+(new Date()).toString(),
							name: fName,
							filename: (parent ? parent+"/" : "")+fName,
							appname: apps[i].sysname,
							folder: typeof files[f] == "object"
						}
						if(typeof files[f] == "object") fileItem.children = makeChildren(files[f], (parent ? parent+"/" : "")+fName)
						//apps.push(fileItem);
						children.push(fileItem);
					}
					return children;
				}
				apps[i].children = makeChildren(files);
			}
			var appStore = this.appStore = new ItemFileWriteStore({
				data: {
					identifier: "id",
					label: "name",
					items: apps
				}
			});
			//TODO: move files using DnD?
			var treeModel = new ForestStoreModel({
				store:appStore,
				query: {category: "*"},
				rootLabel:"root",
				childrenAttrs: ["children"]
			});

			var left = new Tree({
			    showRoot:false,
				model: treeModel,
				region: "left",
				splitter: true,
				style: "overflow: auto;",
				getIconClass: dojo.hitch(appStore, function(item, opened){
					if(item && item.sysname) return "icon-16-categories-applications-other";
					if(item && item.folder) return (opened ? "icon-16-status-folder-open" : "icon-16-places-folder");
					return "icon-16-mimetypes-text-x-generic";
				})
			})
			this.makeMenu(left);
			dojo.connect(left, "onClick", this, "onItem");
			this.win.addChild(left);
			this.win.addChild(right);
		}));
		
		this.toolbar = new Toolbar({region: "top"});
			this.toolbar.addChild(new Button({label: cm["new"], iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, "newApp", 1)}));
			this.toolbar.addChild(new Button({label: cm.save, iconClass: "icon-16-actions-document-save", onClick: dojo.hitch(this, "save")}));
			this.toolbar.addChild(new DropDownButton({label: cm.metadata, iconClass: "icon-16-actions-document-properties", dropDown: this._makeMetaDialog()}));
		//this.toolbar.addChild(new Button({label: cm.run, iconClass: "icon-16-actions-media-playback-start", onClick: dojo.hitch(this, "run")}));
		//this.toolbar.addChild(new Button({label: sys.kill, iconClass: "icon-16-actions-media-playback-stop", onClick: dojo.hitch(this, "killExec")}));
			this.store.fetchItemByIdentity({
				identity: "useEditorLite",
				onItem: dojo.hitch(this, function(item){
					var button;
					this.toolbar.addChild(button = new ToggleButton({
						label: ideLocale.syntaxHighlight,
						iconClass: "dijitCheckBoxIcon",
						onChange: dojo.hitch(this, function(v){
							this.store.setValue(item, "value", !v);
							this.store.save();
						})
					}));
					button.setAttribute("checked", !this.store.getValue(item, "value"));
				})
			});
			
		this.win.addChild(this.toolbar);
		this.win.show();
		this.win.startup();
	},
	makeMenu: function(tree){
		var cm = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
		var nf = nlsFilearea;//i18n.getLocalization("desktop.widget", "filearea",this.lang);
		var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
		var menu = new Menu({});
		dojo.connect(menu, "_openMyself", this, function(e){
			this._contextItem = dijit.getEnclosingWidget(e.target).item || false;
			menu.getChildren().forEach(function(i){
				if(i.setDisabled)
					i.setDisabled(!(this._contextItem
									&& ((i.label == nf.createFolder || i.label == nf.createFile) ? 
											this.appStore.getValue(this._contextItem, "folder") :
											this.appStore.getValue(this._contextItem, "filename")
									 || i.label == cm["delete"])));
			}, this);
		});
		menu.bindDomNode(tree.domNode);
		//add menu items
		menu.addChild(new MenuItem({
			label: nf.createFolder,
			iconClass: "icon-16-actions-folder-new",
			onClick: dojo.hitch(this, function(){
				var nf = nlsFilearea; //i18n.getLocalization("desktop.widget", "filearea",this.lang);
				dialog.input({
					title: nf.createFolder,
					message: nf.createFolderText,
					onComplete: dojo.hitch(this, function(dirname){
						if(dirname == "") return;
						dirname = dirname.replace("..", "").replace("/", "");
						var path = this.appStore.getValue(this._contextItem, "filename");
						var appname = this.appStore.getValue(this._contextItem, "appname");
						this.appStore.fetch({
							query: {
								appname: appname,
								filename: path+"/"+dirname
							},
							queryOptions: {deep: true},
							onComplete: dojo.hitch(this, function(items){
								if(items.length != 0) return dialog.notify({
									type: "warning",
									message: nf.alreadyExists
								})
								srvApp.createFolder(path+"/"+dirname);
								this.appStore.newItem({
									id: appname+"/"+path+"/"+dirname+(new Date()).toString(),
									name: dirname,
									filename: path+"/"+dirname,
									appname: appname,
									folder: true
								}, {
									parent: this._contextItem,
									attribute: "children"
								})
							})
						})
					})
				});
			})
		}))
		menu.addChild(new MenuItem({
			label: nf.createFile,
			iconClass: "icon-16-actions-document-new",
			onClick: dojo.hitch(this, function(){
				var nf = nlsFilearea; //i18n.getLocalization("desktop.widget", "filearea",this.lang);
				dialog.input({
					title: nf.createFile,
					message: nf.createFileText,
					onComplete: dojo.hitch(this, function(filename){
						if(filename == "") return;
						var path = this.appStore.getValue(this._contextItem, "filename");
						var appname = this.appStore.getValue(this._contextItem, "appname");
						var fileOrig = path+"/"+filename;
						filename = filename.replace("..", "").replace("/", "");
						this.appStore.fetch({
							query: {
								appname: appname,
								filename: path+"/"+filename
							},
							queryOptions: {deep: true},
							onComplete: dojo.hitch(this, function(items){
								if(items.length != 0) return dialog.notify({
									type: "warning",
									message: nf.alreadyExists
								})
								var defaultContent = "dojo"+".provide(\"openstar.apps."
									+fileOrig.substring(0, fileOrig.length-3)
									.replace(".", "")
									.replace("/", ".")
									+"\");\n\n";
								srvApp.save({
									filename: path+"/"+filename,
									content: filename.match(".js$") ? defaultContent : " "
								});
								this.appStore.newItem({
									id: appname+"/"+path+"/"+filename+(new Date()).toString(),
									name: filename,
									filename: path+"/"+filename,
									appname: appname,
									folder: false
								}, {
									parent: this._contextItem,
									attribute: "children"
								})
							})
						})
					})
				});
			})
		}))
		menu.addChild(new MenuSeparator({}));
		menu.addChild(new MenuItem({
			label: cm.rename,
			onClick: dojo.hitch(this, function(){
				var nf = nlsFilearea;//i18n.getLocalization("desktop.widget", "filearea",this.lang);
				var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
				dialog.input({
					title: cmn.rename,
					initial: this.appStore.getValue(this._contextItem, "name"),
					onComplete: dojo.hitch(this, function(filename){
						if(filename == "") return;
						var path = this.appStore.getValue(this._contextItem, "filename");
						var appname = this.appStore.getValue(this._contextItem, "appname");
						var fileOrig = path+"/"+filename;
						filename = filename.replace("..", "").replace("/", "");
						var newPath = path.substring(0, path.lastIndexOf("/"))+"/"+filename;
						this.appStore.fetch({
							query: {
								appname: appname,
								filename: newPath
							},
							queryOptions: {deep: true},
							onComplete: dojo.hitch(this, function(items){
								if(items.length != 0) return dialog.notify({
									type: "warning",
									message: nf.alreadyExists
								})
								srvApp.renameFile(
									this.appStore.getValue(this._contextItem, "filename"),
									newPath,
									dojo.hitch(this, function(s){
										if(!s) return;
										this.tabArea.getChildren().forEach(function(item){
											if(!item.ide_info) return;
											if(item.ide_info.fileName == this.appStore.getValue(this._contextItem, "filename")){
												item.setAttribute("title", filename);
												item.ide_info.fileName = newPath;
											}
										}, this);
										this.appStore.setValue(this._contextItem, "name", filename);
										this.appStore.setValue(this._contextItem, "filename", newPath);
										this.onItem(this._contextItem);
									})
								);
							})
						})
					})
				});
			})
		}))
		menu.addChild(new MenuItem({
			label: cm["delete"],
			iconClass: "icon-16-actions-edit-delete",
			onClick: dojo.hitch(this, function(){
				var fname = this.appStore.getValue(this._contextItem, "filename");
				var sname = this.appStore.getValue(this._contextItem, "sysname");
				var doDelete = dojo.hitch(this, function(){
					srvApp.remove(fname ? null : sname, fname || null, dojo.hitch(this, function(result){
						if(!result) return;
						this.tabArea.getChildren().forEach(function(wid){
							if(wid.ide_info.appName == sname){
								this.tabArea.removeChild(wid);
								wid.destroy();
							}
						}, this);
						this.appStore.deleteItem(this._contextItem);
						this._contextItem = null;
					}));
				})
				if(!fname) 
					dialog.yesno({
						title: sys.appDelConfirm,
						message: sys.delFromSys.replace("%s", this.appStore.getValue(this._contextItem, "name")),
						onComplete: dojo.hitch(this, function(a){
							if(a) doDelete();
						})
					})
				else doDelete();
			})
		}))
	},
	makeTab: function(appname, filename, content){
		var div = dojo.doc.createElement("div");
		dojo.style(div, {
			width: "100%",
			height: "100%",
			overflow: "hidden"
		});
		this.store.fetch({
			query: {key:"useEditorLite"},
			onComplete: dojo.hitch(this, function(items){
			    var item = items[0];
				var pane = new ContentPane({
				    closable: true,
				    style: "padding: 0px; overflow: hidden;",
					title: filename.substring(filename.lastIndexOf("/")+1) || filename
				});
				pane.setContent(div);
				this.tabArea.addChild(pane);
				this.tabArea.selectChild(pane);
				var editor = new openstar.apps.KatanaIDE[this.store.getValue(item, "value") ? "EditorLite" : "CodeTextArea"]({
				    plugins: "BlinkingCaret GoToLineDialog Bookmarks MatchingBrackets",
				    resizeTo: pane.id,
//				    colorsUrl: dojo.moduleUrl("openstar.apps.KatanaIDE.data", "javascript_dojo_color.json"),
//				    autocompleteUrl: dojo.moduleUrl("openstar.apps.KatanaIDE.data", "javascript_dojo_ac.json")
				    colorsUrl: require.toUrl("openstar/apps/KatanaIDE/data/javascript_dojo_color.json"),
				    autocompleteUrl: require.toUrl("openstar/apps/KatanaIDE/data/javascript_dojo_ac.json")
			    }, div);
			    pane.ide_info = {
				    fileName: filename,
				    appName: appname,
				    editor: editor
			    }
			    editor.startup();
				dojo.connect(pane, "onClose", function(){
				    pane.resize = function(){};
				    editor.destroy();
				});
				setTimeout(dojo.hitch(this, function(){
				    if(content != "")
					    editor.massiveWrite(content);
					editor.setCaretPosition(0,0);
                    this.tabArea.layout();
                    editor.startup();
				}), 200);
			})
		})
	},
	_makeMetaDialog: function(){
		var mnu = nlsMenus;//i18n.getLocalization("desktop.ui", "menus",this.lang);
		var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
		var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
		var div = document.createElement("div");
		
		var row = document.createElement("div");
		row.textContent = sys.id+": ";
		this.metaUi.sysname = new TextBox({value: "", disabled: true});
		row.appendChild(this.metaUi.sysname.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = sys.name+": ";
		this.metaUi.name = new TextBox({value: ""});
		row.appendChild(this.metaUi.name.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = sys.author+": ";
		this.metaUi.author = new TextBox({value: ""});
		row.appendChild(this.metaUi.author.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = sys.email+": ";
		this.metaUi.email = new TextBox({value: ""});
		row.appendChild(this.metaUi.email.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = sys.version+": ";
		this.metaUi.version = new TextBox({value: ""});
		row.appendChild(this.metaUi.version.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = sys.maturity+": ";
		this.metaUi.maturity = new TextBox({value: ""});
		row.appendChild(this.metaUi.maturity.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = sys.category+": ";
		this.metaUi.category = new FilteringSelect({
			autoComplete: true,
			searchAttr: "label",
			store: new ItemFileReadStore({
				data: {
					identifier: "value",
					items: [
						{ label: mnu.accessories, value: "Accessories" },
						{ label: mnu.development, value: "Development" },
						{ label: mnu.games, value: "Games" },
						{ label: mnu.graphics, value: "Graphics" },
						{ label: mnu.internet, value: "Internet" },
						{ label: mnu.multimedia, value: "Multimedia" },
						{ label: mnu.office, value: "Office" },
						{ label: mnu.system, value: "System" },
						{ label: mnu.administration, value: "Administration" },
						{ label: mnu.preferences, value: "Preferences" }
					]
				}
			}),
			onChange: dojo.hitch( this, function(val){
				if ( typeof val == "undefined" ) return;
			})
		});
		row.appendChild(this.metaUi.category.domNode);
		div.appendChild(row);
		
		var closeButton = new Button({
			label: cmn.save,
			onClick: dojo.hitch(this, "saveMeta")
		});
		div.appendChild(closeButton.domNode);
		
		var dialog = new TooltipDialog({}, div);
		return dialog;
	},
	saveMeta: function(){
		var data = {};
		for(var key in this.metaUi){
			data[key] = this.metaUi[key].getValue();
		}
		srvApp.save(data);
	},
	setMeta: function(info){
		for(var key in this.metaUi){
			this.metaUi[key].setValue(info[key]);
		}
	},
	newApp: function(){
		var ideLocale = nlsIde;//i18n.getLocalization("openstar.apps.KatanaIDE", "ide",this.lang);
		var cmn = nlsCommon;//dojo.i18n.getLocalization("desktop", "common");
		
		var win = new Window({
        	app  : this,
			title: ideLocale.createNewApp,
			width: "350px",
			height: "150px"
		});
		this.windows.push(win);
		var cpane = new ContentPane({
			region: "center",
			style: "padding: 5px;"
		});
		var div = document.createElement("div");
		
		var row = document.createElement("div");
		row.textContent = ideLocale.sysname+": ";
		var sysBox = new ValidationTextBox({required: true, regExp: "[A-Za-z][\\w]+"});
		row.appendChild(sysBox.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = ideLocale.dispname+": ";
		var dispBox = new dijit.form.TextBox({required: true});
		row.appendChild(dispBox.domNode);
		div.appendChild(row);
		
		var saveButton = new Button({
			label: cmn.create,
			onClick: dojo.hitch(this, function(){
				if (dispBox.getValue() != "" && sysBox.isValid() && sysBox.getValue() != ""){
					this.appStore.fetch({
						query: {
							sysname: sysBox.getValue()
						},
						onComplete: dojo.hitch(this, function(items){
							var nf = nlsFilearea;//i18n.getLocalization("desktop.widget", "filearea",this.lang);
							if(items.length != 0) return dialog.notify({
								type: "warning",
								message: nf.alreadyExists
							})
							this._newApp({
								name: dispBox.getValue(),
								sysname: sysBox.getValue()
							})
							win.close();
						})
					})
				}
			})
		});
		div.appendChild(saveButton.domNode);
		
		cpane.setContent(div);
		win.addChild(cpane);
		win.show();
	},
	_newApp: function(info){
		this.appInfo[info.sysname] = dojo.mixin({
			sysname: "",
			name: "",
			author: "",
			email: "",
			version: "1.0",
			maturity: "Alpha",
			category: "Accessories"
		}, info);
		var defaultContent = "dojo"+".provide(\"openstar.apps."+info.sysname+"\");\r\n\r\n"
								+"dojo.declare(\"openstar.apps."+info.sysname+"\", openstar.apps._App, {\r\n"
								+"	init: function(args){\r\n"
								+"		/*Startup code goes here*/\r\n"
								+"	},\r\n"
								+"	kill: function(args){\r\n"
								+"		/*Cleanup code goes here*/\r\n"
								+"	}\r\n"
								+"});"
		this.makeTab(info.sysname, "/"+info.sysname+".js", defaultContent);
		srvApp.save(dojo.mixin(dojo.clone(this.appInfo[info.sysname]), {
			filename: "/"+info.sysname+".js",
			content: defaultContent
		}));
		srvApp.createFolder(info.sysname);
		//make the store item
		var root = this.appStore.newItem(dojo.mixin(dojo.clone(this.appInfo[info.sysname]), {
			id: info.sysname+(new Date()).toString()
		}));
		this.appStore.newItem({
			id: info.sysname+"/"+info.sysname+".js"+(new Date()).toString(),
			name: info.sysname+".js",
			filename: "/"+info.sysname+".js",
			appname: info.sysname,
			folder: false
		}, {
			parent: root,
			attribute: "children"
		})
		this.appStore.newItem({
			id: info.sysname+"/"+info.sysname+"/"+(new Date()).toString(),
			name: info.sysname,
			filename: "/"+info.sysname+"/",
			appname: info.sysname,
			folder: true
		}, {
			parent: root,
			attribute: "children"
		})
	},
	onItem: function(item){
		var store = this.appStore;
		if(!store.isItem(item)) return;
		var filename = store.getValue(item, "filename");
		if(!filename) return;
		if(store.getValue(item, "folder")) return;
		var app = store.getValue(item, "appname");
		var tac = this.tabArea.getChildren();
		for(var i in tac){
			if(typeof tac[i].ide_info != "object") continue;
			if(tac[i].ide_info.fileName == filename && tac[i].ide_info.appName == app){
				return this.tabArea.selectChild(tac[i]);
			}
		}
		srvApp.get(app, filename, dojo.hitch(this, function(content){
			this.makeTab(app, filename, content);
		}))
	},
	save: function(){
		var pane = this.tabArea.selectedChildWidget;
		var content = pane.ide_info.editor.getContent();
		srvApp.save({
			filename: pane.ide_info.fileName,
			content: content
		});
		//var lm = dojo._loadedModules;
		//for(var key in lm){
		//	if(key.indexOf("openstar.apps."+pane.ide_info.appName) == 0){
		//		delete lm[key];
		//	}
		//}
	},

	kill: function()
	{
		dojo.forEach(this.windows, function(win){
			if(!win.closed) win.close();
		});
		if(typeof this.loadwin != "undefined"){
			if(!this.loadwin.closed) this.loadwin.close();
		}
		if(!this.win.closed)this.win.close();
	}
});

KatanaIDE._codeTextArea = {};
KatanaIDE._codeTextArea.plugins = {};
KatanaIDE._codeTextArea.plugins.BlinkingCaret = {};

KatanaIDE._codeTextArea.plugins.BlinkingCaret.startup = function(args){
    this._blinkInterval = setInterval(dojo.hitch(args.source,function(){
        this.caret.style.visibility = 
            this.caret.style.visibility == "hidden" ? "visible" : "hidden"; 
    }), 500);
};

KatanaIDE._codeTextArea.plugins.GoToLineDialog = {};

KatanaIDE._codeTextArea.plugins.GoToLineDialog.startup = function(args){
        var source = args.source;
        dojo.subscribe(source.id + "::KeyPressed", 
        function(topicArgs){
//	        var source = topicArgs.source;
            var evt = topicArgs.evt;
            if(evt.ctrlKey && evt.charCode == 108){ // ctrl + l (lowercase L)
                if(!this._goToLineDialog){
//                    source._blockedKeyCombinations["CTRL+l"] = true;
                    
                    var _goToLineDialogDomNode = document.createElement("div");
                    var _fromTo = document.createElement("div");

                    var _fromLine = document.createElement("span");
					_fromLine.className = "codeTextAreaDialogCaption";
                    _fromLine.innerHTML = "Enter Line Number (1.."; 
                    _fromTo.appendChild(_fromLine);

                    var _toLine = document.createElement("span");
					_toLine.className = "codeTextAreaDialogCaption";
                    _fromTo.appendChild(_toLine);
                    
                    var _line = document.createElement("input");
                    _line.type = "text";
                    _line.value = "";
                    _line.value = "goToLineField";
                    _goToLineDialogDomNode.appendChild(_fromTo);
                    _goToLineDialogDomNode.appendChild(_line);

                    var _errors = document.createElement("div");
                    _errors.style.color = "red";
                    _errors.style.display = "none";
                    _goToLineDialogDomNode.appendChild(_errors);
                    
                    this._goToLineDialog = new dijit.Dialog({
                            title: "Go To Line",
                            duration: 40
                        }, _goToLineDialogDomNode
                    );
					dojo.addClass(this._goToLineDialog.titleNode, "codeTextAreaDialogTitle");
                    this._goToLineDialog._toLine = _toLine; // mmm
                    this._goToLineDialog._errors = _errors; // mmm...
                    var _self = this;
                    dojo.connect(this._goToLineDialog, "hide", function(){
						_self._goToLineDialog.domNode.getElementsByTagName("input")[0].blur();  
						source._blockedEvents = false;
			            document.body.focus();
					});
                    var _dialog = this._goToLineDialog; 
                    dojo.connect(_dialog, "show", function(){
                            _dialog._toLine.innerHTML = source.numLines() + ")";
                            _dialog.domNode.getElementsByTagName("input")[0].value = "";  
                    });
                    
                    dojo.connect(_dialog.titleBar, "focus", function(){
                            _dialog.domNode.getElementsByTagName("input")[0].focus();  
                    });
                    
                    dojo.connect(_dialog.domNode.getElementsByTagName("input")[0], "onkeypress", function(evt){
                            var evt = dojo.fixEvent(evt || window.event);
                            var errors = false; 
                            var _value = parseInt(_dialog.domNode.getElementsByTagName("input")[0].value, 10);
                            
                            var keyCode = evt.keyCode;
                            var charCode = evt.charCode;
                            var resCode = keyCode || charCode;
                            if(resCode == dojo.keys.ENTER){
                                if(isNaN(_value)){
                                    _errors.innerHTML = "not a number";
                                    _errors.style.display = "block";
                                }else if(_value < 1 || _value > source.numLines()){
                                    _errors.innerHTML = "out of range";
                                    _errors.style.display = "block";
                                }else{
                                    _errors.style.display = "none";
                                    source.setCaretPosition(0, 
                                        _value - 1);
									_dialog.domNode.getElementsByTagName("input")[0].blur();  
                                    _dialog.hide();
                                    dojo.stopEvent(evt);
                                }
                            }
                            evt.stopPropagation();
                    });
                }
				source._blockedEvents = true;
                this._goToLineDialog._errors.style.display = "none";
                this._goToLineDialog.show();            
            }
        }
    );
};

KatanaIDE._codeTextArea.plugins.Bookmarks = {};

KatanaIDE._codeTextArea.plugins.Bookmarks.startup = function(args){
	var targetLine = 0;
	var targetBookmark = {};
	var bookmarks = [];
	
    var source = args.source;
	var lineHeight = source.lineHeight;
	var _action = "add";
	// right bar
	var bookmarksBar = dojo.byId("bookmarksBar") || document.createElement("div");
	bookmarksBar.className = "codeTextAreaBookmarksBar";
	with(bookmarksBar.style){
		height = source.getHeight() + "px";
	}

	// dialog
	var _bookmarkDialogNode = document.createElement("div");
	var _caption = document.createElement("span");
	_caption.appendChild(document.createTextNode("Enter Bookmark name: "));
	var _bookmarkField = document.createElement("input");
	_bookmarkField.type = "text";
	_bookmarkField.name = "bookmarkName";
	_bookmarkField.value = "";
	_caption.className = "codeTextAreaDialogCaption";
	_bookmarkDialogNode.appendChild(_caption)
	_bookmarkDialogNode.appendChild(_bookmarkField);

	var _self = this;
	dojo.connect(source, "resize", function(){
		bookmarksBar.style.height = source.getHeight() + "px";
	});

	var bookmarkDialog = new dijit.Dialog({
	        title: "Add Bookmark",
	        duration: 40
	    }, _bookmarkDialogNode
    );	
    dojo.connect(bookmarkDialog, "hide", 
		function(){ 
			bookmarkDialog.domNode.getElementsByTagName("input")[0].blur();  
			source._blockedEvents = false;
            document.body.focus();
	});
    dojo.connect(bookmarkDialog.titleBar, "focus", function(){
            _bookmarkField.focus();  
            _bookmarkField.select();  
    });

	var showBookmarkDialog = function(index){
		source._blockedEvents = true;
		_bookmarkField.value = source.getLineContent(source.linesCollection[index]);
		_action = "add";
		bookmarkDialog.show();
	};

	var normalizePosition = function(params){
		var signum = params.signum;
		for(var i = 0; i < bookmarks.length; i++){
			var placeholder = bookmarks[i].placeholder;
			if(params.position <= bookmarks[i].index || (params.position == bookmarks[i].index + 1 && source.x == 0)){
				bookmarks[i].index += (signum*params.rows);
			}
			bookmarks[i].bookmark.style.top = bookmarks[i].index*lineHeight + "px";
			placeholder.style.top = parseInt((bookmarks[i].index / source.linesCollection.length)*source.getHeight()) + "px";
		}
	};
	var gotoBookmark = function(oBookmark){
		source.setCaretPosition(0, oBookmark.index);
	};
	var enableBookmark = function(index){
		var bookmark = document.createElement("div");
		bookmark.className = "bookmark";
		bookmark.appendChild(document.createTextNode("B"));
		bookmark.style.top = index*lineHeight + "px";
		source.leftBand.appendChild(bookmark);
		var placeholder = document.createElement("div");
		placeholder.className = "placeholder";
		placeholder.style.left = "0px";
		var oBookmark = {
			index: index,
			placeholder: placeholder,
			bookmark: bookmark
		};
		dojo.connect(placeholder, "onclick", function(e){ gotoBookmark(oBookmark) });
		placeholder.style.top = parseInt((index / source.linesCollection.length)*source.getHeight()) + "px";
		bookmarksBar.appendChild(placeholder);
		bookmark.title = _bookmarkField.value;
		placeholder.title = _bookmarkField.value;
		bookmark.style.visibility = "visible";
		
		bookmarks.push(oBookmark);
	};

	dojo.subscribe(source.id + "::addNewLine", normalizePosition);
	dojo.subscribe(source.id + "::removeLine", normalizePosition);

    dojo.connect(_bookmarkField, "onkeypress", function(evt){
        var evt = dojo.fixEvent(evt||window.event);
		var _value;            
        if(evt.keyCode == dojo.keys.ENTER){
			if(_action != "add"){ return; }
			enableBookmark(targetLine);
            bookmarkDialog.hide();
            dojo.stopEvent(evt);
            document.body.focus();
        }
        evt.stopPropagation();
    });
	var hasBookmark = function(index){
		var _hasBookmark = false;
		for(var i = 0; i < bookmarks.length; i++){
			if(index == bookmarks[i].index){
				_hasBookmark = true;
				break;
			}
		}
		return _hasBookmark;
	};
	var addBookmark = function(e){
		if(targetLine >= source.linesCollection.length){
			return;
		}
		showBookmarkDialog(targetLine);
	};

	var removeBookmark = function(index){
		for(var i = 0; i < bookmarks.length; i++){
			var bookmark = bookmarks[i];
			if(index == bookmark.index){
				source.removeFromDOM(bookmark.placeholder);
				source.removeFromDOM(bookmark.bookmark);
				bookmarks.splice(i, 1);
				delete bookmark.placeholder;
				delete bookmark.bookmark;
				delete bookmark.index;
				bookmark = null;
				break;
			}
		}
		_action = "remove";
	};

	var leftBandMenu = new dijit.Menu({targetNodeIds: [source.leftBand.id], id:[source.leftBand.id] + "-menu"});

	var onMenuOpen = function(e){
		targetLine = parseInt((e.y + source.domNode.scrollTop - dojo.coords(source.domNode).y) / lineHeight);
		leftBandMenu.destroyDescendants();
		var menuItem;
		if(!hasBookmark(targetLine)){
			menuItem = new dijit.MenuItem({
				label: "Add bookmark", 
				onClick: function(e){ addBookmark(e); } 
			});
		}else{
			menuItem = new dijit.MenuItem({
				label: "Remove bookmark", 
				onClick: function(e){ removeBookmark(targetLine); } 
			});
		}
		leftBandMenu.addChild(menuItem);
	};
	
	dojo.connect(leftBandMenu, "onOpen", this, function(e){ onMenuOpen(e); });
	leftBandMenu.startup();
};

KatanaIDE._codeTextArea.plugins.MatchingBrackets = {};

KatanaIDE._codeTextArea.plugins.MatchingBrackets.startup = function(args){
	var source = args.source;
	var brackets = [];
	var currentBrackets = [];
	var getX = source.getTokenX;

	var isBracket = function(token){
		return token.getAttribute("tokenType").indexOf("bracket") != -1;
	};
	var getBracketType = function(token){
		var tokenType = token.getAttribute("tokenType");
		return tokenType.substring(tokenType.indexOf("-") + 1);
	};

	var getBracketStatus = function(token){
		var tokenType = token.getAttribute("tokenType");
		return tokenType.substring(0, tokenType.indexOf("-"));
	};

	var removeColors = function(){
		for(var i = 0; i < currentBrackets.length; i++){
			dojo.removeClass(dojo.byId(currentBrackets[i]), "matchingBracket");
		}
		currentBrackets.length = 0;
	};

	var makeBracketsList = function(){
		var bracketsToAdd = dojo.query("[tokenType$=bracket]", source.domNode);
		if(!bracketsToAdd.length){
			return;
		}
		brackets.length = 0;
		brackets = bracketsToAdd;
		setBracketColors();
	};

	var colorize = function(token){
		var bracketType = getBracketType(token);
		var status = getBracketStatus(token);
		var matchingStatus = status == "open" ? "closed" : "open";
		var startIndex = -1;
		var matchingCounter = 0;
		
		var increment = 1;
		var i = 0;
		var parsedBrackets = 0;
		if(status == "closed"){
			increment = -1;
			i = brackets.length - 1;
		}
		while(parsedBrackets < brackets.length){
			if(startIndex != -1){
				if(getBracketStatus(brackets[i]) == matchingStatus){
					if(getBracketType(brackets[i]) == bracketType){
						matchingCounter--;
						if(!matchingCounter){
							currentBrackets.push(brackets[startIndex]);
							currentBrackets.push(brackets[i]);
							break;
						}
					}
				}else{ //same status
					if(getBracketType(brackets[i]) == bracketType){
						matchingCounter++;
					}						
				}
			}else{
				if(brackets[i] === token){
					startIndex = i;		
					matchingCounter = 1;				
				}
			}
			parsedBrackets++;
			i += increment;
		}
		if(currentBrackets.length == 2){
			for(var i = 0; i < 2; i++){
				dojo.addClass(currentBrackets[i], "matchingBracket");
			}
		}else{
			// only one bracket found
			currentBrackets.length = 0;
		}		
	};

	var setBracketColors = function(){
		removeColors();
		var token = source.currentToken;
		if(isBracket(token)){
			colorize(token);
		}
	};
	var deleteRemovedBrackets = function(){
		for(var i = brackets.length - 1; i >= 0; i--){
			if(!brackets[i].parentNode){
				brackets.splice(i, 1);
			}
		}
	};
	var insertBracket = function(bracket){
		var len = brackets.length;
		var i = 0;
		while(i < len && source.compareTokenPosition({token:brackets[i], index:0}, {token:bracket, index:0}) == -1){
			i++;
		}
		brackets.splice(i, 0, bracket);
	};
	var pushBracket = function(){
		var token = source.currentToken;
		if(isBracket(token)){
			deleteRemovedBrackets();
			insertBracket(token);
		}
	};
	var gotoMatchingBracket = function(data){
		var evt = data.evt;
        if(evt.ctrlKey && evt.charCode == 98){ // ctrl + b
			var token = source.currentToken;
			if(isBracket(token)){
				var targetToken = null;
				var matchingToken = null;
				for(var i = 0; i < currentBrackets.length; i++){
					if(currentBrackets[i] === token){
						matchingToken = currentBrackets[i];																	
					}else{
						targetToken = currentBrackets[i];
					}
				}
				if(targetToken && matchingToken){
					source.setCaretPosition(getX(targetToken), source.indexOf(targetToken.parentNode));
				}
			}
		}		
	};
	
	dojo.subscribe(source.id + "::writeToken", pushBracket);
	dojo.subscribe(source.id + "::CaretMove", setBracketColors);
	dojo.subscribe(source.id + "::removeCharAtCaret", setBracketColors);
	dojo.subscribe(source.id + "::documentParsed", makeBracketsList);
    dojo.subscribe(source.id + "::viewportParsed", makeBracketsList);
	dojo.subscribe(source.id + "::KeyPressed", gotoMatchingBracket);
};

// replace dojox.data.dom.textContent

dojo.declare(
    "openstar.apps.KatanaIDE.CodeTextArea",
	[_Widget, _Templated],
    {
		templateString:"<div class=\"dojoCodeTextArea\" dojoAttachPoint=\"codeTextAreaContainer\" style=\"height:${height}px; width:${width}px\"\n\t><table class=\"dojoCodeTextAreaWrapper\" dojoAttachPoint=\"codeTextAreaWrapper\"\n\t\t><tbody\n\t\t\t><tr\n\t\t\t\t><td><div class=\"dojoCodeTextAreaBand\" dojoAttachPoint=\"leftBand\"><ol></ol></div\n\t\t\t\t></td\n\t\t\t\t><td><div class=\"dojoCodeTextAreaHL\" style=\"position:absolute;top:0;z-index:10\" dojoAttachPoint=\"currentLineHighLight\"\n\t\t\t\t\t\t><div dojoAttachPoint=\"caret\" style=\"position:absolute;top:0;left:0\" class=\"dojoCodeTextAreaCaret\">&nbsp;</div\n\t\t\t\t\t\t>&nbsp;</div\n                \t><div class=\"dojoCodeTextAreaLines\" dojoAttachPoint=\"lines\"></div\n                ></td\n            ></tr\n        ></tbody\n    ></table\n></div>\n",
        isContainer: true,

        // parameters
        height: "100%",
        width: "100%",
        // attach points
        currentLineHighLight: null,
        caret: null,
        // x: Integer
        x: 0,
        // y: Integer
        y: 0,
        plugins: "",
		resizeTo: "",
        // _caretWidth: Integer
        _caretWidth: 0,
        // lineHeight: Integer
        lineHeight: 0,
        /*boolean*/
        _specialKeyPressed: false,
        _clipboard: null,
        _range: null,
        _lineTerminator: null,
        
        /* parser */
        rowsToParse: 100,
        parserInterval: 500,
        parsedRows: 0,
        parserTimeout: null,
        
        codeTextAreaContainer: null,
        linesCollection: null,

        currentLine: null,
        currentToken: null,
        lastToken: null,
        caretIndex: 0,
        lastCaretIndex: 0,
        colorsUrl: "",
        autocompleteUrl: "",
		selectInProgress: false,
        _command: 0,
		_blockedEvents: false,
        commands: {},
        autocompleteDictionary: {},
        colorsDictionary: {},
        _suggestionBlocked: false,
        _eventHandlers: [],
        suggestionsCombo: null,
        _targetToken: null,
        _preventLoops: false,

		// undo vars
       	_undoStack: [],
       	_undoStackIndex: -1,
        _lastEditCoords: {x:0, y:0},
		_pushNextAction: false,

        _symbols: [
        	{"."    : "context-separator"},
        	{"'"    : "single-quote"},
        	{"\""   : "double-quote"},
        	{" "    : "separator"},
        	{"    " : "separator"},
        	{"/*"   : "open-block-comment"},
        	{"*/"   : "closed-block-comment"},
        	{"("    : "open-round-bracket"},
        	{")"    : "closed-round-bracket"},
        	{"["    : "open-square-bracket"},
        	{"]"    : "closed-square-bracket"},
        	{"{"    : "open-curly-bracket"},
        	{"}"    : "closed-curly-bracket"}
        ],
		uniqueTokens:{
			"open-round-bracket": true,
			"open-square-bracket": true,
			"open-curly-bracket": true,
			"closed-round-bracket": true,
			"closed-square-bracket": true,
			"closed-curly-bracket": true,
			"single-quote": true,
			"double-quote": true,
			"context-separator": true
		},
        postCreate: function(){
			var self = this;
			if(this.resizeTo){
				var container = dijit.byId(this.resizeTo); 
				if(container){
					dojo.connect(container, "resize", function(){
						var coords = dojo.coords(dojo.byId(self.resizeTo));
						self.resize({ w:coords.w, h:coords.h });
					});
				}
			}
			this.leftBand.id = this.id + "leftBand";
			this.lines.style.width = (dojo.coords(this.domNode).w - dojo.coords(this.leftBand).w) + "px";
            this.loadDictionary(this.autocompleteUrl, dojo.hitch(this, this._autocompleteFiller));
            this.loadDictionary(this.colorsUrl, dojo.hitch(this, this._colorsFiller));
            this.linesCollection = this.lines.getElementsByTagName("div");
            this.setDimensions();
            this.startPlugins();
            this._initializeInternals();
            // line terminator
            this._createLineTerminator();

            this._initializeDoc();
            this._initializeClipboard();
            this._initializeSuggestionsPopup();
            this._initializeRange();
			
			this._addRowNumber({position: 1, rows:100});
			// bottleneck with large documents
	    	dojo.subscribe(this.id + "::addNewLine", dojo.hitch(this, self._addRowNumber));
	    	dojo.subscribe(this.id + "::removeLine", dojo.hitch(this, self._removeRowNumber));
			
            // initial status
            this._command = "";

            this.attachEvents();
            document.body.focus();
            //dojo.connect(dojo.body(), "onclick", this, function(e){ 
			//	e.stopPropagation();
			//	return false; 
			//});
            //dojo.connect(this.domNode, "onmouseup", this, "setCaretPositionAtPointer");
            dojo.connect(this.domNode, "onmouseup", this, "mouseUpHandler");
            dojo.connect(this.domNode, "onmousedown", this, "startSelection");
//            dojo.connect(this.domNode, "onmousemove", this, "mouseMoveHandler");
//            dojo.connect(document.body, "onselectstart", this, "startSelection"); // ie
            //dojo.connect(this.domNode, "onclick", this, "blur");
            this.setCaretPosition(0, 0); 
        },
		mouseUpHandler: function(e){
			this.selectInProgress = false;
			this.setCaretPositionAtPointer(e);
		},
		mouseMoveHandler: function(e){
			if(!this.selectInProgress){ return; }
			var kwPar = {
				token: this.currentToken,
				index: this.caretIndex
			};
			this.setCaretPositionAtPointer(e);
			this.addToSelection(kwPar);
		},
        startSelection: function(e){
    		if(this.getSelection().getSelectedText().length){
    			if(e.button != 2) this.getSelection().collapse();
    		}
			this.setCaretPositionAtPointer(e);
			
			this.selectInProgress = true;
//            dojo.stopEvent(e);
//            e.preventDefault();
            // selection
            var evt = dojo.fixEvent(e),
                coords = dojo.coords(this.domNode),
                y = Math.min(parseInt(Math.max(0, evt.clientY - coords.y + this.domNode.scrollTop) / this.lineHeight), this.numLines()-1),
                x = Math.min(parseInt(Math.max(0, evt.layerX + this.domNode.scrollLeft) / this._caretWidth), this.getLineLength(y))
            ;
//            return false;
        },
		resize: function(args){
		    if (args) {
			  this.domNode.parentNode.style.width = args.w + "px";
			  this.domNode.style.height = args.h + "px";
			  this.height = args.h;
			  this.width = args.w;
			}
		},
        _initializeSuggestionsPopup: function(){
            var comboNode = document.createElement("div");
            dojo.style(comboNode, {
                position: "absolute",
                top: "0",
                left: "0",
                display: "none"
            });
            this.domNode.parentNode.appendChild(comboNode);
            var store = new dojo.data.ItemFileReadStore({url: this.autocompleteUrl });
            
            this.suggestionsCombo = new dijit.form.ComboBox({
				name: "suggestions",
				autoComplete: false,
				store: store,
                hasDownArrow: false,
				searchAttr: "name"
			}, comboNode);
			var dn = this.suggestionsCombo.domNode;
			var s = dn.style;
    		s.position = "absolute";
    		s.display = "none";
    		s.zIndex = "100";
            s.display = "inline"; // added 10/03/2007
            dojo.connect(dn, "onkeyup", dojo.hitch(this, this.autocomplete));
            dojo.addClass(this.suggestionsCombo.textbox, "suggester");
        },
        _initializeInternals: function(){
            this.commands = {
                NONE: 0,
                PASTE: 1,
                SELECTALL: 5,
                CLEARSELECTION: 5
            };
        },
        _initializeClipboard: function(){
            this._clipboard = document.createElement("textarea");
            this._clipboard.style.position = "absolute";
            this._clipboard.style.top = "-100px";
            this._clipboard.style.left = "-100px";
            this._clipboard.style.width = "0";
            this._clipboard.style.height = "0";
            document.body.appendChild(this._clipboard);
//            console.log("clipboard initialized");
        },
		clearDocument: function(){
			this.lines.innerHTML = "";
			this.leftBand.getElementsByTagName("ol")[0].innerHTML = "";
			this._addRowNumber({position: 1, rows:100});
			this._initializeDoc();
			this.setCaretPosition(0, 0);
		},
        blur: function(){
            // to solve IE scroll problem; find another solution
//            document.body.focus();
        },
        loadDictionary: function(url, callBack){
            var _self = this;
            var getArgs = {
                url: url,
                sync: true,
                handleAs: "json-comment-optional",
                error: function(err){
                	_self._dictionaryLoadError(err)
                },
                load: function(result){
                	dojo.hitch(_self, callBack(result));
            	}
            };
            dojo.xhrGet(getArgs);
        },
        _colorsFiller: function(data){
        	var cDict = {};
        	for(var i in data){
        		var keys = i.split("|");
        		for(var j = 0, k = keys.length; j < k; j++){
        			cDict[keys[j]] = {};
        			cDict[keys[j]].className = data[i].className;
        		}
        	}
            this.colorsDictionary = cDict;
        },
        _autocompleteFiller: function(data){
        	data = this._expandAutoCompleteLinks(data);
            this.autocompleteDictionary = data;
        },
        _expandAutoCompleteLinks: function(/*Object*/ data){
        	if(data.links){
        		var links = data.links || [];
        		// foreach pair (link --> target)
        		for(var i = 0; i < links.length; i++){
        			var linkPath = links[i]["link"].split(".");
        			var targetPath = links[i]["target"].split(".");
        			var currentLink = data;
        			var currentTarget = data;
        			for(var j = 0; j < linkPath.length; j++){
        				currentLink = currentLink.children[linkPath[j]];
        			}
        			currentLink = currentLink ? currentLink : data;
        			for(var j = 0; j < targetPath.length; j++){
        				currentTarget = currentTarget.children[targetPath[j]];
        			}
        			for(var k in currentTarget.children){
	        			currentLink.children[k] = currentTarget.children[k];
        			} 
        		}
        	}
       		return data;
        },
        _dictionaryLoadError: function(error){
            window.alert(error);
        },
		setWidth: function(width){
			return this.width = width;
		},
		setHeight: function(height){
			return this.height = height;
		},
		getWidth: function(){
			return this.width;//dojo.coords(this.domNode).w;
		},
		getHeight: function(){
			return this.height;//dojo.coords(this.domNode).h;
		},
        getLineLength: function(/*int*/ y){
            var line = this.linesCollection[y];
            return line ? this.getLineContent(line).length-1 : 0;  
        },
		getLineContent: function(line){
			return dojoxDom.textContent(line);
		},
        numLines: function(){
            return this.linesCollection.length;
        },
        clearUndoHistory: function(){
           	this._undoStack = [];
           	this._undoStackIndex = -1;
            this._lastEditCoords = {x:0, y:0};
    		this._pushNextAction = false;
        },
        execCommand: function(command){
            var cmd = this.commands;
            switch (command){
                case cmd.PASTE:
					this.detachEvents();
					var startToken = this.currentToken;
					var startIndex = this.caretIndex;
                    var changes = this.massiveWrite(this._clipboard.value);
					if(changes){ 
						this.removeRedoHistory(); 
						if(this._pushNextAction ||
							!this._undoStack.length 
							|| this._undoStack[this._undoStack.length - 1].action != "massiveWrite" 
							|| this.x != this._lastEditCoords.x || this.y != this._lastEditCoords.y){
							this.pushIntoUndoStack({action: "massiveWrite", data: changes.data, startCoords: changes.startCoords, endCoords: {x: this.x, y: this.y}});		
						}else{
							this._undoStack[this._undoStack.length - 1].data += changes.data;
						}
	                	this._lastEditCoords = {x:this.x, y:this.y};
					}
                    this.attachEvents();
                break;
                case cmd.SELECTALL:
	                if(this.lines.firstChild){
	                	var r = this._range;
						r.setStartBefore(this.lines.firstChild);
						r.setEndAfter(this.lines.lastChild);
						this.selectRange(r);
					}
                break;
                case cmd.CLEARSELECTION:
					this.clearSelection();
                default:
                break;
            }
            this._command = cmd.NONE;
        },
        scrollHandler: function(evt){
            this.parseViewport();
        },
        keyUpHandler: function(evt){
			if(this._blockedEvents){ return; }
            var cmd = this.commands;
            switch (this._command){
                case cmd.PASTE:
                    this.execCommand(this._command);
                break;
                default:
                break;
            }
        },
        selectRange: function(/*range*/ r){
			// from dijit._editor.selection
			var _document = dojo.doc;
			if(_document.selection && dojo.body().createTextRange){ // IE
				r._select(); //mmmpf, private method
			}else if(dojo.global["getSelection"]){
				var selection = dojo.global.getSelection();
				// FIXME: does this work on Safari?
				if(selection["removeAllRanges"]){ // Mozilla
					//var range = _document.createRange() ;
					//range.selectNode(element);
					selection.removeAllRanges();
					selection.addRange(r) ;
				}
			}
        	
        },
        _initializeRange: function(){
            this._range = dijit.range.create();
        },
        getSelection: function(){
        	return dijit._editor.selection;
        },
        getSelectedText: function(){
			return dijit._editor.selection.getSelectedText();
        },
        getSelectedHtml: function(){
			return dijit._editor.selection.getSelectedHtml();
        },
        selectNode: function(node){
            // TODO
        },
        clearSelection: function(){
			var _document = dojo.doc,
			    r = this._range
			;
			if(_document.selection && dojo.body().createTextRange){ // IE
				_document.selection.empty();
			}else if(dojo.global["getSelection"]){
				var selection = dojo.global.getSelection();
				if(selection["removeAllRanges"]){ // Mozilla
					selection.removeAllRanges();
				}
			}
        },
		getTokenPosition: function(token, index){
			index = index || 0;
			var x = this.getTokenX(token) + index,
			    y = this.indexOf(token.parentNode)
			;
			return {x: x, y: y};
		},
        compareTokenPosition: function(/*token*/ fromToken, /*token*/ toToken){
        	// returns:
        	//  0: same token and position
        	// -1: fromToken/index is before
        	//  1: fromToken/index is after
			var firstToken = fromToken.token,
			    firstIndex = fromToken.index,
			    secondToken = toToken.token,
			    secondIndex = toToken.index,
			    indexOf = this.indexOf,
			    firstParent = firstToken.parentNode,
			    secondParent = secondToken.parentNode
			;
			if(firstToken === secondToken && firstIndex == secondIndex){
				return 0;
			}else if( (indexOf(firstParent) < indexOf(secondParent))
				|| 
					((indexOf(firstParent) == indexOf(secondParent))
					&&
					(indexOf(firstToken) < indexOf(secondToken))) 
				||  
					((indexOf(firstParent) == indexOf(secondParent))
					&&
					(indexOf(firstToken) == indexOf(secondToken))
					&&
					(firstIndex < secondIndex)) ){
				return -1;
			}else{
				return 1;
			}
        },
        addToSelection: function(/*Object*/ kwPar){
			// kwPar: oldToken, oldIndex
			var oldToken = kwPar.token,
			    oldIndex = kwPar.index,
			    newToken = this.currentToken,
			    newIndex = this.caretIndex
			;
			if(this.getSelectedText().length == 0){
				this._range.detach();
	            this._range = dijit.range.create();
				this._range.setStart(oldToken.firstChild, oldIndex);
				this._range.setEnd(oldToken.firstChild, oldIndex);
			}

			var selectionStartToken = this.getSelectionStartToken(),
			    selectionStartIndex = this.getSelectionStartIndex(),
			    selectionEndToken = this.getSelectionEndToken(),
			    selectionEndIndex = this.getSelectionEndIndex()
			;

			if(this.getSelectedText().length){
				// inversion begin
				if(!this.compareTokenPosition({token:oldToken, index:oldIndex},{token:selectionStartToken,index:selectionStartIndex}) 
					&&
					(this.compareTokenPosition({token:newToken, index:newIndex},{token:selectionEndToken,index:selectionEndIndex}) == 1)){
					oldToken = this.getSelectionEndToken();
					oldIndex = this.getSelectionEndIndex();
					this._range.setStart(selectionEndToken.firstChild, selectionEndIndex);
				}
				if(!this.compareTokenPosition({token:oldToken, index:oldIndex},{token:selectionEndToken,index:selectionEndIndex}) 
					&&
					(this.compareTokenPosition({token:newToken, index:newIndex},{token:selectionStartToken,index:selectionStartIndex}) == -1)){
					oldToken = this.getSelectionEndToken();
					oldIndex = this.getSelectionEndIndex();
					this._range.setEnd(selectionStartToken.firstChild, selectionStartIndex);
				}
				// inversion end
			}
			// 4 cases
			if((this.compareTokenPosition({token:oldToken, index:oldIndex},{token:newToken,index:newIndex}) == -1)){
//				console.debug("--> ");
				if (this.compareTokenPosition({token:newToken, index:newIndex},{token:selectionEndToken,index:selectionEndIndex}) == 1){
				// 1) |__|-->I
					this._range.setEnd(newToken.firstChild, newIndex);
				}else{
				// 2) |-->__|
					this._range.setStart(newToken.firstChild, newIndex);
				}
			}else{ 
//				console.debug("<--");
				if (this.compareTokenPosition({token:newToken, index:newIndex},{token:selectionStartToken,index:selectionStartIndex}) == -1){
				// 3) I<--|__|
					this._range.setStart(newToken.firstChild, newIndex);
				}else{
				// 4) |__<--|
					this._range.setEnd(newToken.firstChild, newIndex);
				}
			}
			this.selectRange(this._range);
        },
        indexOf: function(node){
        	var parent = node.parentNode,
        	    children = parent.childNodes,
        	    len = children.length
        	;
        	for(var i = 0; i < len; i++){
        		if(children[i] === node){
        			return i;
        		}
        	}
        	return -1;
        },
        moveCaretAtToken: function(/*token*/ token, /*integer*/ offset){
        	var line = token.parentNode,
        	    y = this.indexOf(line),
        	    targetOffset = offset || 0
        	;
        	this.setCaretPosition(this.getTokenX(token) + targetOffset, y);
        },
        removeSelection: function(){
            console.log("remove selection 1");
			if(dojo.doc["selection"]){
				var _sel = dijit.range.getSelection(window);
				this._range = _sel.getRangeAt(0);
			}else{
				this._range = dojo.global.getSelection().getRangeAt(0); // FF only
			}
			console.log("remove selection 2");
			var selectedText = this.getSelectedText(),
			    startToken = this._range.startContainer.parentNode,
			    endToken = this._range.endContainer.parentNode,
			    startOffset = this._range.startOffset,
			    endOffset = this._range.endOffset,
			    startLine = startToken.parentNode,
			    endLine = endToken.parentNode,
			    currentToken = startToken.nextSibling
			;
			this.moveCaretAtToken(startToken, startOffset);

       		this.clearSelection();

			var oldContent = startToken.firstChild.data;
			if(startToken === endToken){
				startToken.firstChild.data = oldContent.substring(0, startOffset) + oldContent.substring(endOffset);
			}else{
				// startLine begin
				startToken.firstChild.data = oldContent.substring(0, startOffset);
				var nextToken;
				if(currentToken && currentToken !== endToken){ // change in do..while
					do{
						nextToken = currentToken.nextSibling;
						this.removeFromDOM(currentToken);
						currentToken = nextToken;
					}while(nextToken && nextToken !== endToken); 
				}
				// startLine end

				// middle lines begin
				if(this.indexOf(startLine) < this.indexOf(endLine) - 1){
					var currentLine = startLine.nextSibling;
					var nextLine;
					while(currentLine && (currentLine !== endLine)){
						nextLine = currentLine.nextSibling;
						this.removeFromDOM(currentLine);
						currentLine = nextLine;
					}						
				}
				// middle lines end
				
				// endLine begin
				currentToken = endToken.previousSibling;
				var previousToken;
				if(currentToken && currentToken !== startToken){ // convert in while..do
					do{
						previousToken = currentToken.previousSibling;
						this.removeFromDOM(currentToken);
						currentToken = previousToken;
					}while(previousToken && previousToken !== startToken);
				}
				// endLine end
				oldContent = endToken.firstChild.data;
				endToken.firstChild.data = oldContent.substring(endOffset);

				
			} // end else						
			/* remove the last line if endLine !== startLine */
			if((endLine !== startLine)){
				currentToken = endToken;
				while(currentToken){
					startLine.appendChild(currentToken.cloneNode(true));
					currentToken = currentToken.nextSibling;
				}
				this.removeFromDOM(endLine);
			}

			if(!startToken.firstChild.data.length){ this.removeFromDOM(startToken) };
			if(!endToken.firstChild.data.length){ this.removeFromDOM(endToken) };
			
      		this.setCurrentTokenAtCaret();
      		if(this.currentToken && this.previousToken){
            	this.mergeSimilarTokens(this.previousToken, this.currentToken);
            }
            this.colorizeToken(this.currentToken);
			return {data:selectedText}
        },
		// find a better name for this method
		removeSelectionWithUndo: function(){
            var sel = document.selection || document.getSelection();
			if(!this._range.startContainer){ return }; // ie
			var startToken = this._range.startContainer.parentNode,
			    endToken = this._range.endContainer.parentNode,
			    startOffset = this._range.startOffset,
			    endOffset = this._range.endOffset,
			    startLine = startToken.parentNode,
			    endLine = endToken.parentNode,
			    selStartCoords = this.getTokenPosition(startToken, startOffset),
			    selEndCoords = this.getTokenPosition(endToken, endOffset),
			    changes = this.removeSelection(),
			    endCoords = {x: this.x, y: this.y}
			;
			this.pushIntoUndoStack({
				action: "removeSelection",
				endCoords: endCoords,
				selStartCoords: selStartCoords,
				selEndCoords: selEndCoords,
				data: changes.data
			});
		},
        keyPressHandler: function(evt){
			if(this._blockedEvents){ return; }
            if (this._preventLoops){
                this._preventLoops = false;
                return;
            }
            this._specialKeyPressed = true;//IE
            evt = dojo.fixEvent(evt || window.event);
            dojo.publish(this.id + "::KeyPressed", [{ source: this,evt: evt }]);
            var keyCode = evt.keyCode,
                charCode = evt.charCode,
            //console.debug("2-> charCode/keyCode: "+evt.charCode+"/"+evt.keyCode);
                dk = dojo.keys,
                x = this.x,
                y = this.y,
                lines = this.linesCollection,
                resCode = charCode || keyCode,
                cmd = this.commands
            ;
            switch(resCode){
            	case 0:
            		// ALT-GR
            	break;
                case dk.ESCAPE:
                break;
                case dk.BACKSPACE:
                    // refactor! shared code with caret left...
         			//this.clearSelection();
         			if(!this.getSelection().getSelectedText().length){
         				if(!(x || y)){ return; }
						var _oldX = this.x,
						    _oldY = this.y
						;
	                    if(x){
	                       this.setCaretPosition(x-1, y);
	                    }else if(y){
	                       this.setCaretPosition(this.getLineLength(y - 1), y-1);
	                    }
	                    var changes = this.removeCharAtCaret();
						if(changes){
							if(this._pushNextAction || 
							!this._undoStack.length || this._undoStack[this._undoStack.length - 1].action != "removeCharBS" 
							|| _oldX != this._lastEditCoords.x || _oldY != this._lastEditCoords.y){
								this.pushIntoUndoStack({
									action: "removeCharBS", 
									data: changes.data, 
									coords: {x: this.x, y: this.y},
									startCoords: {x: _oldX, y: _oldY}
								});		
							}else{
								// au contraire...
								this._undoStack[this._undoStack.length - 1].data = changes.data + this._undoStack[this._undoStack.length - 1].data;
								this._undoStack[this._undoStack.length - 1].coords = {x: this.x, y: this.y};
							}
						}
         			}else{
						this.removeSelectionWithUndo();
         			}
	                this._lastEditCoords = { x: this.x, y: this.y };
                break;
				case dk.CAPS_LOCK:
				break;
                case dk.DELETE:
                    if(charCode == dk.DELETE){ 
                        this._specialKeyPressed = false;
                        break; 
                    }
         			if(!this.getSelection().getSelectedText().length){
	                    var changes = this.removeCharAtCaret();
						if(changes){
							if(this._pushNextAction || 
							!this._undoStack.length || this._undoStack[this._undoStack.length - 1].action != "removeCharDel" 
							|| this.x != this._lastEditCoords.x || this.y != this._lastEditCoords.y){
								this.pushIntoUndoStack({
									action: "removeCharDel", 
									data: changes.data, 
									coords: { x: this.x, y: this.y }
								});		
							}else{
								// au contraire...
								this._undoStack[this._undoStack.length - 1].data += changes.data;
							}
						}
         			}else{
						this.removeSelectionWithUndo();
         			}
	                this._lastEditCoords = { x: this.x, y: this.y };
                break;
                case dk.DOWN_ARROW:
                    if(charCode == 0){
                        if(!lines[y + 1]){ dojo.stopEvent(evt); return; }
                        lineLength = this.getLineLength(y+1);
						var kwPar = {
							token: this.currentToken,
							index: this.caretIndex
						};
						
                        this.setCaretPosition(x < lineLength ? x : lineLength, y+1);

                        if(evt.shiftKey){
                        	this.addToSelection(kwPar);
                        }else{
                        	this.clearSelection();
                        }
                    }else{
                        // open round bracket (
                        this._specialKeyPressed = false;
                    }
                break;
                case dk.LEFT_WINDOW:
                    if(charCode == 0){
                    }else{
                        // open square bracket [
                        this._specialKeyPressed = false;
                    }
                break;
                case dk.LEFT_ARROW:
                    if(charCode == 0){
                        if(x){
							var kwPar = {
								token: this.currentToken,
								index: this.caretIndex
							}
                            this.setCaretPosition(x-1, y);
	                        if(evt.shiftKey){
	                        	this.addToSelection(kwPar);
	                        }else{
	                        	this.clearSelection();
	                        }
                        }else if(y){
                           this.setCaretPosition(this.getLineLength(y - 1), y-1);
                        }
                    }else{
                        // percent %
                        this._specialKeyPressed = false;
                    }
                break;
                case dk.RIGHT_ARROW:
                    if(charCode == 0){
                        if(x < this.getLineLength(y)){
							var kwPar = {
								token: this.currentToken,
								index: this.caretIndex
							}
                            this.setCaretPosition(x + 1, y);
                            if(evt.shiftKey){
                            	this.addToSelection(kwPar);
	                        }else{
	                        	this.clearSelection();
	                        }
                        }else if(y<this.numLines()-1){
                            this.setCaretPosition(0, y+1);
                        }
                    }else{
                        // single quote '
                        this._specialKeyPressed = false;
                    }
                break;
                case dk.UP_ARROW:
                    if(charCode == 0){
                        if(y < 1){
                            dojo.stopEvent(evt);
                            return;
                        }
                        lineLength = this.getLineLength(y-1);
						var kwPar = {
							token: this.currentToken,
							index: this.caretIndex
						}

                        this.setCaretPosition(x < lineLength ? x : lineLength, y-1);
                        if(evt.shiftKey){
                        	this.addToSelection(kwPar);
                        }else{
                        	this.clearSelection();
                        }
                    }else{
                        // ampersand &
                        this._specialKeyPressed = false;
                    }
                break;
                case dk.HOME:
                    if(charCode == 0){
                        this.setCaretPosition(0,this.y);
                    }else{
                        // dollar $
                        this._specialKeyPressed = false;
                    }
                break;
                case dk.END:
                    if(charCode == 0){
                        this.setCaretPosition(this.getLineLength(this.y),this.y);
                    }else{
                        // hash #
                        this._specialKeyPressed = false;
                    }
                break;
                case dk.TAB:
                    this.writeTab();
                    dojo.stopEvent(evt);
                break;
				case dk.CTRL:
                break;
				case dk.SHIFT:
                break;
				case dk.ALT:
                break;
				case dk.ENTER:
		            var _oldX = this.x;
		            var _oldY = this.y;
                    var changes = this.splitLineAtCaret(true);
					if(this._pushNextAction || !this._undoStack.length || this._undoStack[this._undoStack.length - 1].action != "newLine" 
					|| _oldX != this._lastEditCoords.x || _oldY != this._lastEditCoords.y){
						this.pushIntoUndoStack({
							action: "newLine", 
							data: 1, 
							coords: {x: this.x, y: this.y}, // remove coords, not used
							startCoords: { x: _oldX, y: _oldY }
						});		
					}else{
						this._undoStack[this._undoStack.length - 1].data++;
						this._undoStack[this._undoStack.length - 1].coords = {x: this.x, y: this.y}; // not used, remove
					}
		            this._lastEditCoords = { x: this.x, y: this.y };
                break;
                case dk.LEFT_WINDOW:
                break;
                case dk.RIGHT_WINDOW:
                break;
                case 97: // a
                    if(!evt.ctrlKey){
                        this._specialKeyPressed = false;
                    }else{
	                    this.execCommand(cmd.SELECTALL);
                	}
                break;
                case 99: // c
                    if(!evt.ctrlKey){
                        this._specialKeyPressed = false;
                    }else{
                        // default browser action
                        return;
                    }
                break;
                case 118: // v
                    if(!evt.ctrlKey){
                        this._specialKeyPressed = false;
                    }else{
                        // ctrl + v
                        this._clipboard.value = "";
                        this._clipboard.focus();
                        this._command = cmd.PASTE;
                        this._specialKeyPressed = true;
                        return false;
                    }
                break;
                case 120: // x
                    if(!evt.ctrlKey){
                        this._specialKeyPressed = false;
                    }else{
                        // ctrl + x
                        this._clipboard.value = this.getSelectedText();
                        this.removeSelection();
                        this._clipboard.focus();
                        this._clipboard.select();
                        this._specialKeyPressed = true;
                        return;
                    }
                break;
                case 122: // z
                    if(!evt.ctrlKey){
                        this._specialKeyPressed = false;
                    }else{
                        // ctrl + z
                        this._specialKeyPressed = true;
                        var _undoStack = this._undoStack;
						this.undo();
                        return;
                    }
                break;
                case 121: // y
                    if(!evt.ctrlKey){
                        this._specialKeyPressed = false;
                    }else{
                        // ctrl + y
                        this._specialKeyPressed = true;
                        evt.preventDefault();
						this.redo();
                        return;
                    }
                break;
                case 32: // space
                    if(!evt.ctrlKey){
                        this._specialKeyPressed = false;
                    }else{
                        this._suggestionBlocked = true;
                        this.detachEvents();
                        this.showSuggestions();
                    }
                break;
                default:
                    if(!evt.ctrlKey){
                        this._specialKeyPressed = false;
                    }
                break;
                
            }
            
            if(!this._specialKeyPressed){ 
                this.write(String.fromCharCode(resCode), true); 
            }
            dojo.stopEvent(evt); // prevent default action (opera) // to TEST!
//            evt.preventDefault(); // prevent default action (opera)
        },
        removeRedoHistory: function(){
            this._undoStack.length = this._undoStackIndex + 1;
        },
        pushIntoUndoStack: function(/*object*/ undoObject){
			this._pushNextAction = false;
           	this.removeRedoHistory();
           	this._undoStack.push(undoObject);
          	this._undoStackIndex++;
        },
        undo: function(){
			this.clearSelection();
			var undoStack = this._undoStack;
        	if(!undoStack.length || this._undoStackIndex < 0){ 
				// nothing to (un)do
				return; 
			} 
			this._pushNextAction = true;
			var undoObject = undoStack[this._undoStackIndex], // pop! (1)
			    action = undoObject.action,
			    coords = undoObject.coords
			;
			if(undoObject.action == "writeToken"){
				var charsToRemove = undoObject.data.length;
				this.setCaretPosition(coords.x, coords.y);
				for(var i = 0; i < charsToRemove; i++){
					this.removeCharAtCaret();				
				}
			}else if(action == "removeCharBS"){
				//var startCoords = undoObject.startCoords;
				this.setCaretPosition(coords.x, coords.y);
				this.write(undoObject.data, true, true);
			}else if(action == "removeCharDel"){
				this.setCaretPosition(coords.x, coords.y);
				this.write(undoObject.data, true, true);
				this.setCaretPosition(coords.x, coords.y);
			}else if(action == "newLine"){
				var startCoords = undoObject.startCoords;
				this.setCaretPosition(startCoords.x, startCoords.y);
				var charsToRemove = undoObject.data;
				for(var i = 0; i < charsToRemove; i++){
					this.removeCharAtCaret(undoObject.data);
				}
			}else if(action == "massiveWrite"){
				var startCoords = undoObject.startCoords,
				    endCoords = undoObject.endCoords
				;
				this.setCaretPosition(startCoords.x, startCoords.y);
				var startToken = this.currentToken,
				    index = this.caretIndex
				;
				this.setCaretPosition(endCoords.x, endCoords.y);
				this.addToSelection({token: startToken, index: index});
				this.removeSelection();
			}else if(action == "removeSelection"){
				var selStartCoords = undoObject.selStartCoords,
				    selEndCoords = undoObject.selEndCoords,
				    endCoords = undoObject.endCoords
				;
				this.setCaretPosition(endCoords.x, endCoords.y);
				this.massiveWrite(undoObject.data);
				this.setCaretPosition(selStartCoords.x, selStartCoords.y);
				var startToken = this.currentToken,
				    index = this.caretIndex
				;
				this.setCaretPosition(selEndCoords.x, selEndCoords.y);
				this.addToSelection({token: startToken, index: index});
				this.setCaretPosition(endCoords.x, endCoords.y);
			}
			if(undoStack.length){
				this._undoStackIndex--; // pop! (2)
			}
        },
        redo: function(){
			this.clearSelection();
			var undoStack = this._undoStack;
        	if(!undoStack.length || /*this._undoStackIndex < 0 ||*/ this._undoStackIndex == undoStack.length - 1){ 
				//nothing to (re)do
				return; 
			}
			this._undoStackIndex++;
			var undoObject = undoStack[this._undoStackIndex],
			    coords = undoObject.coord,
			    action = undoObject.action
			;
			if(action == "writeToken"){
				this.setCaretPosition(coords.x, coords.y);
				this.writeToken(undoObject.data);
				this.moveCaretBy(undoObject.data.length, 0);
			}else if(action == "removeCharBS"){
				var charsToRemove = undoObject.data.length;
				this.setCaretPosition(coords.x, coords.y);
				for(var i = 0; i < charsToRemove; i++){
					this.removeCharAtCaret();				
				}
			}else if(action == "removeCharDel"){
				var charsToRemove = undoObject.data.length;
				this.setCaretPosition(coords.x, coords.y);
				for(var i = 0; i < charsToRemove; i++){
					this.removeCharAtCaret();				
				}
			}else if(action == "newLine"){
				var linesToAdd = undoObject.data,
				    startCoords = undoObject.startCoords
				;
				this.setCaretPosition(startCoords.x, startCoords.y);
				for(var i = 0; i < linesToAdd; i++){
					this.splitLineAtCaret(true);				
				}
			}else if(action == "massiveWrite"){
				var startCoords = undoObject.startCoords;
				this.setCaretPosition(startCoords.x, startCoords.y);
				this.massiveWrite(undoObject.data);
			}else if(action == "removeSelection"){
				var selStartCoords = undoObject.selStartCoords,
				    selEndCoords = undoObject.selEndCoords,
				    endCoords = undoObject.endCoords
				;
				this.setCaretPosition(selStartCoords.x, selStartCoords.y);
				var startToken = this.currentToken,
				    index = this.caretIndex
				;
				this.setCaretPosition(selEndCoords.x, selEndCoords.y);
				this.addToSelection({token: startToken, index: index});
				this.removeSelection();
				this.setCaretPosition(endCoords.x, endCoords.y);
			}
        },
		getContent: function(){
			return this.lines.innerText || this.lines.textContent || '';
		},
        getSelectionStartToken: function(){
        	return this._range.startContainer.parentNode;
        },
        getSelectionEndToken: function(){
        	return this._range.endContainer.parentNode;
        },
        getSelectionStartIndex: function(){
        	return this._range.startOffset;
        },
        getSelectionEndIndex: function(){
        	return this._range.endOffset;
        },
        getSelectionStartX: function(){
        	var x = 0,
			    startToken = this.getSelectionStartToken(),
			    x = this.getSelectionStartIndex(),
			    prev = startToken.previousSibling
			;
			while(prev){
				x += prev.firstChild.data.length;
				prev = prev.previousSibling;
			}
        	return x;
        },
        getSelectionStartY: function(){
        	var y = 0,
			    startToken = this.getSelectionStartToken(),
			    startLine = startToken.parentNode,
			    y = this.indexOf(startLine)
			;
        	return y;
        },
        getSelectionEndX: function(){
        	var x = 0,
			    endToken = this.getSelectionEndToken(),
			    x = this.getSelectionEndIndex(),
			    prev = endToken.previousSibling
			;
			while(prev){
				x += prev.firstChild.data.length;
				prev = prev.previousSibling;
			}
        	return x;
        },
        getSelectionEndY: function(){
        	var y = 0,
			    endToken = this.getSelectionEndToken(),
			    endLine = endToken.parentNode,
			    y = this.indexOf(endLine)
			;
        	return y;
        },
        isCaretAtStartOfSelection: function(/*boolean*/ def){
			if(!(this.getSelectedText() && this.getSelectedText().length)){ return !!def; }
			return ((this.x == this.getSelectionStartX()) && (this.y == this.getSelectionStartY()))
        },
        writeTab: function(){
            this.write("    ", true);
        },
        removeCharAtCaret: function(){
			var removedChar,
                _currentToken = this.currentToken,
                _previousTokenType = _currentToken.getAttribute("tokenType")
            ;
            if(this.y == this.numLines() - 1 && _previousTokenType == "line-terminator"){
                return;
            }
            var _content = _currentToken.firstChild.data,
                _tokenSize = _content.length
            ;
            if(_tokenSize > 1){
				removedChar = _content.substring(this.caretIndex, this.caretIndex + 1)
                _currentToken.firstChild.data = _content.substring(0, this.caretIndex) + 
                    _content.substring(this.caretIndex + 1);
                this.colorizeToken(_currentToken);
            }else{
                _currentToken.parentNode.removeChild(_currentToken);
				removedChar = _currentToken.firstChild.data;
            }

            this.setCurrentTokenAtCaret();

            if(_previousTokenType == "line-terminator"){ 
                this.mergeLinesAtCaret(); 
            }
            _currentToken = this.currentToken;
            var _prevToken = _currentToken.previousSibling;
            this.mergeSimilarTokens(_prevToken, _currentToken);
            this.setCurrentTokenAtCaret();
            this.colorizeToken(this.currentToken);
			dojo.publish(this.id + "::removeCharAtCaret");
			return {data: removedChar};
        },
        removeLine: function(/*line*/ targetLine, /*integer*/ y){
            this.removeFromDOM(targetLine);
            dojo.publish(this.id + "::removeLine", [{rows:1, position:y, signum:-1}]);
        },
        mergeLinesAtCaret: function(){
            var _currentLine = this.currentLine,
                y = this.y
            ;
            if(y<this.numLines()-1){
                var _nextLine = this.getLine(y + 1),
                    _nextElement = _nextLine.firstChild
                ;
                while(_nextElement){
                    _currentLine.appendChild(_nextElement);
                    _nextElement = _nextLine.firstChild;
                }
                this.removeLine(_nextLine, y);
                this.setCurrentTokenAtCaret();
            }
        },
        mergeSimilarTokens: function(/*token*/ sourceToken, /*token*/ targetToken, /*boolean*/ inverted){
        	if(targetToken && sourceToken && targetToken.getAttribute("tokenType") == sourceToken.getAttribute("tokenType") && !this.uniqueTokens[targetToken.getAttribute("tokenType")]){
				if(!inverted){
	            	targetToken.firstChild.data = sourceToken.firstChild.data + targetToken.firstChild.data;
				}else{
	            	targetToken.firstChild.data = targetToken.firstChild.data + sourceToken.firstChild.data;
				}
	            sourceToken.parentNode.removeChild(sourceToken);
            }
        },
        getLine: function(/*int*/ y){
            return this.linesCollection[y];
        },
        splitLineAtCaret: function(/*boolean*/ moveCaret){
            var _previousToken = this.currentToken.previousSibling,
                _token =  this.currentToken,
                _tokensToMove = []
            ;
            while(_token){
                if(_token.getAttribute("tokenType")=="line-terminator"){ break; }
                _tokensToMove.push(_token);
                _token = _token.nextSibling;
            }
            if(this.caretIndex && _tokensToMove[0]){
                var caretIndex = this.caretIndex,
                    _initialContent = _tokensToMove[0].firstChild.data,
                    _tokenType = _tokensToMove[0].getAttribute("tokenType")
                ;
                _tokensToMove[0].firstChild.data = _initialContent.substring(0,caretIndex);
                this.colorizeToken(_tokensToMove[0]);
                _tokensToMove[0] = document.createElement("span");
                _tokensToMove[0].appendChild(document.createTextNode(_initialContent.substring(caretIndex)));
                _tokensToMove[0].setAttribute("tokenType", _tokenType);
                this.colorizeToken(_tokensToMove[0]);
            }
            // addNewLine() changes the currentToken
            var newLine = this.addNewLine();
            for(var i = 0; i < _tokensToMove.length; i++){
                dojo.place(_tokensToMove[i], newLine.lastChild, "before");
            }
            // put the caret on the next line
			if(moveCaret){
				this.setCaretPosition(0, this.y + 1);
			}
        },
        // TODO: find a better name for these methods
        moveCaretBy: function(/*int*/ x, /*int*/ y){
            this.setCaretPosition(this.x + x, this.y + y);
        },
        setCaretPosition: function(/*int*/ x, /*int*/ y, /*boolean*/ noColor){
            this.caret.style.left = x*this._caretWidth + "px";
            this.x = x;
            var _xPx = x * this._caretWidth,
                _yPx = y * this.lineHeight,
                lineHasChanged = this.y !== y
            ;
            this.currentLineHighLight.style.top = _yPx + "px";
            this.y = y;
            this.setCurrentTokenAtCaret({
                lineHasChanged: lineHasChanged
            });
            if(!noColor && this.currentToken.getAttribute("tokenType") != "paste-delimiter"){ this.colorizeToken(this.currentToken); }

            // scroll

			var w = this.getWidth();
			var h = this.getHeight();
            var dim1 = (new Date()).getTime();
            var _yLim =_yPx + 2*this.lineHeight;
            if(_yLim >= h + this.domNode.scrollTop){
                this.domNode.scrollTop = _yLim - h;
            }else if(_yPx < this.domNode.scrollTop){
                this.domNode.scrollTop = _yPx;
            }
            this.currentLineHighLight.style.width = Math.max(w, this._caretWidth*(this.x+1)) + "px"; 
            var _xLim =_xPx + 3*this._caretWidth; // a computed value is better than 3...
            if(_xLim >= w/* + this.domNode.scrollLeft*/){
                this.domNode.scrollLeft = _xLim - w;
            }else if(_xPx < this.domNode.scrollLeft){
                this.domNode.scrollLeft = _xPx;
            }
            dojo.publish(this.id + "::CaretMove", [{x:x + 1,y:y + 1}]);
        },
        getTokenX: function(/*token*/ token){
        	var line = token.parentNode,
        	    children = line.childNodes,
        	    len = children.length,
        	    x = 0, 
        	    i = 0
        	;
        	while(i < len && children[i] !== token){
       			x+= children[i].firstChild && children[i].firstChild.data ? children[i].firstChild.data.length : 0;
        		i++;
        	}
        	return x;
        },
        setCurrentTokenAtCaret: function(args){
            // find the currentToken

            // workaround for a IE performance issue
            if(args && args.lineHasChanged){
                this.currentLine = this.linesCollection[this.y];
            }
            var tokens = this.currentLine.getElementsByTagName("span");
            var x = this.x,
                lastChar = 0,
                firstChar = 0,
                tokensLength = tokens.length
            ;
            for(var i = 0; i < tokensLength; i++){
                firstChar = lastChar;
                lastChar += tokens[i].firstChild.data.length;// + 1; 
                if(x < lastChar){
                    this.currentToken = tokens[i];
                    this.previousToken = i ? tokens[i-1] : null;
                    this.caretIndex = x - firstChar;
                    break;
                }
            }
        },
        getCaretPosition: function(){
            return {x: this.x, y: this.y};
        },
        setDimensions: function(){
            this._caretWidth = dojo.contentBox(this.caret).w;
            this.lineHeight = dojo.contentBox(this.currentLineHighLight).h;
            this.width = dojo.coords(this.domNode).w;
            this.height = dojo.coords(this.domNode).h;
        },
        attachEvents: function(){
            var node = document;
            this._eventHandlers.push(dojo.connect(node, "onkeypress", this, "keyPressHandler"));
            this._eventHandlers.push(dojo.connect(node, "onkeyup", this, "keyUpHandler"));
            this._eventHandlers.push(dojo.connect(this.domNode, "onscroll", this, "scrollHandler"));
        },
        detachEvents: function(){
            for(var i = 0; i < this._eventHandlers.length; i++){
                dojo.disconnect(this._eventHandlers[i]);
            }
            this._eventHandlers.length = 0;
        },
        setCaretPositionAtPointer: function(e){
            var evt = dojo.fixEvent(e),
			    coords = dojo.coords(this.domNode),
                y = Math.min(parseInt(Math.max(0, evt.clientY - coords.y + this.domNode.scrollTop) / this.lineHeight), this.numLines()-1),
                x = Math.min(parseInt(Math.max(0, evt.layerX + this.domNode.scrollLeft) / this._caretWidth), this.getLineLength(y))
            ;
            this.setCaretPosition(x, y);
        },
        createLine: function(){
            var newLine = document.createElement("div");
            newLine.className = "codeTextAreaLine";             
            newLine.style.height = this.lineHeight + "px";
            var _currentToken = this.getLineTerminator();
            newLine.appendChild(_currentToken);
 			this.lastToken = this.currentToken;
            this.currentToken = _currentToken;
            return newLine;
        },
        writeLine: function(/*String*/ text, /*Boolean*/ moveCaret, /*Boolean*/ noUndo){
            if(!text){ return; }
//            var tokens = text.match(/\S+|\s+/g);            
            //var tokens = text.match(/\.+|[\S+|\s+]/g);            
            var tokens = text.match(/\.+|[\S+|\s+]|\(|\)|\[|\]/g);  
            var len = tokens.length;
            for(var i = 0; i < len; i++){
                var token = tokens[i],
                    changes = this.writeToken(token)
                ;
				if(!noUndo){
					if(token){ this.removeRedoHistory(); }
					if(this._pushNextAction ||
						!this._undoStack.length 
						|| changes.typeChange
						|| this._undoStack[this._undoStack.length - 1].action != "writeToken" 
						|| this.x != this._lastEditCoords.x || this.y != this._lastEditCoords.y){
						this.pushIntoUndoStack({action: "writeToken", data: changes.data, coords: {x: this.x, y: this.y}});		
					}else{
						this._undoStack[this._undoStack.length - 1].data += changes.data;
					}
				}
                if(moveCaret){ this.moveCaretBy(token.length, 0); }
			    this._lastEditCoords = {x:this.x, y:this.y};
            }
        },
        addNewLine: function(/*string*/ position){
            var lines = this.linesCollection,
                newLine = this.createLine(),
			    insertionPoint = 0
			;
            if(position == "end"){
                this.lines.appendChild(newLine);
				insertionPoint = this.lines.length + 1;
            }else{
                dojo.place(newLine, lines[this.y], "after");
				insertionPoint = this.y + 1;
            }
            dojo.publish(this.id + "::addNewLine", [{rows:1, position:insertionPoint, signum:1}]);
            return newLine;
        },
        write: function(/*String*/ text, /*Boolean*/ moveCaret, /*Boolean*/ noUndo){
            if(!text){ return; }
            var rows = text.split(/\n\r|\r\n|\r|\n/);
            for(var i = 0; i < rows.length; i++){
                var line;
                if(i){
                    this.splitLineAtCaret(moveCaret);
                }else{
                    line = this.currentLine;
                }
                if(moveCaret){ this.currentLine = line; }
                this.writeLine(rows[i], moveCaret, noUndo);
            }
            //if(moveCaret){ this.setCaretPosition(this.x, this.y); }
        },
        _createLineTerminator: function(){
            this._lineTerminator = document.createElement("span");
            this._lineTerminator.style.visibility = "hidden";
            this._lineTerminator.setAttribute("tokenType", "line-terminator");
            this._lineTerminator.appendChild(document.createTextNode("\u000D"));
        },
        getLineTerminator: function(){
            return this._lineTerminator.cloneNode(true);
        },
        matchSymbol: function(/*Object*/ kwPar){
            var tokenType = kwPar.def,
                _currentChar = kwPar.currentChar,
                i = 0
            ;
            while(i < this._symbols.length){
            	if(this._symbols[i][_currentChar]){
            		tokenType = this._symbols[i][_currentChar];
            		break;
            	}
            	i++;
            }
            return tokenType;
        },
		getViewPort: function(){
			var lineHeight = this.lineHeight,
			    scrollTop = this.domNode.scrollTop,
			    startLine = parseInt(scrollTop / lineHeight),
			    h = this.getHeight(),
			    endLine = Math.min(parseInt((scrollTop + h) / lineHeight), this.linesCollection.length - 1)
			;
			return { startLine: startLine, endLine: endLine };
		},
        writeToken: function(/*String*/ content, /*Boolean*/ moveCaret, /*Boolean*/ substCaret){
            if(!this.currentToken.parentNode){ 
                // currentToken destroyed by the asynch parse
                this.setCurrentTokenAtCaret();
            }
			if(this.getSelection().getSelectedText().length){
	            if(substCaret){ 
	                this.getSelection().collapse(); 
	            }
				this.removeSelectionWithUndo();
			}
			var originalContent = content;
            if(!content){ return; }
			var typeChange = false,
            // parametrize this section [begin]
                wrapper = "span",
                _currentChar = content.charAt(0),
                tokenType = this.matchSymbol({
                currentChar : content.charAt(0),
                def : "word"
            });
			// substitution for " " with \u00a0, because Firefox can't select
			// a string containing spaces
            if(tokenType == "separator"){
            	var len = content.length;
            	content = "";
            	for(var i = 0; i < len; i++){
            		content += "\u00a0";
            	}
            }
            if(substCaret){
				tokenType = substCaret;
				wrapper = "i";
            }
            // parametrize this section [end]
            
            var currentToken = this.currentToken,
                _previousCurrentToken = currentToken,
                currentTokenType = currentToken.getAttribute("tokenType")
            ;
            // two main cases:
            if(this.caretIndex != 0){
                // *************************************************************
                // 1) in a token
                // *************************************************************
                if(tokenType == currentTokenType){// subcase 1: same token type
                    // in the currentToken
                    currentToken.replaceChild(
                        document.createTextNode(
                            currentToken.firstChild.data.substring(0, this.caretIndex)
                            + content + currentToken.firstChild.data.substring(this.caretIndex)
                        ), 
                        currentToken.firstChild
                    );
                }else{// subcase 2: different types
					typeChange = true;
                    var _data = currentToken.firstChild.data,
                        firstText = _data.substring(0, this.caretIndex),
                        lastText = _data.substring(this.caretIndex)
                    ;
                    if(firstText.length != 0){
                        // first token
                        var newToken = document.createElement("span");
                        newToken.appendChild(document.createTextNode(firstText));
                        newToken.setAttribute("tokenType", currentTokenType);
                        dojo.place(newToken, currentToken, "before");
                        
                        // inner token
                        var innerToken = document.createElement(wrapper);
                        innerToken.appendChild(document.createTextNode(content));
                        innerToken.setAttribute("tokenType", tokenType);
                        dojo.place(innerToken, currentToken, "before");

                        if(tokenType == "paste-delimiter"){
	                        //dojo.place(innerToken.cloneNode(true), currentToken, "before");
                        }
    
                        // last token
                        currentToken.replaceChild(document.createTextNode(lastText),
                            currentToken.firstChild);
                        currentToken.setAttribute("tokenType", currentTokenType);
    
                        this.currentToken = currentToken = innerToken;
                    }
                }
            }else{
                // *************************************************************
                // 2) between two tokens
                // *************************************************************
                var _prev = this.currentToken.previousSibling,
                    _targetToken
                ;
                if(_prev && _prev.getAttribute("tokenType") == tokenType && !this.uniqueTokens[tokenType]){
                    _targetToken = _prev;
                    _targetToken.replaceChild(document.createTextNode(_targetToken.firstChild.data + content), _targetToken.firstChild);
                }else if(tokenType == currentTokenType && !this.uniqueTokens[tokenType]/* || currentTokenType == ""*/){
                    // if currentTokenType == "" => first (unique) token in this line
                    _targetToken = this.currentToken;
                    _targetToken.replaceChild(document.createTextNode(content + _targetToken.firstChild.data), _targetToken.firstChild);
                }else{
					typeChange = true;
                    // create a new token
                    _targetToken = document.createElement(wrapper);
                    _targetToken.appendChild(document.createTextNode(content));
                    _targetToken.setAttribute("tokenType", tokenType);
                    if(_prev){
                        dojo.place(_targetToken, _prev, "after");
                        if(tokenType == "paste-delimiter"){
	                        //dojo.place(_targetToken.cloneNode(true), _prev, "after");
                        }
                    }else{
                        dojo.place(_targetToken, this.currentToken, "before");
                        if(tokenType == "paste-delimiter"){
	                        //dojo.place(_targetToken.cloneNode(true), this.currentToken, "before");
                        }
                    }
                }
                this.currentToken = _targetToken;
            }
			dojo.publish(this.id + "::writeToken", [{tokenType:tokenType}]);
			return {data: originalContent, typeChange: typeChange};
        },
        substCaretPosition: function(){
            this.writeToken("-", false, "paste-delimiter"); // params: token, moveCaret, substCaret
        },
        setBookmark: function(){
        	
        },
        _getTextDelimiter: function(/*String*/ text){
			var _index;
            _index = text.indexOf("</i>");
            if(_index == -1){
            	_index = text.indexOf("</I>"); // IE fix
            }
            return _index + 4;
        },
        removeFromDOM: function(/*DOM node*/ target){
        	if(!target.parentNode){ return };
            target.parentNode.removeChild(target);
        },
		parseLine: function(args){
			var lineIndex = args.lineIndex,
			    line = this.linesCollection[lineIndex],
			    lineContent = this.getLineContent(line).replace("\u000D", "").replace("\u000A", ""),
                tokens = [],            
			    cDict = this.colorsDictionary,
			    _previousType = _currentType = _workingToken = _unparsedToken = _rowText = parsedLine = ""
			;
			for(var k = 0; k < lineContent.length; k++){
				// token classification
				var _currentChar = lineContent.charAt(k),
				    _oldChar = _currentChar
				;
				// html START
				if(_currentChar == "&"){
					_currentChar = "&amp;";
				}else if(_currentChar == "\t"){
					_currentChar = "    ";
				}else if(_currentChar == "\u00A0"){
					_currentChar = " ";
				}else if(_currentChar == "<"){
					_currentChar = "&lt;";
				}else if(_currentChar == ">"){
					_currentChar = "&gt;";
				}else if(_currentChar == ";"){
					//window.alert("fullstop");
				}
				// html END
	            _currentType = this.matchSymbol({
	                currentChar : _currentChar,
	                def : "word"
	            });
				
				if(_currentChar == " "){
					_currentChar = "&nbsp;";
				}else if(_currentChar == "    "){ // find a better way to do this
					_currentChar = "&nbsp;&nbsp;&nbsp;&nbsp;";
				}
				
				// type controls

				if(_currentType === _previousType && k < lineContent.length - 1 && !this.uniqueTokens[_currentType]){
					_workingToken += _currentChar;
					_unparsedToken += _oldChar;
				}else{ // type change or end of line
					if(_currentType === _previousType && !this.uniqueTokens[_currentType]){
						_workingToken += _currentChar;
						_unparsedToken += _oldChar;
					}
					if(_previousType){
						var _class = (_workingToken in cDict) ? cDict[_workingToken].className : "";
						parsedLine += "<span class=\"" + _class + "\" tokenType=\"" + _previousType + "\">" + _workingToken + "</span>";
					}
					if(k == lineContent.length - 1 && (_currentType !== _previousType || (_currentType === _previousType && this.uniqueTokens[_currentType])) ){
						var _class = (_currentChar in cDict) ? cDict[_currentChar].className : "";
						parsedLine += "<span class=\"" + _class + "\" tokenType=\"" + _currentType + "\">" + _currentChar + "</span>";
					}
					_workingToken = _currentChar;
					_unparsedToken = _oldChar;
					_previousType = _currentType;
				}
			}
			// 2 aug 2008 start

			//parsedLine += "<span style=\"visibility:hidden\" tokenType=\"line-terminator\">\u000D</span>";
			// 2 aug 2008 end
			line.innerHTML = parsedLine;
			line.appendChild(this.getLineTerminator());
		},
		parseDocument: function(args){
		    this.parsedRows = 0;
			var lines = this.linesCollection,
			    asynch = args.asynch || false
			;
			if(asynch){
			    var self = this,
			        linesCollection = this.linesCollection
			    ;
    			dojo.publish(this.id + "::startParse", [{rowsToParse: linesCollection.length}]);
			    this.parserTimeout = setTimeout(function(){
			        var parsedRows = self.parsedRows,
			            limit = Math.min(self.rowsToParse, linesCollection.length - parsedRows)
			        ;
			        for(var i = 0; i < limit; i++){
			            self.parseLine({lineIndex: parsedRows++});
			        }
        			dojo.publish(self.id + "::parseBlock", [{parsedRows: parsedRows}]);
			        if(parsedRows < self.linesCollection.length){
			            self.parserTimeout = setTimeout(arguments.callee, self.parserInterval);
			        }else{
            			dojo.publish(self.id + "::documentParsed");
			        }
			        self.parsedRows = parsedRows;
			    }, this.parserInterval);
			}else{
    			for(i = lines.startLine; i <= lines.endLine; i++){
    				this.parseLine({lineIndex: i});
    			}
			}
		},
		parseFragment: function(startLine, endLine){
			for(var i = startLine; i <= endLine; i++){
				this.parseLine({lineIndex: i});
			}
		},
		parseViewport: function(args){
			var lines = this.getViewPort(),
			    endLine = lines.endLine
			;
			this.parseFragment(lines.startLine, lines.endLine);
			dojo.publish(this.id + "::viewportParsed");
			
		},
		massiveWrite: function(content){
		    // experimental massiveWrite
            // find the caret position
			var time0 = (new Date()).getTime()
            var _yIncrement = 0,
                _savedCurrentToken = this.currentToken,
		        _savedPreviousToken = this.previousToken
		    ;
            this.substCaretPosition();
			var startCoords = { x: this.x, y: this.y },
                _initialContent = this.lines.innerHTML,
                _index = this._getTextDelimiter(_initialContent),
                _firstFragment = _initialContent.substring(0, _index),
                _lastFragment = _initialContent.substring(_index),
                _parsedContent = "",
                timeSplit0, timeSplit1,
                rows = content.split(/\n\r|\r\n|\r|\n/),
                tokens = [],
                cDict = this.colorsDictionary
            ;
			_yIncrement = rows.length - 1;
            //timeSplit0 = (new Date()).getTime();

            var rowsNum = rows.length, 
                rowLen
            ;
            for(var i = 0; i < rowsNum; i++){
				// START new solution 09-23-2007
				var row = rows[i],
				    _rowText = ""
				;
				if(i){
					_rowText = "<div class=\"codeTextAreaLine\" style=\"height: " + this.lineHeight + "px\">";
				}
				rowLen = row.length;
				for(var k = 0; k < rowLen; k++){
					// token classification
					var _currentChar = row.charAt(k);
					var _oldChar = _currentChar;
					// html START
					if(_currentChar == "&"){
						_currentChar = "&amp;";
					}else if(_currentChar == "\t"){
						_currentChar = "    ";
					}else if(_currentChar == "<"){
						_currentChar = "&lt;";
					}else if(_currentChar == ">"){
						_currentChar = "&gt;";
					}else if(_currentChar == ";"){
						//window.alert("fullstop");
					}
					// html END
					if(_currentChar == " "){
						_currentChar = "&nbsp;";
					}else if(_currentChar == "    "){ // find a better way to do this
						_currentChar = "&nbsp;&nbsp;&nbsp;&nbsp;";
					}
					
					// type controls
					_rowText += _currentChar;
				} // end current row
				if(i < rows.length - 1){
				    // 1 aug 2008
					//_rowText += "<span style=\"visibility:hidden\" tokenType=\"line-terminator\">\u000D</span></div>";
					_rowText += "</div>";
				}
				_parsedContent += _rowText;
				// END new solution 09-23-2007
            } // end rows cycle
            //timeSplit1 = (new Date()).getTime();
            //window.alert("elapsed time: " + (timeSplit1 -timeSplit0));
			var _insertionPoint = this.y,
                newContent = _firstFragment + _parsedContent + _lastFragment
            ;
            if(!dojo.isIE){
            	this.lines.innerHTML = newContent;
            }else{
            	this.lines.innerHTML = "";
            	var container = document.createElement("div");
            	this.lines.appendChild(container);
            	container.outerHTML = newContent;
            }

			this._addRowNumber({position: _insertionPoint, rows: _yIncrement});
            var _delimiters = dojo.query(".dojoCodeTextAreaLines i");
            
			this.removeFromDOM(_delimiters[0]);
			
            //this.moveCaretAtToken(_delimiters[1], 0);
            var nextY = rowsNum - 1,
                nextX = nextY ? rowLen - this.x : rowLen
            ;
            this.parseLine({lineIndex: nextY});
            this.moveCaretBy(nextX, nextY);
			//this._removeDelimiter(_delimiters[1]);

			this.currentToken = _savedCurrentToken;
			// lineHasChanged = true force the currentLine re-read
			this.setCurrentTokenAtCaret({ lineHasChanged: true });
			if(!content){ return "" }
			dojo.publish(this.id + "::massiveWrite");
			var time1 = (new Date()).getTime()
//			console.log("_massiveWrite " + (time1-time0) + "ms");
			this.parseViewport();

			this.parseDocument({asynch:true}); // remove from here
			return {data: content, startCoords: startCoords};
		},	
        // handles the single token colorization
        colorizeToken: function(/*token*/ currentToken){
            var previousToken = currentToken.previousSibling,
                cDict = this.colorsDictionary
            ;
            if(previousToken){
                previousToken.className = previousToken.firstChild.data in cDict ? cDict[previousToken.firstChild.data].className : "";
                var ppreviousToken = previousToken.previousSibling;
                if(ppreviousToken && ppreviousToken.firstChild){
                    ppreviousToken.className = ppreviousToken.firstChild.data in cDict ? cDict[ppreviousToken.firstChild.data].className : "";
                }
            }
            currentToken.className = currentToken.firstChild.data in cDict ? cDict[currentToken.firstChild.data].className : "";
        },
        showSuggestions: function(){
            var _currentContext = this.getCurrentContext(),
                _contextLength = _currentContext.length,       
                _suggestions = this.autocompleteDictionary,
                i = 0
            ;
            while(i < _contextLength && _suggestions.children){
                _suggestions = _suggestions.children[_currentContext[i]];
                i++;
            }
            if(i < _contextLength || !_suggestions){ this._preventLoops = true; this.attachEvents(); return; } // IE loops! :O
            // display suggestions
            var _items = _suggestions.children; 
            if(!_items){ this._preventLoops = true; this.attachEvents(); return; }
            this.createPopup(_items);
        },
        createPopup: function(/*Object */ items){
            var _items = [];
            for(var i in items){
                _items.push({ value: i, name: i });
            }
            this.suggestionsCombo.store = 
                new dojo.data.ItemFileReadStore({data: {items:_items}});
            var _self = this,
                _toComplete = "",
                _targetToken = this.caret
            ;
            if(this.currentToken.getAttribute("tokenType") == "word"){
                _targetToken = this.currentToken;
            }else if(this.currentToken.previousSibling && this.currentToken.previousSibling.getAttribute("tokenType") == "word"){
                _targetToken = this.currentToken.previousSibling;
                _toComplete = _targetToken.firstChild.data;                
            }
            if(_targetToken != this.caret){
                _toComplete = _targetToken.firstChild.data;
            }
            this._targetToken = _targetToken;
            this.suggestionsCombo.setDisplayedValue(_toComplete);
            this.suggestionsCombo.domNode.style.display = "block";
            dijit.placeOnScreenAroundElement(this.suggestionsCombo.domNode, _targetToken, {'TL' : 'TL'});
            this.suggestionsCombo.focus();

            // bill: can you make _startSearch public? pleeeease! ^__^
            this.suggestionsCombo._startSearch(this.suggestionsCombo.getValue());
        },
        getCurrentContext: function(){
            return this.getContext(this.currentToken);
        },
        getContext: function(/*token*/ startToken){
            var _targetToken = this._getTargetToken(startToken);
            if(_targetToken){
                return this.getContext(_targetToken).concat([_targetToken.firstChild.data]);
            }else{
                return [];
            };
            
        },
        autocomplete: function(evt){
            evt = dojo.fixEvent(evt||window.event);
            var keyCode = evt.keyCode,
                charCode = evt.charCode,
                resCode = keyCode || charCode,
                _targetToken = this._targetToken
            ;
            if(resCode == dojo.keys.ENTER || resCode == dojo.keys.ESCAPE){
                this.suggestionsCombo.domNode.style.display = "none";
				this.suggestionsCombo.textbox.blur(); // Opera and Safari
                if(_targetToken != this.caret){
                    // move the caret after the .
                    var _xShift = 0;
					if(this.caretIndex){
						_xShift = this.caretIndex;
					}else{
	                    if(!(this._targetToken === this.currentToken)){
							_xShift = _targetToken.firstChild.data.length;
						}
					}
                    this.moveCaretBy(-(_xShift), 0);
                    _targetToken.firstChild.data = "";
                }
                this.write(this.suggestionsCombo.getValue(), true);
                this.attachEvents();
            }
			dojo.stopEvent(evt);
			evt.preventDefault();
        },
        startPlugins: function(){
            var plugins = this.plugins.split(" ");
            for(var i = 0; i < plugins.length; i++){
                try{
                    if(plugins[i]){
                        openstar.apps.KatanaIDE._codeTextArea.plugins[plugins[i]].startup({source:this});
                    }
                }catch(error){
//                    console.log("plugin \"" + plugins[i] + "\" not found");
                }                
            }
        },
        /* private functions */
		_removeDelimiter: function(/*token*/ delimiter){
			this.removeFromDOM(delimiter);
		},
        _getTargetToken: function(/*token*/ startToken){
            /* REFACTOR THIS METHOD!! */
            var _previousToken = startToken.previousSibling,
                _ppreviousToken = _previousToken ? _previousToken.previousSibling : null,
                _pppreviousToken = _ppreviousToken ? _ppreviousToken.previousSibling : null,
                _targetToken
            ;
            // TODO: add constants for "word", "context-separator"...
            if(startToken.getAttribute("tokenType") == "word" && 
                _previousToken && _previousToken.getAttribute("tokenType") == "context-separator"
                && _ppreviousToken && _ppreviousToken.getAttribute("tokenType") == "word"){
                _targetToken = _ppreviousToken;
            }else if(_previousToken && _previousToken.getAttribute("tokenType") == "word" && 
                _ppreviousToken && _ppreviousToken.getAttribute("tokenType") == "context-separator"
                && _pppreviousToken && _pppreviousToken.getAttribute("tokenType") == "word"){
                _targetToken = _pppreviousToken;
            }else if(_previousToken && _previousToken.getAttribute("tokenType") == "context-separator" &&
                _ppreviousToken && _ppreviousToken.getAttribute("tokenType") == "word"){
                _targetToken = _ppreviousToken;
            }
            return _targetToken;
        },
        _initializeDoc: function(){
            var newLine = this.createLine();
            this.lines.appendChild(newLine);
            this.currentLine = newLine;
        },
        _removeRowNumber: function(/*integer*/ rowsToRemove){
			var root = this.leftBand.getElementsByTagName("ol")[0];
			this.removeFromDOM(root.getElementsByTagName("li")[rowsToRemove.position + 1]);
		},
        _addRowNumber: function(/*integer*/ rowsToAdd){
			var root = this.leftBand.getElementsByTagName("ol")[0],
        	    _offset = root.getElementsByTagName("li").length + 1,
        	    _rows = "",
        	    _endCount = rowsToAdd.rows + _offset,
			    insertionPoint = rowsToAdd.position || 1
			;			
			for(var i = 0; i < rowsToAdd.rows - 1; i++){
				var number = document.createElement("li");
				root.appendChild(number);
			}
        }
	}
);

dojo.declare("openstar.apps.KatanaIDE.EditorLite", SimpleTextarea, {
	width: "100%",
	height: "100%",
	postCreate: function(){
		this.inherited(arguments);
		dojo.style(this.domNode, {
			width: this.width,
			height: this.height
		});
		dojo.connect(this.domNode, "onkeypress", this, "_onKey");
		dojo.style(this.domNode, "fontFamily", "monospace");
	},
	_onKey: function(e){
		dojo.fixEvent(e);
		if(e.keyCode != dojo.keys.TAB) return;
		dojo.stopEvent(e);
		if (document.selection)
		{
			this.editorNode.focus();
			var sel = document.selection.createRange();
			sel.text = "	";
		}
		else if (this.editorNode.selectionStart || this.editorNode.selectionStart == '0')
		{
			var scroll = this.editorNode.scrollTop;
			var startPos = this.editorNode.selectionStart;
			var endPos = this.editorNode.selectionEnd;
			this.editorNode.value = this.editorNode.value.substring(0, startPos) + "	" + this.editorNode.value.substring(endPos, this.editorNode.value.length);
			this.editorNode.selectionStart = startPos+1;
			this.editorNode.selectionEnd = endPos+1;
			this.editorNode.scrollTop = scroll;
		}else{
			this.editorNode.value += "	";
		}
	},
	setCaretPosition: function(x, y){
		//compatibility function
	},
	massiveWrite: function(content){
		this.setValue(content);
	},
	getContent: function(){
		return this.getValue();
	},
	parseFragment: function(x, y){},
	parseViewport: function(){}
});

runtime.addDojoCss("openstar/apps/KatanaIDE/codeEditor.css");

return KatanaIDE;

});


