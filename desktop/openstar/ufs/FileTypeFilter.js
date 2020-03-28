define([
	"dojo/_base/declare"

],function(declare){


	return declare(null,{
	    constructor: function(types){
	    	this._types=types.split(",");
	    },
	    filterList: function(list)  {
			var newList=[];
			for (var i=0;i<list.length;i++)	{
				var resource=list[i];
				if (resource.elementType!="File"){
					newList.push(resource);
				}else{
					for (var j=0;j<this._types.length;j++){
						if (resource.getExtension()==this._types[j] || this._types[j]=="*")	{
							newList.push(resource);
							break;
						}
					}
				}
			}
			return newList;
	    }
	});
});