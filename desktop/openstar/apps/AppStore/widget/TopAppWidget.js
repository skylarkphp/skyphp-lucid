define([
  "dojo/on",
  "dojo/mouse",
  "dojo/dom-class",
  "dojo/dom-construct",
  "dojo/_base/declare",
  "dojo/_base/array",
  "dijit/_WidgetBase", 
  "dijit/_TemplatedMixin",
  "dojo/dom-style", 
  "dojo/_base/fx", 
  "dojo/_base/lang",
  "./AppWidget"
  ],function(on,mouse,domClass,domConstruct,declare,array,WidgetBase,TemplatedMixin, domStyle, baseFx, lang,AppWidget){
    return declare(AppWidget, {
      baseClass:"topAppWidget",
      hasName: true,
      hasAuthor: false,
      hasAction: false,
      hasIcon: true,
      hasTime: false,
      hasDescription: true,
      postCreate: function(){
        this.inherited(arguments);
      }
    });
  });