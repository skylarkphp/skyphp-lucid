define([
	"qscript/lang/Class", // declare
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/topic",
	"dojo/Deferred",
	"openstar/ufs/IFolder",
	"openstar/ufs/File"
], function(
	Class,
	lang,
	array,
	topic, 
	Deferred,
	IFolder, 
	File
) {
	var Folder = Class.declare({
		"-parent-"		:	Class,
		
		"-interfaces-"	:	[IFolder],
		

		"-protected-"	:	{
			"-fields-"	:	{
                "_internalChildren" : function(copy) {
                    var _ = this._,
                        children = _.children;
                    if (children && copy) {
                        return children.slice(0);
                    } else {
                        return children;
                    }
                },

				/**
				 * @param responseObject  
				 * @returns
				 */
				_refreshChildren: function(responseObject){
					this.clearChildren();
					array.forEach(responseObject,function(item){
						var data = Object.mixin({},item);

						data.isDir = item.type == "text\/directory";
						data.isNew = false;
						data.isDirty = false;
						data.readOnly = false;
						this.addChild(data);
					}, this);
					this._.isLoaded = true;
				},

				_createResourceSync: function(name, isFolder, localOnly) {
					var _ = this._;
					var file,
						data;
					data.name = name;
					data.isDir = isFolder;
					
//					if (name != null) {
//						file = isFolder ? new Folder(name, this) : new File(name, this);
//					} else {
//						file = this;
//						isFolder = _.elementType == "Folder";
//					}
					
					var response = "OK";
					if (!localOnly) {
						var pathStr = this.pathStr+"/"+name;
						var root = this.getRootFolder();
						root.innerCreate(path,isFolder,{sync:true}).then(
							function(){
							},
							function(){
								response = "ERROR";
							}
						);		
					}
					
					
					if (response == "OK" && name != null) {
						file = this.addChild(data);
						//delete file._readOnly;
						topic.publish("/openstar/ufs/resource/created", file);
						return file;
					}else if(response=="EXISTS"){
						/* resource already exists on server, so just be gracefull about it. */
						file = this.addChild(data);
						//delete file._readOnly;
						topic.publish("/openstar/ufs/resource/created", file);
						return file;
					}else if (response != "OK"){
						throw "Folder.createResource failed: name=" + name + "response=" + response;
					} else {
						//delete file._readOnly;
						return this;
					}
				}
				
			},
			
			"-methods-"	:	{
			}
		},
		
		"-public-"	:	{
			"-attributes-"	:	{
				"isLoaded"	:	{
					"type"	:	Boolean
				}
			},
			"-methods-"	:	{
				
				
				/**
				 * @returns  Deffered
				 */
				"sync": function() {
					var promise
					if (this.isLoaded) {
					    promise =  new Deferred();
						promise.resolve(this);
					} else {
						if (this._loading) {
							promise = this._loading;
						} else {
					    	promise =  new Deferred();
							var pathStr = this.pathStr;
							var root = this.root;
							this._loading = promise;
							root.innerList(pathStr).then(
								lang.hitch(this,function(responseObject){
									this._refreshChildren(responseObject);
									delete this._loading;
									promise.resolve(this);
								}),
								function(err){
									promise.reject(err);
								}
							);
						}
					}
					return promise;
				},
				
				"createFolder"	:	function(/*String*/name) {
				
				},
				
				"createFile"	:	function(/*String*/name) {
				
				},


				createFileSync : function(name,localOnly){
					return this._createResourceSync(name,false);
				},
				
				createFolderSync : function(name,localOnly) {
					return this._createResourceSync(name,true);
				},

				/*
				 * @returns  Array
				 */
				getChildrenSync: function() {
					if (!this.isLoaded) {
						var pathStr = this.pathStr,
							root = this.root;
						root.innerList(
							pathStr,
							{sync:true}
						).then(
							function(responseObject){
								this._refreshChildren(responseObject);
							}.bind(this),
							function(err){
							});
					}
					return this.children;
				},
				/**
				 * @param name  
				 * @returns  Resource
				 */
				getChildSync: function(name) {
//					alert("getChildSync");
					if(!this.isLoaded) {
						this.getChildrenSync();
					}
					return this.getChildByName(name);
				},
				

				/**
				 * @param name  Path of resource to find. 
				 * @returns  Resource
				 */
				"findSync": function(name){
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
					
					var serverFind;
					var resource = this;
					function doFind(){
						for (var i=seg1;i<segments.length;i++){
							var found=null;
							//#23
							if (segments[i] == '..') {
								//parent
								found = resource = resource.parent;
							}else if(segments[i] != '.'){ // check for self
								found = resource = resource.getChildSync(segments[i]);
							} // else it was self so we just increment to the next segment
							// #23
							if (!found) {
							  return;
							}
						}
						return found;			
					}
					
					return doFind();
				},
			
				/*
				 *Deletes this resource from the workspace.
				 */
				deleteSync: function(localOnly) {
					var modifyModel = function(){
							var name = this.getName();
							this._parent.children.some(function(child, i, children) {
								if(child.getName() == name) {
									children.splice(i, 1);
									return true;
								}				
							});
				
							topic.publish("/openstar/ufs/resource/deleted",  this);
						}.bind(this);

					if (localOnly) {
						modifyModel();
					} else {
						var path = this.path,
							root = this.root;
						var ex;
						promise = root.innerDelete(
							path,
							{sync:true}
						).then(
							modifyModel,
							function(e){
								ex = e;
							}
						);
						if (ex) {
							throw ex;
						}
					}
				},

				visitSync: function(visitor) {
					var dontVisitChildren = visitor.visit(this);
					if (!dontVisitChildren && this.elementType == "Folder") {

						array.forEach(this.getChildrenSync(), function(child) {
							child.visit(visitor, dontLoad);
						});
					}
				},

				renameSync: function(newName) {
					var path = this.getPath();
					var newPath = new Path(path).removeLastSegments().append(newName);
					var root = this.root;
					var ex;
					root.innerMove(path,newPath,{sync:true}).then(
						lang.hitch(this,function() {
							this.name = newName;
							topic.publish("/openstar/ufs/resource/renamed", this);
						}),
						function(e){
							ex = e;
						}
					);	
					if (ex) {
						throw ex;
					}
				},
				
			}
		},
		"-constructor-"	:	{
			"instantiate"	:	function (name,data,parent) {
				var _ = this._;
				_.elementType = "Folder";
				_.name = name;
				_.data = data;
				_.parent = parent;
				_.children = [];
			}
			
		},
		"-destructor-"	:	{
			 "finalize"	:	function(){
			 },
			 "dispose"	:	function(){
			 }
		}	 
	
	});
	
	return Folder;
	
});
  
