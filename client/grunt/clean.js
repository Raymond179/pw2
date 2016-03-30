// task: clean
module.exports = {

    // targets
    all: [
        '.grunt-tmp/',
        'build/*',
        '!build/uploads',
    ],
    tmp: [
        '.grunt-tmp/'
    ],
    statics: [
        'build/*',
        '!build/js',
        '!build/css',
        '!build/uploads',
    ]

};
