/**
 *
 * Copyright (c) 2013 psteam Inc.(http://www.psteam.co.jp)
 * http://www.psteam.co.jp/qface/license
 * 
 * @Author: liwenfeng
 * @Date: 2013/02/28
 */
define([
	"qscript/lang/Object",
	"qscript/lang/Interface",
	"openstar/ufs/IContainer"
], function(
	Object,
	Interface,
	IContainer){

	var IFolder = Interface.declare({
		"-parent-"		:	IContainer,
		
		"-module-"		:	"qscriptx/store/ws/IFolder",

		"-interfaces-"	:	[],
		
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
			}
		},
		"-constructor-"	:	{
		}
	
	});
	
	return IFolder;

});

