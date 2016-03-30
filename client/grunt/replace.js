module.exports = {

    cache_bust: {
    	src: ['build/index.html'],
    	dest: 'build/index.html',
    	replacements: [{
    		from: '@@TIMESTAMP@@',
    		to: function (matchedWord) {
    			return new Date().getTime();
    		}
    	}]
    }
};
