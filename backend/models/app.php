<?php 
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	class App extends Base
	{
		var $sysname = array('type' => "text");
		var $name = array('type' => "text");
		var $author = array('type' => "text");
		var $email = array('type' => "text");
		var $version = array('type' => "text");
		var $maturity = array('type' => "text");
		var $category = array('type' => "text");
		var $icon = array('type' => "text");
		var $filetypes = array('type' => "array");
		var $permissions = array('type' => "array");
		var $compatible = array('type' => "array");
		var $description = array('type' => "text");
		var $download_count = array('type' => 'integer','default' => 0);
		var $view_count = array('type' => 'integer','default' => 0);
		var $fav_count = array('type' => 'integer','default' => 0);
		var $created_at = array('type' => 'date');
		var $updated_at = array('type' => 'date');

		// function hot_apps(){

		// }

		// function latest_apps(){
		// 	$latest_apps = $App->filter("sysname", $_POST['sysname']);
		// }

		// function free_apps(){
			
		// }

	}
	global $App;
	$App = new App();
