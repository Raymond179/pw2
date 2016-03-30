// grunt watch specification
module.exports = {

    // targets
    styles_project: {
        files: [ 'src/styles/**/*.less' ],
        tasks: [ 'less:styles_project', 'copy:styles_project', 'autoprefixer:styles_project', 'copy:styles_project', 'clean:tmp' ]
    },
    styles_notcritical: {
        files: [ 'src/styles/**/*.less' ],
        tasks: [ 'less:styles_notcritical', 'copy:styles_notcritical', 'autoprefixer:styles_notcritical', 'copy:styles_notcritical','clean:tmp' ]
    },
    styles_vendor: {
        files: [ 'src/vendor/**/*.css', 'src/vendor.json' ],
        tasks: [ 'concat:styles_vendor', 'cssmin:styles_vendor', 'copy:styles_vendor', 'clean:tmp' ]
    },
    scripts_project: {
        files: [ 'src/scripts/**/*.js' ],
        tasks: [ 'concat:scripts_project', 'copy:scripts_project', 'copy:scripts_project', 'clean:tmp' ]
    },
    scripts_vendor: {
        files: [ 'src/vendor/**/*.js', 'src/vendor.json' ],
        tasks: [ 'concat:scripts_vendor', 'uglify:scripts_vendor', 'copy:scripts_vendor', 'clean:tmp' ]
    },
    
    statics: {
        files: [ 'src/statics/**/*' ],
        tasks: [ 'clean:statics', 'copy:statics', 'replace:cache_bust', 'clean:tmp' ]
    },
    images: {
        files: [ 'src/statics/images' ],
        tasks: [ 'imagemin:all', 'copy:images', 'clean:tmp' ]
    },


    livereload: {
        options: {
            livereload: true
        },
        files: ['build/**/*']
    }

};
