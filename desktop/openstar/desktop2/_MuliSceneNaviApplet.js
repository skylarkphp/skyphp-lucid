/**
 *
 * Copyright (c) 2013 psteam Inc.(http://www.psteam.co.jp)
 * http://www.psteam.co.jp/qface/license
 * 
 * @Author: liwenfeng
 * @Date: 2013/02/28
 */
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-construct", // domConstruct.create
	"dojo/dom-geometry",
	"dojo/_base/fx", // fx.Animation
	"dojo/_base/html",
	"dojo/on",
	"dojo/dnd/Source",
	"dojo/has",
	"dijit/form/Form",
	"dijit/form/Select",
	"dijit/Dialog",
	"dijit/form/Button",
	"dijit/form/TextBox",
	"qfacex/dijit/container/BorderContainer",
	"dijit/layout/TabContainer",
	"dijit/layout/ContentPane",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
	"qfacex/dijit/applet/Applet",
	"qfacex/dijit/container/deprecated/Window",
	"dojo/text!openstar/desktop2/templates/addSceneForm.html",
	"dojo/i18n!openstar/desktop2/nls/Scene"
], function(declare,lang,array,domClass,domStyle,domConstruct,domGeom,dojoFx,domHtml,on,dndSource,has,Form,Select,Dialog,
	Button,TextBox,BorderContainer,TabContainer,ContentPane,_TemplatedMixin,_WidgetsInTemplateMixin,QApplet,Window,template,nlsScene){
	// module:
	//		openstar
	// summary:
	//		The openstar package main module

	var MultiSceneNaviBar = declare([QApplet],{
		sceneContainer : null,
		_sceneIconsMap : null,
		_currentSceneName : "",
		
		constructor : function(params) {
			this._sceneIconsMap = new Array();
		},
		
		postCreate: function(){
			domClass.add(this.containerNode, "navBar");
			
			var tbl = domConstruct.create("table");
			var tbody = domConstruct.create("tbody");
			var tr = this.trNode = domConstruct.create("tr");
			domClass.add(tr,"scene-list");
			tbody.appendChild(tr);
			tbl.appendChild(tbody);
			this.containerNode.appendChild(tbl);
			this._createAddNode();
			this.inherited(arguments);
		},
		
		_createAddNode: function(){
			var self = this;
			// var addtr = domConstruct.create("tr",{"class":"scene-action"});
			var addtd = domConstruct.create("td",{"class":"sceneAction"},this.trNode);
			var a = domConstruct.create("a",{
				label:"add",
				title:"add",
				innerHTML:"<img src='res/qface/images/add.png' alt='add' title='add'/>",
				"class":"addScene",
				onclick: function(){
					var form = new SceneForm({sceneObj:self});
					var win = new Window({
		      	app  : this,
		        width: "450px",
		        height: "350px",
		        title: nlsScene.add,
		        scene: self.desktop.currentScene
		      });
		      dojo.connect(form, "onCancel", win, "close");
		      dojo.connect(form, "onSubmit", win, "close");
		      dojo.connect(win, "onResize", form.borderContainer, "resize");
		      dojo.connect(win, "onResize", form.tabContainer, "resize");
		      win.addChild(form);
		      form.startup();
		      win.show();
		      // this.windows.push(win);

					// var dialog = new Dialog({title: nlsScene.add});
					// var form = new SceneForm({sceneObj:self,dialog:dialog});
		   //    dialog.addChild(form);
		   //    dialog.show();
				}
			},addtd);
		},
		
		addScene : function(name,scene) {
			var td = domConstruct.create("td");
			this.trNode.appendChild(td);
			
			var domNode=domConstruct.create("a");
			domHtml.setSelectable(domNode, false);
			
			domClass.add(domNode,"ui-droppable");
			
			td.appendChild(domNode);
			
			on(domNode,"click",lang.hitch(this,function() {
				this.selectScene(name);
			}));
			
			var dskInfo = {
				name : name,
				scene : scene,
				icon : domNode
		  };
			this._sceneIconsMap.push(dskInfo);
			this._sceneIconsMap[name] = dskInfo;
		},
		
		removeScene : function() {
		},
		
		selectScene : function(/*String|Number*/name) {
			if (!lang.isString(name)) {
				name = this._sceneIconsMap[name].name;
			}
			if (this._currentSceneName) {
				var preIcon = this._sceneIconsMap[this._currentSceneName].icon;
				domClass.remove(preIcon,"currTab");
			}
			this.sceneContainer.selectChild(this._sceneIconsMap[name].scene,true);
			this._currentSceneName = name;
			this.desktop.currentScene = this._sceneIconsMap[name].scene;
			var icon = this._sceneIconsMap[name].icon;
			domClass.add(icon,"currTab");
		},
		
		nextScene : function() {
		},
		
		searchScene : function ()	{
			var currentValue = domStyle.get('search-form','display');
			if (currentValue == "none"){
			  domStyle.set('search-form', 'display', 'block');
			} else {
			  domStyle.set('search-form', 'display', 'none');
			}
		},
		
		currentScene : function() {
			return this._sceneIconsMap[this._currentSceneName].scene;
		}
	});

	var SceneForm = declare([Form,_TemplatedMixin,_WidgetsInTemplateMixin],{
		sceneObj:null,
		templateString:template,

		postCreate: function(){
 			
			domConstruct.create("label",{innerHTML:"Type"},this.sceneType);
		 	var select = this.select = new Select({name: "sceneType",
	      options: [
	        { label: "MultiApp", value: "openstar/desktop2/scenes/explorer/MultiAppScene"},
	        { label: "MultiTab", value: "openstar/desktop2/scenes/explorer/MultiTabScene"},
	        { label: "SingleApp", value: "openstar/desktop2/scenes/explorer/SingleAppScene"},
	        { label: "icons", value: "openstar/desktop2/scenes/icons/Scene" }
	      ]
		 	}).placeAt(this.sceneType);

		//  	new Button({
		//  		label:nlsScene.cancel,
		//  		onClick: lang.hitch(this,function(){
		//  			// this.dialog.hide();
		//  		})
		//  	}).placeAt(this.submitNode);
		//  	new Button({
		//  		label:nlsScene.save,
		//  		onClick: function(){
		// 			var name = self.sceneName.value;
		// 			var type = self.select.get("value");
		// 			require([type],function(sceneClass) {
		// 				var scene = new sceneClass({name:name,desktop:self.sceneObj.desktop});
		// 				self.sceneObj.addScene(name,scene)
		// 				// self.dialog.hide();
		// 			});	
		//  		}
		//  	}).placeAt(this.submitNode);
		},

		 onSubmit: function(){
		 	var self = this;
      var name = self.sceneName.getValue();
			var type = self.select.getValue();
			require([type],function(sceneClass) {
				var scene = new sceneClass({name:name,theme:"soria",desktop:self.sceneObj.desktop});
				var config = {
					"type"  : type,
					"theme" : "soria",
					"wallpaper": {
						"image": "./wallpaper1.png",
						"color": "#696969",
						"style": "centered",
						"storedList": []
					},
					"apps":[]
				}
				scene.init(config);
				self.sceneObj.addScene(name,scene)
			})
    },
    onCancel: function(){
    }
	});

	return MultiSceneNaviBar;
});
