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
    "openstar/ufs/IResource"
], function(Object, Interface, IResource) {

    var IFile = Interface.declare({
        "-parent-": IResource,

        "-module-": "qscriptx/store/ws/IFile",

        "-interfaces-": [],

        "-protected-": {
            "-fields-": {

            },

            "-methods-": {

            }
        },

        "-public-": {
            "-attributes-": {
                "extension": {
                    "type": String,
                    "getter": function() {
                        var name = this.name;
                        return name.substr(name.lastIndexOf('.') + 1);
                    }
                }

            },
            "-methods-": {

                setContent: function(content, isWorkingCopy) {
                    var workingCopy = isWorkingCopy ? "true" : "false";
                    var dirty = isWorkingCopy ? true : false;
                    if (this.isNew && !isWorkingCopy) {
                        this.isNew = false;
                    }
                    var workingCopyExtension = isWorkingCopy ? ".workingcopy" : "";

                    var pathStr = this.pathStr + workingCopyExtension,
                        root = this.root;
                    return root.innerWriteAllText(
                        pathStr,
                        content
                    ).then(
                        Function.hitch(this, function(res) {
                            this.dirtyResource = dirty;
                            dojo.publish("/openstar/ufs/resource/modified", this);
                        })
                    );
                },

                getContent: function() {
                    var pathStr = this.pathStr;
                    root = this.root;
                    return root.innerReadAllText(path);
                },


                getExtension: function() {
                    return this.extension;
                },

                getText: function() {
                    return this.getContentSync();
                },

                removeWorkingCopy: function() {

                    if (this.isNew) {
                        this["delete"](true);
                    }
                }
            }
        },
        "-constructor-": {}
    });
    return IFile;
});
