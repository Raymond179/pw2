var imageminPngquant = require('imagemin-pngquant');
var imageminMozjpeg = require('imagemin-mozjpeg');
// task: imagemin
module.exports = {

    // targets
    all: {
        options: {
            use: [imageminPngquant({quality: 10}), imageminMozjpeg({quality: 60})]
        },
        files: [{
            expand: true,
            cwd: 'src/statics/images/',
            src: ['**/*.{png,jpg,gif,svg}'],
            dest: '.grunt-tmp/images/'
        }]
    }
};
