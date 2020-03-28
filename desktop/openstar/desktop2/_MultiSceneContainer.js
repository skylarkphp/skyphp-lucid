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
	"dojo/dom-style",
	"dojo/dom-construct", // domConstruct.create
	"dojo/dom-geometry",
	"dojo/_base/fx", // fx.Animation
	"dojo/dnd/Source",
	"dojo/has",
	"dojo/topic",
	"dijit/layout/StackContainer",
	"qscript/util/logger"
],function(declare,domStyle,domConstruct,domGeom,dojoFx,dndSource,has,topic,StackContainer,logger) {

	var MultiSceneContainer = declare([StackContainer],{
	
	    duration : 1000,
		
		_transition: function(/*dijit/_WidgetBase?*/ newWidget, /*dijit/_WidgetBase?*/ oldWidget, /*Boolean*/ animate){
			// Overrides StackContainer._transition() to provide sliding of title bars etc.

			if(has("ie") < 8){
				// workaround animation bugs by not animating; not worth supporting animation for IE6 & 7
				animate = false;
			}

			if(this._animation){
				// there's an in-progress animation.  speedily end it so we can do the newly requested one
				this._animation.stop(true);
				delete this._animation;
			}

			var self = this;


			if(newWidget){

				var d = this._showChild(newWidget);	// prepare widget to be slid in

				// Size the new widget, in case this is the first time it's being shown,
				// or I have been resized since the last time it was shown.
				// Note that page must be visible for resizing to work.

//modified by LWF 20140717
//				if(this.doLayout && newWidget.resize){
//					newWidget.resize();
//				}

				if(this.doLayout){
					newWidget.resize(this._containerContentBox || this._contentBox);
				}else{
					// the child should pick it's own size but we still need to call resize()
					// (with no arguments) to let the widget lay itself out
					newWidget.resize();
				}

			}

			if(oldWidget){
				if(!animate){
					this._hideChild(oldWidget);
					topic.publish("/openstar/desktop2/hide",oldWidget);
				}
			}

			if(animate){
				var newContents = newWidget.domNode,
					oldContents = oldWidget.domNode;

				var box = domGeom.getContentBox(this.containerNode);
					
								
				newContents.style.left = (box.w) + "px";
						
				this._animation = new dojoFx.Animation({
					node: newContents,
					duration: this.duration,
					curve: [1, box.w],
					onAnimate: function(value){
						value = Math.floor(value);	// avoid fractional values
						oldContents.style.left = (0 - value) + "px";
						newContents.style.left = (box.w - value) + "px";
					},
					onEnd: function(){
						delete self._animation;
						newContents.style.left = "0px";
						self._hideChild(oldWidget);
						self._showChild(newWidget);	// prepare widget to be slid in
						topic.publish("/openstar/desktop2/hide",oldWidget);
						topic.publish("/openstar/desktop2/show",newWidget);
					}
				});
				this._animation.onStop = this._animation.onEnd;
				

				this._animation.play();
			} else {
				topic.publish("/openstar/desktop2/show",newWidget);
			}

			return true;	
		},
	});

	
	return MultiSceneContainer;
	
});

