<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/

//debugging
function mlog($d) {
    $f = fopen("c:/temp/log.txt", "a+");
    fwrite($f, "\r\n$d");
    fclose($f);
}