// task: sass
module.exports = {

    // targets
    styles_project: {
        options: {
            
        },
        files: {
            '.grunt-tmp/css/app.css': 'src/styles/imports.less'
        }
    },

    styles_notcritical: {
        options: {
            
        },
        files: {
            '.grunt-tmp/css/not-critical.css': 'src/styles/not-critical.less'
        }
    }

};