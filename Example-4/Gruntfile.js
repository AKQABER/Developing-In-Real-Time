/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global require:false, module:false, console:false */
(function () {
    "use strict";
    var LIVERELOAD_PORT = 35729;
    var liveReloadSnippet = require("connect-livereload")({port: LIVERELOAD_PORT});
    var proxySnippet = require("grunt-connect-proxy/lib/utils").proxyRequest;
    var mountFolder = function (connect, dir) {
        return connect.static(require("path").resolve(dir));
    };
    var options = require('./options');
    module.exports = function (grunt) {
        require('load-grunt-tasks')(grunt, {
            pattern: ['grunt-*']
        });
        require('time-grunt')(grunt);

        var src = "src",
            rep = options.cacheBuster,
            dest = options.staticDir;

        grunt.initConfig({
            src: src,
            rep: rep,
            dest: dest,
            staticString: new Date().getTime().toString('36'),
            appcache: {
                options: {
                    basePath: '<%= dest%>',
                    baseUrl: '/'
                },
                all: {
                    dest: '<%= dest %>/static/manifest.appcache',
                    cache: {
                        patterns: [
                            '<%= dest %>/<%= rep%>/**/*',
                            '!<%= dest %>/<%= rep%>/images/icons/*',
                            '!<%= dest %>/<%= rep%>/images/interstitials/*',
                            '!<%= dest %>/<%= rep%>/images/dummy/*',
                            '!<%= dest %>/<%= rep%>/images/comps/*',
                            '!<%= dest %>/<%= rep%>/images/content/*',
                        ]
                    },
                    network: '*'
                }
            },
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
                options: {
                    banner: '/*! Copyright (c) 2015 AKQA GmbH. All Rights Reserved. */'
                },
                js: {
                    src: [
                            "<%= src %>/js/lib/jk.akscroller.min.js",
                            "<%= src %>/js/lib/*.js",
                            "!<%= src %>/js/lib/jq.akcarousel.min.js",
                            "<%= src %>/js/lib/jq.akcarousel.min.js",
                            "<%= src %>/isojs/calendar.js",
                            "<%= src %>/js/start.js",
                            "<%= src %>/js/*.js",
                            "!<%= src %>/js/init.js",
                            "<%= src %>/js/init.js"
                        ],
                    dest: "<%= dest %>/<%= rep%>/js/app.min.js"
                }
            },
            concurrent: {
                servers: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
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
                                mountFolder(connect, 'public'),
                                proxySnippet
                            ];
                        }
                    }
                },
                proxies: [
                    {
                        context: "/",
                        host: "localhost",
                        port: "3000",
                        changeOrigin: true
                    }
                ]
            },
            copy: {
                fonts: {
                    files: [
                        {
                            expand: true,
                            cwd: 'src/',
                            src: ['fonts/**/*'], 
                            dest: '<%= dest %>/<%= rep%>/'
                        }
                    ]
                }, 
                images: {
                    files: [
                        {
                            expand: true,
                            cwd: 'src/',
                            src: ['images/**/*'], 
                            dest: '<%= dest %>/<%= rep%>/'
                        }
                    ]
                },
                jq: {
                    files: [
                        {
                            expand: true,
                            cwd: 'src/',
                            src: ['js/jq/*'], 
                            dest: '<%= dest %>/<%= rep%>/'
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
                        cwd: "<%= dest %>/<%= rep%>/css/",
                        src: ["*.css"],
                        dest: "<%= dest %>/<%= rep%>/css/"
                    }]
                }
            },
            dataUri: {
                dist: {
                    // src file
                    src: ['<%= dest %>/<%= rep%>/css/app.min.css'],
                    // output dir
                    dest: '<%= dest %>/<%= rep%>/css/',
                    options: {
			            target: ['.'],
                        fixDirLevel: true,
                        maxBytes : 2048
                    }
                }
            },
            jshint: {
                files: [
                    "Gruntfile.js",
                    "<%= src %>/js/*.js"
                ]
            },
            nodemon: {
                options: {
                    delayTime: 1,
                    nodeArgs: '--debug',
                    ignore: ['views/**', 'src/js/*', 'dist/**']
                },
                dev: {
                    script: 'finnair.js'
                }
            },
            replace: {
              dist: {
                options: {
                  patterns: [
                    {
                      match: /\$rep/,
                      replacement: '<%=staticString%>'
                    }
                  ]
                },
                files: [
                  {expand: true, flatten: true, src: ['options.js'], dest: '.'}
                ]
              }
            },
            sass: {
                dist: {
                    options: {
                        includePaths:  require('node-bourbon').includePaths,
                        outputStyle:"compressed",
                        precision: 6
                    },
                    files: [{
                        '<%= dest %>/<%= rep%>/css/app.min.css': '<%= src %>/sass/app.scss'
                    }]
                }, 
                dev: {
                    options: {
                        includePaths: require('node-bourbon').includePaths,
                        outputStyle:"compressed",
                        sourceMap: true,
                        precision: 6
                    },
                    files: '<%=sass.dist.files%>'
                }
            },
            uglify: {
                prod: {
                    files: {
                        "<%= dest %>/<%= rep%>/js/app.min.js" : ["<%= dest %>/<%= rep%>/js/app.min.js"]
                    },
                    options: {
                        beautify: false,
                        mangle: true,
                        preserveComments: "some"
                    }
                }
            },
            wait: {
                options: {
                    delay: 200
                },
                pause: {      
                    options: {
                        before : function(options) {
                            console.log('pausing %dms', options.delay);
                        },
                        after : function() {
                            console.log('pause end');
                        }
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
                        "<%= src %>/js/*.js",
                        "<%= src %>/isojs/*.js",
                        "<%= src %>/js/lib/*.js"
                    ],
                    tasks: ["concat:js"],
                    options: {livereload: true}
                },
                css: {
                    files: ["<%= dest %>/<%= rep%>/css/**/*.css"],
                    options: {livereload: true}
                },
                sass: {
                    files: ["<%= src %>/sass/**/*.scss"],
                    tasks: ["sass:dev"]
                },
                images: {
                    files: ["<%= src %>/images/**/*"],
                    tasks: ["copy:images", "sass:dev"],
                    options: {livereload: true}
                },
                html: {
                    files: ["**/*.ejs"],
                    options: {livereload: true}
                },
                fonts: {
                    files: ["<%= src %>/fonts/**/*"],
                    tasks: ["copy:fonts"],
                    options: {livereload: true}
                },
                serverjs: {
                    files: [
                        'options.js',
                        'fa.js',
                        'dispatcher.js',
                        'routes/*.js',
                        'src/isojs/*.js'
                    ],
                    tasks:['wait'],
                    options: {livereload: true}
                }
            }
        });
        grunt.registerTask("build", ["clean", "jshint", "copy", "concat", "uglify", "sass:dist", "appcache"]);
        grunt.registerTask("builddev", ["clean", "jshint", "copy", "concat", "sass:dev"]);
        grunt.registerTask("server", ["builddev",'configureProxies','connect:livereload', "concurrent:servers"]);
        grunt.registerTask("prodserver", ["build", 'configureProxies','connect:livereload', "concurrent:servers"]);
    };
}());
