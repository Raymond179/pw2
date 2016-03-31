this.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('sw-1.1').then(function(cache) {
            return cache.addAll([
                './',
                'css/app.css',
                'js/app.js'
            ]);
        })
    );
});

this.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if(response) {
                    return response;
                } else {
                    return fetchAndCache(event);
                }
            })
    );
});

function fetchAndCache(event) {
    return fetch(event.request).then(function(response) {
        return caches.open('sw-1.2').then(function(cache) {
            cache.put(event.request, response.clone());
            return response;
        });
    });
}