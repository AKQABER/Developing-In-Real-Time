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
        require('time-grunt')(grunt);

        var src = "src",
            dest = "dist";

        grunt.initConfig({
            src: src,
            dest: dest,
            clean: {
                all: ['dist/**/*']
            },
            combine_mq: {
                dist: {
                    expand: true,
                    cwd: "<%= src %>/core/css/",
                    src: "*.css",
                    dest: "<%= src %>/core/css/"
                }
            },
            concat: {
                js: {
                    files: {
                        "<%= dest %>/js/app.min.js" : [
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
            cssmin: {
                options: {
                    compatibility: 'ie8',
                    advanced: false
                },
                dist: {
                    files: [{
                        expand: true,
                        cwd: "<%= dest %>/css/",
                        src: ["*.css"],
                        dest: "<%= dest %>/css/"
                    }]
                }
            },
            dataUri: {
                dist: {
                    // src file
                    src: ['<%= dest %>/css/app.min.css'],
                    // output dir
                    dest: '<%= dest %>/css/',
                    options: {
                        fixDirLevel: true,
                        maxBytes : 2048
                    }
                }
            },
            jshint: {
                files: [
                    "Gruntfile.js",
                    "<%= src %>/js/**/*.js"
                ]
            },
            sass: {
                dist: {
                    options: {
                        includePaths: [
                            require('node-bourbon').includePaths],
                        outputStyle:"compressed",
                        imagePath: "../img/",
                        precision: 6
                    },
                    files: [{
                        '<%= dest %>/css/app.min.css': '<%= src %>/sass/app.scss'
                    }]
                }, 
                dev: {
                    options: {
                        includePaths: require('node-bourbon').includePaths,
                        outputStyle:"compressed",
                        sourceMap: true,
                        imagePath: "../img/",
                        precision: 6
                    },
                    files: '<%=sass.dist.files%>'
                }
            },
            uglify: {
                prod: {
                    files: {
                        "<%= dest %>/js/app.min.js" : ["<%= dest %>/js/app.min.js"]
                    },
                    options: {
                        beautify: false,
                        mangle: true,
                        preserveComments: "some",
                        sourceMap: true
                    }
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
                    tasks: ["sass:dev"]
                },
                images: {
                    files: ["<%= src %>/images/**/*.*"],
                    tasks: ["copy:img", "sass:dev", "dataUri", "cssmin"],
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
        grunt.registerTask("build", ["clean", "jshint", "copy", "concat", "uglify", "sass:dist", "dataUri", "combine_mq", "cssmin"]);
        grunt.registerTask("builddev", ["clean", "jshint", "copy", "concat", "uglify", "sass:dev"]);
        grunt.registerTask("server", ["builddev", "connect", "watch"]);
        grunt.registerTask("prodserver", ["build", "connect", "watch"]);
    };
}());
