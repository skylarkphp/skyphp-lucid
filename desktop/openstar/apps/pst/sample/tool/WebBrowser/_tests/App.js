define([ "doh/main", "../App"], function(doh,App){

	doh.register("apps.pst.sample.tool.WebBrowser._tests.App",[
		function testCtor(t){
			var s=new App({});
			t.assertEqual(true,!!s );
		}
	]);

});