require([
	"dojo/ready",
	"dojo/dom",
	"dojo/on",
	"dojo/aspect",
	"dojo/request",
	"dojo/query",
	"dojo/parser", 
	"dojo/json", 
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/_base/lang",
	"dojo/_base/xhr",
	"dojox/gfx",
	"dojox/gfx/fx"
	],function(ready,dom,on,aspect,request,query,parser,JSON,domConstruct,domStyle,lang,xhr,gfx,fx){
	ready(function(){
		/*var surface = gfx.createSurface("surfaceElement",800,600);

		surface.createRect({x:100,y:50,width:200,height:100}).setFill("yellow").setStroke("blue");

		surface.createCircle({cx:100,cy:300,r:50}).setFill("green").setStroke("pink");

		surface.createEllipse({cx:300, cy:200, rx:50, r:25}).setFill("#fff").setStroke("#999");

		surface.createLine({x1:10,y1:50,x2:400,y2:400}).setStroke("green");

		surface.createPolyline([
			{x: 250, y: 250},
			{x: 300, y: 300},
			{x: 250, y: 350},
			{x: 200, y: 300},
			{x: 110, y: 250}
		]).setStroke("blue");

		surface.createImage({x:100, y:300, width: 123, height: 56, src: "/fisheye/img/NetWork.png"});

		var text = surface.createText({x:64, y:220, text:"Vector Graphics Rock!", align:"start"});
		text.setFont({ family:"Arial", size:"20pt", weight:"bold" }).setFill("blue");

		var textShape = surface.createTextPath({text:"TextPath!!!"})
		textShape.moveTo(125,70).lineTo(285,20).setFont({family:"Verdana",size:"2em"}).setFill("black");

		surface.createPath("m100 100 100 0 0 100c0 50-50 50-100 0s-50-100 0-100z").setStroke("black");

		// Create a circle with a set "blue" color
		surface.createCircle({ cx: 50, cy: 50, rx:50, r:25 }).setFill("blue");
		 
		// Crate a circle with a set hex color
		surface.createCircle({ cx: 300, cy: 300, rx:50, r:25 }).setFill("#f00");
		 
		// Create a circle with a linear gradient
		surface.createRect({x: 180, y: 40, width: 200, height: 100 }).
		setFill({ type:"linear",
		    x1:0,
		    y1:0,   //x: 0=>0, consistent gradient horizontally
		    x2:0,   //y: 0=>420, changing gradient vertically
		    y2:420,
		    colors: [
		        { offset: 0,   color: "#003b80" },
		        { offset: 0.5, color: "#0072e5" },
		        { offset: 1,   color: "#4ea1fc" }
		    ]
		});
		 
		// Create a circle with a radial gradient
		surface.createEllipse({
		    cx: 120,
		    cy: 260,
		    rx: 100,
		    ry: 100
		}).setFill({
		    type: "radial",
		    cx: 150,
		    cy: 200,
		    colors: [
		        { offset: 0,   color: "#4ea1fc" },
		        { offset: 0.5, color: "#0072e5" },
		        { offset: 1,   color: "#003b80" }
		    ]
		});*/

		var surface = gfx.createSurface("surfaceElement",600,600);

		var group = surface.createGroup();

		var vShape = group.createPolyline([
			{ x:28, y:420 }, 
	    { x:100, y:420 }, 
	    { x:240, y:124 }, 
	    { x:384, y:420 }, 
	    { x:456, y:420 }, 
	    { x:276, y:44 }, 
	    { x:208, y:44 }, 
	    { x:28, y:420 } 
		]);

		vShape.setStroke({color:"#a70017"}).setFill({
			type:"linear", 
			x1:0, y1:0, x2:0, y2:420, 
			colors: [
				{ 
    			offset:0, 
   		  	color:"#f3001f"
				},
				{ 
    			offset:1, 
    			color:"#a40016"
				}
			]
		});

		var rectShape = group.createRect({ x:32, y:272, width:412, height:64 }).setFill("#0000ae");

		var textShape = group.createText({ x:64, y:320, text:"LONDON AJAX", align:"start"});

		textShape.setFont({ family:"Arial", size:"36pt", weight:"bold" }).setFill("#ffffff"); 
	
		var originalVShapeColor = vShape.getFill(), originalRectShapeColor = rectShape.getFill();
		
		var fxObj = new fx.animateTransform({
		    duration: 1200,
		    shape: group,
		    transform: [ { name: "rotategAt", start: [0,240,240], end: [360,240,240] }],
		    onAnimate: function() {
		        vShape.setFill({ 
		            type:"linear", 
		            x1:0, 
		            y1:0, 
		            x2:0, 
		            y2:420, 
		            colors: [{ offset:0, color:"#a40016"},{ offset:1, color:"#f3001f"}] });
		        rectShape.setFill("#0daf24");
		    },
		    onEnd: function() {
		        vShape.setFill(originalVShapeColor);
		        rectShape.setFill(originalRectShapeColor);
		    }
		});
		 
		/* play transformation when clicked */
		on(group.getEventSource(),"click",function() {
		    fxObj.play();
		});
	})
})