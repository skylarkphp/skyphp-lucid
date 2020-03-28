/**
 *
 * Copyright (c) 2013 psteam Inc.(http://www.psteam.co.jp)
 * http://www.psteam.co.jp/qface/license
 *
 * @Author: liwenfeng
 * @Date: 2014/09/30
 */
define([
	"qscript/lang/Class"
], function(
	Class
){

	/**
	 * @class openstar/desktop2/ApplicationMeta
	 * @description a meta data to a application  in the application store.
	 */
	var ApplicationMeta = Class.declare({
		"-parent-"		:	ServiceReference,

		"-interfaces-"	:	[],

		"-module"		:   "openstar/desktop2/ApplicationMeta",


		"-protected-"	:	{
			"-fields-"	:	{
				"_"		: {
				}
			},

			"-methods-"	:	{

			}
		},

		"-public-"	:	{
			"-attributes-"	:	{

				/*
				 *@attribute category
				 *example: tools.develop
				 *@description The category name of this application
				 *@type String
				 *@writable true
				 */
				"category"	:	{
					type	:	String,
					writable:   true
				},

				/*
				 *@attribute vendor
				 *example: utilhub.com
				 *@description The vendor name of this application
				 *@type String
				 *@writable true
				 */
				"vendor"	:	{
					type	:	String,
					writable:   true
				},

				/*
				 *@attribute category
				 *example: tools.develop
				 *@description The category name of this application
				 *@type String
				 *@writable true
				 */
				"category"	:	{
					type	:	String,
					writable:   true
				},

				/*
				 *@attribute appname
				 *example: htmleditor
				 *@description The application name of this application
				 *@type String
				 *@writable true
				 */
				"appname"	:	{
					type	:	String,
					writable:   true
				},

				/*
				 *@attribute componentUrl
				 *example: /desktop/swh/psteam.co.jp/samples/1.0.0/tools/calculator
				 *@description The component url of this application
				 *@type String
				 *@writable true
				 */
				"componentUrl"	:	{
					type	:	String,
					writable:   true
				},

			},
			"-methods-"	:	{
			}
		},
		"-constructor-"	:	{
			/*
			 * @initialize
			 */
			"initialize"	:	function(/*Object*/args) {
					this._setupAttributeValues({
						"category"		:	args.category,
						"vendor"		:	args.vendor,
						"appname"		:	args.appname,
						"componentUrl"	:	args.componentUrl
					});
			}
		}

	});

	return ServiceReference;

});

