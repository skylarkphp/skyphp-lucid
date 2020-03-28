/*
	Copyright (c) 2004-2008, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["openstar.apps.KatanaIDE._codeTextArea.plugins.BlinkingCaret"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["openstar.apps.KatanaIDE._codeTextArea.plugins.BlinkingCaret"] = true;
dojo.provide("openstar.apps.KatanaIDE._codeTextArea.plugins.BlinkingCaret");
openstar.apps.KatanaIDE._codeTextArea.plugins.BlinkingCaret.startup = function(args){
    this._blinkInterval = setInterval(dojo.hitch(args.source,function(){
        this.caret.style.visibility = 
            this.caret.style.visibility == "hidden" ? "visible" : "hidden"; 
    }), 500);
};

}
