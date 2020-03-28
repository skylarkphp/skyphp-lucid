/**
 *
 * Copyright (c) 2013 psteam Inc.(http://www.psteam.co.jp)
 * http://www.psteam.co.jp/qface/license
 * 
 * @Author: liwenfeng
 * @Date: 2013/02/28
 */
define([
	"qscript/lang/Interface",
	"openstar/ufs/IResource"
], function(
	Interface,
	IResource){

	var IContainer = Interface.declare({
		"-parent-"		:	IResource,
		
		"-module-"		:	"openstar/ufs/IContainer",

		"-interfaces-"	:	[],
		
		
		"-public-"	:	{
			"-attributes-"	:	{
			
			},
			"-methods-"	:	{
				/**
				 * @returns  Deffered
				 */
				"create": function() {
				},
	
				/**
				 * @returns  Deffered
				 */
				"sync": function() {
				},
				
				/*
				 * Refreshes the data in the container  from the underlying repository.
				 * @returns  Deffered
				 */
				"resync": function() {
					var _ = this._;
					_.isLoaded = false;
					return this.sync();
				},
				
				visit: function(visitor) {
					var promise;
					var dontVisitChildren = visitor.visit(this);
					if (!dontVisitChildren && this.elementType == "Folder") {
						if (!this.isLoaded) {
							promise = this.getChildren().then(
								lang.hitch(this, function() { 
									array.forEach(this.children, function(child) {
										child.visit(visitor); 
									});
								}));
						} else {
							array.forEach(this.children, function(child) {
								child.visit(visitor);
							});
							promise.resolve();
						}
					} else {
						promise.resolve();
					}	
					return promise;
				},

				/**
				 * @param name  Path of resource to find. 
				 * @returns  IResource
				 */
				"find": function(/*Path|String*/name){
					var promise =  new Deferred();

					ignoreCase = true;
					var seg1 = 0,segments;
					if (typeof name == 'string') {
						segments = name.split('/');
						if (segments[0] == '.'){
							seg1 = 1;
						}
					} else if (name.getSegments) {
						segments = name.getSegments();
						name = name.toString();
					}
					
					var resource = this;
					
					function doFind(/*IContainer*/container,/*Array*/subSegments){
						var seg = subSegments.shift();
						
						container.sync().then(
							function(folder){
								resource = folder.getChildByName(seg);
								if (!resource) {
									promise.reject(new Error(name + " is not found!"));	
								} else {
									if (subSegments.length == 0) {
										promise.resolve(resource);			
									} else {
										doFind(resource,subSegments);
									}
								
								}
							},
							function(err){
								promise.reject(err);
							}
						);
					}
					
					doFind(resource,segments);
					
					return promise;
				}
			
			}
		},
		"-constructor-"	:	{
		}
	
	});
	
	return IContainer;

});

