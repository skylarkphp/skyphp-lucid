<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/

require_once("../lib/debug.php");
	if(!isset($GLOBALS['path'])) {
		$path = dirname(dirname(__FILE__)) . DIRECTORY_SEPARATOR;
	    $GLOBALS['path'] = $path;
	}
	$includes = array(
		"lib/util.php",
		"lib/MDB2.php",
		"configuration.php",
		"lib/output.php",
		"models/base.php"
	);
   mlog("includes ".$_GET['section']." ".$_GET['action']);
	foreach($includes as $include)
	{
mlog($GLOBALS['path'] . $include);	
		if(!is_null($include)) {
			@include_once($GLOBALS['path'] . $include);
		}
	}
