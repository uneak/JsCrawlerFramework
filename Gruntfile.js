module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-sass')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-npm2bower-sync')


    var jsSrc = [
        'src/js/utils.js',
        'src/js/event-dispatcher.js',
        'src/js/router.js',
        'src/js/loader-model.js',
        'src/js/crawler.js',
        'src/js/controller.js',
        'src/js/model.js',
        'src/js/view.js',
        'src/js/controllers.js',
        'src/js/models.js',
        'src/js/views.js',
        'src/js/js-crawler.js'
    ]
    var srcHintOptions = grunt.file.readJSON( "src/js/.jshintrc" );


    grunt.initConfig({
        pkg: grunt.file.readJSON( "package.json" ),
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: [{
                    "expand": true,
                    "cwd": "src/sass/",
                    "src": ["*.scss"],
                    "dest": "dist/css/",
                    "ext": ".css"
                }]
            }
        },
        concat: {
            options: {
                separator: '\n\n'
            },
            dist: {
                src: jsSrc,
                dest: 'dist/js/js-crawler.js'
            }
        },
        uglify: {
            options: {
                preserveComments: false,
                sourceMap: true,
                sourceMapName: "dist/js/js-crawler.min.map",
                report: "min",
                beautify: {
                    "ascii_only": true
                },
                banner: "/*! JsCrawler Framework v<%= pkg.version %> | " +
                "(c) Marc Galoyer | MIT */",
                compress: {
                    "hoist_funs": false,
                    loops: false,
                    unused: false
                }
            },
            dist: {
                src: jsSrc,
                dest: 'dist/js/js-crawler.min.js'
            }
        },
        watch: {
            scripts: {
                files: 'src/js/*.js',
                tasks: ['concat:dist']
            },
            styles: {
                files: 'src/sass/*.scss',
                tasks: ['sass:dist']
            }
        },
        jshint: {
            dev: {
                src: ["src/js/*.js"],
                options: {
                    jshintrc: true
                }
            },
            dist: {
                src: "dist/js/js-crawler.js",
                options: srcHintOptions
            }
        },
        sync: {
            all: {
                options: {

                    sync: [
                        'name',
                        'main',
                        'description',
                        'version',
                        'homepage',
                        'keywords',
                        'license'
                    ]
                }
            }
        },


    })


    //grunt.registerTask('dev', ['sass:dist', 'jshint:dev', 'concat:dist'])
    grunt.registerTask('dev', ['sass:dist', 'concat:dist'])
    grunt.registerTask('dist', ['sync', 'dev', 'jshint:dist', 'uglify:dist'])

    grunt.registerTask('default', ['dev', 'watch'])
}