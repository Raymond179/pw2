// task: copy
module.exports = {

    // targets
    scripts_project: {
        expand: true,
        cwd: '.grunt-tmp/js',
        src: 'app.js',
        dest: 'build/js'
    },
    scripts_vendor: {
        expand: true,
        cwd: '.grunt-tmp/js',
        src: 'vendor.js',
        dest: 'build/js'
    },
    styles_project: {
        expand: true,
        cwd: '.grunt-tmp/css',
        src: 'app.css',
        dest: 'build/css'
    },
    styles_notcritical: {
        expand: true,
        cwd: '.grunt-tmp/css',
        src: 'not-critical.css',
        dest: 'build/css'
    },
    styles_vendor: {
        expand: true,
        cwd: '.grunt-tmp/css',
        src: 'vendor.css',
        dest: 'build/css'
    },
    statics: {
        expand: true,
        cwd: 'src/statics/',
        src: '**',
        dest: 'build/'
    },
    images: {
        expand: true,
        cwd: '.grunt-tmp/images',
        src: '**',
        dest: 'build/images/'
    }

};
