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
	"dojox/layout/ExpandoPane",
	"qfacex/dijit/container/deprecated/Window",
	"openstar/desktop2/scenes/explorer/_ExplorerBase",
	"openstar/desktop2/primitives/Area"
],function(lang,declare,dojo,arrayUtil,domConstruct,query,ItemFileWriteStore,Tree,ForestStoreModel,BorderContainer,ContentPane,
	SplitContainer,AccordionContainer,AccordionPane,TabContainer,ToggleSplitter,ExpandoPane,Window,_ExplorerBase,Area) {

	var Scene = declare([_ExplorerBase],{

		_makeTabContent: function(){

			this._fullAC = new ContentPane({region:'center'});
			
			this._mainBorder.addChild(this._fullAC);
		},

		addWindow : function(win,args){
				this._winLists.push(win);
				this._addWindowToFullStyle(win);
				return this._windowList.newItem(args);
		},


		_addWindowToFullStyle: function(win){
			// remove current app window
			while (this._area.containerNode.hasChildNodes()) {
		    	this._area.containerNode.removeChild(this._area.containerNode.lastChild);
			}
			this._area.addChild(win);

			this._fullAC.addChild(this._area);
			this._fullAC.startup();
		},


		removeWindow : function(win,item){
			this._area.removeChild(win);
			this._windowList.deleteItem(item)
		},

		updateWindowTitle : function(item,title){
			this._windowList.setValue(item, "label", title);
		},
		
		getBox : function(){
			return this._area.getBox();
		},

		restrictWindow : function(win){
			win.showMaximize = false;
			win.showMinimize = false;
			win.showFull = false;
			win.maximized = true;
		}		
	});
	
	
	return Scene;

});

