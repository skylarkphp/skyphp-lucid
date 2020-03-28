define([
  "dojo/on",
  "dojo/mouse",
  "dojo/dom-class",
  "dojo/_base/event",
  "dojo/_base/declare",
  "dijit/_WidgetBase", 
  "dijit/_TemplatedMixin",
  "dojo/text!./templates/SearchWidget.html",
  "dojo/dom-style", 
  "dojo/_base/fx", 
  "dojo/_base/lang"
  ],function(on,mouse,domClass,event,declare,WidgetBase, TemplatedMixin, template, domStyle, baseFx, lang){
    return declare([WidgetBase, TemplatedMixin], {
      templateString: template,
      mainObj:null,
      width:"",
      height:"",
      postCreate: function(args){
        on(this.searchButton,"click",lang.hitch(this,function(e){
        event.stop(e);
        this.obj._searchApp(this.searchValue.value);
      }));
      }
    })
  })