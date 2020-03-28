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
	"qscript/lang/Array",
	"qscript/util/collection/ITreeItem",
	"qscript/util/Path"
], function(
	Interface,
	Array,
	ITreeItem,
	Path){

	var IResource = Interface.declare({
		"-parent-"		:	Interface,
		
		"-module-"		:	"qscriptx/store/ws/IResource",

		"-interfaces-"	:	[ITreeItem],
		
		"-protected-"	:	{
			"-fields-"	:	{
			},
			
			"-methods-"	:	{
			
			}
		},
		
		"-public-"	:	{
			"-attributes-"	:	{
			
				"elementType"	:	{
					"type"	:	String
				},

				/*
				 *Returns whether this resource subtree is marked as derived.
				 */
				"isDerived"	:	{
					"type"		:	Boolean,
					"default"	:	false
				},

				/*
				 *Returns whether this resource is hidden in the resource tree.
				 */
				"isHidden"	:	{
					"type"		:	Boolean,
					"default"	:	false
				},

				/*
				 *Returns whether this resource has been linked to a location other than the default location calculated by the platform.
				 */
				"isLinked"	:	{
					"type"	:	Boolean
				},

				/*
				 *Returns whether this resource is a phantom resource.
				 */
				"isPhantom"	:	{
					"type"		:	Boolean,
					"default"	:	false
				},

				/*
				 * Returns whether this resource is marked as read-only in the file system.
				 */
				"isReadOnly"	:	{
					"type"		:	Boolean,
					"default"	:	false
				},

				/*
				 * Returns whether this resource is a virtual resource.
				 */
				"isVirtual"	:	{
					"type"		:	Boolean,
					"default"	:	false
				},

				/*
				 * Returns a cached value of the local time stamp on filesystem for this resource, or NULL_STAMP if the resource 
				 * does not exist or is not local or is not accessible.
				 */
				"localTimeStamp"	:	{
					"type"	:	Date
				},
			
				"path"		:	{
					"type"	:	Path,
					"getter"	:	function(){
						var _ = this._,
							p = _.parent,
							n = _.name;
						if (p) {
							return p.path.appendPathStr(n);
						}
						return new Path(n);
					}
				},

				"pathStr"		:	{
					"type"	:	String,
					"getter"	:	function(){
						var _ = this._,
							p = _.parent,
							n = _.name;
						if (p) {
							return p.pathStr + "/" + n;
						}
						return n;
					}
				}
				
			},
			"-methods-"	:	{

				getPath: function() {
					return this.pathStr;
				},

				getParent : function(){
					return this.parent;
				},

				/*
				 *Makes a copy of this resource at the given path.
				 */
				"copyTo"		:	function(){
					//TODO: will be implemented
				},
				
				/*
				 *Deletes this resource from the workspace.
				 */
				"delete": function(localOnly) {
					var promise,
						modifyModel = function(){
							var name = this.getName();
							this.parent.children.some(function(child, i, children) {
								if(child.getName() == name) {
									children.splice(i, 1);
									return true;
								}				
							});
				
							topic.publish("/openstar/ufs/resource/deleted",  this);
						}.bind(this);

					if (localOnly) {
						promise = new Deferred();
						modifyModel();
						promise.resolve();
					} else {
						var path = this.path,
							root = this.root;
						promise = root.innerDelete(
							path
						).then(
							modifyModel
						);
						
					}
					return promise;
				},

				/*
				 *Returns whether this resource exists in the workspace.
				 */
				"exists"			:	/*Boolean*/function(){
					//TODO: will be implemented
				},

				/*
				 *
				 *@method getChildByName
				 *@return ITreeItem
				 */
				"getChildByName"	:	function(/*String*/name){
					var _ = this._,
						children = _.children;
					if (children) {
						for (var i =0; i<children.length; i++){
							var child = children[i];
							if (child.name == name) {
								return child;
							}	
						}
					}
				},

				/*
				 *Makes a copy of this resource at the given path.
				 */
				"moveTo"		:	function(/*Path|String*/targetPath){
					//TODO: will be implemented
				},

				relativeTo	:	function(/*Folder*/rel) {
					//rel must an ancestor folder of this resource in this version
					if (rel == this) {
						return "";
					}else {
						var p = this.parent; 
						if (rel == p) {
							return this.name;
						} else if (p) {
							return p.relativeTo(rel) + "/" + this.name;
						}			
					} 
				},

				"rename": function(newName) {
					
					var path = this.path;
					var newPath = new Path(path).removeLastSegments().append(newName),
						root = this.root;
					return root.innerMove(path,newPath).then(
						lang.hitch(this,function() {
							this._.name = newName;
							topic.publish("/openstar/ufs/resource/renamed", this);
						})
					);	
				},
				

				toURL: function() {
					var path = this.getPath(),
					    root = this.getRootFolder();
					
					/* need a special flavor or URI Rewrite to encode files with # */
					return  root.toUrl(path);
				},


				setDirty: function(isDirty) {
					this.dirtyResource = isDirty;
				},

				isDirty: function() {
					return this.dirtyResource;
				},

				getId: function() {
					return this.qsid;
				}	

				
			}
		},
		"-constructor-"	:	{
		}
	
	});
	
	return IResource;

});

