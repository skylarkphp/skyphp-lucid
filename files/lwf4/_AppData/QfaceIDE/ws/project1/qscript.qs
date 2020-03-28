/**
 *
 * Copyright (c) 2013 psteam Inc.(http://www.psteam.co.jp)
 * http://www.psteam.co.jp/qface/license
 *
 * @Author: liwenfeng
 * @Date: 2013/02/28
 */
define([
	"qscript/lang/Class",
	"qscript/data/geom/Geometry"
],function(Class,Geometry) {

	var Point = Class.declare({
		"-module-"	:	"qscript/data/geom/Point",

		"-parent-"	:	Geometry,

		"-public-"	:	{
			"-attributes-" : {
				// x: Number
				//		The X coordinate of the point, default value 0.
				"x" : {
					type : Number
				},
				// y: Number
				//		The Y coordinate of the point, default value 0.
				"y" : {
					type : Number
				}
			},
			"-methods-" : {
				"clone"	: function(){
					var _ = this._;
					return new Point(_.x,_.y);

				},

				"move"	: function(/*Number*/dx,/*Number*/dy) {
					this._setupAttributeValues({
						"x"			:	x,
						"y"			:	y
					});
					this.x = this.x+dx;
					this.y = this.y+dy;
				}
			}
		},

		"-constructor-"	:	{
			"initialize"	:	[
				function(){
					this.overload(0,0);
				},
				function(/*Number*/x,/*Number*/y){
					this._setupAttributeValues({
						"x"			:	x,
						"y"			:	y
					});
				}
			]
		}
	});


	return Point;

});
