define([
     "qscript/lang/Class", // declare
     "qfacex/dijit/form/Form",
     "dojo/i18n!./nls/app",
     "dojo/text!./MainForm.html"
     
],function(Class,Form,nlsApp,template) {

	return Class.declare({
		"-parent-"		:	Form,
		
		"-interfaces-"	:	[],
		
		"-protected-"	:	{
			"-fields-"	:	{
				"$$contentTemplate"	:	template
			},
			
			"-handlers-"	:	{
				"navibtn_click"		:	function(){
					this.go();
				},
				"self_activate"		:	function(args){
		            if(args.url) this.go(args.url);
		            else this.go("http://www.yahoo.co.jp/");
				}
			},
			
			"-methods-"	:	{
			
			}
		},
		
		"-public-"	:	{
			"-fields-"	:	{
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
		        go: function(url) {
		            var URL = (typeof url == "string" ? url : this.urlbox.getValue());
		            if(!(URL.charAt(4) == ":" && URL.charAt(5) == "/" && URL.charAt(6) == "/")) {
		                //but wait, what if it's an FTP site?
		                if(!(URL.charAt(3) == ":" && URL.charAt(4) == "/" && URL.charAt(5) == "/")){
		                    //if it starts with an "ftp.", it's most likely an FTP site.
		                    if((URL.charAt(0) == "F" || URL.charAt(0) == "f") && (URL.charAt(1) == "T" || URL.charAt(1) == "t") && (URL.charAt(2) == "P" || URL.charAt(2) == "p") && URL.charAt(3) == ".")
		                    {
		                        URL = "ftp://"+URL;
		                    }  else  {
		                        //ok, it's probably a plain old HTTP site...
		                        URL = "http://"+URL;
		                    }
		                }
		            }
		            this.frame.url = URL;
		            this.urlbox.setValue(URL);
		            return;
		        }
			
			}
		},
		"-constructor-"	:	{
			"initialize"	:	function(/*Object*/params,/*DomNode|String?*/srcNodeRef){
				this.overrided(params,srcNodeRef);
//				this.self_activate(params);
			}
			
		}
	});	
});
