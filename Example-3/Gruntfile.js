/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global require:false, module:false, process:false */
(function () {
    "use strict";
    var LIVERELOAD_PORT = 35729;
    var liveReloadSnippet = require("connect-livereload")({port: LIVERELOAD_PORT});
    var rewriteModule = require('http-rewrite-middleware');
    var proxySnippet = require("grunt-connect-proxy/lib/utils").proxyRequest;
    var rewrites = [
        // Javascript
        {from: "^/.*/publish.min.([0-9]+).js$", to: "/core/js/app.min.js"},
        {from: "^/.*/locator.min.([0-9]+).js$", to: "/core/js/locator/js/locator.min.js"},
        // CSS
        {from: "^/.*/publish.min.([0-9]+).css(.*)?$", to: "/core/css/app.min.css$2"},
        {from: "^/.*/app.min.css.map$", to: "/core/css/app.min.css.map"},
        {from: "/etc/designs/richemont-pan/clientlibs/core/css/ie.min.css(.*)?$", to: "/core/css/ie/css/ie.min.css$1"},
        {from: "^/.*/main-ie1.min.css(.*)?$", to: "/core/main-ie1/main-ie1.min.css$1"},
        {from: "^/.*/main-ie2.min.css(.*)?$", to: "/core/main-ie2/main-ie2.min.css$1"},
        // Images
        {from: "/richemont-pan/(img|fonts|swf)/", to: "/richemont-pan/clientlibs/core/$1/"}
    ];
    var mountFolder = function (connect, dir, dir2) {
        if (dir2) {
            return connect.static(require("path").resolve(dir), dir2);
        }
        return connect.static(require("path").resolve(dir));
    };
    module.exports = function (grunt) {
        require('load-grunt-tasks')(grunt, {
            pattern: ['grunt-*', '!grunt-template-jasmine-istanbul']
        });
        require('time-grunt')(grunt);

        var bin = "cms-pan-design-package/bin",
            jcr_root = "cms-pan-design-package/src/main/content/jcr_root/",
            clientlibs = jcr_root + "etc/designs/richemont-pan/clientlibs",
            tests = "cms-pan-design-package/src/test/js",
            proto = "cms-pan-design-package/prototype";

        grunt.initConfig({
            bin: bin,
            clientlibs: clientlibs,
            tests: tests,
            proto: proto,
            port: "8503",
            host: "localhost",
            watch: {
                self: {
                    files: ["Gruntfile.js"],
                    tasks: ["jshint"],
                    options: {reload: true}
                },
                scripts: {
                    files: [
                        "<%= clientlibs %>/core/jssrc/**/*.js",
                        "!<%= clientlibs %>/core/jssrc/locator.js",
                        "!<%= clientlibs %>/core/jssrc/worldcoords.js",
                    ],
                    tasks: ["concat:js"],
                    options: {livereload: true}
                },
                locatorjs: {
                    files: [
                        "<%= clientlibs %>/core/jssrc/locator.js",
                        "<%= clientlibs %>/core/jssrc/worldcoords.js"
                    ],
                    tasks: ["concat:locator"],
                    options: {livereload: true}
                },
                /*tests: {
                    files: ["<%= tests %>/*.js, <%= tests %>/mocks/*.js", "<%= clientlibs %>/core/js/app.min.js"],
                    tasks: ["test"]
                },*/
                css: {
                    files: ["<%= clientlibs %>/core/css/**/*.css"],
                    options: {livereload: true}
                },
                sass: {
                    files: ["<%= clientlibs %>/core/sass/**/*.scss"],
                    tasks: ["sass:dev"]
                },
                images: {
                    files: ["<%= clientlibs %>/core/img/*.*"],
                    tasks: ["sass:dev", "dataUri", "cssmin"],
                    options: {livereload: true}
                },
                mochaTest: {
                    files: ["cms-pan-design-package/src/test/**/*.*"],
                    tasks: ["mochaTest"]
                },
                html: {
                    files: ["<%= proto %>/*.html"],
                    options: {livereload: true}
                },
                jsp: {
                    files: ["cms-pan-ui/cms-pan-ui-package/src/main/content/jcr_root/apps/richemont-pan/ui/**/*.jsp"],
                    tasks: ["svlt"],
                    options: {
                        livereload: true,
                        cwd: '../'
                    }
                }
            },
            sass: {
                dist: {
                    options: {
                        //outputStyle:"compressed",
                        imagePath: "../img/",
                        precision: 6
                    },
                    files: [{
                        '<%= clientlibs %>/core/css/app.min.css': '<%= clientlibs %>/core/sass/app.min.scss'
                    },
                    {
                        '<%= proto %>/test.css': '<%= clientlibs %>/core/sass/test.scss'
                    },
                    {
                        '<%= clientlibs %>/core/css/ie/css/ie.min.css': '<%= clientlibs %>/core/sass/ie/css/ie.min.scss'
                    },
                    {
                        '<%= clientlibs %>/core/main-ie1/main-ie1.min.css': '<%= clientlibs %>/core/sass/ie/css/ie1.scss'
                    },
                    {
                        '<%= clientlibs %>/core/main-ie2/main-ie2.min.css': '<%= clientlibs %>/core/sass/ie/css/ie2.scss'
                    }]
                }, 
                dev: {
                    options: {
                        //outputStyle:"compressed",
                        sourceMap: true,
                        imagePath: "../img/",
                        precision: 6
                    },
                    files: '<%=sass.dist.files%>'
                }
            },
            dataUri: {
                dist: {
                    // src file
                    src: ['<%= clientlibs %>/core/css/app.min.css'],
                    // output dir
                    dest: '<%= clientlibs %>/core/css/',
                    options: {
                        // specified files are only encoding
                        target: ['<%= clientlibs %>/core/img/b64/*.*'],
                        // adjust relative path?
                        fixDirLevel: true,
                        // img detecting base dir
                        // baseDir: './'

                        // Do not inline any images larger
                        // than this size. 2048 is a size
                        // recommended by Google's mod_pagespeed.
                        maxBytes : 2048
                    }
                }
            },
            jshint: {
                files: [
                    "<%= clientlibs %>/core/jssrc/*.js",
                    "<%= clientlibs %>/core/jssrc/plugins/*.js"
                ],
                options:{
                    // don't try to lint minified files
                    ignores: ['/**/*.min.js']
                }
            },
            concat: {
                js: {
                    files: {
                        "<%= clientlibs %>/core/js/app.min.js" : [
                            "<%= clientlibs %>/core/jssrc/lib/jq.akscroller.min.js",
                            "<%= clientlibs %>/core/jssrc/lib/jq.akcarousel.min.js",
                            "<%= clientlibs %>/core/jssrc/lib/*.js",
                            "<%= clientlibs %>/core/jssrc/utils/utils.js",
                            "<%= clientlibs %>/core/jssrc/utils/*.js",
                            "<%= clientlibs %>/core/jssrc/tracking/*.js",
                            "<%= clientlibs %>/core/jssrc/plugins/*.js",
                            "<%= clientlibs %>/core/jssrc/validate.js",
                            "<%= clientlibs %>/core/jssrc/*.js",
                            "!<%= clientlibs %>/core/jssrc/worldcoords.js",
                            "!<%= clientlibs %>/core/jssrc/locator.js",
                            "!<%= clientlibs %>/core/jssrc/init.js",
                            "<%= clientlibs %>/core/jssrc/init.js"
                        ]
                    },
                },
                locator: {
                    files: {
                        "<%= clientlibs %>/core/js/locator/js/locator.min.js" : [
                            "<%= clientlibs %>/core/jssrc/worldcoords.js",
                            "<%= clientlibs %>/core/jssrc/locator.js"
                        ]
                    }
                }
            },
            uglify: {
                prod: {
                    files: {
                        "<%= clientlibs %>/core/js/app.min.js" : ["<%= clientlibs %>/core/js/app.min.js"]
                    },
                    options: {
                        beautify: false,
                        mangle: true,
                        preserveComments: "some",
                        sourceMap: true
                    }
                },
            },
            strip_code: {
                prod: {
                    src: "<%= clientlibs %>/core/js/*.js"
                }
            },
            //testing
            mochaTest: {
                test: {
                    options:{
                        reporter: 'spec',
                        quiet: false
                    },
                    src: ["cms-pan-design-package/src/test/index.js"]
                }
                
            },
            plato: {
                complexity: {
                    files: {
                        "<%= bin %>/js/complexity": [
                            "<%= clientlibs %>/core/jssrc/*.js",
                            "!<%= clientlibs %>/core/jssrc/worldcoords.js",
                            "cms-pan-design-package/src/test/js/*.js"
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
                                function(req, res, next) {
                                    res.setHeader("Access-Control-Allow-Origin", "*");
                                    res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
                                    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
                                    if (req.originalUrl.indexOf(".htc") !== -1) {
                                        res.setHeader("Content-Type", "text/x-component");
                                    }
                                    // don"t just call next() return it
                                    return next();
                                },
                                liveReloadSnippet,
                                rewriteModule.getMiddleware(rewrites),
                                mountFolder(connect, clientlibs),
                                mountFolder(connect, 'cms-pan-design-package'),
                                proxySnippet
                            ];
                        }
                    }
                },
                testserver: {
                    options: {
                        port: 9001,
                        debug: true,
                        hostname: "0.0.0.0",
                        middleware: function (connect) {
                            return [
                                function(req, res, next) {
                                    res.setHeader("Access-Control-Allow-Origin", "*");
                                    res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
                                    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
                                    if (req.originalUrl.indexOf(".htc") !== -1) {
                                        res.setHeader("Content-Type", "text/x-component");
                                    }
                                    // don"t just call next() return it
                                    return next();
                                },
                                rewriteModule.getMiddleware(rewrites),
                                mountFolder(connect, clientlibs),
                                mountFolder(connect, 'cms-pan-design-package'),
                                proxySnippet
                            ];
                        }
                    }
                },
                proxies: [
                    {
                        context: "/",
                        host: "<%=host%>",
                        port: "<%=port%>",
                        changeOrigin: true
                    }
                ]
            },
            // Combine media queries
            combine_mq: {
                dist: {
                    expand: true,
                    cwd: "<%= clientlibs %>/core/css/",
                    src: "*.css",
                    dest: "<%= clientlibs %>/core/css/"
                }
            },
            cssmin: {
                options: {
                    compatibility: 'ie8',
                    noAdvanced: true,
                    advanced: false /* clean-css v3 changed to this but is very new so we have both so as to not break stuff */
                },
                dist: {
                    files: [{
                        expand: true,
                        cwd: "<%= clientlibs %>/core/css/",
                        src: ["*.css"],
                        dest: "<%= clientlibs %>/core/css/"
                    }]
                }
            },
            svlt: {
                options: {
                    vaultWork: '../cms-pan-ui/cms-pan-ui-package/src/main/content/jcr_root/apps/richemont-pan/ui/',
                    src: ['**/*.jsp'],
                    stdout: true,
                    multithread: true,
                    checkout: {
                        host: {
                            uri: 'http://localhost:<%=port%>/crx',
                            user: 'admin',
                            password: 'admin'
                        },
                        autoforce: true,
                        stdout: true
                    }
                }
            },
            clean: {
                staticGeneratedFiles: [
                    "<%=clientlibs%>/core/css/app.min.css",
                    "<%=clientlibs%>/core/css/app.min.css.map",
                    "<%=clientlibs%>/core/css/ie/css/ie.min.css",
                    "<%=clientlibs%>/core/css/ie/css/ie.min.css.map",
                    "<%=clientlibs%>/core/js/app.min.js",
                    "<%=clientlibs%>/core/js/locator/js/locator.min.js",
                    "<%=clientlibs%>/core/main-ie1/main-ie1.min.css",
                    "<%=clientlibs%>/core/main-ie1/main-ie1.min.css.map",
                    "<%=clientlibs%>/core/main-ie2/main-ie2.min.css",
                    "<%=clientlibs%>/core/main-ie2/main-ie2.min.css.map"
                ]
            }
        });
        grunt.registerTask('set', 'Set server port', function(name, val) {
            grunt.config.set(name, val);
        });
        grunt.registerTask("testdev", ["jshint", "set:port:4503", "set:host:dev-cqp.pan.akqa.net", "configureProxies","connect:testserver","mochaTest"/*, "plato"*/]);
        grunt.registerTask("test", ["jshint", "configureProxies","connect:testserver","mochaTest"/*, "plato"*/]);
        grunt.registerTask("build", ["concat", "uglify", "strip_code", "sass:dist", "dataUri", "cssmin", "testdev"]);
        grunt.registerTask("rundevserver", ["concat", "sass:dev", "test", "configureProxies", "connect:livereload", "watch"]);
        grunt.registerTask("runprodserver", ["build", "configureProxies", "connect:livereload", "watch"]);
        grunt.registerTask("author", ["set:port:8502", "rundevserver"]);
        grunt.registerTask("publish", ["rundevserver"]);
        grunt.registerTask("prod", ["runprodserver"]);
        grunt.registerTask("server", ["rundevserver"]);
    };
}());
