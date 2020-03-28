define([
	"qscript/lang/Class", // declare
	"dojo/on",
	"dojo/dom-construct",
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/connect",
	"dojo/_base/event",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/query",
	"openstar/desktop2/Application",
	"qfacex/dijit/container/deprecated/Window",
	"dojo/data/ItemFileWriteStore",
	"qfacex/dijit/tree/Tree",
	"dijit/tree/ForestStoreModel",
	"qfacex/dijit/button/Button",
	"dijit/form/Form",
	"qfacex/dijit/input/TextBox",
	"qfacex/dijit/container/BorderContainer",
	"qfacex/dijit/container/ContentPane",
	"dijit/layout/AccordionContainer",
	"dijit/layout/AccordionPane",
	"qfacex/dijit/container/TabContainer",
	"dojox/layout/ToggleSplitter",
	"openstar/services/Registry",
	"openstar/services/app",
	"openstar/services/user",
	"./AppStore/widget/AppWidget",
	"./AppStore/widget/SimpleAppWidget",
	"./AppStore/widget/TopAppWidget",
	"./AppStore/widget/SearchWidget",
	"./AppStore/widget/PaginateWidget",
	"openstar/system2/Runtime",
	"dojox/widget/AutoRotator",
	"dojox/widget/rotator/Slide",
	"dojox/widget/rotator/Controller"
	],function(Class,on,domConstruct,declare,array,lang,connect,event,domStyle,domClass,query,_App,Window,ItemFileWriteStore,Tree,ForestStoreModel,Button,
		Form,TextBox,BorderContainer,ContentPane,AccordionContainer,AccordionPane,TabContainer,ToggleSplitter,SrvRegistry,srvApp,srvUser,AppWidget,
		SimpleAppWidget,TopAppWidget,SearchWidget,PaginateWidget,qface,AutoRotator,RotatorSlide,RotatorController){

	// "openstar/ui/widget/AppStoreWidget",
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
				apps: [],
				lastItemName:null// check if this app tree item visited,if so do noting. 
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				init: function(args){
					var win = this.win = new Window({
			    		app  : this,
				        title: "AppStore",
			    	    width: "1080px",
			        	height: "550px",
						onClose: lang.hitch(this, "kill")
					});
					var appLayout = this.appLayout = new BorderContainer({style:"width:100%;height:100%"});

		      /////////
		      // left
		      /////////

					var leftItem = new BorderContainer({region:"left",minSize:"20", style:"width:230px;"});
					var searchItem = new ContentPane({region:"top",style:"height:30px;"});
					var searchNode = this.searchNode = new SearchWidget({obj:this});
					searchItem.addChild(searchNode);
					var appItem = this.appItem = new ContentPane({title:"appList",region:"center"});
					leftItem.addChild(searchItem);
					leftItem.addChild(appItem);

					/////////
		      // center
		      /////////

					var centerItem = new BorderContainer({region:"center"});
					var viewItem = this.viewItem = new ContentPane({region:"top",style:"height:150px;text-align:center;padding-bottom:0;"});
					
					var appListItem = this.appListItem = new ContentPane({region:"center"});
					centerItem.addChild(viewItem);

					centerItem.addChild(appListItem);

					this._readyForTreeData(); // create left tree

					/////////
		      // right
		      /////////
					
					var rightItem = new BorderContainer({region:"right",style:"width:230px;"});
					var userItem = new ContentPane({region:"top",title:"user info",style:"height:100px;"});
					var userAppItem = this.userAppItem = new ContentPane({region:"center"});
					rightItem.addChild(userItem);
					rightItem.addChild(userAppItem);


					// appLayout.addChild(topItem);
					appLayout.addChild(leftItem);
					appLayout.addChild(centerItem);
					appLayout.addChild(rightItem);
					
					win.addChild(appLayout);
					appLayout.startup();
					setTimeout(function(){win.show()});

					
					qface.addDojoCss("openstar/apps/AppStore/resources/stylesheets/AppWidget.css");
					qface.addDojoCss("openstar/apps/AppStore/resources/stylesheets/appStore.css");
					qface.addDojoCss("openstar/apps/AppStore/resources/stylesheets/paginateWidget.css");
			
				},

				kill: function(){
		      if(!this.win.closed)
		          this.win.close();
		    },

		    _readyForTreeData: function(){
					srvApp.list(lang.hitch(this, function(apps){
						this.apps = apps;
						var appType = ["app","theme","applet"];
						var self = this;
						var categoryList = [];
						var formatData = [];
						array.forEach(apps,function(app){
							categoryList.push(app.category);
						});
						var categoryUniqList = this.categoryUniqList = this.__uniqueArray(categoryList);

						array.forEach(appType, function(name, index){
			    		var oData = {};
			    		oData.label = name;
			    		oData.id =  index + 1;
			    		oData.type =  'folder';
			    		oData.icon = 'category';
			    		oData.folders = [];
			    		if(name =="app"){
					    	array.forEach(categoryUniqList, function(category, sindex){
								  oItem = {};
								  oItem.id = (index + 1) * 1000 + sindex;
								  oItem.label = category;
								  oItem.iconClass = "icon-16-categories-applications-"+category.toLowerCase();
								  oItem.icon = "icon-16-categories-applications-"+category.toLowerCase();
								  oData.folders.push(oItem);
								});
			    		}
							formatData.push(oData);
						});

						var treeData = {
							id: 0,
							identifier: 'id',
							label: 'label',
							items: formatData
						};
						
						var treeStore = this.treeStore = new ItemFileWriteStore({data: treeData});
						var treeModel = new ForestStoreModel({
							store: treeStore,
							query: {type:'folder'},
							labelAttr:"label" ,
							label:"application",
							childrenAttrs: ["folders"]
						});

						var appTree = new Tree({
							model: treeModel,
							showRoot: false,
							openOnClick: true,
							onClick: function(item){
								self._selectTreeRootNode(item,apps);
							},
							getIconClass: function(item,opened){
								if(!item.root){
									if(!item.folders){
										return item.iconClass;
									} else {
										switch(item.label[0]){
											case 'app':{
												return "icon-16-categories-applications-other";
												break;
											}
											case 'theme':{
												return "icon-16-apps-preferences-desktop-theme";
												break;
											}
											case "applet":{
												return "icon-16-apps-preferences-desktop-theme";
												break;
											}
										}
									}
								}
							}
						});

						this.appItem.addChild(appTree);
						this._createAppPage(apps);

						var userApps = array.filter(apps,function(app){return app.current_user_app === true});
						this._getUserApps(userApps);
					  this._getTopApps(userApps);
					}));
				},

				_selectTreeRootNode: function(item,apps){
					var label = this.treeStore.getValue(item,"label"); 
					if(!label) return;
					if(this.lastItemName === label) return;
					this.lastItemName = label;
		      var filterApps = array.filter(apps,function(app){return app.category === label});
		      this._createAppPage(filterApps);
				},

				// method for searchWidget
				_searchApp: function(appName){
		      var filterApps = array.filter(this.apps,function(app){return app.name === appName});
					this._createAppPage(filterApps);
				},

				_createAppPage: function(apps){
					var self = this;
					var appWidgets = [];
					array.forEach(apps,function(app){
						app.width = "540px";
						app.height ="8px";
						app.appClass = app.category;
						app.appStore = self;
						app.appIcon = "openstar/apps/AppStore/resources/images/defaultAppIcon.png";
						if(!app.icon)
							app.icon = "icon-16-apps-default";
						var appWidget = new AppWidget(app);
						appWidgets.push(appWidget);
					});
					var sortObj = {"download_count":"??","updated_at":"最新","fav_count":"推荐","view_count":"免?","version":"限免","app_id":"收?"};
					domConstruct.empty(this.appListItem.id);
					var appPage = new PaginateWidget({baseData:appWidgets,sortObj:sortObj});
					this.appListItem.addChild(appPage);

				},

				_getUserApps: function(userApps){
					array.forEach(userApps,lang.hitch(this,function(app,index){
						app.appClass = app.category;
						app.appIcon = "openstar/apps/AppStore/resources/images/defaultAppIcon.png";
						var userApp = new SimpleAppWidget(app);
						this.userAppItem.addChild(userApp);
						// var divNode = domConstruct.create("div",{},this.userAppItem);
					}))
						
				},

				_getTopApps: function(topApps){
					
					var paneDiv = domConstruct.create("div",{"class":"paneContainer"},this.viewItem.domNode);
					var panes = [];

					array.forEach(topApps,function(topApp,index){
						var appWidget = new TopAppWidget(topApp);
						colorClass = index % 2 == 0 ? "evenPane" : "oddPane";
						panes.push({className: "pane " + colorClass + " pane" + index, innerHTML: appWidget.domNode.innerHTML});
					});
					// var autoItem = new RotatorSlide(
					var autoItem = new AutoRotator(
		        {
		        	transition: "dojox.widget.rotator.slideLeft",
		          transitionParams: "quick:true,continuous:true",
		          duration: 3500,
		          panes: panes
		        },
		       	paneDiv
		   		);
		   		
					domConstruct.create('a',{
		   				href:"javascript:void(0);",
		          class:"prevPane",
		        	innerHTML:'<img src="openstar/apps/AppStore/resources/images/arrow-prev.png" width="24" height="43" alt="Arrow Prev">',
		          onclick: function(){
		           	autoItem.prev();
		          }
		   			}, paneDiv);
		   		// var self = this;

		   		domConstruct.create('a',{
		 				href:"javascript:void(0);",
		        class:"nextPane",
		        innerHTML:'<img src="openstar/apps/AppStore/resources/images/arrow-next.png" width="24" height="43" alt="Arrow Prev">',
		        onclick: function(){
		         	autoItem.next();
		        }
		 			}, paneDiv);
				},

				__uniqueArray: function(/*Array*/ arrayList){
					var check = {};
					var result = [];
					array.forEach(arrayList,function(item,index){
						if(!check[item]){
							check[item] = true;
							result.push(item);
						}
					})
					return result;
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

