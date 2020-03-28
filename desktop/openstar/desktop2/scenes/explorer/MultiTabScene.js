/**
 *
 * Copyright (c) 2013 psteam Inc.(http://www.psteam.co.jp)
 * http://www.psteam.co.jp/qface/license
 * 
 * @Author: lihongwang
 * @Date: 2013/02/28
 */
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
	"qfacex/dijit/container/deprecated/Window",
	"openstar/desktop2/scenes/explorer/_ExplorerBase",
	"openstar/desktop2/primitives/Area"
],function(lang,declare,dojo,arrayUtil,domConstruct,query,ItemFileWriteStore,Tree,ForestStoreModel,BorderContainer,ContentPane,
	SplitContainer,AccordionContainer,AccordionPane,TabContainer,ToggleSplitter,Window,_ExplorerBase,Area) {

	var Scene = declare([_ExplorerBase],{

		_makeTabContent: function(){
			this._tabAC = new TabContainer({id:"tableWindow",region:'center', tabStrip:'true',style:"display:'';overflow:hidden;"});

			this._fullAC = new ContentPane({id:"fullWindow",region:'center',style:"display:none;"});
			
			this._multipleAC = new ContentPane({id:"multipleWindow",region:'center',style:"display:none;overflow:hidden;"});
	
			this._mainBorder.addChild(this._tabAC);
		},
		
		addWindow : function(win,args){

			this._winLists.push(win);
	   		var area = this._addWindowToTabStyle(win);
			return this._windowList.newItem(lang.mixin(args,{_area: area}));
		},

		_addWindowToTabStyle: function(win){
			var area = this._area = new Area({title:win.title,closable:true});

			area.addChild(win);
			this._tabAC.addChild(area);
			this._tabAC.selectChild(area);
			//win.maximize();
			return area;
		},

		removeWindow : function(win,item){
		  var area = this._windowList.getValue(item,"_area");
		  if (area) {
	      	area.removeChild(win);
			this._windowList.setValue(item, "_area", null);
	      	
	      }	
	      this._windowList.deleteItem(item)
		},

		updateWindowTitle : function(item,title){
			this._windowList.setValue(item, "label", title);
		},
		
		getBox : function(win,item){
		
		  if (item) {
			  var area = this._windowList.getValue(item,"_area");
			  if (area) {
				return area.getBox();
			  }
		  } else {
				return this._area.getBox();
		  }
		},

		restrictWindow : function(win){
			//win.borderStyle = Window.BorderStyle.None;
			win.maximized = true;
			win.fulled = true;
		}
		
	});
	
	
	return Scene;

});

