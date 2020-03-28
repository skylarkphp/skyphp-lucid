<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	class Share extends Base
	{
		var $name = array('type' => 'text');
		var $description = array('type' => 'text');
		var $groups = array('type' => 'array');
		
		function _deltree( $f ){
			if( is_dir( $f ) ){
				foreach( scandir( $f ) as $item ){
					if( !strcmp( $item, '.' ) || !strcmp( $item, '..' ) )
						continue;       
					$this->_deltree( $f . "/" . $item );
				}   
				return rmdir( $f );
			}
			else{
				return unlink( $f );
			}
		}
		
		function create_fs() {
			mkdir($GLOBALS['path'] . "/../public/".$this->name."/");
			file_put_contents($GLOBALS['path'] . "/../public/".$this->name."/sharing.txt", "You now have a share setup. Congrats!");
		}
		
		function frag_fs() {
			_deltree($GLOBALS['path'] . "/../public/".$this->name."/");
		}
	}
	global $Share;
	$Share = new Share();