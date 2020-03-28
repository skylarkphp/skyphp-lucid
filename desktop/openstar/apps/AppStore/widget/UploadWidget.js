define([
  "dojo/dom",
  "dojo/on",
  "dojo/request",
  "dojo/html",
  "dojo/dom-construct",
  "dojo/dom-attr",
  "dojo/_base/array",
  'dojo/_base/json',
  "dojo/_base/lang",
  "dojo/_base/declare",
  "dojo/dom-style",
  "dojo/dom-class",
  "dojo/query",
  "dojo/aspect",
  "dojo/store/Memory",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dojo/text!./templates/upload.html"
],function(dom,on,request,html,domConstruct,domAttr,array,dJson,lang,declare,domStyle,domClass,query,aspect,Memory,WidgetBase,TemplatedMixin,
  _WidgetsInTemplateMixin,template){

  return declare([WidgetBase, TemplatedMixin,_WidgetsInTemplateMixin], {
    templateString: template,
    baseClass:"psteamUpload",
    postCreate: function(){

      this.inherited(arguments);
    }

  })
})