define([
	"dojo/_base/lang", 
	"dojo/_base/declare", 
	"dojo",
	"dojo/_base/array",
	"dojo/dom-construct",
	"dojo/query",
	"dojo/data/ItemFileWriteStore",
	"dijit/Tree",
	"dijit/tree/ForestStoreModel",
	"qfacex/dijit/container/BorderContainer",
	"dijit/layout/ContentPane",
	"dijit/layout/SplitContainer",
	"dijit/layout/AccordionContainer",
	"dijit/layout/AccordionPane",
	"dijit/layout/TabContainer",
	"dojox/layout/ToggleSplitter",
	"dojox/layout/ExpandoPane",
	"qfacex/dijit/container/deprecated/Window",
	"openstar/desktop2/_SceneBase",
	"openstar/desktop2/primitives/Area"
],function(lang,declare,dojo,array,domConstruct,query,ItemFileWriteStore,Tree,ForestStoreModel,BorderContainer,ContentPane,
	SplitContainer,AccordionContainer,AccordionPane,TabContainer,ToggleSplitter,ExpandoPane,Window,_SceneBase,Area) {
	var _ExplorerBase = declare([_SceneBase],{
		//	_windowList: dojo.data.ItemFileWriteStore
		//		A dojo.data.ItemFileWriteStore containing a list of windows
		_windowList: null,
		
		_winLists: null,
		//	_drawn: Boolean
		//		true after the UI has been drawn
		_drawn: false,
		
		constructor: function() {
			this._windowList = new ItemFileWriteStore({
				data:{identifer: "id", items: []}
			});
			this._winLists = [];
		},

		init: function(config){
			this._config = config;
			var area = this._area = new Area({});
			this._makeMainBorder();
			this._makeTabContent();
			this._makeTree();
		},

		_makeMainBorder: function(){
			this._favApp = new ContentPane({title:"favourite Applications"});
			this._allApp = new ContentPane({title:"All Applications"});
			this._aC = new AccordionContainer({region: 'leading',splitter:true,minSize:"20", style:"width:230px;"});
			this._mainBorder = new BorderContainer({
				liveSplitters: false,
				style:"width: 100%; height: 100%;"
			});
			this._mainBorder._splitterClass = "dojox.layout.ToggleSplitter";

			this._aC.addChild(this._allApp);
			this._aC.addChild(this._favApp);
			this._mainBorder.addChild(this._aC);
			this.addChild(this._mainBorder);
		},

		_makeTree: function (){
		  var config = this._config;
			
			var treeData = config.apps;
			var treeStore = this.treeStore = new ItemFileWriteStore({data: treeData});
			var treeModel = new ForestStoreModel({
				store: treeStore,
				query: {type:'folder'},
				rootLabel: "application",
				labelAttr:"label" ,
				label:"application",
				childrenAttrs: ["folders"]
			});

			var self = this;
			var tree = this.tree = new Tree({
				model: treeModel,
				showRoot: false,
				openOnClick: true,
				onClick: function(item){
					var sysname = treeStore.getValue(item,"sysname");
					if(sysname){
						self.launch(sysname, {})
					}
				},
				getIconClass: function(item,opened){
					if(item.icon) return treeStore.getValue(item,"icon").replace(/-32-/,"-16-");
				}
			});
			this._allApp.addChild(tree);
		},

		addApp: function(app,appConfig){
			var app = {
					"id":app.app_id + "ADDAPP",
					"sysname":app.sysname,
					"label":app.name,
					"name":app.name,
					"type": "app",
					"category":app.category,
					"icon":app.icon.replace(/-16-/,"-32-"),
					"version":app.version
				};
			var items = appConfig.scenes[this.name].apps.items;
			var categoryName = app.category.toLocaleLowerCase();
			var cat = array.filter(items,function(item){return item.sysname === categoryName});
			var self = this;
			
			var addChild = function(item,app){
				var child = self.treeStore._getItemByIdentity(app.id);
				if(!child){
					self.treeStore.newItem(app,{parent:item,attribute:"folders"});
					self.treeStore.save();
				}
			};

			if(cat.length>0){
				cat[0].folders.push(app);
				this.treeStore.fetchItemByIdentity({
					identity:cat[0].id,
					onItem:function(item){
						addChild(item,app);
					},
					onError: function(err){
						console.error(err);
					}
				});
			} else {
				var newCat = { 
					"type": "folder", 
					"id":items.length +1 + "ADDCATEGORY",
					"sysname": categoryName,  
					"label":categoryName,
					"name":categoryName,
					"icon":"icon-16-categories-applications-" + categoryName, 
					"folders":[]
				};
				self.treeStore.newItem(newCat);
				self.treeStore.save();
				self.treeStore.fetchItemByIdentity({
					identity:newCat.id,
					onItem: function(item){
						addChild(item,app);
					},
					onError: function(err){
						console.error(err);
					}
				})
				newCat.folders.push(app);
				items.push(newCat);
			}
			return appConfig;
		},

		removeApp: function(app,appConfig){
			this.treeStore.fetchItemByIdentity({
				identity: app.app_id + "ADDAPP",
				onItem: lang.hitch(this,function(item){
					this.treeStore.deleteItem(item);
				}),
				onError: function(err){
					console.error(err);
				}
			})
			return appConfig;
		},

		updateWindowTitle : function(item,title){
			this._windowList.setValue(item, "label", title);
		},

		restrictWindow : function(win){
			win.showMinimize = false;
			win.showFull = false;
		}		
	});
	
	return _ExplorerBase;
})
