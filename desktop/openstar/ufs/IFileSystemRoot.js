/**
 *
 * Copyright (c) 2013 psteam Inc.(http://www.psteam.co.jp)
 * http://www.psteam.co.jp/qface/license
 * 
 * @Author: liwenfeng
 * @Date: 2013/02/28
 */
define([
	"qscript/lang/Interface",
	"qscript/util/collection/ITreeRoot",
	"openstar/ufs/IContainer"
], function(
	Interface,
	ITreeRoot,
	IContainer
){

	/*
	 *A root resource represents the top of the resource hierarchy in a filesystem. There is exactly one root in a filesystem. 
	 *The root resource has the following behavior:
	 *-It cannot be moved or copied
	 *-It always exists.
	 *-Deleting the root deletes all of the children under the root but leaves the root itself
	 *-It is always local.
	 *-It is always local.
	 *
	 */
	var IFileSystemRoot = Interface.declare({
		"-parent-"		:	IContainer,
		
		"-module-"		:	"qscriptx/store/ws/IFileSystemRoot",

		"-interfaces-"	:	[ITreeRoot],
		
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
				
				"innnerCopy"	:	function(srcPath,targetPath,options){
				
				},
				
				/**
				 * @method innerCreate
				 * @param  {String} path
				 * @param  {Boolean} isFolder
				 * @return {dojo/Deferred} 
				 **/
				"innerCreate" : function(path,isFolder,options) {
				},
				
				/**
				 * @method innerDelete
				 * @param  {String} path
				 * @return {Deferred} 
				 **/
				"innerDelete" : function(path,options) {
				},
				
				"innerFind"	:	function(name,options){
				
				},
				
				/**
				 * @method innerExists
				 * @param  {String} path
				 * @return {dojo/Deferred} 
				 **/
				"innerExists":function(path,options) {
				},


				/**
				 * @method innerList
				 * @param  {String} path
				 * @return {dojo/Deferred} 
				 **/
				"innerList":function(path,options) {
				},

				/**
				 * @method innerMove
				 * @param  {String} oldPath
				 * @param  {String} newPath
				 * @return {dojo/Deferred} 
				 **/
				"innerMove" : function(oldPath,newPath,options) {
				},
				
				/**
				 * @method innerReadAllText
				 * @param  {String} path
				 * @return {dojo/Deferred} 
				 **/
				"innerReadAllText": function(path,options) {
				},
				
				/**
				 * @method innerReadAllBytes
				 * @param  {String} path
				 * @return {dojo/Deferred} 
				 **/
				"innerReadAllBytes": function(path,options) {
				},
				

				/**
				 * @method innerWriteAllText
				 * @param  {String} path
				 * @param  {String} text
				 * @return {dojo/Deferred} 
				 **/
				"innerWriteAllText" : function(path,text,options) {
				},
				
				/**
				 * @method innerWriteAllBytes
				 * @param  {String} path
				 * @param  {Byte[]} bytes
				 * @return {dojo/Deferred} 
				 **/
				"innerWriteAllBytes" : function(path,bytes,options) {
				}
			}
		},
		"-constructor-"	:	{
		}
	
	});
	
	return IFileSystemRoot;

});

