/**
 *
 * Copyright (c) 2013 psteam Inc.(http://www.psteam.co.jp)
 * http://www.psteam.co.jp/qface/license
 *
 * @Author: liwenfeng
 * @Date: 2013/02/28
 */
define([
	"dojo/_base/lang",
	"dojo/_base/declare",
	"dojo/_base/html",
	"dojo/dom-style",
    "dojo/query",
    "dijit",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"openstar/desktop2/primitives/Area",
	"openstar/desktop2/scenes/icons/ListView"
],function(lang,declare,html,domStyle,query,dijit,MenuItem,MenuSeparator,WindowArea,ListView) {


	return declare( [WindowArea], {
		postCreate: function(){
			this.inherited(arguments);

			var listarea = this.listarea = new ListView({
				subdirs: false,
				vertical: true,
				textShadow: true,
				overflow: "hidden",
				scene : this.scene,
				onItem  : lang.hitch(this,function(item) {
					this.scene.launch(item);
				})
			});

			this.addChild(listarea);


		},

		startup : function(){
			if (this._started) {
				return;
			}

			this.inherited(arguments);
			this.listarea.updateItems(this.items);
		},

		resize: function(e){
			//	summary:
			//		Does some cleanup when the window is resized. For example it moves the listarea.
			//		Also called when a panel is moved.
			// modified by LWF 20140718
			this.inherited(arguments);

			query(".scenePanel",this.domNode).forEach(function(panel, i){
				var w = dijit.byNode(panel);
				w.resize();
			});
			var max = this.getBox();
			//var viewport = dijit.getViewport();
			domStyle.set(this.listarea.domNode, "top", max.t+"px");
			domStyle.set(this.listarea.domNode, "left", max.l+"px");
			domStyle.set(this.listarea.domNode, "width", (max.w)+"px");
			domStyle.set(this.listarea.domNode, "height", (max.h)+"px");

		}

	});

});

