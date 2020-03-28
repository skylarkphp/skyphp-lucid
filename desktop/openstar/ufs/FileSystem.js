define([
    "qscript/lang/Object",
    "qscript/lang/Class", // declare
    "qscript/lang/Array",
    "qscript/lang/Deferred",
    "qscript/util/Path",
    "openstar/ufs/IFileSystemRoot",
    "openstar/ufs/_Drive",
    "openstar/ufs/Folder",
    "openstar/ufs/File"
], function(Object, Class, Array, Deferred, Path, IFileSystemRoot, Drive, Folder, File) {
    var drives = [];
    var driveRootFolders;

    var parsePathToDrive = function(path) {
        var segments = new Path(path);
        var driveName = segments.firstSegment(),
            drive = FileSystem.getDrive(driveName);
        if (!drive) {
            throw new Error("invalide path:" + path);
        }
        segments = segments.removeFirstSegments(1);
        return {
            "d": drive,
            "p": segments.toString()
        };
    };


    var RootFolder = Class.declare({
        "-parent-": Class,

        "-interfaces-": [IFileSystemRoot],


        "-protected-": {
            "-fields-": {
                reload: function() {},
                _createResourceSync: function(name, isFolder, localOnly) {},

                _addChildFolder: function(name) {
                    var _ = this._,
                        children = _.children;
                    child = new Folder(name, {}, this);
                    children.push(child);
                },

                _removeChildFolder: function(name) {
                    var _ = this._,
                        children = _.children;
                    var childIdx = -1;
                    name = name.toLowerCase();
                    Array.some(children, function(child, idx) {
                        var childName = child.getName();
                        childName = childName.toLowerCase();

                        var match = childName == name;
                        if (match) {
                            childIdx = idx;
                        }

                        return match;
                    });
                    if (childIdx > -1) {
                        children.splice(childIdx, 1);
                    }
                }

            },

            "-methods-": {}
        },

        "-public-": {
            "-attributes-": {

            },
            "-methods-": {
                "createItem": function(data) {
                    var item;
                    if (data.isDir) {
                        item = new Folder(data.name, data);
                    } else {
                        item = new File(data.name, data);
                    }
                    return item;
                },

                "innerFindSync": function(name) {
                    var segments, driveName, drive;
                    if (typeof name == 'string') {
                        segments = new Path(name);
                    } else {
                        segments = name;
                    }
                    driveName = segments.firstSegment();
                    segments = segments.removeFirstSegments(1);
                    drive = this.getChildByName(driveName);
                    if (drive) {
                        return drive.findSync(segments);
                    }
                },

                "innerFind": function(name) {
                    var segments, driveName, drive;
                    if (typeof name == 'string') {
                        segments = new Path(name);
                    } else {
                        segments = name;
                    }
                    driveName = segments.firstSegment();
                    segments = segments.removeFirstSegments(1);
                    drive = this.getChildByName(driveName);
                    if (drive) {
                        return drive.find(segments);
                    }
                },

                /**
                 * @method innerCreate
                 * @param  {String} path
                 * @param  {Boolean} isFolder
                 * @return {dojo/Deferred}
                 **/
                "innerCreate": function(path, isFolder, options) {
                    var d_p = parsePathToDrive(path),
                        drive = d_p.d,
                        pathInDrive = d_p.p;
                    return drive.create(pathInDrive, isFolder, options && options.sync);
                },

                /**
                 * @method innerDelete
                 * @param  {String} path
                 * @return {dojo/Deferred}
                 **/
                "innerDelete": function(path, options) {
                    var d_p = parsePathToDrive(path),
                        drive = d_p.d,
                        pathInDrive = d_p.p;
                    return drive["delete"](pathInDrive, options && options.sync);
                },

                /**
                 * @method innerList
                 * @param  {String} path
                 * @return {dojo/Deferred}
                 **/
                "innerList": function(path, options) {
                    var d_p = parsePathToDrive(path),
                        drive = d_p.d,
                        pathInDrive = d_p.p;
                    return drive.list(pathInDrive, options && options.sync);
                },

                /**
                 * @method innerMove
                 * @param  {String} oldPath
                 * @param  {String} newPath
                 * @return {dojo/Deferred}
                 **/
                "innerMove": function(oldPath, newPath, options) {
                    var d_p1 = parsePathToDrive(oldPath),
                        drive1 = d_p1.d,
                        pathInDrive1 = d_p1.p;
                    var d_p2 = parsePathToDrive(newPath),
                        drive2 = d_p2.d,
                        pathInDrive2 = d_p2.p;
                    if (drive1 == drive2) {
                        return drive1.move(pathInDrive1, pathInDrive2, options && options.sync);
                    }
                },

                /**
                 * @method innerWriteAllText
                 * @param  {String} path
                 * @param  {String} text
                 * @return {dojo/Deferred}
                 **/
                "innerWriteAllText": function(path, text, options) {
                    var d_p = parsePathToDrive(path),
                        drive = d_p.d,
                        pathInDrive = d_p.p;
                    return drive.writeFile(pathInDrive, text, options && options.sync);
                },

                /**
                 * @method innerReadAllText
                 * @param  {String} path
                 * @return {dojo/Deferred}
                 **/
                "innerReadAllText": function(path, options) {
                    var d_p = parsePathToDrive(path),
                        drive = d_p.d,
                        pathInDrive = d_p.p;
                    return drive.readFile(pathInDrive, options && options.sync);
                },

                "sync": function() {
                    var promise = new Deferred();
                    promise.resolve(this);
                    return promise;

                }

            }
        },
        "-constructor-": {
            "instantiate": function(name, parent) {
                var _ = this._;
                _.elementType = "Root";
                _.name = "";
                _.parent = null;
                _.children = [];
                _.isLoaded = true;
                _.isRoot = true;
            }

        },
        "-destructor-": {
            "finalize": function() {},
            "dispose": function() {}
        }

    });

    var root = new RootFolder();

    var FileSystem = {};

    Object.mixin(FileSystem, {
        /**
         * @method addDrive
         * @param name
         * @param driveClass
         * @returns  Drive
         */
        addDrive: function(name, driveClass) {
            var drive = new driveClass(name);
            drives.push(drive);
            root._addChildFolder(name);
            return drive;
        },

        /**
         * @method removeDrive
         * @param name
         * @param driveClass
         * @returns  Drive
         */
        removeDrive: function(name) {
            var driveIdx = -1;
            name = name.toLowerCase();
            Array.some(drives, function(child, idx) {
                var driveName = child.getName();
                driveName = driveName.toLowerCase();

                var match = driveName == name;
                if (match) {
                    driveIdx = idx;
                }

                return match;
            });
            if (driveIdx > -1) {
                root._removeChildFolder(name);
                return drives.splice(driveIdx, 1);
            }
        },

        /**
         * @method getDrive
         * @param name
         * @returns  Drive
         */
        getDrive: function(name) {
            var driveIdx = -1;
            name = name.toLowerCase();
            Array.some(drives, function(child, idx) {
                var driveName = child.getName();
                driveName = driveName.toLowerCase();

                var match = driveName == name;
                if (match) {
                    driveIdx = idx;
                }

                return match;
            });
            if (driveIdx > -1) {
                return drives[driveIdx];
            }
        },

        /**
         * @method listDrive
         * @returns  Array
         */
        listDrive: function() {
            return Array.map(drives, function(d) {
                return d;
            });
        },

        /**
         * @method findSync
         * @param name
         * @returns  Resource
         */
        findSync: function(name) {
            return root.innerFindSync(name, {
                sync: true
            });
        },

        /**
         * @method find
         * @param name
         * @returns  Resource
         */
        find: function(name) {
            return root.innerFind(name);
        },

        /**
         * @method getRootFolder
         * @returns  Folder
         */
        getRootFolder: function() {
            return root;
        }
    });
    return FileSystem;
});
