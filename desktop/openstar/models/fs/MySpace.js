 define([
	"dojo/_base/declare",
	"qscript/util/Path",
	"openstar/ufs/FileSystem",
	"openstar/ufs/_Drive",
	"openstar/services/filesystem"
	
], function(declare,Path,FileSystem,Drive,srvFilesystem) {

	function convertPath(path) {
		return "file://"+path;
	}

	var ctoc =  declare(Drive, {
		
		remove : function(path,sync) {
		 	path = convertPath(path);
		 	
		 	return srvFilesystem.remove(path,null,null,null,sync);
		 	
		},

		move : function(oldPath,newPath,sync) {
			oldPath = convertPath(oldPath);
			newPath = convertPath(newPath);
		 	return srvFilesystem.move(oldPath,newPath,null,null,null,sync);
		},
		
		writeFile : function(path,contents,sync) {
		 	path = convertPath(path);
		 	return srvFilesystem.writeFileContents(path,contents,null,null,null,sync);
		},
		
		readFile: function(path,sync) {
		 	path = convertPath(path);
		 	return srvFilesystem.readFileContents(path,null,null,null,sync);
		},
		
		create : function(path,isFolder,sync) {
		 	path = convertPath(path);
			if (isFolder) {
				return srvFilesystem.createDirectory(path,null,null,null,sync);
			} else {
				return srvFilesystem.writeFileContents(path,"",null,null,null,sync);
			}
		},
		
		list:function(path,sync) {
		 	path = convertPath(path);
		 	return srvFilesystem.listDirectory(path,null,null,null,sync);
		}

	});
	
	var MySpace = FileSystem.addDrive("MySpace",ctoc);
	
	return MySpace;
	
});

