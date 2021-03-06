/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global require:false, module:false */
(function () {
    "use strict";
    var LIVERELOAD_PORT = 35729;
    var liveReloadSnippet = require("connect-livereload")({port: LIVERELOAD_PORT});
    var mountFolder = function (connect, dir) {
        return connect.static(require("path").resolve(dir));
    };
    module.exports = function (grunt) {
        require('load-grunt-tasks')(grunt, {
            pattern: ['grunt-*']
        });

        var src = "src",
            dest = "dist";

        grunt.initConfig({
            src: src,
            dest: dest,
            clean: {
                all: ['dist/**/*']
            },
            concat: {
                js: {
                    files: {
                        "<%= dest %>/js/app.js" : [
                            "<%= src %>/js/*.js"
                        ]
                    }
                }
            },
            connect: {
                livereload: {
                    options: {
                        port: 9000,
                        debug: true,
                        hostname: "0.0.0.0",
                        middleware: function (connect) {
                            return [
                                liveReloadSnippet,
                                mountFolder(connect, dest)
                            ];
                        }
                    }
                }
            },
            copy: {
                fonts: {
                    files: [
                        {
                            expand: true,
                            cwd: 'src/',
                            src: ['fonts/**/*'], 
                            dest: '<%= dest %>/fonts/'
                        }
                    ]
                }, 
                html: {
                    files: [
                        {
                            expand: true,
                            cwd: 'src/',
                            src: ['**/*.html'], 
                            dest: '<%= dest %>/'
                        }
                    ]
                },
                images: {
                    files: [
                        {
                            expand: true,
                            cwd: 'src/',
                            src: ['images/**/*'], 
                            dest: '<%= dest %>/images/'
                        }
                    ]
                }
            },
            sass: {
                dist: {
                    options: {
                        outputStyle:"compressed",
                        imagePath: "../img/",
                        precision: 6
                    },
                    files: [{
                        '<%= dest %>/css/app.min.css': '<%= src %>/sass/app.scss'
                    }]
                }
            },
            watch: {
                self: {
                    files: ["Gruntfile.js"],
                    tasks: ["jshint"],
                    options: {reload: true}
                },
                scripts: {
                    files: [
                        "<%= src %>/js/**/*.js",
                    ],
                    tasks: ["concat:js"],
                    options: {livereload: true}
                },
                css: {
                    files: ["<%= dest %>/css/**/*.css"],
                    options: {livereload: true}
                },
                sass: {
                    files: ["<%= src %>/sass/**/*.scss"],
                    tasks: ["sass"]
                },
                images: {
                    files: ["<%= src %>/images/**/*.*"],
                    tasks: ["copy:img"],
                    options: {livereload: true}
                },
                html: {
                    files: ["<%= src %>/**/*.html"],
                    tasks: ["copy:html"],
                    options: {livereload: true}
                },
                fonts: {
                    files: ["<%= src %>/fonts/**/*"],
                    tasks: ["copy:fonts"],
                    options: {livereload: true}
                }
            }
        });
        grunt.registerTask("build", ["clean", "copy", "concat", "sass"]);
        grunt.registerTask("server", ["build", "connect", "watch"]);
    };
}());
