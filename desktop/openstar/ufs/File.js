 define([
	"qscript/lang/Class", // declare
	"openstar/ufs/IFile"
], function(
	Class,
	IFile
) {

	var File = Class.declare({
		"-parent-"		:	Class,
		
		"-interfaces-"	:	[IFile],
		

		"-protected-"	:	{
			"-fields-"	:	{
			},
			
			"-methods-"	:	{
			}
		},
		
		"-public-"	:	{
			"-attributes-"	:	{
			
			},
			"-methods-"	:	{
				setContentSync: function(content, isWorkingCopy){
					var workingCopy = isWorkingCopy ? "true" : "false";
					var dirty = isWorkingCopy  ? true : false;
					if (this.isNew && !isWorkingCopy) {
						this.isNew = false;
					}
					var workingCopyExtension = isWorkingCopy ? ".workingcopy" : "";

					var ex;
					var pathStr = this.pathStr+workingCopyExtension,
						root = this.root;
					return root.innerWriteAllText(
						pathStr,
						content,
						{sync : true}
					).then(
						lang.hitch(this,function(res){
							this.dirtyResource = dirty;
							topic.publish("/openstar/ufs/resource/modified",this);
						}),
						function(e){
							ex = e;
						}
					);
					if (ex) {
						throw ex;
					}
				},

				getContentSync: function(){
					var pathStr = this.pathStr;
						root = this.root;
					var ex;
					root.innerReadAllText(
						pathStr,
						{sync:true}
					).then(
						function(data){
						content = data;
						},
						function(e){
							ex = e;
						}
					);
					
					if (ex) {
						throw ex;
					}
					return content;
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
				}
				

			}
		},
		"-constructor-"	:	{
			"instantiate"	:	function (name,data,parent) {
				var _ = this._;
				_.elementType = "File";
				_.name = name;
				_.data = data;
				_.parent = parent;
				_.extension = name.substr(name.lastIndexOf('.') + 1);
			}
			
		},
		"-destructor-"	:	{
			 "finalize"	:	function(){
			 },
			 "dispose"	:	function(){
			 }
		}	 
	
	});
	
	return File;
});

