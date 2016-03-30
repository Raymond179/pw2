// Bundlin Environment Variable
// please note, this file is overwritten during deployment
// possible values: staging, acceptance, production
var BLN_ENVIRONMENT = "development";
var BLN_BUILD_TIMESTAMP = "111111111";;(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
 (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
 m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
 })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

if(typeof BLN_ENVIRONMENT !== 'undefined' && BLN_ENVIRONMENT == 'production') {
  ga('create', 'UA-34557675-9', 'bundlin.com');
} else {
  ga('create', 'UA-34557675-9', {'cookieDomain': 'none'});
}
;// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (! window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (! window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
;'use strict';

// Initialize Angular app
var app = angular.module('bundlin', [
    'duScroll', // durated/angular-scroll: angular scrollTo function
    'ui.router', // to handle the dynamic views
    'ngAnimate',
    'restangular', // to handle API requests
    'angulartics', // Google Analytics for angular
    'angulartics.google.analytics',
    'angularFileUpload',
    'ngTagsInput',
    'ng-fastclick',
    'toastr'
]);;app.config(function(RestangularProvider) {

    RestangularProvider.setBaseUrl('/api');
    RestangularProvider.setFullResponse(true);

    RestangularProvider.addResponseInterceptor(function(response, operation) {
        if (!response || !response.data) return response;

        var newResponse = response.data;

        if (operation === 'get' || operation === 'post') {
            newResponse = newResponse[0];
        }

        return newResponse;
    });

});
;app.config(function($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $locationProvider) {

    // Disable strict mode
    $urlMatcherFactoryProvider.strictMode(false);

    // HTML5 mode (no #)
    $locationProvider.html5Mode(true); 

    // Redirects
    $urlRouterProvider
        .when('/intro', '/')
        .when('/pim', '/12001')
        .when('/nick', '/12002')
        .when('/peter', '/12003')
        .otherwise(function ($injector, $location) {
            var $state = $injector.get('$state');
            if($state.current.name !== 'app.error') {
                var wrongUrl = $location.$$url;
                $state.go('app.error', { bundleId: 404 });
            }
        });

    // Routes
    $stateProvider

        // app
        .state('app', {
            url: '',
            abstract: true,
            controller: 'AppController',
            templateUrl: '/views/layouts/app.html?v=' + BLN_BUILD_TIMESTAMP
        })
        .state('app.error', {
            url: '/error/:bundleId',
            controller: 'ViewBundleController',
            templateUrl: '/views/app/view_bundle.html?v=' + BLN_BUILD_TIMESTAMP
        })
        .state('app.home', {
            url: '/',
            template: '<ui-view></ui-view>'
        })
        .state('app.home.intro', {
            url: '',
            controller: 'IntroController',
            templateUrl: '/views/app/intro.html?v=' + BLN_BUILD_TIMESTAMP
        })
        .state('app.home.feed', {
            templateUrl: '/views/app/feed.html?v=' + BLN_BUILD_TIMESTAMP,
            controller: 'FeedController',
            abstract: true
        })
        .state('app.home.feed.popular', {
            url: '',
            views: {
                'bundles': {
                    templateUrl: '/views/app/feed_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var currentPage = 1, loading = false;
                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getPopularBundles(currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll('Trending Bundles on Bundlin', 'These are the popular, most viewed Bundles on Bundlin.com. The trending Bundles are refreshed every hour.');
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.home.feed.new', {
            url: 'latest',
            views: {
                'bundles': {
                    templateUrl: '/views/app/feed_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var currentPage = 1, loading = false;
                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getLatestBundles(currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll('The Latest Bundles on Bundlin', 'This is a stream of the latest Bundles created by people around the world!');
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.home.feed.following', {
            url: 'following',
            views: {
                'bundles': {
                    templateUrl: '/views/app/feed_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var currentPage = 1, loading = false;
                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getFollowerBundles(currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll('Bundles created by Bundlers you follow', 'These are the Bundles created by Bundlers you follow! The more people you follow, to more active this stream becomes.');
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.create_bundle', {
            url: '/create',
            controller: 'CreateBundleController'
        })
        .state('app.profile', {
            url:'/profile',
        })
        .state('app.view_profile', {
            url:'/profile/:profileScreenName',
            templateUrl: '/views/app/view_profile.html?v=' + BLN_BUILD_TIMESTAMP,
            controller: 'ViewProfileController',
            abstract: true
        })
        .state('app.view_profile.bundles', {
            url: '',
            views: {
                'bundles': {
                    templateUrl: '/views/app/view_profile_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var username = $state.params.profileScreenName, currentPage = 1, loading = false;
                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getUserBundles(username, currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll(username + ' on Bundlin.com', username + ' is a creator of beautiful lookbooks consisting of amazing links on Bundlin.com.');
                                SEO.set('author', username);
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.view_profile.collects', {
            url: '/collected',
            views: {
                'bundles': {
                    templateUrl: '/views/app/view_profile_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var username = $state.params.profileScreenName, currentPage = 1, loading = false;

                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getUserCollectedBundles(username, currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll('These are the Bundles collected by ' + username, 'Collect Bundles so you never lose track of your favorite content.');
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.view_profile.published', {
            url: '/published',
            views: {
                'bundles': {
                    templateUrl: '/views/app/view_profile_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var username = $state.params.profileScreenName, currentPage = 1, loading = false;
                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getUserPublishedBundles(username, currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll(username + '\'s published Bundles on Bundlin', 'These Bundles are visible to everyone.');
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.view_profile.unpublished', {
            url: '/unpublished',
            views: {
                'bundles': {
                    templateUrl: '/views/app/view_profile_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var username = $state.params.profileScreenName, currentPage = 1, loading = false;
                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getUserUnpublishedBundles(username, currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll('Your unpublished Bundles', 'This are the Bundles that are not visible to the public.');
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.edit_bundle', {
            url: '/:bundleId/edit',
            controller: 'EditBundleController',
            templateUrl: '/views/app/edit_bundle.html?v=' + BLN_BUILD_TIMESTAMP
        })
        .state('app.view_bundle', {
            url: '/:bundleId',
            controller: 'ViewBundleController',
            templateUrl: '/views/app/view_bundle.html?v=' + BLN_BUILD_TIMESTAMP
        })

});
;app.run(function($rootScope, SEO, $state, tooltips, stateTransition, debouncedEvents, $window, $filter, scrollToggler, $timeout, $document, sideextensions, Auth, $urlRouter) {

    // Rootscope variables
    $rootScope.generalLoading = 'intro';
    $rootScope.state = $state;
    $rootScope.filter = $filter;
    $rootScope.extraStateParams = false;
    $rootScope.Modernizr = Modernizr;
    $rootScope.stateTransition = {
        time: 0,
        status: 'in',
        same: false
    };
    $rootScope.BLN_BUILD_TIMESTAMP = BLN_BUILD_TIMESTAMP;

    debouncedEvents.onResize(function() {
        $rootScope.mobile = $window.innerWidth < 768;
    }, 30);

    var prevent = function (event) {
        event.preventDefault();
        $urlRouter.update(true);
    };

    // On state change
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

        if(toState.name == 'app.home') {
            prevent(event);
            Auth.user()
                .then(function(user) {
                    if (user.hasRole('beta', 'admin')) {
                        $state.go('app.home.feed.popular');
                    } else {
                        $state.go('app.home.intro');
                    }
                }, function() {
                    $state.go('app.home.intro');
                });
            return false;
        }
        if(toState.name == 'app.profile'){
            prevent(event);
            Auth.user()
                .then(function(user) {
                    if (user.hasRole('beta', 'admin')) {
                        $state.go('app.view_profile.bundles', {profileScreenName: user.username});
                    } else {
                        $state.go('app.home');
                    }
                }, function() {
                    $state.go('app.home');
                });
            return false;
        }
        

        // Loading
        if($rootScope.generalLoading !== 'intro') {
            $rootScope.generalLoading = 'loading';
            $rootScope.pageLoading = 'loading';
        }

        // Disable all sideextensions
        sideextensions.disableAll();
        tooltips.disableAll();

        // Enable scroll
        scrollToggler.enable();

        // State transition handling
        toState.extraParams = $rootScope.extraStateParams;
        $rootScope.extraStateParams = false;
        stateTransition.run(event, toState, toParams, fromState, fromParams, function() {
            // Pre
            SEO.reset();
        }, function() {
            // Post
            $rootScope.appSidebar = toState.sidebar || $rootScope.appSidebar;
            $rootScope.appSidebarScope = {};
            $rootScope.loading = {
                state: false
            };
            
            // Go to top of page
            $document.scrollTo(angular.element(document.querySelector('html')), 0, 0);
        });
    });

    $rootScope.$on('$stateChangeSuccess', function() {
        $timeout(function(){
            if($rootScope.pageLoading === 'loading') $rootScope.pageLoading = 'loaded';

        }, 1000)
        $timeout(function() {
            // Loading
            if($rootScope.generalLoading === 'loading') $rootScope.generalLoading = 'loaded';
        }, 2000);
    });

    $timeout(function() {
        $rootScope.pageLoading = 'loaded';
        $rootScope.generalLoading = 'loaded';
    }, 3000);

});;app.config(function($sceDelegateProvider) {

    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        '**'
    ]);

});
;app.config(function(toastrConfig) {
    angular.extend(toastrConfig, {
        allowHtml: false,
        closeButton: false,
        closeHtml: '',
        containerId: 'bln-toastcontainer',
        iconClass: 'bln-sub-icon',
        iconClasses: {
            error: 'bln-toast-error',
            info: 'bln-toast-info',
            success: 'bln-toast-success',
            warning: 'bln-toast-warning'
        },
        maxOpened: 5,
        messageClass: 'bln-sub-message',
        newestOnTop: true,
        onHidden: null,
        onShown: null,
        positionClass: '',
        preventDuplicates: false,
        progressBar: false,
        tapToDismiss: false,
        target: 'bln-app, bln-modals',
        timeOut: 3500,
        titleClass: 'bln-sub-title',
        toastClass: 'bln-toast'
    });
});;app.controller('AppController', function($scope, Auth, $document, fieldWatcher, $animate, $analytics, $rootScope, scrollToggler) {
    $scope.setFocuspointForPlaceholder = function setFocuspointForPlaceholder(bundle){
        bundle.picture.focus_x = 50;
        bundle.picture.focus_y = 100;
    }
    /***********************************************************************************************/
    /* App config */
    /***********************************************************************************************/
    $animate.enabled(false);


    /***********************************************************************************************/
    /* User check */
    /***********************************************************************************************/
    Auth.user(true) // passing true to force session call
        .then(function () {
            $analytics.eventTrack('Session call', {category: 'System action', label: 'Success: user session created'});
        });


    /***********************************************************************************************/
    /* App event listeners */
    /***********************************************************************************************/
    $scope.modalIsActive = false;
    $rootScope.$on('modals:firstmodalopens', function () {
        scrollToggler.disable();
        $scope.modalIsActive = true;
    });

    $rootScope.$on('modals:lastmodalcloses', function () {
        scrollToggler.enable();
        $scope.modalIsActive = false;
    });


    /***********************************************************************************************/
    /* Secret thing */
    /***********************************************************************************************/
    fieldWatcher('turnaround', function() {
        $('html').addClass('fieldwatcher-turnaround');
        $document.scrollTo($("html"), 0, 500);
    }, $scope);
    fieldWatcher('comicsans', function() {
        $('*').addClass('fieldwatcher-comicsans');
    }, $scope);
    fieldWatcher('pleasebreath', function() {
        $('.bln-sidebaricon, .bln-bundleitem, .bln-title, .bln-paragraph, .bln-tags>li, .bln-author').addClass('fieldwatcher-pleasebreath');
    }, $scope);

});
;app.controller('CreateBundleController', function($scope, $rootScope, $stateParams, $state, Auth, Restangular, error, Bundles) {
    
    /***********************************************************************************************/
    /* Create bundle */
    /***********************************************************************************************/
    Bundles.createBundle().then(function (bundle) {
        $state.go('app.edit_bundle', {
            bundleId: bundle._sid
        });
    }, function (error) {
        $state.go('app');
    });

});
;app.controller('EditBundleController', function($scope, $rootScope, $state, $stateParams, FileUploader, Auth, Restangular, $interval, $q, helpers, tags, $location, modals, toastr, SEO, $document) {

    /***********************************************************************************************/
    /* Page */
    /***********************************************************************************************/
    $rootScope.stateTransition.time = 350;
    $scope.Math = window.Math;
    $scope.loading = {
        page: true,
        scraper: false,
        new_quote: false,
        bundle: false,
        suggestion: false
    };
    $scope.scraperError = {
        active: false,
        message: '',
        timer: 0,
        intervalPromise: {}
    };
    var SCRAPER_ERROR_LIFETIME = 5; // seconds
    $scope.tweet = {
        content: ''
    };

    /***********************************************************************************************/
    /* Bundle */
    /***********************************************************************************************/
    var bundleBase = Restangular.one('bundles', $stateParams.bundleId);
    $scope.bundle = {};
    $scope.bundleTags = [];
    $scope.publishedItems = [];
    $scope.archivedItems = [];
    $scope.user = {};
    $scope.bundleValid = {
        valid: false,
        messages: []
    };
    $scope.creatorTwitterHandles = [];
    $scope.PROGRESSBAR_PUBLISH_TRESHOLD = 80;
    $scope.progress = 0;

    Auth.user()
        .then(function (user) {
            $scope.user = user;
        });

    // Get bundle
    $q.all([
            bundleBase.get(),
            Auth.user()
        ])
        .then(function(responses) {
            var bundle = responses[0].data;
            $scope.user = responses[1];

            if($scope.user.loggedIn && (bundle.author._id === $scope.user._id || $scope.user.hasRole('admin'))) {
                handleBundleData(bundle);
            } else {
                $state.go('app.error', { status: '404' });
            }
        }, function () {
            $state.go('app.error', { status: '404' });
        }).finally(function () {
            $scope.loading.page = false;
        });

    // Get tags
    $scope.loadTagsForTagsInput = function($query){
        return tags.load($query);
    };

    // Set SEO
    SEO.setForAll('Create a Bundle', 'You can use all sorts of web content, don\'t forget to come up with a compelling title and use an amazing cover photo.')

    // Handle bundle data
    var handleBundleData = function handleBundleData (bundle) {
        $scope.bundleTags = $scope.transformTagsForUI(bundle.tags);
        hydrateBundle(bundle);
        $scope.bundle = bundle;
        itemMaintenance($scope.bundle);
        if($scope.bundleValid && $scope.bundleValid.valid) {
            fillTweet();
        }
    };

    // Hydrate bundle
    var hydrateBundle = function hydrateBundle (bundle) {

        // Bundle cover image uploader
        bundle.imageUploader = new FileUploader({
            url: '/api/bundles/' + bundle._sid + '/picture',
            autoUpload: true,
            removeAfterUpload: true,
            onSuccessItem: function (uploaditem, response, status) {
                if(status === 200 && response && response.data && response.data[0]) {
                    bundle.picture = response.data[0];
                    bundle.uploaded_user_image = true;
                    runBundleValidation();
                }
            },
            onErrorItem: function(uploaditem, response, status, headers) {
                if(status === 413) {
                    toastr.error('Ooops! We couldn\'t process this immense picture.');
                    return;
                }
                if(response.message) {
                    toastr.error(response.message);
                }
            },
            onBeforeUploadItem: function () {
                bundle.loading.changepicture = true;
            },
            onCompleteItem: function () {
                bundle.loading.changepicture = false;
            }
        });

        // Loading states
        bundle.loading = {
            changepicture: false,
            tweeting: false
        };

        // Picture focus point defaults
        if(!bundle.picture.focus_x) bundle.picture.focus_x = 50;
        if(!bundle.picture.focus_y) bundle.picture.focus_y = 50;

        // Update bundle focuspoint callback
        bundle.setFocusPoint = function (x, y) {
            var newPicture = bundle.picture;
            newPicture.focus_x = x;
            newPicture.focus_y = y;
            $scope.updateBundle({
                picture: newPicture
            });
        };

        // Hydrate bundle items
        _.each(bundle.items, function (item) {
            hydrateItem(item, bundle._sid);
        });
    };

    // Hydrate invididual bundle item
    var hydrateItem = function hydrateItem (item, bundleSid) {

        // Initiate uploader when type=article
        if(item.type === 'article') {
            item.imageUploader = new FileUploader({
                url: '/api/bundles/' + bundleSid + '/items/' + item._sid + '/picture',
                autoUpload: false,
                removeAfterUpload: true,
                onSuccessItem: function (uploaditem, response, status, headers) {
                    if(status === 200 && response && response.data && response.data[0]) {
                        item.fields.picture = response.data[0];
                        item.fields.selected_crawled_image_index = -1;
                    }
                },
                onBeforeUploadItem: function () {
                    item.loading.changepicture = true;
                },
                onCompleteItem: function () {
                    item.loading.changepicture = false;
                },
                onErrorItem: function(uploaditem, response, status, headers) {
                    if(status === 413) {
                        toastr.error('Ooops! We couldn\'t process this immense picture.');
                        return;
                    }
                    if(response.message) {
                        toastr.error(response.message);
                    }
                }
            });

            item.loading = {
                changepicture: false
            };
        }
    };

    // Re-assign all published bundle item order indices
    var reAssignOrder = function reAssignOrder (bundle) {
        _.chain(bundle.items)
            .filter('active')
            .sortBy('order')
            .each(function (item, index) {
                item.order = index + 1;
            });
    };

    // Create filtered bundle items
    var updatePublicArchivedArrays = function updatePublicArchivedArrays (bundle) {
        $scope.publishedItems = _.filter(bundle.items, { active: true });
        $scope.archivedItems = _.filter(bundle.items, { active: false });
    };

    // Update bundle action
    $scope.updateBundle = function(data) {
        $scope.loading.bundle = true;
        return bundleBase.patch(data).then(function() {
            _.merge($scope.bundle, data);
            runBundleValidation()
        }).finally(function () {
            $scope.loading.bundle = false;
        });
    };

    // Update bundle tags
    var debouncedUpdateTags = _.debounce(function (bundleTags) {
        $scope.loading.suggestion = true;
        var transformedTags = $scope.transformTagsForSubmission(bundleTags);
        $scope.updateBundle({
            tags: transformedTags
        });
    }, 1500);
    $scope.updateTags = function (bundleTags) {
        debouncedUpdateTags(bundleTags);
    };

    var fillTweet = function fillTweet () {
        var title = $scope.bundle.title;
        var url = $location.host() + '/' + $scope.bundle._sid;
        url = url.replace('bundlin', 'Bundlin');

        $scope.tweet.content = [
            title,
            'on',
            url
        ].join(' ');
    };

    var updateCreatorTwitterHandles = function updateCreatorTwitterHandles () {
        var bundle = $scope.bundle;
        if(!bundle || !bundle.items || !bundle.items.length) return;

        $scope.creatorTwitterHandles = [];
        _.each(bundle.items, function (item) {
            switch(item.type) {
                case 'article':
                    if(item.fields && item.fields.creator && item.fields.creator.twitter && item.fields.creator.twitter.username && item.fields.creator.twitter.username.length > 0 && $scope.creatorTwitterHandles.indexOf(item.fields.creator.twitter.username) === -1)
                        $scope.creatorTwitterHandles.push(item.fields.creator.twitter.username);
                    break;
                case 'twitter_profile':
                    if(item.fields && item.fields.username && item.fields.username.length > 0 && $scope.creatorTwitterHandles.indexOf(item.fields.username) === -1)
                        $scope.creatorTwitterHandles.push(item.fields.username);
                    break;
                case 'twitter_tweet':
                    if(item.fields && item.fields.author && item.fields.author.username && item.fields.author.username.length > 0 && $scope.creatorTwitterHandles.indexOf(item.fields.author.username) === -1)
                        $scope.creatorTwitterHandles.push(item.fields.author.username);
                    break;
            }
        });
    };

    /***********************************************************************************************/
    /* Data transforms */
    /***********************************************************************************************/
    $scope.transformTagsForUI = function (tags) {
        return _.map(tags, function (tag) {
            return {
                text: tag
            };
        });
    };
    $scope.transformTagsForSubmission = function (tags) {
        // Retrieve suggestions based on provided tags
        $scope.suggestImages(tags);

        return _.map(tags, function (tag) {
            return tag.text;
        });
    };

    /***********************************************************************************************/
    /* Image Suggestions */
    /***********************************************************************************************/
    $scope.suggestImages = function (tags) {
        // Check if there is at least 1 tag to avoid crashes
        if (tags.length < 1) return;

        var tagArray = [];
        tags.forEach(function (tag) {
            tagArray.push(tag.text);
        });

        $scope.bundle.loading.changepicture = false;
        bundleBase
            .customPOST({ tags: tagArray }, 'updatesuggestions')
            .then(function(response) {
                var pictureObject = Restangular.stripRestangular(response.data);
                $scope.bundle.picture = pictureObject;
                runBundleValidation();
            })
            .finally(function () {
                $scope.bundle.loading.changepicture = false;
            });
    };

    $scope.nextSuggestion = function () {
        $scope.bundle.loading.changepicture = true;
        bundleBase
            .post('nextsuggestion')
            .then(function(response) {
                var pictureObject = Restangular.stripRestangular(response.data);
                $scope.bundle.picture = pictureObject;
                $scope.bundle.uploaded_user_image = false;
                runBundleValidation();
            })
            .finally(function () {
                $scope.bundle.loading.changepicture = false;
            });
    };

    $scope.previousSuggestion = function () {
        $scope.bundle.loading.changepicture = true;
        bundleBase
            .post('previoussuggestion')
            .then(function(response) {
                var pictureObject = Restangular.stripRestangular(response.data);
                $scope.bundle.picture = pictureObject;
                $scope.bundle.uploaded_user_image = false;
                runBundleValidation();
            })
            .finally(function () {
                $scope.bundle.loading.changepicture = false;
            });
    };

    $scope.unsetCoverimage = function () {
        $scope.bundle.loading.changepicture = true;
        $scope.updateBundle({ picture: {} })
            .then(function () {
                $scope.bundle.picture = {};
                $scope.bundle.uploaded_user_image = false;
                runBundleValidation();
            })
            .finally(function () {
                $scope.bundle.loading.changepicture = false;
            });
    };

    /***********************************************************************************************/
    /* Publish and restrictions */
    /***********************************************************************************************/
    $scope.publishBundle = function(tweetContent) {
        if(tweetContent.length > 140) return false;
        $scope.bundle.loading.tweeting = true;
        _.defer(function () { $scope.$apply() });

        var publish = function () {
            $scope.loading.bundle = true;
            var data = {
                tweet: tweetContent
            };
            bundleBase.customPOST(data, 'publish').then(function() {
                $scope.bundle.published = true;
                $state.go('app.view_bundle', { bundleId: $scope.bundle._sid });
            }, function(response) {
                if(response.status === 409) {
                    toastr.error('Publishing bundle failed, duplicate tweet found on timeline');
                } else if (response.status === 400) {
                    toastr.error(response.data.message);
                } else {
                    toastr.error('Publishing bundle failed');
                }
            }).finally(function () {
                $scope.bundle.loading.tweeting = false;
                $scope.loading.bundle = false;
            });
        };

        if(!$scope.user.twitter_write) {
            Auth.login().then(function () {
                $scope.user.twitter_write = true;
            })
            .finally(publish);
        } else {
            publish();
        }
    };
    $scope.unpublishBundle = function() {
        $scope.loading.bundle = true;
        bundleBase.customDELETE('publish').then(function() {
            $scope.bundle.published = false;
        }).finally(function () {
            $scope.loading.bundle = false;
        });
    };
    var PROGRESS_VALID_MIN = 80;
    var validProgress = 0;
    var validProgressMax = 9; // title + description + tags + picture + 5 items = 9 total;
    var progress = 0;
    var progressMax = 12; // title + description + tags + picture + 8 items = 12 total;

    $scope.bundleValidations = {
        title: false,
        description: false,
        tags: false,
        picture: false,
        items: false
    };

    var updateProgress = function updateProgress(){
        if(validProgress <= validProgressMax && !$scope.bundleValid.valid){
            $scope.progress = Math.ceil((PROGRESS_VALID_MIN / validProgressMax) * validProgress);
        } else {
            $scope.progress = PROGRESS_VALID_MIN + (Math.ceil(20 / 3) * (progress - validProgress));
        }
    }

    var validateBundle = function validateBundle(bundle) {
        if(!bundle) {
            return {
                valid: false,
                messages: ['no bundle found']
            };
        }
        $scope.bundleValidations = {
            title: false,
            description: false,
            tags: false,
            picture: false,
            items: false
        };
        var valid = true;
        var messages = [];

        progress = 0;
        validProgress = 0;

        if (bundle.title ) {
            if(bundle.title.length < 5 || bundle.title.length > 50) {
                valid = false;
                messages.push('title length incorrect');
            } else {
                $scope.bundleValidations.title = true;
                validProgress += 1;
                progress += 1;
            }

        } else {
            valid = false;
            messages.push('title is required');
        }
        if (bundle.description) {
            if(bundle.description.length < 30 || bundle.description.length > 250) {
                valid = false;
                messages.push('description length incorrect');
            } else {
                $scope.bundleValidations.description = true;
                validProgress += 1;
                progress += 1;
            }
            //EntityValidator.validate(bundle.description, 'Bundle description', 'required|length:min=30,max=250');
        } else {
            valid = false;
            messages.push('description is required');
        }

        if (bundle.tags) {
            if(bundle.tags.length < 1 || bundle.tags.length > 4) {
                valid = false;
                messages.push('number of tags is incorrect');
            } else {
                $scope.bundleValidations.tags = true;
                validProgress += 1;
                progress += 1;
            }
            //EntityValidator.validate(bundle.tags, 'Bundle tags', 'required|length:min=1,max=4');
        } else {
            valid = false;
            messages.push('tags are required');
        }

        if (bundle.items) {
            $scope.bundleValidations.items = true;
            if(_.filter(bundle.items, 'active').length < 5 || _.filter(bundle.items, 'active').length > 8) {
                messages.push('number of items is incorrect');
                valid = false;
                $scope.bundleValidations.items = false;
            }

            validProgress += _.filter(bundle.items, 'active').length < 5 ? _.filter(bundle.items, 'active').length : 5;
            progress += _.filter(bundle.items, 'active').length < 8 ? _.filter(bundle.items, 'active').length : 8;
            
            //EntityValidator.validate(items, 'Bundle items', 'length:min=5,max=8');
            //TODO: this.validateMaximalOne(items, ['quote', 'googlemaps', 'vimeo', 'youtube', 'twitter_tweet', 'twitter_profile', 'soundcloud', 'dribbble']);

        } else {
            valid = false;
            messages.push('items are required');
        }

        if (bundle.picture && bundle.picture.original) {
            $scope.bundleValidations.picture = true;
            validProgress += 1;
            progress += 1;

        } else {
            valid = false;
            messages.push('cover images is required');
        }

        return {
            valid: valid,
            messages: messages
        };
    };

    $scope.addHandleToTweet = function addHandleToTweet (handle) {
        if($scope.tweet.content.indexOf('→') === -1) {
            $scope.tweet.content += ' →';
        }
        $scope.tweet.content += ' ' + handle;
    };

    function runBundleValidation() {
        if(!$scope.bundle) return;
        $scope.bundleValid = validateBundle($scope.bundle);
        updateProgress();
    }

    $scope.$watch('bundleValid', function (newValue, oldValue) {
        if(newValue.valid && !oldValue.valid) {
            fillTweet();
        }
    }, true);

    /***********************************************************************************************/
    /* Delete */
    /***********************************************************************************************/
    $scope.deleteBundle = function() {
        if(confirm('Are you sure you want to delete this bundle?')) {
            bundleBase.remove().then(function() {
                $state.go('app.home');
            });
        }
    };

    /***********************************************************************************************/
    /* Item actions */
    /***********************************************************************************************/
    $scope.updateItem = function updateItem (item, data) {
        item.loading = true;
        return bundleBase.one('items', item._sid).patch(data).then(function() {
            _.merge(item, data);
        }).finally(function () {
            item.loading = false;
        });
    };

    $scope.deleteItem = function deleteItem (item) {
        item.loading = true;
        bundleBase.one('items', item._sid).remove().then(function() {
            $scope.bundle.items = _.without($scope.bundle.items, item);
            itemMaintenance($scope.bundle);
        }, function () {
            item.loading = false;
        });
    };

    $scope.archiveItem = function archiveItem (item) {
        $scope.updateItem(item, { active: false }).finally(function () {
            item.order = 0;

            itemMaintenance($scope.bundle);
        });
    };

    $scope.publishItem = function publishItem (item) {
        $scope.updateItem(item, { active: true }).finally(function () {
            var lastOrderItem = _.max($scope.bundle.items, 'order');
            if(lastOrderItem && lastOrderItem.order) {
                item.order = lastOrderItem.order + 1;
            } else {
                item.order = 1;
            }

            itemMaintenance($scope.bundle);
        });
    };

    $scope.moveItem = function moveItem(item, relativePosition) {
        if(!item.active) return;

        var sortedItems = _.sortBy($scope.bundle.items, 'order'),
            old_index = sortedItems.indexOf(item),
            new_index = old_index + relativePosition;

        var reSortedItems = helpers.moveItemThroughArray(sortedItems, old_index, new_index);
        var idsInOrder = _.pluck(reSortedItems, '_id');

        bundleBase.post('items/order', {ids: idsInOrder}).then(function(response) {

            var orderObject = response.data;
            _.each($scope.bundle.items, function(item) {
                item.order = orderObject[item._id];
            });

        });

    };

    var uploadItemImageByUrl = function uploadItemImageByUrl (item, url) {
        var defer = $q.defer();
        if (! url || ! item) {
            // _.defer(function () {
            //     defer.reject();
            // });
            // return defer.promise;
            return false;
        }

        item.loading.changepicture = true;
        bundleBase
            .one('items', item._sid)
            .customPOST({ picture: url }, 'picture')
            .then(function (response) {
                var picture = Restangular.stripRestangular(response.data);
                item.fields.picture = picture;
                item.fields.selected_crawled_image_index = -1;
                defer.resolve();
            }, function () {
                defer.reject();
            })
            .finally(function () {
                item.loading.changepicture = false;
            });

        return defer.promise;
    };

    var uploadItemImageByFile = function uploadItemImageByFile (item, file) {
        var Uploader = item.imageUploader;
        Uploader.addToQueue(file);
        Uploader.uploadAll();
    };

    var setCrawledImage = function setCrawledImage (item, index) {
        var url = item.fields.pictures[index];
        if(item && url) {
            uploadItemImageByUrl(item, url).then(function () {
                item.fields.selected_crawled_image_index = index;
            });
        }
    };

    $scope.selectPreviousCrawledImage = function selectPreviousCrawledImage (item) {
        var currentIndex = item.fields.selected_crawled_image_index || 0,
            newIndex = currentIndex - 1;

        if(newIndex < 0) {
            newIndex = item.fields.pictures.length - 1;
        }

        setCrawledImage(item, newIndex);
    };

    $scope.selectNextCrawledImage = function selectNextCrawledImage (item) {
        var currentIndex = item.fields.selected_crawled_image_index || 0,
            newIndex = currentIndex + 1;

        if(newIndex > item.fields.pictures.length - 1) {
            newIndex = 0;
        }

        setCrawledImage(item, newIndex);
    };

    $scope.closeCustomImage = function closeCustomImage (item) {
        if(item.fields.pictures.length) {
            $scope.selectNextCrawledImage(item);
        }
    };

    $scope.selectCustomImage = function selectCustomImage (item) {
        if(!modals.checkCurrentlyOpen('modal-custom-article-image')) {
            modals.open('modal-custom-article-image', {
                bundle: $scope.bundle,
                item: item
            }).then(function (responseData) {
                if(!responseData || !responseData.data) return;
                if(responseData.data.url) {
                    uploadItemImageByUrl(item, responseData.data.url);
                } else if (responseData.data.file) {
                    uploadItemImageByFile(item, responseData.data.file);
                }
            });
        }
    };

    /***********************************************************************************************/
    /* Add new scraper item */
    /***********************************************************************************************/
    $scope.newItemUrl = '';
    $scope.newItemSubmit = function newItemSubmit ($event) {
        $event.originalEvent.preventDefault();
        if(!$scope.newItemUrl || $scope.loading.scraper) return false;

        // Add item to bundle
        $scope.closeScraperError();
        $scope.loading.scraper = true;
        bundleBase.post('items/scrape', {
            active: true,
            url: $scope.newItemUrl
        }).then(function(response) {
            if(!response || !response.data) return;

            // Save new item
            var newItem = response.data;
            hydrateItem(newItem, $stateParams.bundleId);
            $scope.bundle.items.push(newItem);
            itemMaintenance($scope.bundle);
            _.defer(function () {
                $document.scrollTo($('.bln-sub-publisheditem:last-of-type'), 100, 500);
            });

            // Reset form
            this.newItemForm.$error    = {};
            this.newItemForm.$pristine = true;
            this.newItemForm.$dirty    = false;
            this.newItemForm.$valid    = true;
            this.newItemForm.$invalid  = false;
            $scope.newItemUrl = '';

        }, function() {

            // New scraper error
            setScraperError('We are unable to load this item, please check your link');

        }).finally(function () {
            $scope.loading.scraper = false;
        });

        return false;
    };

    var itemMaintenance = function itemMaintenance(bundle) {
        reAssignOrder($scope.bundle);
        updatePublicArchivedArrays($scope.bundle);
        runBundleValidation();
        updateCreatorTwitterHandles();
    }

    var setScraperError = function setScraperError (message) {
        $scope.scraperError = {
            active: true,
            message: message,
            timer: 5,
            intervalPromise: $interval(function() {
                $scope.scraperError.timer --;
                if($scope.scraperError.timer <= 0) {
                    $scope.closeScraperError();
                }
            }, 1000)
        };

        $scope.$on('$destroy', function () {
            $interval.cancel($scope.scraperError.intervalPromise);
        });
    };

    $scope.closeScraperError = function closeScraperError () {
        $interval.cancel($scope.scraperError.intervalPromise);
        $scope.scraperError = {
            active: false,
            message: '',
            timer: 0,
            intervalPromise: {}
        };
    };

    /***********************************************************************************************/
    /* Add new quote item */
    /***********************************************************************************************/
    $scope.createEmptyQuote = function() {

        $scope.loading.new_quote = true;
        bundleBase.post('items', {
            active: true,
            type: 'quote',
            fields: {
                'quote': '',
                'quote_author': ''
            }
        }).then(function(response) {
            if(!response || !response.data) return;

            // Save new item
            var newItem = response.data;
            $scope.bundle.items.push(newItem);
            itemMaintenance($scope.bundle);
            _.defer(function () {
                $('.bln-sub-publisheditem:last-of-type .bln-input-smallform-quote').focus();
            });

        }).finally(function () {
            $scope.loading.new_quote = false;
        });
    };

});
;app.controller('FeedController', function($scope, $analytics, Auth, Restangular, $rootScope, $document, $timeout) {

    Auth.user()
        .then(function(user) {
            $scope.user = user;
        });

});
;app.controller('IntroController', function($scope, $state, $analytics, Auth, Restangular, $rootScope, $document, $timeout, Bundles) {

    $rootScope.stateTransition.time = 350;
    $scope.featured = [];
    $scope.fullGallery = false;
    $scope.user = false;
    $scope.beta_invites_remaining = 'a couple';

    Auth.user()
        .then(function (user) {
            $scope.user = user;
        });
    
    $scope.logInWithTwitter = function() {
        Auth.login()
            .then(function(user) {
                if (user.hasRole('beta')) {
                    $state.go('app.home.feed.popular');
                }
            });
    };

    $scope.playvideo = false;
    $scope.video_played = false;
    $scope.playVideo = function() {
        $scope.video_played = true;
        $scope.playvideo = true;
        var toElement = angular.element(document.querySelector('#introvideo'));
        $document.scrollTo(toElement, 150, 1000);
    };

    $scope.stopVideo = function() {
        $scope.playvideo = false;
    };

    Bundles.getFeaturedPopularBundles().then(function (bundles) {
        $scope.featured = bundles;
    });

    Restangular.one('beta_invites_remaining').get().then(function(response) {
        if(response.data.amount > 0) {
            $scope.beta_invites_remaining = response.data.amount;
        }
    });

});
;app.controller('ViewBundleController', function($scope, $rootScope, $state, $stateParams, $q, $location, Auth, Restangular, SEO, $timeout, $document, $filter, $location, error, Bundles) {

    var RELATED_BUNDLES_COUNT = 20;

    $rootScope.stateTransition.time = 1000;
    $scope.bundle = false;
    $scope.isCollected = false;
    $scope.followsAuthor = false;
    $scope.absoluteUrl = $location.absUrl().replace(/https?:\/\//, '');
    $scope.user = false;
    $scope.login = Auth.login;
    $scope.loading = {
        page: true
    };

    var jumpToItem = $state.current.extraParams.jumpToItem || false,
        jumpedToItem = false;

    var bundleBase = Restangular.one('bundles', $stateParams.bundleId);

    // Bundle call
    bundleBase
        .get()
        .then(function (response) {
            var bundle = response.data;
            handleBundle(bundle);

            Auth.user()
                .then(function (user) {
                    $scope.user = user;
                    handleBundleUserRelations(bundle, user);
                });
        }, function () {
            error.status(404);
        })
        .finally(function () {
            $scope.loading.page = false;
        });


    // Handle bundle
    var handleBundle = function(bundle) {
        if(!bundle) return;
        
        var tags = bundle.tags || [];
        var title;
        var description;
        if(bundle.title) {
            title = bundle.title + ' on Bundlin.com. The beauty of the web bundled.';
        } else {
            title = 'Bundle by ' + bundle.author.name + ' on Bundlin';
        }
        if(bundle.description) {
            description = bundle.description ;
        } else {
            description = 'A bundle created by '+ bundle.author.name + ' on Bundlin.com.';
        }

        var seoTags = tags.slice();
        seoTags.push(bundle.author.name);
        seoTags = seoTags.concat(['Bundlin', 'Bundle']);

        SEO.set('keywords', seoTags.join(', '));
        SEO.set('author', bundle.author.name);
        SEO.set('robots', 'index,follow');

        SEO.set('opengraph', {
            'type': 'article',
            'url': $location.protocol() + '://' + $location.host() + '/' + bundle._sid,
            'site_name': 'Bundlin',
            'image': bundle.picture.original
        });

        SEO.set('twitter', {
            'card': 'summary_large_image',
            'site': '@bundlin',
            'image': bundle.picture.original,
            'creator': '@' + bundle.author.username
        });

        SEO.setForAll(title, description);

        bundle.archivedItems = _.filter(bundle.items, function(item) {
            return !item.active;
        });

        bundle.items = _.filter(bundle.items, function(item) {
            return item.active;
        });

        fillRelatedBundles(bundle);

        $scope.bundle = bundle;

        if(jumpToItem && !jumpedToItem) {
            jumpedToItem = true;
            $timeout(function() {
                var toElement = angular.element(document.querySelector('.itemid-' + jumpToItem));
                $document.scrollTo(toElement, 20, 1000);
                toElement.addClass('highlight');
            }, 1000);
        }
    };

    // Fill related bundles with all bundles
    var fillRelatedBundles = function(bundle) {
        bundle.related_bundles = bundle.related_bundles || [];
        var extraBundlesNeeded = RELATED_BUNDLES_COUNT - bundle.related_bundles.length;
        if(extraBundlesNeeded > 0) {

            // If extra bundles are needed
            var bundlesPromise = Restangular.all('bundles').getList();
            bundlesPromise.then(function(response) {
                var extraBundles = [];

                // Call to all bundles
                _.each(Restangular.stripRestangular(response.data), function(extraBundle) {

                    var originalBundle = bundle.original_bundle || false;

                    // Bundle match checks
                    var isCurrentBundle = extraBundle._id === bundle._id,
                        isOriginalBundle = !originalBundle ? false : extraBundle._id === bundle.original_bundle._id,
                        existInRebundles = _.find(bundle.rebundles, {_id: extraBundle._id}),
                        existInRelatedBundles = _.find(bundle.related_bundles, {_id: extraBundle._id}),
                        isProfileBundle = extraBundle._sid < 13000,
                        isErrorBundle = extraBundle._sid === 404;

                    if(!isCurrentBundle && !isOriginalBundle && !existInRebundles && !existInRelatedBundles && !isErrorBundle && !isProfileBundle) {

                        // Add to related bundles
                        bundle.related_bundles.push(extraBundle);
                    }
                });
            });
        }
    };

    function handleBundleUserRelations(bundle, user) {
        if(!bundle || !user) return;
        
        _.each(bundle.collectors, function(collector) {
            if (collector._id == user._id) {
                $scope.isCollected = true;
            }
        });

        _.each(bundle.author.followers, function(follower) {
            if (follower == user._id) {
                $scope.followsAuthor = true;
            }
        });
    }

    $scope.switchFollow = function() {
        $scope.followsAuthor ? $scope.unfollow() : $scope.follow();
    };

    $scope.follow = function() {
        Restangular
            .one('users', $scope.bundle.author._id)
            .customPOST({}, 'follow')
            .then(function(response) {
                $scope.followsAuthor = true;
            });
    };

    $scope.unfollow = function() {
        Restangular
            .one('users', $scope.bundle.author._id)
            .customDELETE('follow')
            .then(function(response) {
                $scope.followsAuthor = false;
            });
    };

    $scope.switchCollect = function() {
        $scope.isCollected ? $scope.uncollect() : $scope.collect();
    };

    $scope.collect = function() {
        Restangular
            .one('bundles', $stateParams.bundleId)
            .customPOST({}, 'collect')
            .then(function(response) {
                $scope.isCollected = true;
                $scope.bundle.collectors.push($scope.user);
            });
    };

    $scope.uncollect = function() {
        Restangular
            .one('bundles', $stateParams.bundleId)
            .customDELETE('collect')
            .then(function(response) {
                _.each($scope.bundle.collectors, function(collector, index) {
                    if (collector._id == $scope.user._id) {
                        $scope.bundle.collectors.splice(index, 1);
                        $scope.isCollected = false;
                    }
                });
            });
    };

    // $scope.rebundle = function() {
    //     Restangular.one('bundles', $stateParams.bundleId).customPOST({}, 'rebundle').then(function(response) {
    //         var newBundle = response.data;
    //         $state.go('app.edit_bundle', { 'bundleId': newBundle._sid });
    //     });
    // };

    $scope.shareWithTwitter = function() {
        if ($scope.bundle) {
            var settings = {
                'height': 420,
                'width': 550,
                'left': (window.innerWidth - 550) / 2,
                'top': 150,
                'toolbar': 0,
                'status': 0
            };

            var settingsString = Object.keys(settings).map(function(key) {
                return key + '=' + settings[key];
            }).join(',');

            var shareText = '' + $scope.bundle.title + ' by @' + $scope.bundle.author.username + ' ' + $location.absUrl() + ' #bundlin',
                shareString = encodeURIComponent(shareText);

            var popup = window.open('https://twitter.com/intent/tweet?text=' + shareString, 'Share', settingsString);

            if (window.focus) {
                popup.focus();
            }
        }
    };

    $scope.shareWithLinkedin = function() {
        if ($scope.bundle) {
            var settings = {
                'height': 420,
                'width': 550,
                'left': (window.innerWidth - 550) / 2,
                'top': 150,
                'toolbar': 0,
                'status': 0
            };

            var settingsString = Object.keys(settings).map(function(key) {
                return key + '=' + settings[key];
            }).join(',');

            var popup = window.open('https://www.linkedin.com/shareArticle?url=' + $location.absUrl() + '&title=Bundlin: ' + $scope.bundle.title + '&summary=' + $scope.bundle.description, 'Share', settingsString);

            if (window.focus) {
                popup.focus();
            }
        }
    };

    $scope.createBundle = function() {
        Bundles.createBundle().then(function(bundle) {
            $state.go('app.edit_bundle', {
                bundleId: bundle._sid
            });
        })
    }

});
;app.controller('ViewProfileController', function($rootScope, $scope, $state, Restangular, Auth, $timeout, SEO, $location) {

    $scope.profile = undefined;
    $scope.user = {};
    $scope.profileScreenName = $state.params.profileScreenName;
    $scope.login = Auth.login;
    $scope.followsAuthor = false;

    Auth.user()
        .then(function (user) {
            $scope.user = user;
        });

    $scope.switchFollow = function() {
        $scope.followsAuthor ? $scope.unfollow() : $scope.follow();
    };

    $scope.follow = function() {
        Restangular
            .one('users', $scope.profile._id)
            .customPOST({}, 'follow')
            .then(function(response) {
                $scope.followsAuthor = true;
                $scope.user.follows.push($scope.profile._id);
                Auth.updateLocal({
                    follows: $scope.user.follows
                });
                _.defer(function () { $scope.$apply(); });
            });
    };

    $scope.unfollow = function() {
        Restangular
            .one('users', $scope.profile._id)
            .customDELETE('follow')
            .then(function(response) {
                $scope.followsAuthor = false;
                var currentFollowerIndex = $scope.user.follows.indexOf($scope.profile._id);
                if(currentFollowerIndex > -1) {
                    $scope.user.follows.splice(currentFollowerIndex, 1);
                    Auth.updateLocal({
                        follows: $scope.user.follows
                    });
                }
                _.defer(function () { $scope.$apply(); });
            });
    };

    function initializeProfile() {
        Restangular
            .one('users', $scope.profileScreenName)
            .get()
            .then(function(user) {
                var profile = user.data;

                // Make user's website url valid to link to from the app
                if(profile.website){
                    if (profile.website.indexOf('http://') !== 0 && profile.website.indexOf('https://') !== 0) {
                        profile.website_url = 'http://' + profile.website;
                    } else {
                        profile.website_url = profile.website;
                    }
                }

                Auth.user().then(function (currentUser) {
                    if(currentUser._id !== user._id) {
                        $scope.followsAuthor = (currentUser.follows.indexOf(profile._id) > -1);
                    }
                });

                // Replace url and Twitter handle occurrences in bio with actual links
                // Commented out because of not using AUtolink yet
                //profile.bio = Autolinker.link(user.data.bio, {
                //    hashtag: 'twitter'
                //});

                $scope.profile = profile;

                //SEO.set('title', profile.name + ' on Bundlin');
                //SEO.set('description', profile.bio);
                SEO.set('author', profile.name);

                SEO.set('opengraph', {
                    'type': 'profile',
                    'title': profile.name + ' on Bundlin',
                    'url': $location.protocol() + '://' + $location.host() + '/profile/' + profile.username,
                    'image': profile.picture.original
                });

                SEO.set('twitter', {
                    'card': 'summary_large_image',
                    'site': '@bundlin',
                    'title': profile.name + ' on Bundlin',
                    'description': profile.bio,
                    'image': profile.picture.original,
                    'creator': '@' + profile.username
                });

                _.defer(function () { $scope.$apply(); });
            }, function(response) {
                if(response.status == 404) {
                    $state.go('app.error', {
                        bundleId: 404
                    });
                }
            });
    }

    initializeProfile();
    var updateListener = $rootScope.$on('bln:profileUpdated', function(event, data){
        if(data.username === $scope.profile.username){
            initializeProfile();
        }
    });

    $scope.$on('$destroy', function(){
        updateListener();
    })
});
;app.directive('videoStatus', function() {
    return {
        restrict: 'AE',
        scope: {
            videoStatus: '='
        },
        link: function(scope, elm, attrs) {
            var player = elm;
            var url = window.location.protocol + player.attr('src').split('?')[0];

            scope.$watch('videoStatus', function(status) {
                if(status) {
                    controlPlayer('seekTo', '0');
                    controlPlayer('play');
                } else {
                    controlPlayer('pause');
                }
            });
            
            // Helper function for sending a message to the player
            var controlPlayer = function(action, value) {
                player[0].contentWindow.postMessage({
                    method: action,
                    value: value
                }, url);
            }
        }
    };
});;app.directive('autoHorizontalScroll', function($window) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var mobile = $window.outerWidth < 480;
            // debounced the callback, can only be callen once every 500ms
            var debouncedCallback = _.debounce(function(){
                scope.$apply(attrs['scrollEndCallback'], element);
                scrollEnd = false;
            }, 500, true);

            // remember scrolloffset;
            var oldScrollOffsetLeft = 0;

            // mousewheel handler
            var mouseWheelHandler = function mouseWheelHandler(e){
                // console.log(e)
                var scrollLeft = element[0].scrollLeft;
                var scrollEnd = ((element[0].offsetWidth + scrollLeft) > element[0].scrollWidth - 800);
                var scrollDirection = oldScrollOffsetLeft < scrollLeft ? 'right' : 'left'
                oldScrollOffsetLeft = scrollLeft + 10;

                // callback if scrollend is reached and the scrolldirection is right
                if(scrollEnd && scrollDirection === 'right') {
                    debouncedCallback();
                }
                if(e.type === 'mousewheel'){
                    this.scrollLeft -= e.originalEvent.wheelDeltaY;
                    if(!e.originalEvent.wheelDeltaX){
                        e.preventDefault();
                    }
                } else {
                    e.preventDefault();
                    this.scrollLeft += (e.originalEvent.detail * 5);
                }
            };
            
            var oldScrollOffsetTop = 0;
            var scrollBottomHandler = function scrollBottomHandler(e){
                var scrollTop = element[0].scrollTop;
                var scrollEnd = ((element[0].offsetHeight + scrollTop) > element[0].scrollHeight - 800);
                var scrollDirection = oldScrollOffsetTop < scrollTop ? 'down' : 'up'
                oldScrollOffsetTop = scrollTop + 10;

                // callback if scrollend is reached and the scrolldirection is down
                if(scrollEnd && scrollDirection === 'down') {
                    debouncedCallback();
                }
            };

            if(!mobile){
                element.on('mousewheel DOMMouseScroll', mouseWheelHandler);
            } else {
                element.on('scroll', scrollBottomHandler);
            }





            scope.$on('$destroy', function(){
                element.off('mousewheel', mouseWheelHandler);
                element.off('scroll', scrollBottomHandler);
            });
        }
    }
});;app.directive('bundleItem', function($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            item: '=item',
            bundle: '=bundle',
            classes: '@classes',
            take: '@take',
            types: '@types',
            template: '@template'
        },
        template: '<div ng-include="getTemplateUrl()"></div>',
        link: function($scope, $element, $attrs) {
            $timeout(function() {
                $scope.getTemplateUrl = function() {
                    if (! _.isEmpty($scope.item)) {
                        $element.addClass($scope.item.type);

                        var file = '/views/partials/bundle/' + $scope.template + '/items/' + $scope.item.type;

                        var allTypes = [];

                        if ($scope.types) {
                            _.each($scope.types.split(','), function(type) {
                                var typeParts = type.split('=');
                                var typeName = typeParts[0];
                                var typeValue = typeParts[1];
                                allTypes[typeName] = typeValue;
                            });

                            if ($scope.item.type in allTypes) {
                                file += '-' + allTypes[$scope.item.type];
                            }
                        }

                        return file + '.html?v=' + BLN_BUILD_TIMESTAMP;
                    }

                    return false;
                };
            }, 0);
        }
    };
});
;app.directive('bundleItemProperty', function($timeout, Restangular) {
    return {
        restrict: 'A',
        scope: {
            bundle: '=bundle',
            item: '=item',
            property: '@property'
        },
        link: function($scope, $element, $attrs) {
            $scope.updated = true;
            $scope.updatedCount = 0;

            var timeoutPromise = true;

            $scope.$watch('item.fields.' + $scope.property, function(field) {
                $scope.updated = false;
                $scope.updatedCount++;

                if ($scope.updatedCount > 1) {
                    if (! $scope.updated) {
                        $timeout.cancel(timeoutPromise);
                    }

                    timeoutPromise = $timeout(function() {
                        var data = {};
                        data.fields = {};
                        data.fields[$scope.property] = field;
                        Restangular.one('bundles', $scope.bundle._sid).one('items', $scope.item._sid).patch(data).then(function() {
                            $scope.updated = true;
                        });
                    }, 1000)
                }
            });
        }
    };
});
;app.directive('bundleProperty', function(Restangular) {
    return {
        restrict: 'A',
        scope: {
            bundle: '=bundle',
            property: '@property'
        },
        link: function($scope, $element, $attrs) {
            $scope.$watch('bundle', function(bundle) {
                $element.val($scope.bundle[$scope.property]);
            });

            var blurWatcher = function() {
                var data = {};
                data[$scope.property] = $element.val();
                Restangular.one('bundles', $scope.bundle._sid).patch(data);
            };

            $element.on('blur', blurWatcher);

            $scope.$on('$destroy', function() {
                $element.off('blur', blurWatcher);
            });
        }
    };
});
;app.directive('carousel', function ($timeout) {
  return {
    restrict: 'AE',
    link: function(scope, elm, attrs) {
      elm.addClass('bln-carousel');
      var list, items, width;
      scope.current = 0;

      scope.calc = function() {
        list = angular.element(elm.find('list')[0]);
        items = angular.element(list.find('item'));
        width = items[0].offsetWidth;
      };

      scope.to = function(number) {
        scope.current = number < 0 ? items.length - 1 : (number >= items.length ? 0 : number);
        var offset = -1 * width * scope.current;
        items.css({
          '-webkit-transform': 'translate('+offset+'px)',
          '-moz-transform': 'translate('+offset+'px)',
          '-ms-transform': 'translate('+offset+'px)',
          '-o-transform': 'translate('+offset+'px)',
          'transform': 'translate('+offset+'px)'
        });
      };

      scope.prev = function() {
        scope.to(scope.current-1);
      };

      scope.next = function() {
        scope.to(scope.current+1);
      };

      $timeout(function() {
        scope.calc();
        scope.to(scope.current);
      }, 0);
    }
  };
});;app.directive('descriptionContent', function($timeout) {
    return {
        restrict: 'A',
        scope: {
            descriptionContent: '=descriptionContent'
        },
        link: function($scope, $element, $attrs) {
            $scope.$watch('descriptionContent', function(contentSource) {
                if(!contentSource) return;
                var content = angular.copy(contentSource);
                content = cleanUrls(content);
                $element.html(content);
            });

            var cleanUrls = function(content) {
                // find urls
                var urlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
                var urls = content.match(urlRegEx);

                // make each found url pretty
                _.each(urls, function(url) {
                    var hostname = new URL(url).hostname;
                    content = content.replace(url, hostname);
                });

                return content;
            };
        }
    };
});
;app.directive('dropdownToggler', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.on('click', function(e){
                element.toggleClass('bln-tabs-active');
            })
        }
    }
});;app.directive('enableNgAnimate', function($animate) {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            $animate.enabled(true, elm);
        }
    }
});

;app.directive('expandable', function($compile) {
    return {
        restrict: 'AE',
        link: function(scope, elm, attrs) {
            var jqElm = $(elm);
            var expandJqElm = jqElm.find('.expand');
            var compileJqElm = jqElm.find('.compile');

            scope.expand = function() {
                elm.addClass('expanded');
                expandJqElm.trigger('destroy.dot');
                $compile(compileJqElm)(scope);
            };

            scope.contract = function() {
                elm.removeClass('expanded');
                expandJqElm.trigger('update.dot');
                $compile(compileJqElm)(scope);
            };
        }
    };
});;/*
 * This directive gives the element a fancy intro when it appears in the user viewport
 *
 * Usage: attibute only.
 *  
 *  fancy-intro - to initialize the directive
 *  fancy-intro-delay="0" - to set a delay in milliseconds

 *  The following attributes adds classes to the element:
 *  fancy-intro-effect="false" - you can use your own effect name. following classes will be set: 'fancy-intro-effect' and 'fancy-intro-effect-youreffectname'
 *  fancy-intro-effect-distance="false" - only use with fancy-intro-effect. you can use your own distance name. following classes will be set: 'fancy-intro-effect-distance' and 'fancy-intro-effect-distance-yourdistancename'
 *  fancy-intro-speed="false" - you can use your own speed name. follow classes will be set: 'fancy-intro-speed' and 'fancy-intro-speed-yourspeedname'
 *
 *  You can define the necessary classes in styles/components/fancy-intro.less
 *
 */

app.directive('fancyIntro', function($window, debouncedEvents, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {
      // Test for unsupported circumstances
      var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent),
          mobile = $window.innerWidth < 768,
          noSupport = iOS || mobile;

      // Save element as Angular-element and save options
      var delay = noSupport ? 0 : attrs.fancyIntroDelay || 0,
          delay = delay ? parseInt(delay, 10) : 0,
          effect = attrs.fancyIntroEffect || false,
          speed = attrs.fancyIntroSpeed || false,
          offset = attrs.fancyIntroOffset || 0,
          effectDistance = attrs.fancyIntroEffectDistance || false,
          children = attrs.fancyIntroChildren || false,
          childrenDelay = attrs.fancyIntroChildrenDelay || false,
          childrenDelay = childrenDelay ? parseInt(childrenDelay, 10) : 0;

      // Introed
      var introed = false;

      // Get window height on resize
      var windowHeight = 0;
      var saveWindowDimensions = function() {
        windowHeight = $window.innerHeight;
        mobile = $window.innerWidth < 768;
      };
      var resizeEventId = debouncedEvents.onResize(saveWindowDimensions);
      saveWindowDimensions();

      var initializeElement = function(element) {
        // Set the basic class
        element.addClass('fancy-intro');

        // Set the effect classes
        if(effect) {
          element.addClass('fancy-intro-effect fancy-intro-effect-'+effect);
          if(effectDistance) {
          element.addClass('fancy-intro-effect-distance-'+effectDistance);
          }
        }

        // Set the speed classes
        if(speed) {
          element.addClass('fancy-intro-speed fancy-intro-speed-'+speed);
        }
      };

      // Show element with delay
      var showUp = function(element, delay, index) {
        delay = children ? delay + childrenDelay * index : delay;
        $timeout(function() {
          element.addClass('fancy-intro-init');
        }, delay);
      };

      // Init
      var elements = children ? $(elm).find(children) : [elm];
      _.each(elements, function(element) {
        element = angular.element(element);
        initializeElement(element);
      });

      // When scrolled, check if element is in view, then call showUp()
      var scrollHandler = function() {
        if(!introed && (noSupport || (elm[0].getBoundingClientRect().top + parseInt(offset, 0)) <= windowHeight)) {
          _.each(elements, function(element, index) {
            element = angular.element(element);
            showUp(element, delay, index);
          });
          introed = true;
        }
      };

      // Call scrolled() on scroll
      var scrollEventId = debouncedEvents.onScroll(scrollHandler);
      scrollHandler();

      // Event destroy
      scope.$on('$destroy', function () {
        debouncedEvents.off(resizeEventId);
        debouncedEvents.off(scrollEventId);
      });

    }
  };
});;app.directive('fillup', function($timeout, debouncedEvents, $interval, $rootScope) {
  return {
    restrict: 'EA',
    link: function(scope, element, attrs) {

      var jqElm = $(element);
      var jqEndElm = $(jqElm.children('[fillup-element]')[0]);
      var direction = attrs.fillup.length > 0 ? attrs.fillup : 'height';

      var getParts = function() {
        return jqElm.children('[fillup-part]');
      };

      var calculate = function() {
        var width = jqElm.outerWidth();
        var height = jqElm.outerHeight();

        var partWidth = 0;
        var partHeight = 0;
        _.each(parts, function(part) {
          partWidth += $(part).outerWidth();
          partHeight += $(part).outerHeight();
        });

        return {
          'height': height - partHeight,
          'width': width - partWidth
        };
      };

      var applyFilllup = function() {
        if(direction === 'height') {
          jqEndElm.height(0);
          jqEndElm.height(calculate().height);
        } else if (direction === 'width') {
          jqEndElm.width(0);
          jqEndElm.width(calculate().width);
        }
        $rootScope.$broadcast('bundle_edit_details:fillup');
      };

      var resizeEventId = debouncedEvents.onResize(function() {
        $timeout(applyFilllup);
        $timeout(applyFilllup, 100);
      });

      var parts = getParts();
      $timeout(applyFilllup);

      scope.$on('$destroy', function () {
        debouncedEvents.off(resizeEventId);
      });
    }
  };
});;app.directive('focuspicture', function($document, documentProps) {
  return {
    restrict: 'A',
    scope: {
      fx: '@focuspictureX',
      fy: '@focuspictureY'
    },
    link: function(scope, elm, attrs) {

      // Apply function
      var applyFocus = function(x, y) {
        elm.css({
          backgroundPosition: 'top ' + y + '% left ' + x + '%'
        });
      };

      // Watch values
      scope.$watch(function() {
        return scope.fx + ',' + scope.fy;
      }, function() {
        applyFocus(scope.fx, scope.fy);
      }, true);

      // Initial
      applyFocus(scope.fx, scope.fy);

    }
  };
});
;app.directive('focuspoint', function($document, documentProps, debouncedEvents, $timeout, $window, $rootScope) {
  return {
    restrict: 'A',
    scope: {
      fx: '=focuspointX',
      fy: '=focuspointY',
      releaseFunction: '=onFocuspointRelease'
    },
    link: function(scope, elm, attrs) {

      // Get picture element
      var pictureElm = elm.find('figure');

      // Add focuspoint class to elements
      var focuspointElm = angular.element('<div class="bln-focuspoint"></div>');
      elm.append(focuspointElm);

      // standard loading
      elm.addClass('fp-loading');

      // Get container dimensions
      var getContainerDimensions = function() {
        return {
          x: elm[0].getBoundingClientRect().left,
          y: elm[0].getBoundingClientRect().top,
          width: elm[0].offsetWidth,
          height: elm[0].offsetHeight
        };
      };

      // Do the dragging
      var touchDevice = documentProps.isTouch();
      var events = {
        down: touchDevice ? 'touchstart' : 'mousedown',
        move: touchDevice ? 'touchmove' : 'mousemove',
        up: touchDevice ? 'touchend' : 'mouseup',
        hoverstart: touchDevice ? 'touchstart' : 'mouseenter',
        hoverend: touchDevice ? 'touchend' : 'mouseleave'
      };

      var container = getContainerDimensions();
      var offset = 30;
      var startCoords = { x: 0, y: 0 };
      var startFocuspoints = { fx: 0, fy: 0 };
      var dragging = false;

      // Mouse/finger down (start dragging)
      var downHandler = function(event) {
        event.preventDefault();

        // Both touch & mouse
        container = getContainerDimensions();
        if(!event) event = window.event;
        var button = event.which || event.button;
        elm.addClass('fp-dragging');
        dragging = true;
        startCoords = {
          x: event.clientX,
          y: event.clientY
        };
        startFocuspoints = {
          fx: scope.fx,
          fy: scope.fy,
        };

      };
      focuspointElm.on(events.down, downHandler);

       // Drag if enabled
      var moveElm = touchDevice ? focuspointElm : $document;
      moveElm.on(events.move, function(event) {
        if(!dragging) return;
        event.preventDefault();

        scope.fx = bound(startFocuspoints.fx / 100 + ((event.clientX - startCoords.x) / (container.width - offset * 2)), 0, 1) * 100;
        scope.fy = bound(startFocuspoints.fy / 100 + ((event.clientY - startCoords.y) / (container.height - offset * 2)), 0, 1) * 100;

        movePoint();
        movePicture();
      });

       // Mouse/finger up (end of dragging)
      var documentHandler = function() {
        if(!dragging) return;
        event.preventDefault();

        dragging = false;
        elm.removeClass('fp-dragging');
        _.defer(function () { scope.$apply(); });
        if(scope.releaseFunction) scope.releaseFunction(scope.fx, scope.fy);
      };
      $document.on(events.up, documentHandler);

      // Hover
      elm.on(events.hoverstart, function() {
        elm.addClass('fp-hover');
      });
      elm.on(events.hoverend, function() {
        elm.removeClass('fp-hover');
      });

      // Move the point
      var movePoint = function() {
        focuspointElm.css({
          left: (offset / container.width * 100 + scope.fx * (1 - offset / container.width * 2)).toFixed(1) + '%',
          top: (offset / container.height * 100 + scope.fy * (1 - offset / container.height * 2)).toFixed(1) + '%'
        });
      };

      // Move the picture
      var movePicture = function() {
        pictureElm.css({
          backgroundPosition: 'top ' + scope.fy + '% left ' + scope.fx + '%'
        });
      };

      // On window resize
      var resizeEventId = debouncedEvents.onResize(function() {
        container = getContainerDimensions();
        movePoint();
      });

      // On fillup change
      var fillupListener = $rootScope.$on('bundle_edit_details:fillup', function () {
        container = getContainerDimensions();
        movePoint();
      });

      // Boundaries
      var bound = function(val, min, max) {
        return Math.max(min, Math.min(max, val));
      };

      // Validate scope focuspoint
      var validate = function(fx, fy) {
        var x_defined = typeof fx != 'undefined';
        var y_defined = typeof fy != 'undefined';
        var x_in_range = fx >= 0 && fx <= 100;
        var y_in_range = fy >= 0 && fy <= 100;

        return x_defined && y_defined && x_in_range && y_in_range;
      };

      // Reset the coordinates
      var reset = function() {
        elm.removeClass('fp-loading');
        
        return {
          reset: true,
          x: 50,
          y: 50
        };
      };

      // Watch values
      scope.$watch(function() {
        return scope.fx + ',' + scope.fy;
      }, function() {
        // Validate values
        if(!validate(scope.fx, scope.fy)) {
          var def = reset();
          scope.freset = def.reset;
          scope.fx = def.x;
          scope.fy = def.y;
        } else if(scope.freset) {
          scope.freset = false;
        } else {
          elm.removeClass('fp-loading');
        }

        movePoint();
        movePicture();
      }, true);

      // Apply positions for first time
      movePoint();
      movePicture();

      // Destroy events on scope destroy
      scope.$on('$destroy', function () {
        focuspointElm.off(events.down, downHandler);
        $document.off(events.up, documentHandler);
        debouncedEvents.off(resizeEventId);
        fillupListener();
      });
    }
  };
});;app.directive('getHeightOfContentitem', function(debouncedEvents) {
	return {
		restrict: 'AE',
		scope: {
			getHeightOfContentitemClass: '@',
			getHeightOfContentitemWatch: '@'
		},
		link: function(scope, elm, attrs) {
			if(!scope.getHeightOfContentitemClass) return;
			var className = scope.getHeightOfContentitemClass;

			var run = function() {
				var targetElm = $(elm).find('.' + className);
				elm.css({'height': targetElm.height() + 'px'});
				
				// re-run after a delay
				setTimeout(run, 300);
			};

			scope.$watch('getHeightOfContentitemWatch', run);
			var resizeEventId = debouncedEvents.onResize(run);

			// Destroy events on scope destroy
			scope.$on('$destroy', function () {
				debouncedEvents.off(resizeEventId);
			});
			
			elm.on('$destroy', function(){
			    scope.$destroy();
			});
		}
	};
});;app.directive('googlemaps', function() {

  var key = 'AIzaSyDpZYfosiwZ62qxOaa86CvlOC8_bmUgCdg';

  return {
    restrict: 'AE',
    scope: {
      latitude: "@",
      longitude: "@",
      zoom: "@",
      name: "@",
      mode: "@",
      streetviewAvailability: "=setStreetviewAvailabilityTo"
    },
    link: function(scope, elm, attrs) {

      var map, panorama, marker, location;

      scope.$watch(function() {
        return scope.latitude + scope.longitude;
      }, function() {
        location = new google.maps.LatLng(scope.latitude, scope.longitude);
        checkStreetViewAvailability(location);
      });

      // Create an array of styles.
      var styles = [{"featureType":"landscape.natural.landcover","elementType":"labels.text.fill","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"hue":"#F1FF00 "},{"saturation":-27.4},{"lightness":9.4},{"gamma":1}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"simplified"},{"hue":"#e9ebed "},{"saturation":-78},{"lightness":67}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"simplified"},{"hue":"#ffffff "},{"saturation":-100},{"lightness":100}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"},{"hue":"#bbc0c4 "},{"saturation":-93},{"lightness":31}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"},{"hue":"#ffffff "},{"saturation":-100},{"lightness":100}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"simplified"},{"hue":"#e9ebed "},{"saturation":-90},{"lightness":-8}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"on"},{"hue":"#e9ebed "},{"saturation":10},{"lightness":69}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"on"},{"hue":"#2c2e33 "},{"saturation":7},{"lightness":19}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"on"},{"hue":"#bbc0c4 "},{"saturation":-93},{"lightness":31}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"simplified"},{"hue":"#bbc0c4 "},{"saturation":-93},{"lightness":-2}]},{"featureType":"administrative.locality","elementType":"labels","stylers":[{"hue":"#32b38c"}]}];
      var styledMap = new google.maps.StyledMapType(styles, { name: "Map" });

      var enableMapsMode = function() {
        // Initialize map
        map = new google.maps.Map(elm[0], {
          center: location,
          zoom: 10, // parseInt(scope.zoom, 10)
          panControl: true,
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: false,
          scrollwheel: false,
          overviewMapControl: false,
          mapTypeControlOptions: {
            mapTypeIds: []
          }
        });

        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');

        // Place marker
        marker = new google.maps.Marker({
          position: location,
          map: map
        });
      };

      var enableStreetViewMode = function() {
        // Initialize streetview
        panorama = new google.maps.StreetViewPanorama(elm[0], {
          position: location
        });
        panorama.setVisible(true);

        // Calculate heading
        var service = new google.maps.StreetViewService;
        service.getPanoramaByLocation(panorama.getPosition(), 50, function(panoData, status) {
          if(status !== 'OK') {
            scope.streetviewAvailability = false;
          }
          if (panoData !== null) {
            var panoCenter = panoData.location.latLng;
            var heading = google.maps.geometry.spherical.computeHeading(panoCenter, location);
            var pov = panorama.getPov();
            pov.heading = heading;
            panorama.setPov(pov);
          }
        });

        // Place marker
        marker = new google.maps.Marker({
          position: location,
          map: panorama
        });
      };

      var switchMode = function(mode) {
        if(mode === 'street') {
          enableStreetViewMode();
        } else {
          enableMapsMode();
        }
      };

      scope.$watch('mode', function(newVal) {
        switchMode(newVal);
      });

      switchMode(scope.mode);

      var checkStreetViewAvailability = function(location) {
        if(!scope.streetviewAvailability) return;

        location = location || false;
        if(!location) return;

        var service = new google.maps.StreetViewService;
        service.getPanoramaByLocation(location, 50, function(panoData, status) {
          scope.streetviewAvailability = (status === 'OK');
        });
      };

    }
  };
});
;app.directive('modalAskEmail', function (Auth) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {

            scope.setCloseDelay(500);

            /***********************************************************************************************/
            /* Email form */
            /***********************************************************************************************/
            scope.emailAddress = '';
            scope.emailAddressValid = false;
            scope.$watch('emailAddress', function () {
                var emailregex = /(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+ |\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*:(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\ ".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)(?:,\s*(?:(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z |(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*))*)?;\s*)/;
                scope.emailAddressValid = emailregex.test(scope.emailAddress);
            });
            scope.submitEmailForm = function ($event) {
                $event.preventDefault();

                if(scope.emailAddressValid) {
                    Auth.update({ email: scope.emailAddress }).then(function () {
                        scope.close();
                    });
                } else {
                    alert('This emailaddress is invalid');
                }

                return false;
            };


            /***********************************************************************************************/
            /* Video */
            /***********************************************************************************************/
            scope.videoIsPlaying = false;
            scope.videoPlayed = false;

            scope.playVideo = function() {
                scope.videoPlayed = true;
                scope.videoIsPlaying = true;
                var toElement = angular.element(document.querySelector('#modalaskemailvideo'));
                elm.parent().scrollTo(toElement, 150, 1000);
            };

            scope.stopVideo = function() {
                scope.videoIsPlaying = false;
            };

        }
    };
});;app.directive('modalCustomArticleImage', function (Auth, Restangular, debouncedEvents) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            
            scope.setCloseDelay(500);
            scope.loading = {
                suggestions: false
            };

            var form = elm.find('#imageForm');

            /***********************************************************************************************/
            /* Current chosen picture */
            /***********************************************************************************************/
            scope.picture = {
                type: 'none',
                data: {}
            };

            scope.unsetPicture = function () {
                scope.picture.type = 'none';
                scope.picture.data = {};
                form[0].reset();
            };

            /***********************************************************************************************/
            /* Close modal if screen is small than 990 */
            /***********************************************************************************************/
            var previousWidth = window.innerWidth;
            var resizeEventid = debouncedEvents.onResize(function () {
                if(window.innerWidth < 990 && previousWidth >= 990) {
                    scope.close();
                }
            });
            scope.$on('$destroy', function () {
                debouncedEvents.off(resizeEventid);
            });

            /***********************************************************************************************/
            /* Suggestions */
            /***********************************************************************************************/
            scope.suggestions = [];
            scope.loading.suggestions = true;
            Restangular
                .one('bundles', scope.data.bundle._sid)
                .one('items', scope.data.item._sid)
                .customGET('suggestimages')
                .then(function (response) {
                    scope.suggestions = response.data.slice(0, 8);
                })
                .finally(function () {
                    scope.loading.suggestions = false;
                });

            scope.setPictureBySuggestion = function (suggestion) {
                scope.picture.type = 'suggestion';
                scope.picture.data = {
                    url: suggestion.imageUrl
                };
                _.defer(function () { scope.$apply(); });
            };

            /***********************************************************************************************/
            /* Upload */
            /***********************************************************************************************/
            var imageFileInput = elm.find('#imageFileUploadButton');
            imageFileInput.on('change', function (event) {
                scope.picture.data = {};
                var file = event.target.files[0];

                if(!file) {
                    scope.imageBase64Valid = false;
                } else {
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        var contents = event.target.result;
                        if(file.type.indexOf('image') === -1) {
                            scope.imageBase64Valid = false;
                        } else {
                            scope.imageBase64Valid = true;
                            scope.imageBase64 = contents;
                            scope.setPictureByUpload(file);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });

            scope.imageBase64Valid = false;
            scope.imageBase64 = '';
            scope.setPictureByUpload = function (file) {
                scope.picture.type = 'upload';
                scope.picture.data = {
                    base64: scope.imageBase64,
                    file: file
                };
                _.defer(function () { scope.$apply(); });
            };

            /***********************************************************************************************/
            /* Custom URL */
            /***********************************************************************************************/
            scope.imageURLValid = false;
            scope.imageURL = '';
            scope.setPictureByUrl = function () {
                scope.picture.type = 'url';
                scope.picture.data = {
                    url: scope.imageURL
                };
                _.defer(function () { scope.$apply(); });
            };

            var urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            scope.$watch('imageURL', function (url) {
                scope.imageURLValid = urlRegex.test(url);
            });

        }
    };
});;app.directive('ngWidth', function() {
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {
      var applyWidth = function(width) {
        elm.css("cssText", "width: " + width + " !important;");
      };

      applyWidth(attrs.ngWidth);
      attrs.$observe('ngWidth', function(value) {
        applyWidth(value);
      }, true);
    }
  };
});;app.directive('notifications', function(Auth, userProfile) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            scope.user = false;
            
            Auth.user() // pass true to force refresh
                .then(function(user) {
                    scope.user = user;
                });
            scope.$on('$destroy', function(){
                userProfile.markNotificationsAsRead();
                Auth.user(true); // pass true to force refresh

            })
        }
    }
});
;app.directive('overflown', function() {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            // Check which element we should watch for overflow
            var altElm = attrs.overflownElement || false;
            element = altElm ? $(element).find(altElm)[0] : $(element)[0];

            var checkOverflown = function() {
                scope.overflown = {
                    horizontal: element.scrollWidth > element.clientWidth,
                    vertical: element.scrollHeight > element.clientHeight
                };
            };

            // Check on content change
            scope.$watch(function() {
                return '-' + element.scrollWidth + element.clientWidth + element.scrollHeight + element.clientHeight;
            }, checkOverflown);

            // Initial check
            checkOverflown();
        }
    };
});;app.directive('partial', function($http, $templateCache, $compile, $state, Auth) {
	return {
		restrict: 'AE',
		scope: {
			name: '@',
			scope: '='
		},
		link: function(scope, elm, attrs) {
			$http.get('/views/partials/' + scope.name + '.html?v='+BLN_BUILD_TIMESTAMP, { cache: $templateCache }).then(function(response) {
                var newScope = scope.$new();
                newScope.state = $state;
                newScope.user = {};
                mergedScope = _.merge(newScope, scope.scope);
                var newElement = $compile(response.data)(mergedScope);
                elm.replaceWith(angular.element(newElement));
                
                Auth.user()
                    .then(function (user) {
                        if(!newElement) return;
                        var elmScope = newElement.scope();
                        if(!elmScope) return;
                        elmScope.user = user;
                    });
            });
		}
	};
});;/*
 * This directive creates a infinite moving photoroll
 *
 * Usage: element or attibute.
 * Just create a list and put the elements in a horizontal row with display:inline-block.
 * This directive should be the container of the elements
 *
 *  photoroll - initialize the directive
 *  photoroll-speed="40" - pixels the photoroll travels in a second
 *
 */

app.directive('photoRoll', function(debouncedEvents) {
    return {
        link: function($scope, $element, $attrs) {
            // Save the original elements
            var items = $element.find('li');
            var originalItems = items.clone();

            // Prepare PhotoRoll properties
            var speed = $attrs.photoRollSpeed || 40;
            
            // resize event id
            var resizeEventId;

            // PhotoRoll object
            var PhotoRoll = function(originalItems, speed) {
                var stop = true;
                var rollWidth = 0;
                var currentOffset = 0;

                var getRollWidthAndPrepare = function() {
                    // Reset HTML content
                    $element.html('').append(originalItems);

                    // Calculate widths
                    var viewWidth = $element[0].offsetWidth;
                    var localRollWidth = 0;
                    _(originalItems).each(function(item) {
                        localRollWidth += item.offsetWidth;
                    });

                    // Make necessary copies
                    if (localRollWidth > 100) {
                        var necessaryCopies = Math.ceil(viewWidth / localRollWidth * 2);
                        for (var i = 0; i < necessaryCopies; i++) {
                            var clone = $element.html();
                            $element.append(clone);
                        }
                    }

                    rollWidth = localRollWidth;
                    return localRollWidth;
                };

                var step = function() {
                    requestAnimationFrame(step);

                    var stepLength = speed / 60;
                    var transformArguments = 'translate3d(-' + Math.round(currentOffset) + 'px, 0, 0)';

                    $element.css({
                        '-webkit-transform': transformArguments,
                        '-moz-transform': transformArguments,
                        '-ms-transform': transformArguments,
                        '-o-transform': transformArguments,
                        'transform': transformArguments
                    });

                    if (currentOffset < rollWidth) {
                        currentOffset += stepLength;
                    } else {
                        getRollWidthAndPrepare();
                        currentOffset = stepLength;
                    }
                };

                resizeEventId = debouncedEvents.onResize(getRollWidthAndPrepare, 100);
                step();

                return this;
            };

            // Initialize the movement
            var photoroll = new PhotoRoll(originalItems, speed);

            $scope.$on('$destroy', function () {
                debouncedEvents.off(resizeEventId);
            });
        }
    };
});
;app.directive('reloadOnResize', function(debouncedEvents) {
  return {
    restrict: 'A',
    scope: {
      src: '@ngSrc'
    },
    link: function(scope, elm, attrs) {
      if(elm[0].tagName != 'IFRAME') return;

      var src = scope.src;

      scope.$watch('src', function(newSrc) {
        src = newSrc;
        reloadIframe();
      });

      var resizeEventId = debouncedEvents.onResize(function() {
        reloadIframe();
      });

      var debounceTimer;
      var reloadIframe = function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
          elm[0].src = src;
        }, 100);
      };

      reloadIframe();

      scope.$on('$destroy', function () {
        debouncedEvents.off(resizeEventId);
      });

      elm.on('$destroy', function(){
          scope.$destroy();
      });
    }
  };
});;app.directive('scrollButtons', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var scrollElement = element.find('[scrolling-element]');
            var scrollDistance = scrollElement.width();

            scope.scrollRight = function scrollRight(e){
                scrollElement.animate({scrollLeft: '+=' + (scrollDistance * 0.8)}, 500, $.bez([0.74, 0.14, 0.28, 0.9]));
            };

            scope.scrollLeft = function scrollLeft(e){
                scrollElement.animate({scrollLeft: '-=' + (scrollDistance * 0.8)}, 500, $.bez([0.74, 0.14, 0.28, 0.9]));
            };
        }
    }
});;app.directive('scrollButtonsIe', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");
            if(msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){
                scope.ie = true;
                var scrollElement = element;
                var scrollDistance = scrollElement.width();

                scope.scrollRight = function scrollRight(e){
                    scrollElement.animate({scrollLeft: '+=' + (scrollDistance * 0.8)}, 500, $.bez([0.74, 0.14, 0.28, 0.9]));
                };

                scope.scrollLeft = function scrollLeft(e){
                    scrollElement.animate({scrollLeft: '-=' + (scrollDistance * 0.8)}, 500, $.bez([0.74, 0.14, 0.28, 0.9]));
                };
            } else {
                scope.ie = false;
            }
        }
    }
});;app.directive('scrollStatus', function(debouncedEvents, $timeout) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, elm, attrs) {
            // Check which element we should watch for scroll events
            var altElm = attrs.scrollStatusElement || false;
            elm = altElm ? $(elm).find(altElm)[0] : $(elm)[0];

            // Fire check-function on scroll
            var scrollEventId = debouncedEvents.on(elm, 'scroll', function() {
                scope.scrollStatus = getScrollStatus();
            }, 15);

            // Check on content change
            scope.$watch(function() {
                return '-' + elm.scrollWidth + elm.clientWidth + elm.scrollHeight + elm.clientHeight;
            }, function() {
                scope.scrollStatus = getScrollStatus();
            });

            // Check-function
            var getScrollStatus = function() {
                var boundTreshold = 40;
                return {
                    horizontal: {
                        view: elm.clientWidth,
                        content: elm.scrollWidth,
                        scroll: {
                            position: elm.scrollLeft,
                            left: elm.scrollLeft <= boundTreshold,
                            right: elm.scrollLeft >= elm.scrollWidth - elm.clientWidth - boundTreshold
                        }
                    },
                    vertical: {
                        view: elm.clientHeight,
                        content: elm.scrollHeight,
                        scroll: {
                            position: elm.scrollTop,
                            top: elm.scrollTop <= boundTreshold,
                            bottom: elm.scrollTop >= elm.scrollHeight - elm.clientHeight - boundTreshold
                        }
                    }
                };
            };

            // Initial check
            scope.scrollStatus = getScrollStatus();

            // Destroy scope
            scope.$on('$destroy', function () {
                debouncedEvents.off(scrollEventId);
            });
        }
    };
});;/*
 * This directive lets the browser scroll to another point on the website
 *
 * Usage: attibute only.
 *
 *  scroll-to - specify the selector of the destination element here. the directive will add a touchend/click event
 *
 */

app.directive('scrollTo', function($document, scrollToggler) {
    return {
        restrict: 'AE',
        link: function($scope, $element, $attrs) {
            var offset = $attrs.scrollToOffset || 0;
            offset = parseInt(offset, 10);
            var time = $attrs.scrollToSpeed || 1000;

            var clickHandler = function clickHandler () {
                if (scrollToggler.status || typeof $attrs.scrollToForce !== 'undefined') {
                    var toSelector = $attrs.scrollTo;

                    if (toSelector.length > 0) {
                        var toElement = $(toSelector);
                        if(toElement && toElement.length) {
                            _.defer(function () {
                                $document.scrollTo(toElement, offset, time);
                            });
                        }

                    }
                }
            };

            $element.on('click', clickHandler);

            $scope.$on('$destroy', function () {
                $element.off('click', clickHandler);
            });

        }
    };
});
;/*
 * This directive sets the height of the element to the height of the window (also on window-resize)
 *
 * Usage: attibute only.
 *
 *  set-window - possible options: width/height/min-width/min-height (default is height)
 *  set-window-percentage - percentage (0, 50, 100, etc)
 *
 */

app.directive('setWindow', function($window, debouncedEvents) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var cssprop = attrs.setWindow || 'height',
                percentage = attrs.setWindowPercentage || 100,
                percentagePlus = attrs.setWindowPercentagePlus || 0;

            // Function to assign window height to the element
            var set = function() {                
                var prop = cssprop.indexOf('height') >= 0 ? 'innerHeight' : cssprop.indexOf('width') >= 0 ? 'innerWidth' : false;
                if(prop) {
                    element.css(cssprop, ($window[prop] * parseInt(percentage, 10) / 100 + parseInt(percentagePlus, 10)) + 'px');
                }
            };

            // Every time the user stops resizing the window
            var resizeEventId = debouncedEvents.onResize(set, 100);

            // Once
            set();

            scope.$on('$destroy', function () {
                debouncedEvents.off(resizeEventId);
            });
        }
    };
});
;app.directive('settings', function(userProfile, Auth, sideextensions, $rootScope) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            var currentState = 'profile',
                expanded = true;

            scope.userProfile = undefined;
            scope.inputErrors = {};
            scope.expand = function(state){
                element.find('.bln-state-open').removeClass('bln-state-open');
                element.find('.' + state).addClass('bln-state-open');
            }

            var formError = function formError(formElm, key, errorMessage){
                scope.inputErrors[key] = errorMessage;
                formElm.addClass('bln-state-error');
            }

            var formSuccess = function formError(formElm, key){
                scope.inputErrors[key] = '';
                formElm.removeClass('bln-state-error');
            }

            var patchData = function patchData(formElm, value, key) {
                var patchData = {};
                patchData[key] = value;
                userProfile.update(patchData).then(function () {
                    formSuccess(formElm, key);
                }, function(err) {
                    var errMessage = err.data.message;
                    if(err.status !== 400 || !errMessage) {
                        errMessage = 'Whoops, something went wrong with this'
                    }
                    if(err && err.data) {
                        formError(formElm, key, errMessage);
                    }
                });
            }

            scope.submitProfile = function(value, key, $event) {
                var formElm = angular.element($event.target);

                patchData(formElm, value, key);

                /*if(key === 'spiritgif'){
                    $.ajax({
                        type: "HEAD",
                        async: true,
                        url: value,
                        success: function(message,text,response){
                            var contentType = response.getResponseHeader('Content-Type');
                            if(contentType === 'image/gif'){
                                patchData(formElm, value, key);
                            } else {
                                scope.$apply(function(){formError(formElm, key, 'The image has to be a .gif');});
                            }
                        },
                        error: function(){
                            scope.$apply(function(){formError(formElm, key, 'The image has to be a .gif');});
                        }
                    });
                } else {
                    patchData(formElm, value, key);
                }*/
            }

            scope.refreshAvatar = function () {
                userProfile.refreshAvatar();
            };

            scope.logout = function() {
                Auth.logout().then(function () {
                    sideextensions.disableAll();
                }, function (){

                });
            };
            Auth.user()
                .then(function(user) {
                    scope.userProfile = user;

                });

            scope.$on('$destroy', function(){
                $rootScope.$broadcast('bln:profileUpdated', {username:scope.userProfile.username});
            });
        }
    }
});;/*
 * Only show this element on top/bottom of page. This is disabled on ios, because Safari on touch-devices pauses Javascript while scrolling.
 *
 * Usage: attibute only.
 *
 *  show-at="false" - can be top/bottom
 *
 */

app.directive("showAt", function($window, debouncedEvents, documentProps) {
    return {
        restrict: 'AE',
        link: function($scope, $element, $attrs) {
            // Test for iOS
            var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

            // Disable on iOS if set
            if (iOS && typeof $attrs.showAtIos != "undefined") {
                return false;
            }

            // Set hide class name
            var hideClass = 'bln-invisible';

            // Set bln-invisible classes based on top/bottom
            var scrolled = function() {
                if ($attrs.showAt === "top" && $window.pageYOffset <= 200) {
                    $element.removeClass(hideClass);
                } else if ($attrs.showAt === "bottom" && $window.pageYOffset >= documentProps.getHeight() - $window.innerHeight - 100) {
                    $element.removeClass(hideClass);
                } else {
                    $element.addClass(hideClass);
                }
            };

            // Call scrolled() on pageload and debounced scroll
            var scrollEventId = debouncedEvents.onScroll(scrolled);
            scrolled();

            // Destroy
            $scope.$on('$destroy', function () {
                debouncedEvents.off(scrollEventId);
            });
        }
    };
});
;app.directive('sideExtensionToggle', function(sideextensions, $document, $rootScope) {
    return {
        restrict: 'AE',
        link: function($scope, $element, $attrs) {
            $scope.sideextensions = sideextensions;
            var name = $attrs.sideExtensionToggle || false;

            var clickHandler = function clickHandler () {
                _.defer(function () {
                    $scope.$apply(function () {
                        sideextensions.all[name].toggle();
                    });
                });
            };

            $element.on('click', clickHandler);

            $scope.$on('$destroy', function () {
                $element.off('click', clickHandler);
            });
        }
    };
});
;app.directive('sidebar', function($rootScope, sideextensions, Auth, $state) {
    return {
        restrict: 'AE',
        replace: true,
        templateUrl: '/views/partials/sidebar.html?v=' + BLN_BUILD_TIMESTAMP,
        link: function (scope) {

            scope.user = false;
            scope.$state = $state;

            Auth.user()
                .then(function(user) {
                    scope.user = user;
                });

            /***********************************************************************************************/
            /* Login function */
            /***********************************************************************************************/
            scope.login = function login () {
                $rootScope.$broadcast('closeSidebarPlease');

                Auth.login()
                    .then(function(user) {
                        if (user.hasRole('beta')) {
                            $state.go('app.home.feed.popular');
                        }
                    });
            };

            /***********************************************************************************************/
            /* Side extensions */
            /***********************************************************************************************/
            scope.menuStates = {
                notifications: false,
                settings: false,
            };

            var sideExtensionChangeDestroyer = $rootScope.$on('sideExtensionChange', function () {
                scope.menuStates.notifications = sideextensions.all['notificationsMenu'].state;
                scope.menuStates.settings = sideextensions.all['settingsMenu'].state;
            });
            
            scope.disableSideextensions = sideextensions.disableAll;

            scope.$on('$destroy', function () {
                sideExtensionChangeDestroyer();
            });
        }
    };
});;app.directive('sidebarState', function($rootScope, $state, $timeout, scrollToggler, $document, helpers, debouncedEvents, sideextensions, Bundles) {
    return {
        restrict: 'A',
        link: function sidebarStateLink (scope, $elm, attrs) {

            var DISABLED_MOBILE_STATES = [
                'app.home.intro'
            ];

            // Document click handler
            var documentClickHandler = function ($event) {
                if(helpers.checkIfElementIsBelow($event.target, '.bln-sidebarcontainer, .bln-sideextension')) return;
                scope.disableSidebar();
                _.defer(function () { scope.$apply(); });
            };

            // State
            scope.sidebarIsActive = false;

            // Enable / disable
            scope.disableSidebar = function disableSidebar () {
                scrollToggler.enable();
                scope.sidebarIsActive = false;
                $document.off('click', documentClickHandler);
            };
            scope.enableSidebar = function enableSidebar () {
                scope.sidebarIsActive = true;
                scrollToggler.disable();
                $document.on('click', documentClickHandler);
            };

            // Toggle
            scope.toggleSidebar = function toggleSidebar () {
                scope.sidebarIsActive ? scope.disableSidebar() : scope.enableSidebar();
            };

            scope.createBundle = function() {
                Bundles.createBundle().then(function(bundle) {
                    $state.go('app.edit_bundle', {
                        bundleId: bundle._sid
                    });
                })
            }

            // Auto toggle on window resize
            var previousWidth = window.innerWidth;
            var resizeEventId = debouncedEvents.onResize(function () {
                if(previousWidth < 768 && window.innerWidth >= 768) {
                    scope.disableSidebar();
                }
                previousWidth = window.innerWidth;
            });

            // Add 'top' class on top
            var scrollEventId = debouncedEvents.onScroll(function () {
                scope.onTop = window.scrollY <= 0;
            });

            // Check disabled mobile states
            var checkDisabledMobileStates = function checkDisabledMobileStates () {
                scope.disableMobileSidebar = false;
                _.each(DISABLED_MOBILE_STATES, function (stateName) {
                    if($state.includes(stateName)) {
                        scope.disableMobileSidebar = true;
                        return;
                    }
                });
                
                if(scope.disableMobileSidebar) scope.disableSidebar();
            };

            // Listen to disableSidebarPlease event
            var closeSidebarPleaseDestroyer = $rootScope.$on('closeSidebarPlease', scope.disableSidebar);
            var openSidebarPleaseDestroyer = $rootScope.$on('openSidebarPlease', scope.enableSidebar);
            var stateChangeSuccessDestroyer = $rootScope.$on('$stateChangeSuccess', checkDisabledMobileStates);
            $timeout(checkDisabledMobileStates);
            checkDisabledMobileStates();

            // Destroy
            scope.$on('$destroy', function () {
                closeSidebarPleaseDestroyer();
                openSidebarPleaseDestroyer();
                stateChangeSuccessDestroyer();
                debouncedEvents.off(resizeEventId);
                debouncedEvents.off(scrollEventId);
                $document.off('click', documentClickHandler);
            });

        }
    };
});;app.directive('sideExtension', function(debouncedEvents, sideextensions) {
    return {
        restrict: 'AE',
        scope: true,
        link: function($scope, $element, $attrs) {
            var name = $attrs.sideExtension || false;
            $scope.sideextension = sideextensions.register(name);
        }
    };
});
;app.directive('sideextensionState', function($rootScope, $document, helpers, sideextensions) {
    return {
        restrict: 'A',
        link: function sidebarStateLink (scope, $elm, attrs) {

            // Close specific sideextension
            scope.closeSideExtension = function closeSideExtension (name) {
                sideextensions.all[name].close();
            };

            // Document click handler
            var documentClickHandler = function ($event) {
                if(helpers.checkIfElementIsBelow($event.target, '.bln-sidebarcontainer, .bln-sideextension')) return;
                sideextensions.disableAll();
                _.defer(function () { scope.$apply(); });
            };

            // State
            $rootScope.$on('sideExtensionChange', function (event, state) {
                scope.sideextensionIsActive = state;
                if(state) {
                    $document.on('click', documentClickHandler);
                } else {
                    $document.off('click', documentClickHandler);
                }
            });

            // Disable on scope destroy
            scope.$on('$destroy', function () {
                $document.off('click', documentClickHandler);
            });

        }
    };
});;//TODO: shouldn't this be a filter?
app.directive('simplifyWebsite', function($timeout) {
    return {
        restrict: 'A',
        scope: {
            websiteUrl: '=content'
        },
        link: function($scope, $element, $attrs) {
            $scope.$watch('websiteUrl', function(websiteUrl) {
                
                var content = angular.copy(websiteUrl);

                if(typeof $scope.websiteUrl === 'string') {
                    content = content.replace('http://www.', '').replace('https://www.', '').replace('http://', '').replace('https://', ''); // remove protocol and www.
                    content = content.split('?')[0]; // remove '?' and everything after it
                    while(content[content.length - 1] === '/') { // remove trailing slash(es)
                        content = content.substring(0, content.length - 1);
                    }
                    content = content.charAt(0).toUpperCase() + content.slice(1); // capitalize
                }

                $element.html(content);

            });
        }
    };
});
;app.directive('snapOnScroll', function(debouncedEvents, $document) {
    return {
        scope: {
            snapOnScrollEnabled: '='
        },
        link: function(scope, elm, attrs) {
            // init vars
            var enabled = scope.snapOnScrollEnabled || scope.snapOnScrollEnabled === 'undefined' || false,
                treshold = attrs.snapOnScrollTreshold || false,
                scrollElementSelector = attrs.snapOnScrollElement || false,
                scrollElement = scrollElementSelector ? $(elm).find(scrollElementSelector) : elm,
                snapped = false,
                inRange = false;

            // on element scroll
            var elementScrollEventId = debouncedEvents.on(scrollElement, 'scroll', function() {
                if(snapped || (treshold && !inRange) || !enabled) return;
                snapped = true;

                // oh snap
                $document.scrollTo(elm, 0, 100);
            }, 20);

            // on page scroll
            var documentScrollEventId = debouncedEvents.onScroll(function() {
                // prevent snap if element is not in range
                if(treshold) {
                    var elmOffset = Math.abs(elm[0].getBoundingClientRect().top);
                    inRange = elmOffset <= treshold;
                }

                // Reset snapped when out of range
                if(!inRange) snapped = false;
            }, 20);

            scope.$on('$destroy', function () {
                debouncedEvents.off(elementScrollEventId);
                debouncedEvents.off(documentScrollEventId);
            })
        }
    };
});
;app.directive('spinner', function() {
  var opts = {
    lines: 15, // The number of lines to draw
    length: 0, // The length of each line
    width: 2, // The line thickness
    radius: 15, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 24, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb or array of colors
    speed: 1.2, // Rounds per second
    trail: 70, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
  };

  return {
    restrict: 'EA',
    link: function(scope, elm, attrs) {
      // Retrieve settings
      var type = attrs.type || false;
      var color = attrs.color || false;
      var options = opts;
      var target = elm[0];

      // Apply classes
      elm.addClass('bln-spinner');
      if(type) elm.addClass('bln-spinner-'+type);

      // Change options based on settings
      switch(type) {
        case "content":
          options.radius = 8;
          options.width = 2;
          break;
        case "button":
          options.radius = 4;
          options.width = 1;
          break;
        case "row":
          options.radius = 4;
          options.width = 1;
          break;
      }

      // Set color
      if(color === 'invert') {
        options.color = "#fff";
      } else if(color) {
        options.color = color;
      }

      // Apply spinner to target element
      var spinner = new Spinner(options).spin(target);
    }
  };
});;app.directive('stateAnimation', function($rootScope, $timeout, debouncedEvents) {
    return {
        restrict: 'AE',
        scope: {
            enterWatch: '='
        },
        link: function(scope, elm, attrs) {
            var delayTimer;

            var watchStateTransitionDestroy = $rootScope.$watch('stateTransition', function(stateTransition) {
                $timeout.cancel(delayTimer);

                var settings = {
                    enterDelay: attrs.enterDelay || 0,
                    leaveDelay: attrs.leaveDelay || 0,
                    preventIfSame: typeof attrs.preventIfSame !== 'undefined' && attrs.preventIfSame !== 'false',
                    enterWatch: attrs.enterWatch || false
                };

                if(stateTransition.status === 'out') {
                    delayTimer = $timeout(function() { elm.removeClass('enter'); }, settings.leaveDelay);
                }

                if(settings.enterWatch) {
                    scope.$watch('enterWatch', function(enter) {
                        enter ? elm.addClass('enter') : elm.removeClass('enter');
                    });
                } else {
                    if(stateTransition.status === 'in') {
                        delayTimer = $timeout(function() { elm.addClass('enter'); }, settings.enterDelay);
                    }
                }

                // Prevent if fromState and toState are the same
                if (settings.preventIfSame && stateTransition.same) {
                    elm.addClass('prevent');
                } else {
                    elm.removeClass('prevent');
                }

            }, true);

            scope.$on('$destroy', function () {
                watchStateTransitionDestroy();
            });
        }
    };
});;app.directive('switch', function() {
    return {
        restrict: 'AE',
        scope: true,
        link: function($scope, $element, $attrs) {
            // Get varnames
            var varNames = $attrs.vars.split(',');
            var toggle = typeof $attrs.toggle != 'undefined' && $attrs.toggle != 'false';
            var defaultVarName = $attrs.default;
            $scope.switches = {};

            // Reset function
            $scope.reset = function(varNames) {
                _.each(varNames, function(varName) {
                    $scope.switches[varName] = false;
                });
            };

            // Switch function
            $scope.switch = function(varName) {
                var prevstate = $scope.switches[varName];
                $scope.reset(varNames);
                $scope.switches[varName] = toggle ? !prevstate : true;
            };

            // Initialize default states
            $scope.reset(varNames);
            $scope.switch(defaultVarName);
        }
    };
});
;app.directive('templateContainer', function($q, $compile, $http, $templateCache, $injector, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            bundle: '=bundle',
            template: '@name'
        },
        link: function($scope, $element, $attrs) {
            $element.addClass('bln-template');
            $scope.$watch('bundle', function(bundle) {
                if(!bundle || !bundle.items || !bundle.items.length) return;

                var algorithm = $injector.get($scope.template.charAt(0).toUpperCase() + $scope.template.slice(1) + 'TemplateAlgorithm');

                var structures = algorithm.run(bundle.items);
                var promises = [];


                _.each(structures, function(structure) {
                    promises.push($http.get('/views/' + structure.structureTemplate, { cache: $templateCache }));
                });

                $q.all(promises).then(function(responses) {

                    var amountOfItemsTaken = 0;
                    
                    $element.html('');

                    _.each(responses, function(response, index) {
                        var takes = structures[index].itemTemplates.length;

                        var newScope = $rootScope.$new(true);
                        newScope.items = bundle.items.slice(amountOfItemsTaken, amountOfItemsTaken + takes);
                        newScope.bundle = bundle;
                        newScope.templates = structures[index].itemTemplates;

                        if (index === 0) newScope.items[0].first = true;

                        amountOfItemsTaken += takes;

                        // Add element to collection
                        var newElement = angular.element(response.data);
                        $compile(newElement)(newScope);
                        $element.append(newElement);
                        
                    });
                });
            }, true);
        }
    };
});
;app.directive('templateItem', function($compile, $http, $templateCache, $state, $rootScope, $location, $sce) {
    return {
        restrict: 'E',
        scope: {
            item: '=item',
            bundle: '=bundle',
            template: '=template',
            classes: '@classes',
            vars: '@vars'
        },
        link: function($scope, $element, $attrs) {
            
            $scope.$watch(function() {

                return $scope.item + $scope.bundle + $scope.template + $scope.classes + $scope.vars;

            }, function() {

                $element.html('');

                if ($scope.item && $scope.template) {
                    $http.get('/views/' + $scope.template, { cache: $templateCache }).then(function(response) {
                        var newScope = $rootScope.$new(true);
                        newScope.item = $scope.item;
                        newScope.bundle = $scope.bundle;
                        newScope.template = {};
                        newScope.state = $state;
                        newScope.trustHtml = $sce.trustAsHtml;
                        if($scope.vars) {
                            var varsToPass = $scope.vars.split(' ');
                            _.each(varsToPass, function(varToPass) {
                                newScope.template[varToPass] = true;
                            });
                        }
                        newScope.goToWebsite = function(url) {
                            window.location.href = url;
                        };
                        newScope.allowed = true;

                        var newElement = angular.element(response.data);
                        if (newScope.item.first) newElement.addClass('bln-bundleitem-first');
                        newElement.addClass($scope.classes);
                        newElement.addClass('itemid-' + $scope.item._sid);
                        
                        $element.append(newElement);

                        $compile($element.contents())(newScope);
                    });
                }

            }, true);
        }
    };
});
;app.directive('templateStructure', function($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            template: '@file',
            bundle: '=bundle',
            skips: '@skips'
        },
        template: '<div ng-include="templateToLoad"></div>',
        link: function($scope, $element, $attrs) {
            $timeout(function() {
                if (! _.isEmpty($scope.bundle)) {
                    $scope.skips = parseInt($scope.skips);
                    $scope.templateToLoad = $scope.template;
                }
            }, 0);
        }
    };
});
;app.directive('tooltip', function($timeout, $rootScope) {
    return {
        restrict: 'AE',
        scope: {
            angle: '@',
            size: '@',
            state: '@',
            selectSelector: '@'
        },
        link: function(scope, elm, attrs) {
            $timeout(function() {

                // Generate tooltip classes
                scope.angle = scope.angle || 'top';
                scope.size = scope.size || false;

                if (scope.angle) elm.addClass('bln-tooltip-' + scope.angle);
                if (scope.size) elm.addClass('bln-tooltip-' + scope.size);

                // DOM changes on state change
                scope.$watch('state', function(state) {
                    if(state === "true") {
                        elm.addClass('active');
                    } else {
                        elm.removeClass('active');
                    }
                });

            }, 0);
        }
    };
});;app.directive('tooltiptoggle', function(tooltips, $timeout) {
    return {
        restrict: 'A',
        scope: {
            tooltiptoggle: '=',
            tooltiptoggleTemplate: '@',
            tooltiptoggleScope: '=',
            tooltiptoggleAngle: '@',
            tooltiptoggleStyle: '@',
            tooltiptoggleSize: '@',
            tooltiptoggleSelect: '@',
            tooltiptoggleHideIf: '=',
            tooltiptoggleDoIf: '=',
            tooltiptoggleDoAction: '='
        },
        link: function(scope, elm, attrs) {

            // Check for existance
            scope.tooltiptoggleTemplate = scope.tooltiptoggleTemplate || false;
            scope.tooltiptoggleAngle = scope.tooltiptoggleAngle || false;
            scope.tooltiptoggleSelect = scope.tooltiptoggleSelect || false;

            // Tooltip requirements (tooltipTemplate)
            if(!scope.tooltiptoggleTemplate) return false;

            // Register tooltip
            scope.template = 'tooltips/' + scope.tooltiptoggleTemplate;
            var tooltip = tooltips.register({
                template: 'tooltips/' + scope.tooltiptoggleTemplate,
                sourceScope: scope
            });

            // On click
            var clickHandler = function clickHandler () {
                if(attrs.tooltiptoggle.length > 0 && !scope.tooltiptoggle) return;
                
                var jqElm = $(elm);
                tooltip.toggle();
                scope.tooltipActive = tooltip.state;
                tooltip.setPosition({
                    x: jqElm.offset().left,
                    y: jqElm.offset().top,
                    width: jqElm.outerWidth(),
                    height: jqElm.outerHeight()
                });

                if(scope.tooltiptoggleSelect && !Modernizr.touch) {
                    var selectElm = tooltip.find(scope.tooltiptoggleSelect);
                    $timeout(function() {
                        selectElm.select();
                    }, 0);
                }
            }
            elm.on('click', clickHandler);

            // Scope watchers
            scope.$watch(function() {
                return scope.tooltiptoggleDoIf + ' ' + scope.tooltiptoggleHideIf;
            }, function(variable) {
                // Do if
                if(scope.tooltiptoggleDoAction && variable && tooltip.state) {
                    scope.tooltiptoggleDoAction();
                }

                // Hide if variable if true
                if(variable) {
                    tooltip.close();
                }
            });

            // Add toggle class
            elm.addClass('bln-tooltiptoggle');

            scope.$on('$destroy', function () {
                elm.off('click', clickHandler);
                tooltips.unsubscribe(tooltip);
            });
        }
    };
});
;/*
 * Adds the 'touchhover' class on touchend, to use with CSS
 *
 * Usage: attibute only.
 *  
 *  toggle-hover - does the thing
 *
 */

app.directive('touchHover', function() {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
            if (! iOS) return false;

            var touchHandler = function touchHandler () {
                $element.toggleClass('touchhover');
            };

            $element.on('touchend', touchHandler);

            $scope.$on('$destroy', function () {
                $element.off('touchend', touchHandler);
            });
        }
    };
});
;app.directive('triggerloading', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            $rootScope.loading.state = true;
            $(elm).load(function() {
                if(elm[0].src) {
                    $rootScope.loading.state = false;
                }
            });
        }
    };
});;// uses jQuery Dotdotdot (http://dotdotdot.frebsite.nl/)
app.directive('truncate', function($timeout, $compile) {
    return {
        restrict: 'EA',
        link: function(scope, element, attrs) {
            var jqElm = $(element);
            
            $timeout(function() {

                jqElm.dotdotdot({
                    watch: true,
                    after: attrs.truncateAfter || null,
                    callback: function() {
                        $compile(jqElm.find('.compile'))(scope);
                    }
                });
                
            });
        }
    };
});;app.directive('twitterBioContent', function($timeout) {
    return {
        restrict: 'A',
        scope: {
            bioContent: '=twitterBioContent',
            bioUrls: '=urls',
            bioUserMentions: '=userMentions'
        },
        link: function($scope, $element, $attrs) {
            $scope.$watch('bioContent', function(contentSource) {
                var content = angular.copy(contentSource);

                if(typeof $scope.bioUrls === 'object') {
                    _.each($scope.bioUrls, function(urlData) {
                        content = content.replace(urlData.shortened_url, generatePrettyHyperlink(urlData.url));
                    });
                }

                if(typeof $scope.bioUserMentions === 'object') {
                    _.each($scope.bioUserMentions, function(userMentionData) {
                        content = content.replace('@' + userMentionData.username, generateUserHyperlink(userMentionData.username));
                    });
                }

                $element.html(content);
            });

            // Generate pretty <a> from twitter username
            var generateUserHyperlink = function(username) {
                var generatedLink = username;

                // wrap url in <a></a>
                generatedLink = '<a href="http://twitter.com/' + username + '" target="_blank" class="user">@' + username + '</a>';

                return generatedLink;
            };

            // Generate pretty <a> tag from url
            var generatePrettyHyperlink = function(url) {
                var generatedLink = url;

                // make url valid
                if(url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
                    url = 'http://' + url;
                }

                // strip protocol from url
                generatedLink = generatedLink.replace('http://', '').replace('https://', '');

                // strip url after '?'
                generatedLink = generatedLink.split('?')[0];

                // truncate url after 35 characters
                if(generatedLink.length > 45)
                    generatedLink = generatedLink.substring(0, 45) + '...';

                // wrap url in <a></a>
                generatedLink = '<a href="' + url + '" target="_blank" class="url">' + generatedLink + '</a>';

                return generatedLink;
            };
        }
    };
});
;app.directive('twitterTweetContent', function($timeout) {
    return {
        restrict: 'A',
        scope: {
            tweetContent: '=twitterTweetContent',
            tweetUrls: '=urls',
            tweetMedia: '=media',
            tweetUserMentions: '=userMentions',
            tweetHashtags: '=hashtags'
        },
        link: function($scope, $element, $attrs) {
            $scope.$watch('tweetContent', function(contentSource) {
                var content = angular.copy(contentSource);

                if(typeof $scope.tweetUrls === 'object') {
                    _.each($scope.tweetUrls, function(urlData) {
                        content = content.replace(urlData.shortened_url, generatePrettyHyperlink(urlData.url));
                    }); 
                }

                if(typeof $scope.tweetMedia === 'object') {
                    _.each($scope.tweetMedia, function(mediaData) {
                        if (mediaData.type === 'photo') {
                            content = content.replace(mediaData.shortened_url, '');
                        } else {
                            content = content.replace(mediaData.shortened_url, generatePrettyHyperlink(mediaData.shortened_url))
                        }
                    });
                }

                if(typeof $scope.tweetUserMentions === 'object') {
                    _.each($scope.tweetUserMentions, function(userData) {
                        content = content.replace('@' + userData.username, generateUserHyperlink(userData.username));
                    });
                }

                if(typeof $scope.tweetHashtags === 'object') {
                    _.each($scope.tweetHashtags, function(hashtagData) {
                        content = content.replace('#' + hashtagData, generateHashtagSpan(hashtagData));
                    });
                }

                $element.html(content);
            });

            // Generate pretty <a> tag from url
            var generatePrettyHyperlink = function(url) {
                var generatedLink = url;

                // make url valid
                if(url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
                    url = 'http://' + url;
                }

                // strip protocol from url
                generatedLink = generatedLink.replace('http://', '').replace('https://', '');

                // strip url after '?'
                generatedLink = generatedLink.split('?')[0];

                // truncate url after 35 characters
                if(generatedLink.length > 45)
                    generatedLink = generatedLink.substring(0, 45) + '...';

                // wrap url in <a></a>
                generatedLink = '<a href="' + url + '" target="_blank" class="url">' + generatedLink + '</a>';

                return generatedLink;
            };

            // Generate pretty <a> from twitter username
            var generateUserHyperlink = function(username) {
                var generatedLink = username;

                // wrap url in <a></a>
                generatedLink = '<a href="http://twitter.com/' + username + '?ref=bundlin" target="_blank" class="user">@' + username + '</a>';

                return generatedLink;
            };

            // Generate pretty <a> from twitter username
            var generateHashtagSpan = function(hashtag) {
                var generatedSpan = hashtag;

                // wrap url in <a></a>
                generatedSpan = '<span class="hashtag">#' + hashtag + '</span>';

                return generatedSpan;

            };
        }
    };
});
;/**
 * @ngdoc filter
 * @name bundleItemLink
 * @param {string} bundle_sid - the _sid value of the bundle
 * @param {string} item_sid - the _sid value of the item inside the bundle
 * @description
 *     constructs a url for a specific bundle item
 * @example
 *     {{ bundle._sid | bundleItemLink:item._sid }}
 */
app.filter('addRefToUrl', function() {
    return function(url) {
        if(url) {
            if(url.indexOf('?') > -1) {
                return url.replace('?','?ref=bundlin&')
            } else {
                return url += '?ref=bundlin';
            }
        } else {
            return url;
        }
    };
})
    .filter('trustedUrl', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);;/**
 * @ngdoc filter
 * @name bundleItemLink
 * @param {string} bundle_sid - the _sid value of the bundle
 * @param {string} item_sid - the _sid value of the item inside the bundle
 * @description
 *     constructs a url for a specific bundle item
 * @example
 *     {{ bundle._sid | bundleItemLink:item._sid }}
 */
app.filter('bundleItemLink', function(Restangular) {
    return function(bundle_sid, item_sid) {
        if(bundle_sid && item_sid) {
            return Restangular.configuration.baseUrl + '/c/' + bundle_sid + '/' + item_sid;
        } else {
            return bundle_sid;
        }
    };
});;app.filter('bundlinDate', function($filter) {
  return function(input, type) {
    var time = $filter('date')(input, 'HH:mm'),
        date = $filter('date')(input, 'mediumDate');

    switch(type) {
        case 'date':
            return date;
            break;
        case 'time':
            return time;
            break;
        default:
            return time + ' - ' + date;
            break;
    }
  };
});;app.filter('bundlinPlural', function () {
    return function (input) {
        var pluralInput = input;

        if(input[input.length - 1] === 's') {
            input += 'es';
        } else if(input[input.length - 1] === 'y') {
            input = input.substr(0, input.length - 1);
            input += 'ies';
        } else {
            input += 's';
        }

        return input;
    };
});;app.filter('bundlinRaw', function($sce) {
    return function(input) {
        return $sce.trustAsHtml(input);
    };
});;app.filter('item', function() {
  return function(items, conditions) {
    return _.filter(items, function(item) {
      var match = false;
      _.each(conditions, function(condition) {
        match = match || eval(condition);
      });
      return match;
    });
  };
});;app.filter('reverse', function() {
    return function(items) {
        if(typeof items !== 'object') return items;
        return items.slice().reverse();
    };
});;app.factory('Auth', function($q, Restangular, $analytics, $interval, $state, modals) {

    var SESSION_CALLS_DEBOUNCE = 50;
    var sessionBase = Restangular.one('session');
    var User = {
        loggedIn: false,
        hasRole: function hasRole (role) {
            if(!this.loggedIn) return false;
            var roles = arguments || [role];
            var matches = _.intersection(roles, this.roles);
            return matches.length > 0;
        },
        hasUnreadNotifications: function hasUnreadNotifications(){
            return _.some(this.notifications, {'read': false});
        }
    };
    var defaultUserProperties = Object.keys(User);
    var checkForNewNotificationsIntervalId;
    var NOTIFICATION_CHECK_INTERVAL = 30 * 1000; // 30 seconds

    /***********************************************************************************************/
    /* Auth service API */
    /***********************************************************************************************/
    var Auth = {
        user: function (force) {
            var defer = $q.defer();

            // If User is unknown or force is enabled, perform a session call
            if(!User.loggedIn || force) {

                defersArray.push(defer);
                debouncedSessionCall();

            // Otherwise, directly resolve with current User
            } else {
                defer.resolve(User);
            }

            // Return promise
            return defer.promise;
        },

        login: function () {
            var defer = $q.defer();
            $analytics.eventTrack('System', { category: 'Auth', label: 'Login with Twitter' });

            // Twitter login popup settings
            var settings = {
                'height': 420,
                'width': 550,
                'left': (window.innerWidth - 550) / 2,
                'top': 150,
                'toolbar': 0,
                'status': 0
            };

            // Stringify settings
            var windowSettingsString = Object.keys(settings).map(function(key) {
                return key + '=' + settings[key];
            }).join(',');

            // Open the popup
            var popup = window.open('/api/auth/twitter', 'Bundlin - Login with Twitter', windowSettingsString);

            // Focus the popup
            if (window.focus) popup.focus();

            // Callback function to be executed by popup's JavaScript
            window.doBundlinTwitterLogin = function (userData) {
                popup.close();

                var handle = function (newUser) {
                    mergeUserWith(newUser);
                    User.loggedIn = true;
                    defer.resolve(User);
                    checkUserMail();
                };

                if(userData) {
                    handle(userData);
                } else {
                    Auth.user(true)
                        .then(function (response) {
                            handle(response.data);
                        });
                }
            };

            // Return promise
            return defer.promise;
        },

        logout: function () {

            // Perform call, return promise
            return Restangular.one('auth').one('logout').post().then(function(response) {
                cleanUpUser();
                $state.go('app.home');
            });
        },

        updateLocal: function (data) {
            mergeUserWith(data);
            return User;
        },

        update: function (data) {
            var defer = $q.defer();

            Auth.user().then(function(user) {
                Restangular
                    .one('users', user._id)
                    .patch(data)
                    .then(function (response) {
                        Auth.updateLocal(data);
                        defer.resolve(User);
                    }, function (error) {
                        defer.reject(error);
                    });
            });

            return defer.promise;
        }
    };

    /***********************************************************************************************/
    /* Debounced session call logic */
    /***********************************************************************************************/
    var defersArray = [];
    var sessionCall = function () {
        sessionBase.get().then(function (response) {
            var newUser = response.data;
            mergeUserWith(newUser);
            User.loggedIn = true;
            checkUserMail();
            $interval.cancel(checkForNewNotificationsIntervalId);
            var checkForNewNotificationsIntervalId = $interval(debouncedNotificationsCall, NOTIFICATION_CHECK_INTERVAL);

            _.each(defersArray, function (defer) {
                defer.resolve(User);
            });
            defersArray = [];

        }, function () {
            cleanUpUser();
            _.each(defersArray, function (defer) {
                defer.resolve(User);
            });
            defersArray = [];
        });
    };
    var debouncedSessionCall = _.debounce(sessionCall, SESSION_CALLS_DEBOUNCE);


    /***********************************************************************************************/
    /* Auth helper functions */
    /***********************************************************************************************/
    var mergeUserWith = function mergeUserWith (newUser) {
        _.each(newUser, function (value, key) {
            User[key] = value;
        })
    };

    var cleanUpUser = function cleanUpUser () {
        User.loggedIn = false;
        _.each(User, function (value, key) {
            if(defaultUserProperties.indexOf(key) === -1) {
                delete User[key];
            }
        });
    };

    var checkUserMail = function checkUserMail () {
        if(!User.email && !modals.checkCurrentlyOpen('modal-ask-email')) {
            modals.open('modal-ask-email', { user: User });
        }
    };

    var checkForNewNotifications = function checkForNewNotifications () {
        if(!User.loggedIn) return;

        Restangular
            .one('users', User._id)
            .all('unreadnotifications')
            .getList()
            .then(function (response) {
                var newNotifications = response.data || [];
                User.notifications = _.filter(User.notifications, { read: true } );
                User.notifications = newNotifications.concat(User.notifications);
            });
    };
    var debouncedNotificationsCall = _.debounce(checkForNewNotifications, 500);

    return Auth;

});
;app.factory('Bundles', function($q, Restangular, BundlesHelpers, Auth) {
    var Bundles = {};

    var bundlesBase = Restangular.all('bundles');
    var userBundlesBase = function(username){
        return Restangular.one('users', username);
    }
    var BUNDLE_LOAD_LIMIT = 10;

    Bundles.getLatestBundles = function getLatestBundles(page){
        var defer = $q.defer();

        bundlesBase.getList({page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {

            Auth.user().then(function(user){

                var bundles = BundlesHelpers.markCollected(user, response.data),
                    bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(bundles);

                defer.resolve(bundlesWithLoadIndex);
            });

        }, function(error){
            defer.reject(error);
        });

        return defer.promise;
    };

    Bundles.getFeaturedPopularBundles = function getFeaturedPopularBundles(page) {
        var defer = $q.defer();
        page = page || 1;
        bundlesBase.all('featured_popular').getList({page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {
            defer.resolve(response.data);
        }, function(error){
            defer.reject(error);
        });

        return defer.promise;
    }

    Bundles.getPopularBundles = function getPopularBundles(page){
        var defer = $q.defer();
        bundlesBase.all('popular').getList({page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {

            Auth.user().then(function(user){

                var bundles = BundlesHelpers.markCollected(user, response.data),
                    bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(bundles);

                defer.resolve(bundlesWithLoadIndex);
            });
        }, function(error){
            defer.reject(error);
        });

        return defer.promise;
    }

    Bundles.getFollowerBundles = function getFollowerBundles(page){
        var defer = $q.defer();
        bundlesBase.all('following').getList({page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {

            Auth.user().then(function(user){

                var bundles = BundlesHelpers.markCollected(user, response.data),
                    bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(bundles);

                defer.resolve(bundlesWithLoadIndex);
            });
        }, function(error){
            defer.reject(error);
        });

        return defer.promise;
    }
    
    Bundles.getUserBundles = function getUserBundles(username, page){
        var defer = $q.defer();
        userBundlesBase(username).getList('bundles', {page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {
            var bundles = BundlesHelpers.markUnpublishedByCurrentUser(response.data),
                bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(bundles);
            defer.resolve(bundlesWithLoadIndex);
        },function(error){
            defer.reject(error);
        });
        return defer.promise;
    };

    Bundles.getUserCollectedBundles = function getUserCollectedBundles(username, page){
        var defer = $q.defer();
        userBundlesBase(username).all('bundles').customGETLIST('collects', {page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {
            var bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(response.data);
            defer.resolve(bundlesWithLoadIndex);
        },function(error){
            defer.reject(error);
        });
        return defer.promise;
    };

    Bundles.getUserPublishedBundles = function getUserPublishedBundles(username, page){
        var defer = $q.defer();
        userBundlesBase(username).all('bundles').customGETLIST('published', {page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {
            var bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(response.data);
            defer.resolve(bundlesWithLoadIndex);
        },function(error){
            defer.reject(error);
        });
        return defer.promise;
    };

    Bundles.getUserUnpublishedBundles = function getUserUnpublishedBundles(username, page){
        var defer = $q.defer();
        userBundlesBase(username).all('bundles').customGETLIST('unpublished', {page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {
            var bundles = BundlesHelpers.markAllUnpublishedByCurrentUser(response.data),
                bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(bundles);
            defer.resolve(bundlesWithLoadIndex);
        },function(error){
            defer.reject(error);
        });
        return defer.promise;
    };

    Bundles.createBundle = function createBundle() {
        var defer = $q.defer();
        bundlesBase.post().then(function (response) {
            defer.resolve(response.data)
        }, function (error) {
            defer.reject(error);
        });
        return defer.promise;
    }

    return Bundles;
});;app.factory('BundlesHelpers', function(){
    var BundlesHelpers = {};

    BundlesHelpers.markCollected = function markCollected (user, bundles) {
        return _.map(bundles, function (bundle) {
            // mark as collected
            bundle.collectedByCurrentUser = user.collected_bundles.indexOf(bundle._id) > -1 ? true : false;
            return bundle;
        });
        
    };

    BundlesHelpers.markUnpublishedByCurrentUser = function markCollected (bundles) {
        return _.map(bundles, function (bundle) {
            // mark as unpublished
            bundle.unpublishedByCurrentUser = bundle.published ? false : true;
            return bundle;
        });
        
    };

    BundlesHelpers.markAllUnpublishedByCurrentUser = function markCollected (bundles) {
        return _.map(bundles, function (bundle) {
            // mark as unpublished
            bundle.unpublishedByCurrentUser = true;
            return bundle;
        });
        
    };

    BundlesHelpers.setLoadIndex = function markCollected (bundles) {
        return _.map(bundles, function (bundle, index) {
            // set a load index
            bundle.loadIndex = index;
            return bundle;
        });
        
    };

    return BundlesHelpers;
});;/*
 * This service debounces heavy events like 'scroll' and 'resize'
 *
 * Syntax:
 *  debouncedEvents.on(element, event(s), handler, time);
 *
 * Where time is the debounce milliseconds for the event. Default is 10.
 *
 */

app.service('debouncedEvents', function($window, $rootScope, $timeout) {
    var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

    var bindedEvents = [];

    // Scroll event
    this.onScroll = function(handler, time) {
        return this.onWindow('load scroll', handler, time);
    };

    // Resize event
    this.onResize = function(handler, time) {
        if(iOS) {
            return this.onWindow('load orientationchange', handler, time);
        }

        return this.onWindow('load resize', handler, time);
    };

    // Window event
    this.onWindow = function(eventString, handler, time) {
        return this.on($window, eventString, handler, time);
    };

    // Event
    this.on = function(elm, eventString, callback, time) {
        time = time || 10;
        var timeout = null;

        var handler = function() {
            if (timeout !== null) {
                $timeout.cancel(timeout);
            }

            timeout = $timeout(function() {
                if (typeof callback === "function") {
                    return callback();
                }
            }, time);
        };

        $elm = angular.element(elm);
        $elm.on(eventString, handler);

        var newId = 0;
        if(bindedEvents.length) newId = _.max(bindedEvents, 'id').id + 1;
        bindedEvents.push({
            id: newId,
            elm: $elm,
            eventString: eventString,
            handler: handler
        });

        return newId;
    };

    this.off = function (identifier) {
        var index = _.findIndex(bindedEvents, { id: identifier });
        var bindedEvent = bindedEvents[index];
        bindedEvent.elm.off(bindedEvent.eventString, bindedEvent.handler);
        if (index > -1) bindedEvents.splice(index, 1);
    };

});;app.factory('DefaultTemplateAlgorithm', function() {

    var structureTemplatePath = '/partials/bundle/default/structures';
    var itemTemplatePath = '/partials/bundle/default/items';
    var itemStructure = [];
    var remainingItems = [];
    var position = 1;

    var run = function(items) {
        itemStructure = [];
        position = 1;
        remainingItems = angular.copy(items);

        while (remainingItems.length > 0) {
            if (tryThreeContainer()) continue;
            if (tryTwoContainer()) continue;
            doOneContainer();
        }

        return itemStructure;
    };

    var tryThreeContainer = function() {
        if (notEnoughItems(3) || isPosition(1) || !previousIsNot('two-container') || !previousIsNot('three-container') || !previousIsNot('three-container-alt')) return false;

        if (itemsAreOfTypes(3, ['article', 'quote', 'twitter_tweet']) &&
            tweetsDontContainMedia(3) &&
            !articleMayBeWide(2) &&
            !articleMayBeWide(0) &&
            !(articleMayBeHigh(0) && articleMayBeHigh(1)) &&
            !(articleMayBeHigh(1) && articleMayBeHigh(2))) {

            if(articleMayBeHigh(0)) {
                addTemplate('three-container', [remainingItems[0].type, remainingItems[1].type, remainingItems[2].type]);
                return true;
            } else if(articleMayBeHigh(2)) {
                addTemplate('three-container-alt', [remainingItems[0].type, remainingItems[1].type, remainingItems[2].type]);
                return true;
            }
        }

        return false;
    };

    var tryTwoContainer = function() {
        if (notEnoughItems(2) || isPosition(1) || !previousIsNot('two-container') || !previousIsNot('three-container') || !previousIsNot('three-container-alt')) return false;

        var case1 = isPosition(2) && itemsAreNotOfTypes(1, ['article', 'quote']) && tweetsContainMedia(2) && itemsAreOfTypes(2, ['dribbble_shot', 'vine_video', 'twitter_tweet', 'article', 'quote']);
        var case2 = itemsAreOfTypes(1, ['article']) && !articleMayBeWide(1) && itemsAreOfTypes(1, ['dribbble_shot', 'vine_video', 'twitter_tweet'], 1) && tweetsContainMedia(2);
        var case3 = itemsAreOfTypes(2, ['article', 'quote', 'twitter_tweet']) && tweetsDontContainMedia(2);
        var case4 = case3 && itemsAreOfTypes(1, ['article', 'quote', 'twitter_tweet'], 1) && tweetsDontContainMedia(2) && articleMayBeWide(1);
        var case5 = case3 && itemsAreOfTypes(1, ['article']) && articleMayBeWide(0);
        var case6 = itemsAreOfTypes(2, ['soundcloud', 'dribbble_shot', 'vine_video', 'twitter_tweet', 'twitter_profile', 'article', 'quote']);

        if(case1 || case2 || case3 || case4 || case5 || case6) {
            if(itemsAreOfTypes(2, ['article']) && articleMayBeHigh(0) && articleMayBeHigh(1)) {
                addTemplate('two-container', ['article-high', 'article-high']);
                return true;
            } else {
                addTemplate('two-container', [remainingItems[0].type, remainingItems[1].type]);
                return true;
            }
        }

        return false;
    };

    var doOneContainer = function() {
        if (notEnoughItems(1)) return false;

        if(itemsAreOfTypes(1, ['article']) && !articleMayBeWide(0)) {
            addTemplate('one-container', ['article-figureleft']);
        } else if(itemsAreOfTypes(1, ['article']) && articleMayBeWide(0) && !isPosition(1)) {
            addTemplate('one-container', ['article']);
        } else {
            addTemplate('one-container', [remainingItems[0].type]);
        }

        return true;
    };

    // VALIDATORS

    var notEnoughItems = function(count) {
        return remainingItems.length < count;
    };

    var isPosition = function(requiredPos) {
        return position === requiredPos;
    };

    var previousIsNot = function(structure) {
        var lastStructure = itemStructure[itemStructure.length - 1];

        return structure !== lastStructure.structureName;
    };

    var itemsAreOfTypesInOrder = function(types) {
        var valid = true;

        _.each(types, function(type, index) {
            if (remainingItems[index].type !== type) valid = false;
        });

        return valid;
    };

    var itemsAreOfTypes = function(count, types, offset) {
        var valid = true;
        offset = offset || 0;

        for(var index = offset; index < count; index++) {
            if(types.indexOf(remainingItems[index].type) === -1) valid = false;
        }

        return valid;
    };

    var itemsAreNotOfTypes = function(count, types, offset) {
        var valid = true;
        offset = offset || 0;

        for(var index = offset; index < count; index++) {
            if(types.indexOf(remainingItems[index].type) > -1) valid = false;
        }

        return valid;
    };

    var tweetsContainMedia = function(count) {
        var valid = true;

        for(var index = 0; index < count; index++) {
            if(remainingItems[index].type === 'twitter_tweet' && (!remainingItems[index].fields.media || remainingItems[index].fields.media.length === 0)) valid = false;
        }

        return valid;
    };

    var tweetsDontContainMedia = function(count) {
        var valid = true;

        for(var index = 0; index < count; index++) {
            if(remainingItems[index].type === 'twitter_tweet' && (!remainingItems[index].fields.media || remainingItems[index].fields.media && remainingItems[index].fields.media.length > 0)) valid = false;
        }

        return valid;
    };

    var articleMayBeWide = function(itemIndex) {
        var item = remainingItems[itemIndex];
        var valid = true;
        if (item.type !== 'article' || !item.fields.picture || !item.fields.picture_aspect_ratio) valid = false;
        if (item.fields.picture_aspect_ratio < 1.5 ) valid = false;
        return valid;
    };

    var articleMayBeHigh = function(itemIndex) {
        var item = remainingItems[itemIndex];
        var valid = true;
        if (item.type !== 'article' || !item.fields.picture || !item.fields.picture_aspect_ratio) valid = false;
        if (item.fields.picture_aspect_ratio > 0.8 ) valid = false;
        return valid;
    };

    // HELPERS

    var addTemplate = function(structure, templates) {
        var structureFile = structureTemplatePath + '/' + structure + '.html?v=' + BLN_BUILD_TIMESTAMP;

        var templateFiles = templates.map(function(template) {
            position++;

            return itemTemplatePath + '/' + template + '.html?v=' + BLN_BUILD_TIMESTAMP;
        });

        remainingItems.splice(0, templates.length);

        itemStructure.push({
            structureName: structure,
            structureTemplate: structureFile,
            itemTemplates: templateFiles,
            itemNames: templates
        });
    };

    return {
        'run': run
    };

});
;/*
 * This service returns properties of the browser, document, agent or window
 *
 * Syntax:
 *  documentProps.getHeight();
 *  documentProps.isTouch();
 *
 */

app.service('documentProps', function() {

    this.getHeight = function() {
        return Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
    };

    this.isTouch = function() {
        return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    };

});
;app.service('error', function($state) {

    //
    this.status = function(status) {
        switch(status) {
            case 404:
                $state.go('app.error', {
                    bundleId: 404
                });
                break;
        }
    };

});;app.factory('fieldWatcher', function($document) {
  var watchers = [];
  var pressedKeys = "";

  $document.on('keypress', function(e) {
    pressedKeys += String.fromCharCode(e.which);
    _.each(watchers, function(watcher) {
      if(pressedKeys.indexOf(watcher.word) != -1) {
        watcher.scope.$apply(watcher.handler);
        pressedKeys = "";
      }
    });
  });

  return function(word, handler, scope) {
    watchers.push({word:word, handler:handler, scope:scope});
  };
});;app.service('helpers', function() {

    this.moveItemThroughArray = function(array, old_index, new_index) {
        if (new_index > array.length + 1 || new_index < 0) return array;
        array.splice(new_index, 0, array.splice(old_index, 1)[0]);
        return array;
    };

    this.checkIfElementIsBelow = function(element, selector) {
        $element = $(element);
        var self = false;
        $(selector).each(function (idx, match) {
            if(!self) {
                self = $element.get(0) === match;
                return;
            }
        });
        var parents = $element.parents(selector);
        return (!! parents.length || self);
    };
});;app.service('modals', function($rootScope, $compile, $q, scrollToggler, $timeout) {

    // find placeholder for all modals
    var modalPlaceholder = $('.bln-modals');

    // store this
    var me = this;

    this.all = [];
    modalPlaceholder.html('');

    // Open a modal
    this.open = function (template, data) {
        var defer = $q.defer();

        var templateName = 'modals/' + template;
        var element = angular.element('<li><partial name="' + templateName + '" scope="partialScope"></partial></li>');
        var modalScope = $rootScope.$new();
        modalScope.partialScope = {};
        modalScope.partialScope.data = data;
        modalScope.partialScope.closeDelay = 0;
        modalScope.partialScope.close = function closeModal (resolveData) {
            modal.element.find('.bln-modalcontainer').addClass('bln-state-leaving');
            $timeout(function () {
                defer.resolve(resolveData);
                modal.element.remove();
                var index = me.all.indexOf(modal);
                if(index > -1) {
                    me.all.splice(index, 1);
                }
                if(me.all.length === 0) {
                    $rootScope.$broadcast('modals:lastmodalcloses');
                }
            }, modal.closeDelay);
        };
        modalScope.partialScope.setCloseDelay = function setCloseDelay (closeDelay) {
            if(typeof closeDelay !== 'number') return 0;
            return modal.closeDelay = closeDelay;
        };

        var modal = {};
        modal.template = template;
        modal.element = $compile(element)(modalScope);
        modal.scope = modal.element.scope();
        modal.closeDelay = 0;

        me.all.push(modal);
        modalPlaceholder.append(modal.element);

        if(me.all.length === 1) {
            $rootScope.$broadcast('modals:firstmodalopens');
        }

        return defer.promise;
    };

    this.checkCurrentlyOpen = function checkCurrentlyOpen (template) {
        return !! _.find(me.all, { template: template });
    };

    // Function to clean up all modals
    this.cleanUp = function cleanUp () {
        _.each(me.all, function (modal) {
            modal.scope.close();
        });
    };

});
;/*
 * This service can freeze the browsers scroll
 *
 * Syntax:
 *  scrollToggler.enable();
 *  scrollToggler.disable();
 *  scrollToggler.toggle();
 *  scrollToggler.status();
 *
 */

app.service('scrollToggler', function() {

    var scrollEnabled = true;
    var body = angular.element(document.querySelector('body'));

    this.enable = function() {
        body.removeClass('no-scroll');
        scrollEnabled = true;
    };

    this.disable = function() {
        body.addClass('no-scroll');
        scrollEnabled = false;
    };

    this.toggle = function() {
        scrollEnabled ? this.disableStatus() : this.enableStatus();
    };

    this.status = scrollEnabled;

});
;app.service('SEO', function($location, $rootScope) {

    var serviceThis = this;

    var defaults = {
        title: 'Bundlin - The beauty of the web, bundled.',
        description: 'Create, discover and share Bundles of links about your favorite subjects. Bundlin is handcrafted by Lifely in Amsterdam.',
        keywords: 'Bundlin, Create, Links, Lifely, Discover, Pim Verlaan, Nick de Bruijn, Bundle, Bundled, Bundling',

        opengraph: {
            'type': 'website',
            'title': 'Bundlin - The beauty of the web, bundled.',
            'description': 'Create, discover and share Bundles of links about your favorite subjects. Bundlin is handcrafted by Lifely in Amsterdam.',
            'url': $location.protocol() + '://' + $location.host(),
            'site_name': 'Bundlin',
            'image': $location.protocol() + '://' + $location.host() + '/images/bundlin.jpg'
        },

        twitter: {
            'card': 'summary',
            'site': '@bundlin',
            'title': 'Bundlin - The beauty of the web, bundled.',
            'description': 'Create, discover and share Bundles of links about your favorite subjects. Bundlin is handcrafted by Lifely in Amsterdam.',
            'image': $location.protocol() + '://' + $location.host() + '/images/bundlin.jpg',
            'url': $location.protocol() + '://' + $location.host()
        }
    };

    $rootScope.SEO = angular.copy(defaults);

    this.set = function(key, settings) {
        $rootScope.SEO[key] = settings;
    };

    this.setForAll = function(title,description) {
        $rootScope.SEO.title = title;
        $rootScope.SEO.opengraph.title = title;
        $rootScope.SEO.twitter.title = title;

        $rootScope.SEO.description = description;
        $rootScope.SEO.opengraph.description = description;
        $rootScope.SEO.twitter.description = description;
    };

    this.reset = function() {
        $rootScope.SEO = angular.copy(defaults);
    };

});
;app.service('sideextensions', function($rootScope, scrollToggler, $timeout) {

    var self = this;

    this.all = {};

    this.register = function(name, defaultstate) {
        var defaultstate = defaultstate || false;
        var destroyer;
        var sideextension = {
            state: false,
            name: name,
            render: false,
            close: function(){
                if(!sideextension.state) return;
                destroyer = $timeout(function(){
                    sideextension.render = false;
                }, 500);
                sideextension.state = false;
                scrollToggler.enable();
                $rootScope.$broadcast('sideExtensionChange', false);
                return true;
            },
            open: function() {
                $timeout.cancel(destroyer);
                sideextension.render = true;
                self.disableAll();
                sideextension.state = true;
                scrollToggler.disable();
                $rootScope.$broadcast('sideExtensionChange', true);
                return true;
            },
            toggle: function() {
                sideextension.state ? sideextension.close() : sideextension.open();
                return true;
            }
        };

        return self.all[name] = sideextension;
    };

    this.disableAll = function() {
        _.each(self.all, function(sideextension) {
            sideextension.close();
        });
    };

});
;app.service('stateTransition', function($timeout, $state, $rootScope, debouncedEvents, $urlRouter) {

    var me = this;

    // State transition handling variables
    var CSS_TRIGGER_ANIMATION_DELAY = 150;
    var transitioned = false;
    var transitioning = false;
    var stateQueue = [];
    var enabled;

    debouncedEvents.onResize(function () {
        enabled = window.innerWidth >= 768;
    });

    var prevent = function (event) {
        event.preventDefault();
        $urlRouter.update(true);
    };

    this.run = function(event, toState, toParams, fromState, fromParams, preCallback, postCallback) {

        preCallback = preCallback || false;
        postCallback = postCallback || false;

        // Return if already transitioned
        if(transitioned) {
            transitioned = false;
            return;
        }

        // Put transition in queue if transition is running
        if(transitioning) {
            stateQueue.push({
                toState: toState,
                toParams: toParams
            });
            prevent(event);
            return;
        }
        
        transitioning = true; // start
        prevent(event);

        $rootScope.stateTransition.same = false;
        if(fromState.name === toState.name) {
            $rootScope.stateTransition.same = true;
        }

        $rootScope.stateTransition.status = 'out'; // (begin fade-out old page) 

        $timeout(function() {
            transitioned = true;
            $rootScope.extraStateParams = toState.extraParams;
            if(postCallback) postCallback();
            $state.go(toState.name, toParams);
            if(preCallback) preCallback();

            $timeout(function() {
                $rootScope.stateTransition.status = 'in'; // (fade-in new page)
                transitioning = false; // end

                // state queue
                var stateQueueItem = stateQueue.shift();
                if(typeof stateQueueItem !== 'undefined') {
                    $rootScope.extraStateParams = stateQueueItem.toState.extraParams;
                    $state.go(stateQueueItem.toState, stateQueueItem.toParams);
                }
            }, enabled ? CSS_TRIGGER_ANIMATION_DELAY : 0);
        }, enabled ? $rootScope.stateTransition.time : 0);

    }
});;app.service('tags', function($q, Restangular) {

    var tagsPromise = Restangular.one('tags');

    this.load = function(query) {
        // should work with this promise
        var deferred = $q.defer();
        tagsPromise.getList('autocomplete', {search:query}).then(function(response){
            deferred.resolve(response.data);
        }, function(){
            deferred.reject();
        });
        
        return deferred.promise;
    };
});;app.service('tooltips', function($rootScope, debouncedEvents, $compile, $document, helpers) {

    // find placeholder for all tooltips
    var tooltipPlaceholder = $('.bln-tooltips');

    // store this
    var me = this;

    this.all = [];
    tooltipPlaceholder.html('');

    // register tooltip
    this.register = function(properties) {
        properties.sourceScope.state = false;

        var element = angular.element('<div class="bln-tooltipcontainer" ng-class="{\'active\': state}" ng-style="{ left: position.x + \'px\', top: position.y + \'px\', width: position.width + \'px\', height: position.height + \'px\' }"><tooltip angle="{{tooltiptoggleAngle}}" state="{{state}}" class="bln-tooltip" style="{{tooltiptoggleStyle}}" size="{{tooltiptoggleSize}}"><ng-include src="\'/views/partials/\' + template + \'.html?v=\' + BLN_BUILD_TIMESTAMP"></ng-include></tooltip></div>');
        var compiledElement = $compile(element)(properties.sourceScope);

        var tooltip = {};
        tooltip.state = false;
        tooltip.element = angular.element(compiledElement);
        tooltip.scope = compiledElement.scope();
        tooltip.open = function() {
            me.disableAll();
            tooltip.state = true;
            tooltip.scope.state = true;
            _.defer(function () { tooltip.scope.$apply(); });
        };
        tooltip.close = function() {
            tooltip.state = false;
            tooltip.scope.state = false;
            _.defer(function () { tooltip.scope.$apply(); });
        };
        tooltip.toggle = function() {
            if (tooltip.state) {
                tooltip.close();
            } else {
                tooltip.open();
            }
        };
        tooltip.setPosition = function(position) {
            tooltip.scope.position = position;
        };
        tooltip.find = function(selector) {
            return $(tooltip.element).find(selector);
        };

        tooltipPlaceholder.append(compiledElement);

        me.all.push(tooltip);
        return tooltip;
    };

    // disable all tooltips: handling
    this.disableAll = function() {
        _.each(me.all, function(tooltip) {
            tooltip.close();
        });
    };

    // disable all tooltips on resize and scroll
    debouncedEvents.onResize(me.disableAll);
    debouncedEvents.onScroll(me.disableAll);

    // disable all tooltips when user clicks next to it
    var documentElement = angular.element(document);
    documentElement.on('mousedown', function($event) {
        var preventClick = false;
        _.each(me.all, function (tooltip) {
            if(helpers.checkIfElementIsBelow($event.target, '.bln-tooltip')) {
                preventClick = true;
            }
        });

        if(!preventClick) me.disableAll();
    });

    this.unsubscribe = function(tooltip) {
        tooltip.element.remove();
        var index = me.all.indexOf(tooltip);
        if (index > -1) {
            me.all.splice(index, 1);
        }
    };

});
;app.service('userProfile', function($q, Auth, Restangular) {

    this.refreshAvatar = function() {
        Auth.user().then(function(user) {
            Restangular
                .one('users', user._id)
                .one('refresh_avatar')
                .customPOST({ userId: user._id })
                .then(function () {
                    Auth.user(true);
                });
        });
    }

    this.markNotificationsAsRead = function() {
        var defer = $q.defer();

        Auth.user().then(function(user) {
            Restangular
                .one('users', user._id)
                .one('mark_notifications_read')
                .customPOST({ userId: user._id });
        });

        return defer.promise;
    }

    this.update = Auth.update;
    
});;angular.module('bundlin').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('index.html',
    "<!doctype html><!--[if lte IE 8]><script type=\"text/javascript\">\r" +
    "\n" +
    "    alert('This version of Internet Explorer is not supported by Bundlin. Please upgrade your browser to use Bundlin.');\r" +
    "\n" +
    "  </script><![endif]--><html lang=en ng-app=bundlin id=ng-app><head><meta charset=UTF-8><title ng-bind=SEO.title>Bundlin - the beauty of the web, bundled.</title><meta name=fragment content=!><style>.bln-sidebar {\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "              top: 0;\r" +
    "\n" +
    "              left: 0;\r" +
    "\n" +
    "              bottom: 0;\r" +
    "\n" +
    "              width: 80px;\r" +
    "\n" +
    "              background-color: #292929;\r" +
    "\n" +
    "              text-align: center;\r" +
    "\n" +
    "              border-right: 10px solid transparent;\r" +
    "\n" +
    "              z-index: 25;\r" +
    "\n" +
    "              box-sizing: content-box;\r" +
    "\n" +
    "              background-clip: padding-box;\r" +
    "\n" +
    "              -webkit-overflow-scrolling: touch;\r" +
    "\n" +
    "              -webkit-transition: border .35s, -webkit-transform .35s;\r" +
    "\n" +
    "                      transition: border .35s, transform .35s;\r" +
    "\n" +
    "              -webkit-animation: fadein .35s;\r" +
    "\n" +
    "                      animation: fadein .35s;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            @-webkit-keyframes fadein {\r" +
    "\n" +
    "              from {\r" +
    "\n" +
    "                opacity: 0;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              to {\r" +
    "\n" +
    "                opacity: 1;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            @keyframes fadein {\r" +
    "\n" +
    "              from {\r" +
    "\n" +
    "                opacity: 0;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              to {\r" +
    "\n" +
    "                opacity: 1;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebar .content {\r" +
    "\n" +
    "              position: relative;\r" +
    "\n" +
    "              height: 100%;\r" +
    "\n" +
    "              background-color: #292929;\r" +
    "\n" +
    "              z-index: 10;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebar .content .bottom {\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "              width: 100%;\r" +
    "\n" +
    "              bottom: 0;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebar .content .group {\r" +
    "\n" +
    "              list-style: none;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebar .content .group-topmargin {\r" +
    "\n" +
    "              padding-top: 10px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebar .content .group-bottommargin {\r" +
    "\n" +
    "              padding-bottom: 10px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebar .group-animate {\r" +
    "\n" +
    "              -webkit-animation: fadein_group 1.5s;\r" +
    "\n" +
    "                      animation: fadein_group 1.5s;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            @-webkit-keyframes fadein_group {\r" +
    "\n" +
    "              0% {\r" +
    "\n" +
    "                opacity: 0;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              65% {\r" +
    "\n" +
    "                opacity: 0;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              100% {\r" +
    "\n" +
    "                opacity: 1;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            @keyframes fadein_group {\r" +
    "\n" +
    "              0% {\r" +
    "\n" +
    "                opacity: 0;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              65% {\r" +
    "\n" +
    "                opacity: 0;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              100% {\r" +
    "\n" +
    "                opacity: 1;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            @media only screen and (min-width: 768px) {\r" +
    "\n" +
    "              .bln-sidebar {\r" +
    "\n" +
    "                border-right-color: rgba(41, 41, 41, 0.1);\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-state-sidebaractive .bln-sidebar {\r" +
    "\n" +
    "              border-right-color: rgba(41, 41, 41, 0.1);\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-state-sideextensionactive .bln-sidebar {\r" +
    "\n" +
    "              border-right-color: transparent !important;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-header {\r" +
    "\n" +
    "              height: 600px;\r" +
    "\n" +
    "              min-height: 550px;\r" +
    "\n" +
    "              max-height: 1500px;\r" +
    "\n" +
    "              background-color: #333;\r" +
    "\n" +
    "              color: #fff;\r" +
    "\n" +
    "              position: relative;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-header .bln-headerbg,\r" +
    "\n" +
    "            .bln-header .bln-headercontent {\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "              top: 0;\r" +
    "\n" +
    "              right: 0;\r" +
    "\n" +
    "              bottom: 0;\r" +
    "\n" +
    "              left: 0;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-header .bln-headerbg {\r" +
    "\n" +
    "              background-image: url(/images/intro-header-bg.jpg);\r" +
    "\n" +
    "              background-repeat: no-repeat;\r" +
    "\n" +
    "              background-position: top 0px left 68%;\r" +
    "\n" +
    "              background-size: cover;\r" +
    "\n" +
    "              opacity: .6;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-header .bln-headercontent {\r" +
    "\n" +
    "              text-align: center;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-header .bln-title {\r" +
    "\n" +
    "              text-shadow: 0px 0px 80px rgba(0, 0, 0, 0.3);\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-header .bln-title-sub {\r" +
    "\n" +
    "              margin-top: 10px;\r" +
    "\n" +
    "              text-shadow: 0px 0px 40px rgba(0, 0, 0, 0.6);\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-header .bln-button {\r" +
    "\n" +
    "              margin-top: 50px;\r" +
    "\n" +
    "              text-shadow: 0px 0px 80px rgba(0, 0, 0, 0.5);\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-header .bln-socials {\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "              top: 20px;\r" +
    "\n" +
    "              right: 20px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-header .bln-credits {\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "              right: 20px;\r" +
    "\n" +
    "              bottom: 20px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-header section {\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "              top: 50%;\r" +
    "\n" +
    "              left: 0;\r" +
    "\n" +
    "              right: 0;\r" +
    "\n" +
    "              height: 230px;\r" +
    "\n" +
    "              margin-top: -115px;\r" +
    "\n" +
    "              padding-left: 30px;\r" +
    "\n" +
    "              padding-right: 30px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-headerlayer {\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "              top: 0;\r" +
    "\n" +
    "              right: 0;\r" +
    "\n" +
    "              bottom: 0;\r" +
    "\n" +
    "              left: 0;\r" +
    "\n" +
    "              background-color: rgba(50, 50, 50, 0.4);\r" +
    "\n" +
    "              background-image: url(/images/intro-header-bg-shadow.jpg);\r" +
    "\n" +
    "              background-repeat: repeat-x;\r" +
    "\n" +
    "              background-position: bottom center;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            @media screen and (max-width: 479px) {\r" +
    "\n" +
    "              .bln-header {\r" +
    "\n" +
    "                min-height: 550px;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              .bln-header .bln-handcraftedby {\r" +
    "\n" +
    "                -webkit-transform: translate(-100px, 37px);\r" +
    "\n" +
    "                        transform: translate(-100px, 37px);\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              .bln-header section {\r" +
    "\n" +
    "                height: 350px;\r" +
    "\n" +
    "                margin-top: -200px;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            @media screen and (min-width: 480px) {\r" +
    "\n" +
    "              .bln-header .bln-socials {\r" +
    "\n" +
    "                top: 40px;\r" +
    "\n" +
    "                right: 40px;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              .bln-header .bln-credits {\r" +
    "\n" +
    "                right: 40px;\r" +
    "\n" +
    "                bottom: 40px;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebarcontainer {\r" +
    "\n" +
    "              position: relative;\r" +
    "\n" +
    "              -webkit-transition: opacity .5s;\r" +
    "\n" +
    "                      transition: opacity .5s;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebarcontainer .bln-sub-toggle {\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "              top: 0;\r" +
    "\n" +
    "              left: 80px;\r" +
    "\n" +
    "              padding: 20px;\r" +
    "\n" +
    "              opacity: .5;\r" +
    "\n" +
    "              -webkit-transition: opacity .2s, -webkit-transform .35s;\r" +
    "\n" +
    "                      transition: opacity .2s, transform .35s;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebarcontainer .bln-sub-toggle .bln-icon {\r" +
    "\n" +
    "              width: 37px;\r" +
    "\n" +
    "              color: #ccc;\r" +
    "\n" +
    "              -webkit-transition: -webkit-transform .35s, color .2s;\r" +
    "\n" +
    "                      transition: transform .35s, color .2s;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebarcontainer .bln-sub-toggle .bln-icon .open,\r" +
    "\n" +
    "            .bln-sidebarcontainer .bln-sub-toggle .bln-icon .close {\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "              -webkit-transition: opacity .35s;\r" +
    "\n" +
    "                      transition: opacity .35s;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebarcontainer .bln-sub-toggle .bln-icon .close {\r" +
    "\n" +
    "              opacity: 0;\r" +
    "\n" +
    "              pointer-events: none;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebarcontainer .bln-sub-toggle:hover {\r" +
    "\n" +
    "              opacity: 1;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebarcontainer .bln-sub-toggle:hover .bln-icon {\r" +
    "\n" +
    "              color: #fff;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebarcontainer .bln-sub-toggle.bln-state-ontop {\r" +
    "\n" +
    "              opacity: 1;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebarcontainer .bln-sub-toggle.bln-state-open {\r" +
    "\n" +
    "              opacity: 1;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebarcontainer .bln-sub-toggle.bln-state-open .bln-icon {\r" +
    "\n" +
    "              -webkit-transform: translate3d(10px, 0, 0);\r" +
    "\n" +
    "                      transform: translate3d(10px, 0, 0);\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebarcontainer .bln-sub-toggle.bln-state-open .bln-icon .open {\r" +
    "\n" +
    "              opacity: 0;\r" +
    "\n" +
    "              pointer-events: none;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebarcontainer .bln-sub-toggle.bln-state-open .bln-icon .close {\r" +
    "\n" +
    "              opacity: 1;\r" +
    "\n" +
    "              pointer-events: auto;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebarcontainer.bln-state-disablemobile {\r" +
    "\n" +
    "              opacity: 1;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            @media only screen and (min-width: 768px) {\r" +
    "\n" +
    "              .bln-sidebarcontainer .bln-sub-toggle {\r" +
    "\n" +
    "                display: none;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              .bln-sidebarcontainer.bln-state-disablemobile {\r" +
    "\n" +
    "                opacity: 1;\r" +
    "\n" +
    "                pointer-events: auto;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon {\r" +
    "\n" +
    "              position: relative;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon a {\r" +
    "\n" +
    "              display: block;\r" +
    "\n" +
    "              color: rgba(255, 255, 255, 0.5);\r" +
    "\n" +
    "              text-decoration: none;\r" +
    "\n" +
    "              padding-top: 22px;\r" +
    "\n" +
    "              font-size: 16px;\r" +
    "\n" +
    "              background: transparent;\r" +
    "\n" +
    "              height: 80px;\r" +
    "\n" +
    "              text-align: center;\r" +
    "\n" +
    "              -webkit-transition: background .2s, color .2s, opacity .2s;\r" +
    "\n" +
    "                      transition: background .2s, color .2s, opacity .2s;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon a .bln-icon {\r" +
    "\n" +
    "              opacity: .5;\r" +
    "\n" +
    "              -webkit-transition: opacity .2s, -webkit-transform .2s;\r" +
    "\n" +
    "                      transition: opacity .2s, transform .2s;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon a .bln-numberlabel {\r" +
    "\n" +
    "              display: block;\r" +
    "\n" +
    "              color: #f66567;\r" +
    "\n" +
    "              font-family: 'source-sans-pro', Helvetica, Arial, sans-serif;\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon a .bln-numberlabel-link {\r" +
    "\n" +
    "              bottom: 50px;\r" +
    "\n" +
    "              right: 47px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon a .bln-sub-dotlabel {\r" +
    "\n" +
    "              background-color: #f66567;\r" +
    "\n" +
    "              width: 6px;\r" +
    "\n" +
    "              height: 6px;\r" +
    "\n" +
    "              border-radius: 50%;\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "              -webkit-transition: opacity .2s;\r" +
    "\n" +
    "                      transition: opacity .2s;\r" +
    "\n" +
    "              opacity: 0;\r" +
    "\n" +
    "              -webkit-animation: dotlabel_bounce 0.35s cubic-bezier(0.2, 0.54, 0.43, 0.85) 0s infinite alternate;\r" +
    "\n" +
    "                      animation: dotlabel_bounce 0.35s cubic-bezier(0.2, 0.54, 0.43, 0.85) 0s infinite alternate;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            @-webkit-keyframes dotlabel_bounce {\r" +
    "\n" +
    "              from {\r" +
    "\n" +
    "                -webkit-transform: translateY(0);\r" +
    "\n" +
    "                        transform: translateY(0);\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              to {\r" +
    "\n" +
    "                -webkit-transform: translateY(-4px);\r" +
    "\n" +
    "                        transform: translateY(-4px);\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            @keyframes dotlabel_bounce {\r" +
    "\n" +
    "              from {\r" +
    "\n" +
    "                -webkit-transform: translateY(0);\r" +
    "\n" +
    "                        transform: translateY(0);\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              to {\r" +
    "\n" +
    "                -webkit-transform: translateY(-4px);\r" +
    "\n" +
    "                        transform: translateY(-4px);\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon a .bln-sub-dotlabel.bln-state-active {\r" +
    "\n" +
    "              opacity: 1;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon a .bln-sub-dotlabel-horn {\r" +
    "\n" +
    "              top: 20px;\r" +
    "\n" +
    "              left: 20px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon a:hover {\r" +
    "\n" +
    "              color: rgba(255, 255, 255, 0.65);\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon a:hover .bln-icon {\r" +
    "\n" +
    "              opacity: 1;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon.bln-state-active a {\r" +
    "\n" +
    "              background-color: #252525;\r" +
    "\n" +
    "              color: rgba(255, 255, 255, 0.65);\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon.bln-state-active a .bln-icon {\r" +
    "\n" +
    "              opacity: 1;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon-text a {\r" +
    "\n" +
    "              padding-top: 13px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon-text a .bln-icon {\r" +
    "\n" +
    "              display: block;\r" +
    "\n" +
    "              margin-bottom: 5px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon-text-small a {\r" +
    "\n" +
    "              font-size: 12.5px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon-avatar {\r" +
    "\n" +
    "              background-size: cover;\r" +
    "\n" +
    "              background-position: center center;\r" +
    "\n" +
    "              height: 80px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon-avatar a {\r" +
    "\n" +
    "              background-color: transparent;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon-avatar a:hover {\r" +
    "\n" +
    "              background-color: rgba(56, 56, 56, 0.2);\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon-logo a {\r" +
    "\n" +
    "              position: relative;\r" +
    "\n" +
    "              height: auto;\r" +
    "\n" +
    "              padding-top: 40px;\r" +
    "\n" +
    "              padding-bottom: 32px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon-logo a .bln-icon {\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "              left: 7px;\r" +
    "\n" +
    "              top: 50%;\r" +
    "\n" +
    "              margin-top: -7px;\r" +
    "\n" +
    "              opacity: 0;\r" +
    "\n" +
    "              -webkit-transform: translateX(8px);\r" +
    "\n" +
    "                      transform: translateX(8px);\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon-logo a:hover {\r" +
    "\n" +
    "              background: transparent;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon-logo a:hover .bln-icon {\r" +
    "\n" +
    "              -webkit-transform: translateX(0);\r" +
    "\n" +
    "                      transform: translateX(0);\r" +
    "\n" +
    "              opacity: 1;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon-logo .image {\r" +
    "\n" +
    "              display: inline-block;\r" +
    "\n" +
    "              height: 43px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-sidebaricon-logo-nolink {\r" +
    "\n" +
    "              padding-top: 40px;\r" +
    "\n" +
    "              padding-bottom: 32px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-homeheader {\r" +
    "\n" +
    "              position: relative;\r" +
    "\n" +
    "              background: #32b38c;\r" +
    "\n" +
    "              color: white;\r" +
    "\n" +
    "              overflow: hidden;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-homeheader .bln-section {\r" +
    "\n" +
    "              position: relative;\r" +
    "\n" +
    "              background: transparent;\r" +
    "\n" +
    "              z-index: 1;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-homeheader .bln-credits {\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "              bottom: 42px;\r" +
    "\n" +
    "              right: 30px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-homeheader .title {\r" +
    "\n" +
    "              font-size: 25px;\r" +
    "\n" +
    "              line-height: 1.3em;\r" +
    "\n" +
    "              font-weight: 600;\r" +
    "\n" +
    "              margin-top: -2px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-homeheader .subtitle {\r" +
    "\n" +
    "              color: white;\r" +
    "\n" +
    "              opacity: .5;\r" +
    "\n" +
    "              margin-top: 16px;\r" +
    "\n" +
    "              font-weight: 600;\r" +
    "\n" +
    "              line-height: 1.6em;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-homeheader .buttons {\r" +
    "\n" +
    "              margin-top: 32px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-homeheader .buttons .playbutton {\r" +
    "\n" +
    "              width: 100%;\r" +
    "\n" +
    "              text-align: center;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-homeheader .buttons .signupbutton {\r" +
    "\n" +
    "              margin-left: -22px;\r" +
    "\n" +
    "              margin-bottom: -20px;\r" +
    "\n" +
    "              margin-top: 10px;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            .bln-homeheader .bln-movinggallery {\r" +
    "\n" +
    "              display: none;\r" +
    "\n" +
    "              position: absolute;\r" +
    "\n" +
    "              top: 0;\r" +
    "\n" +
    "              right: 80px;\r" +
    "\n" +
    "              width: 400px;\r" +
    "\n" +
    "              height: 100%;\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            @media screen and (min-width: 480px) {\r" +
    "\n" +
    "              .bln-homeheader .bln-credits {\r" +
    "\n" +
    "                bottom: auto;\r" +
    "\n" +
    "                top: 30px;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              .bln-homeheader .title {\r" +
    "\n" +
    "                font-size: 35px;\r" +
    "\n" +
    "                margin-top: -9px;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              .bln-homeheader .subtitle {\r" +
    "\n" +
    "                width: 80%;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              .bln-homeheader .buttons .playbutton {\r" +
    "\n" +
    "                width: auto;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              .bln-homeheader .buttons .signupbutton {\r" +
    "\n" +
    "                margin-bottom: 0;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            @media screen and (min-width: 768px) {\r" +
    "\n" +
    "              .bln-homeheader .bln-movinggallery {\r" +
    "\n" +
    "                display: block;\r" +
    "\n" +
    "                opacity: .5;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              .bln-homeheader .title {\r" +
    "\n" +
    "                width: 70%;\r" +
    "\n" +
    "                font-size: 48px;\r" +
    "\n" +
    "                margin-top: -13px;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              .bln-homeheader .subtitle {\r" +
    "\n" +
    "                width: 60%;\r" +
    "\n" +
    "                font-size: 18px;\r" +
    "\n" +
    "                margin-top: 6px;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              .bln-homeheader .bln-credits {\r" +
    "\n" +
    "                top: 40px;\r" +
    "\n" +
    "                right: 40px;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            @media screen and (min-width: 990px) {\r" +
    "\n" +
    "              .bln-homeheader .bln-movinggallery {\r" +
    "\n" +
    "                opacity: 1;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              .bln-homeheader .title {\r" +
    "\n" +
    "                width: 90%;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "              .bln-homeheader .subtitle {\r" +
    "\n" +
    "                width: 80%;\r" +
    "\n" +
    "              }\r" +
    "\n" +
    "            }</style><script>function loadCSS(href){\r" +
    "\n" +
    "                var ss = window.document.createElement('link'),\r" +
    "\n" +
    "                    ref = window.document.getElementsByTagName('head')[0];\r" +
    "\n" +
    "\r" +
    "\n" +
    "                ss.rel = 'stylesheet';\r" +
    "\n" +
    "                ss.href = href;\r" +
    "\n" +
    "\r" +
    "\n" +
    "                // temporarily, set media to something non-matching to ensure it'll\r" +
    "\n" +
    "                // fetch without blocking render\r" +
    "\n" +
    "                ss.media = 'only x';\r" +
    "\n" +
    "\r" +
    "\n" +
    "                ref.parentNode.insertBefore(ss, ref);\r" +
    "\n" +
    "\r" +
    "\n" +
    "                setTimeout( function(){\r" +
    "\n" +
    "                  ss.media = 'all';\r" +
    "\n" +
    "                },0);\r" +
    "\n" +
    "            }\r" +
    "\n" +
    "            loadCSS('/css/not-critical.css?v=@@TIMESTAMP@@');</script><noscript><link rel=stylesheet href=\"/css/app.css?v=@@TIMESTAMP@@\"></noscript><link rel=\"shortcut icon\" href=/favicon.ico><link rel=apple-touch-icon sizes=57x57 href=/favicons/apple-touch-icon-57x57.png><link rel=apple-touch-icon sizes=114x114 href=/favicons/apple-touch-icon-114x114.png><link rel=apple-touch-icon sizes=72x72 href=/favicons/apple-touch-icon-72x72.png><link rel=apple-touch-icon sizes=144x144 href=/favicons/apple-touch-icon-144x144.png><link rel=apple-touch-icon sizes=60x60 href=/favicons/apple-touch-icon-60x60.png><link rel=apple-touch-icon sizes=120x120 href=/favicons/apple-touch-icon-120x120.png><link rel=apple-touch-icon sizes=76x76 href=/favicons/apple-touch-icon-76x76.png><link rel=apple-touch-icon sizes=152x152 href=/favicons/apple-touch-icon-152x152.png><link rel=apple-touch-icon sizes=180x180 href=/favicons/apple-touch-icon-180x180.png><meta name=apple-mobile-web-app-title content=Bundlin><link rel=icon type=image/png href=/favicons/favicon-192x192.png sizes=192x192><link rel=icon type=image/png href=/favicons/favicon-160x160.png sizes=160x160><link rel=icon type=image/png href=/favicons/favicon-96x96.png sizes=96x96><link rel=icon type=image/png href=/favicons/favicon-16x16.png sizes=16x16><link rel=icon type=image/png href=/favicons/favicon-32x32.png sizes=32x32><meta name=msapplication-TileColor content=#292929><meta name=msapplication-TileImage content=/favicons/mstile-144x144.png><meta name=application-name content=Bundlin><meta name=viewport content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no\"><meta name=description content=\"{{ SEO.description }}\" ng-if=SEO.description><meta name=keywords content=\"{{ SEO.keywords }}\" ng-if=SEO.keywords><meta name=author content=\"{{ SEO.author }}\" ng-if=SEO.author><meta name=robots content=\"{{ SEO.robots }}\" ng-if=SEO.robots><meta property=\"{{ 'og:' + field }}\" content=\"{{ value }}\" ng-repeat=\"(field, value) in SEO.opengraph\"><meta name=\"{{ 'twitter:' + field }}\" content=\"{{ value }}\" ng-repeat=\"(field, value) in SEO.twitter\"></head><body><div ui-view=\"\"></div><div class=bln-tooltips></div><ul class=bln-modals></ul><div id=bln-toastcontainer></div><script src=\"https://maps.googleapis.com/maps/api/js?key=AIzaSyDpZYfosiwZ62qxOaa86CvlOC8_bmUgCdg\"></script><script src=\"/js/vendor.js?v=@@TIMESTAMP@@\"></script><script src=\"/js/app.js?v=@@TIMESTAMP@@\"></script></body></html>"
  );


  $templateCache.put('views/app/edit_bundle.html',
    "<state-animation class=\"bln-stateanimation fade\"><article class=\"bln-bundle bln-bundle-create\" ng-hide=error.user><header class=\"bln-metacover bln-metacover-edit\" set-window=height ng-click=disableSidebar($event)><ul class=bln-form fillup=\"\"><li fillup-part=\"\"><form name=titleForm novalidate><input name=bundleTitle ng-model=bundle.title ng-minlength=5 ng-maxlength=50 class=\"bln-input bln-input-bigplaceholder bln-input-spooky bln-input-title\" ng-model-options=\"{ updateOn: 'blur' }\" ng-blur=\"titleForm.$valid && updateBundle({ 'title': bundle.title })\" placeholder=\"Come up with a great title\" ng-required=\"\"></form></li><li fillup-part=\"\"><ul class=bln-paragraphbuttons><li><img ng-src=\"{{ bundle.author.picture.h64 || bundle.author.picture.original }}\" alt=\"{{ bundle.author.name }}\"></li></ul><form name=descriptionForm novalidate><textarea name=bundleDescription ng-model=bundle.description ng-minlength=30 ng-maxlength=250 class=\"bln-input bln-input-bigplaceholder bln-input-spooky bln-input-area bln-input-paragraphbuttons\" ng-blur=\"titleForm.$valid && updateBundle({description: bundle.description})\" placeholder=\"Why should people check out your Bundle?\"></textarea></form></li><li fillup-part=\"\" ng-class=\"{ 'hideplaceholder': bundleTags.length }\"><tags-input ng-model=bundleTags name=bundleTags class=\"bln-input bln-input-bigplaceholder bln-input-spooky bln-input-tags\" min-length=2 remove-tag-symbol=&nbsp; max-length=15 on-tag-added=updateTags(bundleTags) on-tag-removed=updateTags(bundleTags) placeholder=\"Tag your Bundle up!\" replace-spaces-with-dashes=false><auto-complete source=loadTags($query) min-length=1></auto-complete></tags-input></li><li fillup-element=\"\" class=coverphoto><div class=\"bln-coverphoto bln-coverphoto-edit\" focuspoint=\"\" focuspoint-x=bundle.picture.focus_x focuspoint-y=bundle.picture.focus_y on-focuspoint-release=bundle.setFocusPoint ng-class=\"{'bln-state-disablefocuspoint': bundle.loading.changepicture || !bundle.picture.original, 'bln-state-empty': bundle.picture.original, 'bln-state-suggesting': loading.suggestion && !bundle.picture.original}\"><figure ng-style=\"{ 'background-image': 'url(' + (bundle.picture.h600 || bundle.picture.original) + ')' }\"><div class=bln-sub-placeholder ng-if=!bundle.picture.original><p class=bln-title>We'd love to suggest you a cover photo</p><p class=bln-paragraph>Please fill in some tags so our minions know what to look for. Enter the most relevant ones first.</p><div class=bln-sub-videocontainer><video autoplay=\"\" loop=\"\"><source src=/images/wolkengast.mp4 type=video/mp4></video></div></div><div class=bln-row ng-show=!bundle.uploaded_user_image><div class=cell ng-show=bundle.tags.length><a href=# class=\"bln-button bln-button-input bln-button-input-imagecontrols\" ng-click=previousSuggestion()><span class=\"bln-icon bln-icon-budicon-68\"></span></a></div><div class=\"cell stretch\"><label for=bundlePicture class=\"bln-button bln-button-upload bln-button-input bln-button-input-small bln-button-input-primary\"><span class=\"bln-icon bln-icon-budicon-75\"></span> Upload photo</label></div><div class=\"cell last\" ng-show=bundle.tags.length><a href=# class=\"bln-button bln-button-input bln-button-input-imagecontrols\" ng-click=nextSuggestion()><span class=\"bln-icon bln-icon-budicon-70\"></span></a></div></div><div class=bln-row ng-show=bundle.uploaded_user_image><div class=cell><label for=bundlePicture class=\"bln-button bln-button-upload bln-button-input bln-button-input-small bln-button-input-primary\"><span class=\"bln-icon bln-icon-budicon-75\"></span> Upload photo</label></div><div class=\"cell stretch\"></div><div class=\"cell last\"><a ng-if=bundle.tags.length href=# class=\"bln-button bln-button-input bln-button-input-imagecontrols\" ng-click=nextSuggestion()><span class=\"bln-icon bln-icon-budicon-5\"></span></a> <a ng-if=!bundle.tags.length href=# class=\"bln-button bln-button-input bln-button-input-imagecontrols\" ng-click=unsetCoverimage()><span class=\"bln-icon bln-icon-budicon-5\"></span></a></div></div><span class=\"bln-icon bln-icon-loading\" ng-class=\"{'bln-state-active': bundle.loading.changepicture}\"><span></span> <span></span> <span></span></span> <input type=file nv-file-select=\"\" uploader=bundle.imageUploader id=bundlePicture class=bln-hidden accept=image/* ng-if=bundle.imageUploader></figure></div></li></ul></header><div class=\"bln-bundlecontent bln-bundlecontent-edit\"><figure class=bln-sub-createplaceholder ng-if=\"!bundle.items.length && !loading.scraper && !loading.page\"><div class=bln-row><div class=\"cell stick\"><img src=/images/grumpycat.png alt=\"\"></div><div class=\"cell stretch last\"><section><p class=bln-title>Start by adding some great content</p><p class=bln-paragraph>Did you know you can add all sorts of content? Try adding articles, quotes, locations on Google Maps, Vimeo and YouTube videos, Dribbble shots, Soundcloud music, Twitter profiles, Tweets, Vines and apps from the Apple and Android store.</p></section></div></div></figure><div class=\"bln-bundleitem bln-bundleitem-publishbundle bln-bundleitem-first\" ng-class=\"{'bln-state-tweeter': bundleValid.valid && !bundle.published, 'bln-state-tweeting': bundle.loading.tweeting}\"><span class=\"bln-icon bln-icon-loading\"><span></span> <span></span> <span></span></span> <div class=bln-sub-tweet><div class=bln-smallform><label for=tweet class=bln-sub-label><p>Publish your Bundle to share it with your followers on Twitter</p><p class=right ng-class=\"{ 'invalid': tweet.content.length > 140 }\">{{ tweet.content.length }}</p></label><fieldset><textarea id=tweet rows=3 ng-model=tweet.content class=\"bln-input bln-input-smallform\"></textarea></fieldset><div class=\"bln-sub-label bln-sub-label-extras\" ng-if=\"creatorTwitterHandles.length > 0\"><p>Add the creators of your Bundle's content to your Tweet:</p><ul><li ng-repeat=\"handle in creatorTwitterHandles\"><a href=# class=bln-button ng-click=\"addHandleToTweet('@' + handle)\">@{{ handle }}</a></li></ul></div></div></div><div class=bln-row><div class=\"cell stretch\"><progressbar class=bln-progressbar tooltiptoggle=\"\" tooltiptoggle-template=bundle-validation tooltiptoggle-angle=bottom tooltiptoggle-scope=bundleValidations><bar class=background ng-width=100%><span ng-if=bundleValid.valid>Awesome</span> <span ng-if=\"!bundleValid.valid && progress > 50\">Almost ready to publish</span> <span ng-if=\"!bundleValid.valid && progress <= 50\">Indication of awesomeness</span></bar><bar class=extra ng-width=\"{{Math.min(100, progress)}}%\" ng-show=bundleValid.valid><span></span></bar><bar class=normal ng-width=\"{{Math.min(PROGRESSBAR_PUBLISH_TRESHOLD, progress)}}%\"><span ng-class=\"{inactive: progress < PROGRESSBAR_PUBLISH_TRESHOLD}\" ng-if=bundleValid.valid>Ready to publish</span></bar><bar ng-width=0%><span>{{Math.min(100, progress)}}%</span></bar></progressbar></div><div class=cell><a ui-sref=\"app.view_bundle({ bundleId: bundle._sid })\" class=\"bln-button bln-button-small\">Preview</a></div><div class=\"cell last\"><button class=\"bln-button bln-button-small\" ng-click=unpublishBundle() ng-show=bundle.published>Unpublish</button> <button class=\"bln-button bln-button-primary bln-button-small\" ng-click=publishBundle(tweet.content) ng-show=!bundle.published ng-class=\"{'bln-button-disabled': tweet.content.length > 140 || !bundleValid.valid, 'bln-button-primary-filled': bundleValid.valid}\">Publish <span class=\"bln-icon bln-icon-afterline bln-icon-twitter-logo\"></span></button></div></div></div><section class=bln-scraper ng-class=\"{'bln-state-loading': loading.scraper }\"><form class=\"bln-row bln-row-addlink\" name=newItemForm ng-submit=newItemSubmit($event)><div class=\"cell stretch stick\"><input class=\"bln-input bln-input-button bln-input-stick\" ng-model=newItemUrl name=newItemUrl placeholder=\"Add a link to your Bundle\"></div><div class=cell><button type=submit class=\"bln-button bln-button-input bln-button-input-stick bln-button-input-primary\" scroll-to=.bln-sub-publisheditem:last-of-type scroll-to-offset=100 scroll-to-speed=500>Add</button></div><div class=cell><p>or</p></div><div class=\"cell last\"><button type=button class=\"bln-button bln-button-input bln-button-input-tertiery\" ng-click=createEmptyQuote() scroll-to=.bln-sub-publisheditem:last-of-type scroll-to-offset=100 scroll-to-speed=500>Quote someone</button></div></form></section><section><div ng-repeat=\"item in publishedItems | orderBy: 'order'\" class=bln-sub-publisheditem><ng-include src=\"'/views/partials/bundle/editor/items/' + item.type + '.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include></div></section><section class=\"bln-bundleitem bln-bundleitem-create bln-bundleitem-figureleft bln-bundleitem-loading\" ng-show=loading.scraper><div class=bln-bundleitemcontent><header><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></header><figure></figure><div class=bln-bundleitemnote><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div><span class=\"bln-icon bln-icon-loading\"><span></span> <span></span> <span></span></span></div></section><section class=\"bln-bundleitem bln-bundleitem-error\" ng-show=scraperError.active><div class=bln-bundleitemcontent><p>{{ scraperError.message }}</p><a href=# class=\"bln-button bln-button-small bln-button-secondary bln-button-secondary-filled\" ng-click=closeScraperError()>Close ({{ scraperError.timer }})</a></div></section><section ng-show=\"archivedItems.length > 0\"><div class=\"bln-bundleitem bln-bundleitem-footer bln-bundleitem-title bln-bundleitem-title-archiveditems\"><h2>Archived items are only visible to you. Switch to public to add them to your bundle. ({{archivedItems.length}})</h2></div><div ng-repeat=\"item in archivedItems\"><ng-include src=\"'/views/partials/bundle/editor/items/' + item.type + '.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include></div></section><section class=\"bln-bundleitem bln-bundleitem-last\" ng-if=bundle.items.length><p class=\"bln-paragraph bln-paragraph-small\"><a ng-click=deleteBundle() class=bln-link>Delete this Bundle</a></p></section></div></article><article class=\"bln-bundle bln-bundle-create-error\"><div class=bln-disabled><p class=bln-paragraph>Creating and editing Bundles is not yet supported on small screens</p><a class=bln-button ui-sref=\"app.view_bundle({bundleId: bundle._sid})\">Back to bundle</a></div></article></state-animation>"
  );


  $templateCache.put('views/app/feed.html',
    "<article class=bln-horizontal auto-horizontal-scroll=\"\" scroll-end-callback=loadBundles() overflown=\"\" scroll-status=\"\" scroll-buttons-ie=\"\"><div class=\"shadowbar shadowbar-right\" ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.right}\"></div><a ng-show=ie class=\"bln-scrollarrow bln-scrollarrow-right\" ng-click=scrollRight() ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.right}\"></a> <a ng-show=ie class=\"bln-scrollarrow bln-scrollarrow-left\" ng-click=scrollLeft() ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.left}\"></a> <ul state-animation=\"\" class=\"bln-tabs bln-stateanimation fade move-down\" leave-delay=650 dropdown-toggler=\"\"><li ng-class=\"{ 'bln-state-active': ('app.home.feed.popular' | isState) }\"><a ui-sref=app.home.feed.popular ui-sref-active=bln-state-active>Trending</a></li><li ng-class=\"{ 'bln-state-active': ('app.home.feed.new' | isState) }\"><a ui-sref=app.home.feed.new ui-sref-active=bln-state-active>Latest</a></li><li ng-class=\"{ 'bln-state-active': ('app.home.feed.following' | isState) }\"><a ui-sref=app.home.feed.following ui-sref-active=bln-state-active>Following</a></li></ul><section ui-view=bundles class=bln-feed id=first-content></section><div class=bln-pageloader ng-class=\"{' bln-pageloader-disabled': pageLoading === 'loaded' }\"><span class=\"bln-icon bln-icon-loading bln-icon-loading-gray\"><span></span> <span></span> <span></span></span></div></article>"
  );


  $templateCache.put('views/app/feed_bundles.html',
    "<ul ng-show=bundles.length><li ng-repeat=\"bundle in bundles\"><state-animation class=\"bln-stateanimation fade\" enter-delay=\"{{ 750 + 200 * bundle.loadIndex}}\" style=\"height: 100%\"><partial name=bundletile scope=\"{'bundle': bundle, 'type': 'home'}\"></partial></state-animation></li></ul><div class=\"bln-nocontent bln-stateanimation fade\" ng-if=\"generalLoading === 'loaded' && !bundles.length\" state-animation=\"\" leave-delay=650 enter-delay=250><p ng-if=\"'app.home.feed.popular' | isState\">Whoops, something went wrong!</p><p ng-if=\"'app.home.feed.new' | isState\">Whoops, something went wrong!</p><p ng-if=\"'app.home.feed.following' | isState\">You might consider following some more active users.</p></div>"
  );


  $templateCache.put('views/app/intro.html',
    "<article><state-animation class=\"bln-stateanimation fade\"><header class=bln-homeheader><state-animation class=\"bln-stateanimation fade homeheader\" enter-delay=500><div class=\"bln-section bln-section-intro bln-section-intro-header\"><div class=bln-maxwidth><state-animation class=\"bln-stateanimation slow fade\" enter-delay=1500><p class=\"bln-credits bln-credits-small\"><img src=/images/intro-handcrafted.png alt=\"Handcrafted by\" class=handcraftedby> <a href=\"http://lifely.nl?ref=bundlin\" target=_blank class=logo><img src=/images/logo_lifely.png alt=Lifely></a></p></state-animation><h1 class=title>The beauty of the web, bundled.</h1><p class=subtitle>Create, discover and share Bundles of links about your favorite subjects.</p><div class=buttons><div class=\"playbutton bln-button bln-button-invert bln-button-play\" ng-click=playVideo() ng-show=!playvideo ng-class=\"{'bln-button-played': video_played}\"><span class=\"bln-icon bln-icon-play-button\"></span> What's Bundlin all about?</div><div class=\"playbutton bln-button bln-button-invert bln-button-stop\" ng-click=stopVideo() ng-show=playvideo><span class=\"bln-icon bln-icon-stop-button\"></span> Stop video</div><div class=\"signupbutton bln-button bln-button-signup\" scroll-to=#invitation ng-show=\"!user.loggedIn || mobile\">Log in / Sign up <span class=\"bln-icon bln-icon-budicon-41\"></span></div></div></div></div></state-animation><state-animation class=\"bln-stateanimation fade\" enter-delay=500><div class=bln-movinggallery fancy-intro=\"\" fancy-intro-offset=0 fancy-intro-delay=2000 fancy-intro-effect=move-up fancy-intro-effect-distance=long fancy-intro-children=\"ul > li\" fancy-intro-children-delay=150><ul><li><div class=layer-2 ng-style=\"{'background-image': 'url(' + '/images/teamphotos/teamphoto-01.jpg' + ')', 'left': '116px', 'top': '-77px'}\"></div></li><li><div class=\"layer-1 small\" ng-style=\"{'background-image': 'url(' + '/images/teamphotos/teamphoto-02.jpg' + ')', 'left': '46px', 'top': '95px'}\"></div></li><li><div class=layer-2 ng-style=\"{'background-image': 'url(' + '/images/teamphotos/teamphoto-03.jpg' + ')', 'left': '176px', 'top': '111px'}\"></div></li><li><div class=\"layer-3 small\" ng-style=\"{'background-image': 'url(' + '/images/teamphotos/teamphoto-04.jpg' + ')', 'left': '234px', 'top': '192px'}\"></div></li><li><div class=\"layer-2 large\" ng-style=\"{'background-image': 'url(' + '/images/teamphotos/teamphoto-05.jpg' + ')', 'left': '35px', 'top': '243px'}\"></div></li></ul></div></state-animation><section class=\"bln-section bln-section-green bln-section-intro bln-section-video bln-section-video-intro\" ng-class=\"{'active': playvideo}\"><div class=bln-maxwidth><div class=\"bln-iframewrapper bln-iframewrapper-video\"><figure><iframe src=\"//player.vimeo.com/video/125583287?color=fff&portrait=0&title=0&byline=0&badge=0&autoplay=0&api=1&player_id=introvideo\" class=bln-video webkitallowfullscreen=\"\" mozallowfullscreen=\"\" allowfullscreen video-status=playvideo id=introvideo></iframe></figure></div></div></section></header></state-animation><state-animation class=\"bln-stateanimation fade\" enter-delay=750><section class=\"bln-section bln-section-feed\" set-window=\"\" id=first-content><div class=\"bln-horslider bln-horslider-homefeed\" scroll-buttons=\"\" overflown=\"\" overflown-element=\"> ul\" scroll-status=\"\" scroll-status-element=\"> ul\" snap-on-scroll=\"\" snap-on-scroll-enabled=!Modernizr.touch snap-on-scroll-treshold=150 snap-on-scroll-element=\"> ul\"><div class=captioncontainer><div class=bln-feedcaption><p>Discover great bundles</p></div></div><div class=\"shadowbar shadowbar-right\" ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.right}\"></div><a class=\"bln-scrollarrow bln-scrollarrow-right\" ng-click=scrollRight() ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.right}\"></a> <a class=\"bln-scrollarrow bln-scrollarrow-left\" ng-click=scrollLeft() ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.left}\"></a><ul scrolling-element=\"\"><li ng-repeat=\"entry in featured\" ng-init=\"bundle = entry\"><state-animation class=\"bln-stateanimation fade\" enter-delay=\"{{ 750 + 200 * $index}}\" style=\"height: 100%\"><partial name=bundletile scope=\"{'bundle': bundle, 'type': 'home'}\"></partial></state-animation></li></ul></div></section><section class=\"bln-section bln-section-intro\"><div class=bln-maxwidth><h2 class=bln-heading>Creating the wow experience with bundles of web content.</h2><p class=\"bln-paragraph bln-paragraph-intro\">You're constantly scouring the web discovering great content, leading to valuable selections of articles, videos and images on any subject of interest. Through Bundlin, you can capture and share these selections, transforming them into stunning looking bundles of indefinite existence.</p><ul class=bln-featurelist fancy-intro=\"\" fancy-intro-offset=300 fancy-intro-delay=0 fancy-intro-effect=move-right fancy-intro-effect-distance=long fancy-intro-children=li fancy-intro-children-delay=200><li><span class=\"bln-icon bln-icon-green bln-icon-budicon-37 bln-icon-feature\"></span><h3 class=\"bln-heading bln-heading-feature\">Enjoy the experience</h3><p class=\"bln-paragraph bln-paragraph-intro bln-paragraph-feature\">Bundlin offers you a fast, easy and seamless way to create stunning looking bundles of your favorite web content.</p></li><li class=\"bln-icon-before bln-icon-featurelistarrow bln-icon-before\"><span class=\"bln-icon bln-icon-green bln-icon-budicon bln-icon-feature\"></span><h3 class=\"bln-heading bln-heading-feature\">Capture great content</h3><p class=\"bln-paragraph bln-paragraph-intro bln-paragraph-feature\">Capture the valuable process of finding amazing content into great bundles of indefinite existence.</p></li><li class=\"bln-icon-before bln-icon-featurelistarrow bln-icon-before\"><span class=\"bln-icon bln-icon-green bln-icon-budicon-36 bln-icon-feature\"></span><h3 class=\"bln-heading bln-heading-feature\">Add value to content</h3><p class=\"bln-paragraph bln-paragraph-intro bln-paragraph-feature\">By selecting links and defining the relationships between those links, you make existing content more valuable.</p></li><li class=\"bln-icon-before bln-icon-featurelistarrow bln-icon-before\"><span class=\"bln-icon bln-icon-green bln-icon-twitter-logo bln-icon-feature\"></span><h3 class=\"bln-heading bln-heading-feature\">Share your passion</h3><p class=\"bln-paragraph bln-paragraph-intro bln-paragraph-feature\">Use Bundlin to share your passion and thoughts with the world, without having to create content yourself.</p></li></ul></div></section><section class=\"bln-section bln-section-intro bln-section-green\" id=invitation><div class=bln-maxwidth><h2 class=\"bln-heading bln-heading-white\">Join our awesome group of beta users!</h2><p class=\"bln-paragraph bln-paragraph-intro bln-paragraph-white bln-paragraph-opacity\">Bundlin is still in an early phase of delevopment. We need your feedback in order to make Bundlin truly amazing. Are you passionate about product development, then please help us by testing bundlin. We only have room for <b>{{ beta_invites_remaining }}</b> more beta accounts, so you better hurry up!</p><section class=\"bln-section bln-section-invitation\"><div ng-hide=user.loggedIn><button class=\"bln-button bln-button-invert\" ng-click=logInWithTwitter()><span class=\"bln-icon bln-icon-twitter-logo bln-icon-beforeline\"></span> Log in / Sign up</button> <span class=bln-hintcontainer-intro><span class=bln-hint touch-hover=\"\" analytics-on=hover analytics-event=Hover analytics-label=\"Twitter login hint\"><span class=\"bln-icon bln-icon-beforeline bln-icon-info-icon\"></span> <span class=bln-hinttext>Use Twitter to log in</span></span></span></div><p ng-show=user.loggedIn><a ui-sref=\"app.view_profile.bundles({ profileScreenName: user.username })\" class=bln-avatar analytics-on=click analytics-event=Click analytics-label=\"Splash page avatar link to Bundlin profile\"><img ng-src=\"{{ user.picture.h128 || user.picture.original || '/images/default.png' }}\" alt=\"{{ user.name }}\"></a> <button class=\"bln-button bln-button-wannabe bln-button-grey\" ng-show=user.loggedIn><span ng-show=\"!user.hasRole('beta', 'admin')\">Hi {{ user.name }}, awesome! You're one of the first in line. We'll contact you as soon as it's ready!</span> <span ng-show=\"user.hasRole('beta', 'admin')\">Thanks {{ user.name }} for signing up to the Bundlin Beta!</span></button></p></section></div></section><section class=bln-section><div class=\"bln-photoroll bln-photoroll-green\"><ul photo-roll=\"\" photo-roll-speed=30><li><img src=/images/photoroll/intro-photoroll-01.jpg alt=\"\"></li><li><img src=/images/photoroll/intro-photoroll-02.jpg alt=\"\"></li><li><img src=/images/photoroll/intro-photoroll-03.jpg alt=\"\"></li><li><img src=/images/photoroll/intro-photoroll-04.jpg alt=\"\"></li><li><img src=/images/photoroll/intro-photoroll-05.jpg alt=\"\"></li><li><img src=/images/photoroll/intro-photoroll-06.jpg alt=\"\"></li><li><img src=/images/photoroll/intro-photoroll-07.jpg alt=\"\"></li><li><img src=/images/photoroll/intro-photoroll-08.jpg alt=\"\"></li><li><img src=/images/photoroll/intro-photoroll-09.jpg alt=\"\"></li><li><img src=/images/photoroll/intro-photoroll-10.jpg alt=\"\"></li></ul></div></section><section class=\"bln-section bln-section-intro\"><div class=bln-maxwidth><h2 class=bln-heading>Our team of dreamers.</h2><p class=\"bln-paragraph bln-paragraph-intro\">Bundlin is handcrafted by <a href=http://lifely.nl target=_blank>Lifely</a>. When we're not working for our awesome clients we spend every waking minute developing Bundlin.</p><ul class=bln-teamlist fancy-intro=\"\" fancy-intro-offset=200 fancy-intro-delay=0 fancy-intro-effect=move-right fancy-intro-effect-distance=long fancy-intro-children=\"li > a\" fancy-intro-children-delay=100><li class=bln-profilecard><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'pimverlaan'})\"><img src=/images/avatars/pim.jpg alt=\"Foto Pim Verlaan\"> <span class=\"bln-name bln-name-profilecard\">Pim Verlaan</span> <span class=\"bln-role bln-role-profilecard\">Founder & design</span></a></li><li class=bln-profilecard><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'nrdebruijn'})\"><img src=/images/avatars/nick.jpg alt=\"Foto Nick de Bruijn\"> <span class=\"bln-name bln-name-profilecard\">Nick de Bruijn</span> <span class=\"bln-role bln-role-profilecard\">Founder</span></a></li><li class=bln-profilecard><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'peterpeerdeman'})\"><img src=/images/avatars/peter.jpg alt=\"Foto Peter Peerdeman\"> <span class=\"bln-name bln-name-profilecard\">Peter Peerdeman</span> <span class=\"bln-role bln-role-profilecard\">Lead Tech</span></a></li><li class=bln-profilecard><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'bryantebeek'})\"><img src=/images/avatars/bryan.jpg alt=\"Foto Bryan te Beek\"> <span class=\"bln-name bln-name-profilecard\">Bryan te Beek</span> <span class=\"bln-role bln-role-profilecard\">Coding</span></a></li><li class=bln-profilecard><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'jessedvrs'})\"><img src=/images/avatars/jesse.jpg alt=\"Foto Jesse de Vries\"> <span class=\"bln-name bln-name-profilecard\">Jesse de Vries</span> <span class=\"bln-role bln-role-profilecard\">Coding</span></a></li><li class=bln-profilecard><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'nick_koster'})\"><img src=/images/avatars/nick.k.jpg alt=\"Foto Nick Koster\"> <span class=\"bln-name bln-name-profilecard\">Nick Koster</span> <span class=\"bln-role bln-role-profilecard\">Coding</span></a></li><li class=bln-profilecard><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'takeluutzen'})\"><img src=/images/avatars/take.jpg alt=\"Foto Take Lijzenga\"> <span class=\"bln-name bln-name-profilecard\">Take Lijzenga</span> <span class=\"bln-role bln-role-profilecard\">Design</span></a></li><li class=bln-profilecard><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'llaleon'})\"><img src=/images/avatars/leon.jpg alt=\"Foto Léon Smit\"> <span class=\"bln-name bln-name-profilecard\">Léon Smit</span> <span class=\"bln-role bln-role-profilecard\">Coding</span></a></li><li class=bln-profilecard><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'jannaboekema'})\"><img src=/images/avatars/janna.jpg alt=\"Foto Janna Boekema\"> <span class=\"bln-name bln-name-profilecard\">Janna Boekema</span> <span class=\"bln-role bln-role-profilecard\">Content strategy</span></a></li></ul><div class=\"bln-staticgallery shrink\" ng-class=\"{'shrink': !fullGallery}\" fancy-intro=\"\" fancy-intro-offset=150 fancy-intro-delay=400 fancy-intro-children=\"img, .stretch figure, .loadmorecontainer\" fancy-intro-children-delay=200 fancy-intro-effect=move-up fancy-intro-effect-distance=long><ul><li><div class=\"wrap half left\"><img src=../images/homepictures/team-01.jpg></div><div class=\"wrap half right stretch\"><figure style=\"background-image: url(../images/homepictures/team-02.jpg)\"></figure></div></li><li><div class=wrap><figure><img src=../images/homepictures/team-03.jpg></figure></div></li><li><div class=\"wrap half left stretch\"><figure style=\"background-image: url(../images/homepictures/team-04.jpg)\"></figure></div><div class=\"half right\"><div class=wrap><figure><img src=../images/homepictures/team-05.jpg></figure></div><div class=wrap><figure><img src=../images/homepictures/team-06.jpg></figure></div></div></li></ul><div class=loadmorecontainer ng-class=\"{ 'inactive': fullGallery }\"><div class=fade></div><button class=loadmore ng-click=\"fullGallery = true\">More</button></div></div></div></section><footer class=\"bln-footer bln-footer-intro\"><div class=bln-maxwidth><div class=content><p class=\"bln-paragraph bln-paragraph-footer\">Made with <span class=bln-hidden>love</span><span class=\"bln-icon bln-icon-inline bln-icon-red bln-icon-tiny bln-icon-heart-icon\"></span> in Amsterdam</p><p class=\"bln-paragraph bln-paragraph-footer\"><a href=mailto:nick@bundlin.com analytics-on=click analytics-event=Click analytics-label=\"Contact e-mail button\">nick@bundlin.com</a></p></div><ul class=bln-socials><li><a href=\"https://www.facebook.com/lifelyNL?ref=bundlin\" target=_blank class=\"bln-icon bln-icon-facebook-logo\"></a></li><li><a href=\"https://twitter.com/bundlin?ref=bundlin\" target=_blank class=\"bln-icon bln-icon-budicon-14\"></a></li></ul></div></footer></state-animation></article>"
  );


  $templateCache.put('views/app/view_bundle.html',
    "<article class=bln-bundle><state-animation class=\"bln-stateanimation metacover\" leave-delay=650><header class=bln-metacover set-window=height><div class=shadows><div class=\"layer layer-top\"></div><div class=\"layer layer-bottom\"></div></div><div class=background ng-style=\"{'background-image': 'url(' + (bundle.picture.h1024 || bundle.picture.original || (loading.page ? '' : '/images/bundle-placeholder.jpg')) + ')'}\" focuspicture=\"\" focuspicture-x=\"{{ bundle.picture.focus_x }}\" focuspicture-y=\"{{ bundle.picture.focus_y }}\"></div><div class=content ng-click=disableSidebar() ng-click-preventclass=prevent-sidebar-close><state-animation class=\"bln-stateanimation fade\" enter-delay=250 leave-delay=400><p class=smalldata>By <a ui-sref=\"app.view_profile.bundles({ profileScreenName: bundle.author.username })\" rel=author>{{ bundle.author.name }}</a> <span class=subtle><time datetime=\"{{ bundle.updated_at }}\" ng-show=bundle.updated_at class=date>{{ bundle.published ? 'published' : 'updated' }} {{bundle.updated_at | bundlinDate:'date'}}</time></span></p><h1 class=title>{{ bundle.title }}</h1><p class=description>{{ bundle.description }}</p><ul class=\"tags bln-tags\"><li ng-repeat=\"tag in bundle.tags\">{{ tag }}</li></ul></state-animation><state-animation class=\"bln-stateanimation fade\" enter-delay=450 leave-delay=200><div class=footer><div class=author><a ui-sref=\"app.view_profile.bundles({ profileScreenName: bundle.author.username })\" rel=author class=link tooltiptoggle=\"!user.hasRole('beta', 'admin')\" tooltiptoggle-template=beta tooltiptoggle-angle=top tooltiptoggle-scope=\"{login: login, user: user}\" tooltiptoggle-style=\"bottom: 138px;\"><img class=avatar ng-src=\"{{ bundle.author.picture.h128 || bundle.author.picture.original || '/images/default.png' }}\" alt=\"{{ bundle.author.name }}\"> <strong class=name><span>{{ bundle.author.name }}</span></strong></a> <a ng-hide=\"!user.loggedIn || bundle.author._id === user._id || !user.hasRole('beta', 'admin')\" class=\"followbutton bln-button bln-button-secondary bln-button-lesspadding\" ng-click=switchFollow()><span ng-show=!followsAuthor>Follow me</span> <span ng-show=followsAuthor>Following</span></a><p class=bio><span twitter-bio-content=bundle.author.bio urls=bundle.author.bio_urls user-mentions=bundle.author.bio_user_mentions></span></p></div><ul class=statistics><li>{{ bundle.author.published_bundle_count || 0 }} <span>bundles</span></li><li>{{ bundle.author.collected_bundles.length || 0 }} <span>collected</span></li></ul><a class=\"scrollbutton bln-icon bln-icon-white bln-icon-metacover\" scroll-to=#first-content>b</a>  <a ng-click=\"state.go('app.edit_bundle', { bundleId: bundle._sid })\" class=editbutton ng-show=\"user.hasRole('beta', 'admin') && user._id === bundle.author._id\"><span class=\"bln-icon bln-icon-greenbutton bln-icon-budicon-56\"></span></a></div></state-animation></div></header></state-animation><div class=\"bln-bundlecontent bln-stateanimation fade move-down\" id=first-content set-window=min-height set-window-percentage=100 state-animation=\"\" enter-delay=650><section class=bln-discussionbar ng-if=bundle.published_tweet><p><a ng-href=\"http://twitter.com/statuses/{{bundle.published_tweet}}?ref=bundlin\" target=_blank>Do you want to discuss this Bundle with me? <span><span class=text>Start conversation <span class=\"bln-icon bln-icon-white bln-icon-budicon-14\"></span></span> <span class=\"bln-icon bln-icon-white bln-icon-budicon-14\"></span></span></a></p></section><section class=bln-discussionbar ng-if=\"!bundle.published_tweet && user._id === bundle.author._id\"><p><a ng-click=\"state.go('app.edit_bundle', { bundleId: bundle._sid })\">This bundle is not published for the outside world yet <span><span class=text>Edit bundle</span> <span class=\"bln-icon bln-icon-white bln-icon-budicon-56\"></span></span></a></p></section><template-container name=default bundle=bundle></template-container><footer><section class=\"bln-bundleitem bln-bundleitem-footer bln-bundleitem-footer-share\" ng-class=\"{'collectButtonEnabled': user._id !== bundle.author._id}\"><div class=bln-bundleitemcontent><div class=left><button class=\"bln-button bln-button-secondary\" ng-click=\"user.loggedIn && switchCollect()\" ng-show=\"user._id !== bundle.author._id\" tooltiptoggle=!user.loggedIn tooltiptoggle-template=signin-to-use tooltiptoggle-angle=right tooltiptoggle-scope=\"{login: login, user: user}\" tooltiptoggle-style=\"margin-left: 15px; margin-top: -32px;\" tooltiptoggle-hide-if=user tooltiptoggle-do-if=user tooltiptoggle-do-action=collect><span ng-show=!isCollected><span class=\"bln-icon bln-icon-red bln-icon-budicon-49 bln-icon-beforeline\"></span> Collect this bundle</span> <span ng-show=isCollected><span class=\"bln-icon bln-icon-red bln-icon-budicon-64 bln-icon-beforeline\"></span> Collected</span></button><p class=label ng-show=\"user._id === bundle.author._id && bundle.collectors.length > 0\">Collected by</p><div class=bln-useravatarlist ng-show=\"bundle.collectors.length > 0\"><ul><li ng-repeat=\"user in bundle.collectors | limitTo: (mobile ? 3 : 5) | reverse\"><a ui-sref=\"app.view_profile.bundles({ profileScreenName: user.username })\" title=\"{{ user.name }}\"><img ng-src=\"{{ user.picture.h64 || user.picture.original || '/images/default.png' }}\" alt=\"{{ user.name }}\"></a></li><li class=more ng-show=\"bundle.collectors.length > (mobile ? 3 : 5)\">{{bundle.collectors.length - (mobile ? 3 : 5)}}+</li></ul></div></div><div class=\"right bln-sharebuttons\"><ul><li class=darker><a title=Shortlink class=\"bln-icon bln-icon-budicon-43\" tooltiptoggle=\"\" tooltiptoggle-template=shorturl tooltiptoggle-size=small tooltiptoggle-select=.textselect tooltiptoggle-style=bottom:30px; tooltiptoggle-scope={absoluteUrl:absoluteUrl} ng-class=\"{ 'active': tooltipActive }\"></a></li><li><a title=\"Share with Twitter\" class=\"bln-icon bln-icon-budicon-14\" ng-click=shareWithTwitter()></a></li><li><a title=\"Share with LinkedIn\" class=\"bln-icon bln-icon-budicon-45\" ng-click=shareWithLinkedin()></a></li></ul></div></div></section><section ng-show=\"bundle.author._id === user._id && bundle.archivedItems.length > 0\"><div class=\"bln-bundleitem bln-bundleitem-footer bln-bundleitem-title\"><h2>Only you can see the links archived in this bundle</h2></div><div ng-repeat=\"item in bundle.archivedItems\"><template-item item=item bundle=bundle template=\"'partials/bundle/archive/items/'+item.type+'.html?v=' + BLN_BUILD_TIMESTAMP\"></template-item></div></section><section class=\"bln-bundleitem bln-horslider bln-horslider-bundles\" scroll-buttons=\"\" overflown=\"\" overflown-element=\"> ul\" scroll-status=\"\" scroll-status-element=\"> ul\" ng-show=\"bundle.original_bundle || bundle.rebundles.length > 0 || bundle.related_bundles.length > 0\"><div class=\"shadowbar shadowbar-left\" ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.left}\"></div><div class=\"shadowbar shadowbar-right\" ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.right}\"></div><a class=\"bln-scrollarrow bln-scrollarrow-right\" ng-click=scrollRight() ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.right}\"></a> <a class=\"bln-scrollarrow bln-scrollarrow-left\" ng-click=scrollLeft() ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.left}\"></a><ul scrolling-element=\"\"><li ng-if=bundle.original_bundle><partial name=bundletile scope=\"{'bundle': bundle.original_bundle, 'relation': 'original_bundle', 'editable': user.hasRole('beta', 'admin') && bundle.author._id === user._id, 'type': 'related'}\"></partial></li><li ng-repeat=\"bundle in bundle.related_bundles\" ng-class=\"{'separator': $index === 0}\"><partial name=bundletile scope=\"{'bundle': bundle, 'editable': user.hasRole('beta', 'admin') && bundle.author._id === user._id, 'type': 'related'}\"></partial></li></ul></section><section class=\"bln-bundleitem bln-bundleitem-footer bln-bundleitem-bigspace\"><div class=bln-bundleitemcontent><p class=\"bln-paragraph bln-paragraph-mention\">Do you know of some great content out there? <a tooltiptoggle=\"!user.hasRole('beta', 'admin')\" tooltiptoggle-template=beta tooltiptoggle-angle=top tooltiptoggle-scope=\"{login: login, user: user}\" ng-click=\"user.hasRole('beta', 'admin') && createBundle()\">Create</a> a new bundle  and share collections of links about your favorite subjects!</p><div class=bln-buttonset><a class=\"bln-button bln-button-primary\" tooltiptoggle=\"!user.hasRole('beta', 'admin')\" tooltiptoggle-template=beta tooltiptoggle-angle=top tooltiptoggle-scope=\"{login: login, user: user}\" tooltiptoggle-style=\"bottom: 70px;\" ng-click=\"user.hasRole('beta', 'admin') && createBundle()\">Create your bundle</a> </div></div></section></footer></div></article>"
  );


  $templateCache.put('views/app/view_profile.html',
    "<article class=\"bln-horizontal bln-horizontal-profile\" auto-horizontal-scroll=\"\" scroll-end-callback=loadBundles() overflown=\"\" scroll-status=\"\" scroll-buttons-ie=\"\"><div class=\"shadowbar shadowbar-right\" ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.right}\"></div><a ng-show=ie class=\"bln-scrollarrow bln-scrollarrow-right\" ng-click=scrollRight() ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.right}\"></a> <a ng-show=ie class=\"bln-scrollarrow bln-scrollarrow-left\" ng-click=scrollLeft() ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.left}\"></a> <state-animation class=\"bln-stateanimation bln-statenaimation-profile fade move-right\" leave-delay=650 enter-delay=250><section class=\"bln-profilebar bln-profilebar-show\"><header><header><figure class=bln-avatar ng-style=\"{'background-image': 'url(' + (profile.picture.h128 || profile.picture.original || '/images/default.png') + ')'}\"></figure><a ng-if=\"user._id !== profile._id\" class=\"followbutton bln-button bln-button-secondary bln-button-lesspadding\" ng-click=switchFollow()><span ng-show=!followsAuthor tooltiptoggle=!user.loggedIn tooltiptoggle-template=signin-to-use tooltiptoggle-angle=right tooltiptoggle-scope=\"{login: login, user: user}\" tooltiptoggle-style=\"margin-left: 15px; margin-top: -32px;\" tooltiptoggle-hide-if=user tooltiptoggle-do-if=user tooltiptoggle-do-action=follow>Follow me</span> <span ng-show=followsAuthor>Following</span></a> <a class=\"followbutton bln-editbutton\" ng-if=\"user._id === profile._id\" side-extension-toggle=settingsMenu><span class=\"bln-icon bln-icon-greybutton bln-icon-budicon-56\"></span></a></header><article><h3>{{ profile.name }}</h3><p class=bln-paragraph twitter-bio-content=profile.bio urls=profile.bio_urls user-mentions=profile.bio_user_mentions></p></article><footer><ul class=\"bln-statistics bln-statistics-inverted\"><li><a ui-sref=app.view_profile.published({profileScreenName:profileScreenName})>{{ profile.published_bundle_count || 0 }}<span>bundles</span></a></li><li><a ui-sref=app.view_profile.collects({profileScreenName:profileScreenName})>{{ profile.collected_bundles.length || 0 }}<span>collects</span></a></li></ul></footer></header><article><ul><li><a class=location><span class=bln-icon>r</span> {{ profile.location || '-'}}</a></li><li><a ng-href=\"{{'http://www.twitter.com/' + profile.username}}?ref=bundlin\" target=_blank><span class=bln-icon>#</span> @{{ profile.username }}</a></li><li><a ng-href=\"{{profile.website_url | addRefToUrl }}\" target=_blank><span class=bln-icon>U</span> {{ profile.website || '-' }}</a></li></ul></article><footer class=bln-spirit ng-if=profile.spiritgif><span>Spirit gif</span> <img ng-src=\"{{ profile.spiritgif }}\" alt=Spirit></footer></section></state-animation><ul state-animation=\"\" class=\"bln-tabs bln-stateanimation fade move-down\" leave-delay=450 enter-delay=450 dropdown-toggler=\"\"><li ng-class=\"{ 'bln-state-active': ('app.view_profile.bundles' | isState) }\"><a ui-sref=app.view_profile.bundles({profileScreenName:profileScreenName}) ui-sref-active=bln-state-active>Bundles</a></li><li ng-class=\"{ 'bln-state-active': ('app.view_profile.published' | isState) }\"><a ui-sref=app.view_profile.published({profileScreenName:profileScreenName}) ui-sref-active=bln-state-active>Published</a></li><li ng-class=\"{ 'bln-state-active': ('app.view_profile.unpublished' | isState) }\" ng-if=\"user._id === profile._id\"><a ui-sref=app.view_profile.unpublished({profileScreenName:profileScreenName}) ui-sref-active=bln-state-active>Unpublished</a></li><li ng-class=\"{ 'bln-state-active': ('app.view_profile.collects' | isState) }\"><a ui-sref=app.view_profile.collects({profileScreenName:profileScreenName}) ui-sref-active=bln-state-active>Collected</a></li></ul><section ui-view=bundles class=bln-feed id=first-content></section><div class=bln-pageloader ng-class=\"{' bln-pageloader-disabled': pageLoading === 'loaded' }\"><span class=\"bln-icon bln-icon-loading bln-icon-loading-gray\"><span></span> <span></span> <span></span></span></div></article>"
  );


  $templateCache.put('views/app/view_profile_bundles.html',
    "<ul ng-show=bundles.length><li ng-repeat=\"bundle in bundles\"><state-animation class=\"bln-stateanimation fade\" enter-delay=\"{{ 750 + 200 * bundle.loadIndex}}\" style=\"height: 100%\"><partial name=bundletile scope=\"{'bundle': bundle, 'type': 'home'}\"></partial></state-animation></li></ul><div class=\"bln-nocontent bln-stateanimation fade\" ng-if=\"generalLoading === 'loaded' && !bundles.length\" state-animation=\"\" leave-delay=650 enter-delay=250><p ng-if=\"'app.view_profile.bundles' | isState\"><span ng-if=\"profile._id === user._id\">Go on, make some bundles! Duurt lang.</span> <span ng-if=\"profile._id !== user._id\">{{profile.name}} has not done anything on Bundlin yet.</span></p><p ng-if=\"'app.view_profile.collects' | isState\"><span ng-if=\"profile._id === user._id\">It seems you've not yet found the collect button.</span> <span ng-if=\"profile._id !== user._id\">{{profile.name}} has not collected any Bundles yet.... I know right!</span></p><p ng-if=\"'app.view_profile.published' | isState\"><span ng-if=\"profile._id === user._id\">What are you waiting for? Make some awesome Bundles.</span> <span ng-if=\"profile._id !== user._id\">{{profile.name}} hasn't made any Bundles yet.</span></p><p ng-if=\"'app.view_profile.unpublished' | isState\">Keeping your profile nice and clean are we?</p></div>"
  );


  $templateCache.put('views/layouts/app.html',
    "<div class=bln-app id=top sidebar-state=\"\" sideextension-state=\"\" ng-class=\"{\r" +
    "\n" +
    "        'bln-state-sidebaractive': sidebarIsActive,\r" +
    "\n" +
    "        'bln-state-sideextensionactive': sideextensionIsActive,\r" +
    "\n" +
    "        'bln-state-modalactive': modalIsActive\r" +
    "\n" +
    "    }\"><sidebar></sidebar><main class=page ui-view=\"\" set-window=height></main></div>"
  );


  $templateCache.put('views/partials/bundle/archive/items/android_application.html',
    "<section class=\"bln-bundleitem bln-bundleitem-archivedlink bln-bundleitem-archivedlink-application bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><a href=\"{{bundle._sid | bundleItemLink:item._sid}}\" target=_blank><h2>{{ item.fields.title }}</h2><p><span class=\"bln-icon bln-icon-android bln-icon-android-logo\"></span> {{ item.fields.creator_name }}</p></a><figure ng-class=\"{ 'empty': !item.fields.icon.original }\"><div class=image ng-style=\"{'background-image': 'url(' + item.fields.icon.original + ')'}\"></div></figure></div></section>"
  );


  $templateCache.put('views/partials/bundle/archive/items/apple_application.html',
    "<section class=\"bln-bundleitem bln-bundleitem-archivedlink bln-bundleitem-archivedlink-application bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><a href=\"{{bundle._sid | bundleItemLink:item._sid}}\" target=_blank><h2>{{ item.fields.title }}</h2><p><span class=\"bln-icon bln-icon-apple bln-icon-apple-logo\"></span> {{ item.fields.creator_name }}</p></a><figure ng-class=\"{ 'empty': !item.fields.icon.original }\"><div class=image ng-style=\"{'background-image': 'url(' + item.fields.icon.original + ')'}\"></div></figure></div></section>"
  );


  $templateCache.put('views/partials/bundle/archive/items/article.html',
    "<section class=\"bln-bundleitem bln-bundleitem-archivedlink bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><a href=\"{{bundle._sid | bundleItemLink:item._sid}}\" target=_blank><h2>{{ item.fields.title }}</h2></a><figure ng-class=\"{ 'border': item.fields.background_is_white && item.fields.picture.original, 'empty': !item.fields.picture.original }\"><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.h500 || item.fields.picture.original) + ')'}\"></div></figure></div></section>"
  );


  $templateCache.put('views/partials/bundle/archive/items/dribbble_shot.html',
    "<section class=\"bln-bundleitem bln-bundleitem-archivedlink bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><a href=\"{{bundle._sid | bundleItemLink:item._sid}}\" target=_blank><h2 truncate=\"\">{{ item.fields.title }}</h2><p><span class=\"bln-icon bln-icon-dribbble bln-icon-budicon-47\"></span> {{ item.fields.author.name }}</p></a><figure><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.h500 || item.fields.picture.original) + ')'}\"></div></figure></div></section>"
  );


  $templateCache.put('views/partials/bundle/archive/items/googlemaps.html',
    "<section class=\"bln-bundleitem bln-bundleitem-archivedlink bln-bundleitem-archivedlink-googlemaps bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><a href=\"{{bundle._sid | bundleItemLink:item._sid}}\" target=_blank><h2>{{ item.fields.name }}</h2><p>- {{ item.fields.address.country }}</p></a><figure ng-class=\"{ 'empty': !item.fields.picture.original }\"><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.h500 || item.fields.picture.original) + ')'}\"></div></figure></div></section>"
  );


  $templateCache.put('views/partials/bundle/archive/items/quote.html',
    "<section class=\"bln-bundleitem bln-bundleitem-archivedlink bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><h2>{{ item.fields.quote }}</h2></div></section>"
  );


  $templateCache.put('views/partials/bundle/archive/items/soundcloud.html',
    "<section class=\"bln-bundleitem bln-bundleitem-archivedlink bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><a href=\"{{bundle._sid | bundleItemLink:item._sid}}\" target=_blank><h2 truncate=\"\">{{ item.fields.title }}</h2><p><span class=\"bln-icon bln-icon-soundcloud bln-icon-soundcloud-logo\"></span> {{ item.fields.creator_name }}</p></a><figure ng-class=\"{ 'empty': !item.fields.picture.original }\"><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.h500 || item.fields.picture.original) + ')'}\"></div></figure></div></section>"
  );


  $templateCache.put('views/partials/bundle/archive/items/twitter_profile.html',
    "<section class=\"bln-bundleitem bln-bundleitem-archivedlink bln-bundleitem-archivedlink-twitterprofile bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><a href=\"{{bundle._sid | bundleItemLink:item._sid}}\" target=_blank><h2 truncate=\"\">{{ item.fields.name }}</h2><p><span class=\"bln-icon bln-icon-twitter bln-icon-budicon-14\"></span> @{{ item.fields.username }}</p></a><figure ng-class=\"{ 'empty': !item.fields.picture.original }\"><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.h500 || item.fields.picture.original) + ')'}\"></div></figure></div></section>"
  );


  $templateCache.put('views/partials/bundle/archive/items/twitter_tweet.html',
    "<section class=\"bln-bundleitem bln-bundleitem-archivedlink bln-bundleitem-archivedlink-twittertweet bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><a href=\"{{bundle._sid | bundleItemLink:item._sid}}\" target=_blank><h2>{{ item.fields.content }}</h2></a><figure><div class=image ng-style=\"{'background-image': 'url(' + item.fields.author.picture.original + ')'}\"></div></figure></div></section>"
  );


  $templateCache.put('views/partials/bundle/archive/items/vimeo.html',
    "<section class=\"bln-bundleitem bln-bundleitem-archivedlink bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><a href=\"{{bundle._sid | bundleItemLink:item._sid}}\" target=_blank><h2 truncate=\"\">{{ item.fields.title }}</h2><p><span class=\"bln-icon bln-icon-vimeo bln-icon-budicon-15\"></span> {{ item.fields.creator_name }}</p></a><figure ng-class=\"{ 'empty': !item.fields.icon.original }\"><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.h500 || item.fields.picture.original) + ')'}\"></div></figure></div></section>"
  );


  $templateCache.put('views/partials/bundle/archive/items/vine_video.html',
    "<section class=\"bln-bundleitem bln-bundleitem-archivedlink bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><a href=\"{{bundle._sid | bundleItemLink:item._sid}}\" target=_blank><h2 truncate=\"\">{{ item.fields.title }}</h2><p><span class=\"bln-icon bln-icon-vine bln-icon-vine-logo\"></span> {{ item.fields.author.name }}</p></a><figure ng-class=\"{ 'empty': !item.fields.icon.original }\"><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.h500 || item.fields.picture.original) + ')'}\"></div></figure></div></section>"
  );


  $templateCache.put('views/partials/bundle/archive/items/youtube.html',
    "<section class=\"bln-bundleitem bln-bundleitem-archivedlink bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><a href=\"{{bundle._sid | bundleItemLink:item._sid}}\" target=_blank><h2 truncate=\"\">{{ item.fields.title }}</h2><p><span class=\"bln-icon bln-icon-youtube bln-icon-youtube-logo\"></span> {{ item.fields.creator_name }}</p></a><figure ng-class=\"{ 'empty': !item.fields.icon.original }\"><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.h500 || item.fields.picture.original) + ')'}\"></div></figure></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/items/android_application.html',
    "<section class=bln-bundleitem><div class=bln-bundleitemcontent><div class=bln-application><div class=header><div class=app><img ng-src=\"{{ item.fields.icon.original || '/images/default.png' }}\" alt=\"{{ item.fields.title }}\"></div><div class=info><p class=title><a ng-href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" target=_blank class=link><span ng-bind=item.fields.title class=text></span></a></p><p class=\"type type-android\"><span class=\"bln-icon bln-icon-inline bln-icon-android-logo\"></span> <span class=creator>{{ item.fields.creator_name }}</span></p></div><div class=button><a href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" target=_blank class=\"bln-button bln-button-primary bln-button-installapp\">Install</a></div></div><div class=description expandable=\"\"><p class=expand truncate=\"\" truncate-after=a.bln-readmore>{{ item.fields.description }} <a class=\"bln-readmore bln-readmore-text bln-readmore-truncate compile\" ng-click=expand()>Continue reading <span class=\"bln-icon bln-icon-budicon-1 bln-icon-inline\" style=padding-bottom:0></span></a></p></div><div class=\"bln-horslider bln-horslider-screenshots\" overflown=\"\" overflown-element=\"> ul\" ng-click=\"active = true\" ng-class=\"{'active': active}\" scroll-status=\"\" scroll-status-element=\"> ul\"><div class=\"shadowbar shadowbar-left\" ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.left}\"></div><div class=\"shadowbar shadowbar-right\" ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.right}\"></div><div class=hover></div><ul><li ng-repeat=\"screenshot in item.fields.screenshots\"><img ng-src=\"{{ screenshot.original || '/images/default.png' }}\" alt=\"App screenshot {{$index}}\"></li></ul></div></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/items/apple_application.html',
    "<section class=bln-bundleitem><div class=bln-bundleitemcontent><div class=bln-application><div class=header><div class=app><img ng-src=\"{{ item.fields.icon.original || '/images/default.png' }}\" alt=\"{{ item.fields.title }}\"></div><div class=info><p class=title><a ng-href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" target=_blank class=link><span ng-bind=item.fields.title class=text></span></a></p><p class=\"type type-apple\"><span class=\"bln-icon bln-icon-inline bln-icon-apple-logo\"></span> <span class=creator>{{ item.fields.creator_name }}</span></p></div><div class=button><a href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" class=\"bln-button bln-button-primary bln-button-installapp\">Install</a></div></div><div class=description expandable=\"\"><p class=expand truncate=\"\" truncate-after=a.bln-readmore><span ng-bind-html=\"item.fields.description | bundlinRaw\"></span> <a class=\"bln-readmore bln-readmore-text bln-readmore-truncate compile\" ng-click=expand()>Continue reading <span class=\"bln-icon bln-icon-budicon-1 bln-icon-inline\" style=padding-bottom:0></span></a></p></div><div class=\"bln-horslider bln-horslider-screenshots\" overflown=\"\" overflown-element=\"> ul\" ng-click=\"active = true\" ng-class=\"{'active': active}\" scroll-status=\"\" scroll-status-element=\"> ul\"><div class=\"shadowbar shadowbar-left\" ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.left}\"></div><div class=\"shadowbar shadowbar-right\" ng-class=\"{'active': overflown.horizontal && scrollStatus && !scrollStatus.horizontal.scroll.right}\"></div><div class=hover></div><ul><li ng-repeat=\"screenshot in item.fields.screenshots\"><img ng-src=\"{{ screenshot.original || '/images/default.png' }}\" alt=\"App screenshot {{$index}}\"></li></ul></div></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/items/article-figureleft.html',
    "<section class=\"bln-bundleitem bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><p></p><a ng-href=\"{{bundle._sid | bundleItemLink:item._sid}}\" target=_blank class=link><header class=header><h2 class=title><span ng-bind=item.fields.title class=text></span></h2></header><figure ng-class=\"{'border': item.fields.background_is_white || !item.fields.picture.original}\"><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.h500 || item.fields.picture.original) + ')'}\"></div></figure></a><div ng-include=\"'/views/partials/bundle/default/partials/comment_description.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/items/article-high.html',
    "<section class=\"bln-bundleitem bln-bundleitem-high\"><div class=bln-bundleitemcontent><a ng-href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" target=_blank class=link><header class=header><h2 class=\"title title-big\"><span ng-bind=item.fields.title class=text></span></h2></header><figure ng-class=\"{'border': item.fields.background_is_white || !item.fields.picture.original, 'higher': !mobile}\"><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.h500 || item.fields.picture.original) + ')'}\"></div></figure></a><div ng-include=\"'/views/partials/bundle/default/partials/comment_description.html?v=' + BLN_BUILD_TIMESTAMP\" ng-init=\"wide = true\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/items/article-noimage.html',
    "<section class=bln-bundleitem><div class=bln-bundleitemcontent><a ng-href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" target=_blank class=link><header class=header><h2 class=title><span ng-bind=item.fields.title class=text></span></h2></header></a><div ng-include=\"'/views/partials/bundle/default/partials/comment_description.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/items/article.html',
    "<section class=bln-bundleitem><div class=bln-bundleitemcontent><a ng-href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" target=_blank class=link><header class=header><h2 class=\"title title-big\"><span ng-bind=item.fields.title class=text></span></h2></header><figure ng-class=\"{'border': item.fields.background_is_white || !item.fields.picture.original, 'higher': !mobile}\"><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.h500 || item.fields.picture.original) + ')'}\"></div></figure></a><div ng-include=\"'/views/partials/bundle/default/partials/comment_description.html?v=' + BLN_BUILD_TIMESTAMP\" ng-init=\"wide = true\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/items/dribbble_shot.html',
    "<div class=bln-bundleitem><div class=bln-bundleitemcontent><div class=bln-dribbbleshot><div class=\"bln-dribbbleshotauthor header\"><img ng-src=\"{{item.fields.author.picture.original || '/images/default.png'}}\" alt={{item.fields.author.name}}> <a ng-href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" target=_blank class=link><span class=\"title text\" ng-bind=item.fields.title></span><br></a> <span class=\"bln-icon bln-icon-budicon-47 bln-icon-inline\"></span><a ng-href=\"{{'http://dribbble.com/' + item.fields.author.username}}\" class=author ng-bind=item.fields.author.name></a></div><div class=bln-dribbbleshotcontent><figure><img ng-src=\"{{item.fields.picture.h500 || item.fields.picture.original || '/images/default.png'}}\" alt={{item.fields.title}}></figure></div></div><div ng-include=\"'/views/partials/bundle/default/partials/comment_description.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></div>"
  );


  $templateCache.put('views/partials/bundle/default/items/googlemaps.html',
    "<section class=\"bln-bundleitem bln-bundleitem-map\"><div class=bln-bundleitemcontent ng-init=\"item.fields.streetview_is_available = true\"><switch vars=map,street default disableactives=\"\"><header class=header><div class=bln-row><div class=\"cell stretch maxwidth\"><a ng-href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" target=_blank class=link><h2 class=title><span ng-bind=item.fields.name class=text></span></h2><p class=bln-bundleitemsubtitle ng-show=\"item.fields.address.city || item.fields.address.state\">{{ item.fields.address.city + (item.fields.address.city && item.fields.address.state ? ' (' + item.fields.address.state + ')' : '') + (!item.fields.address.city && item.fields.address.state ? ' ' + item.fields.address.state : '') }}</p></a></div><div class=\"cell last bottom\"><button class=\"bln-button bln-button-switch\" ng-class=\"{'bln-button-wannabe bln-button-switch-googlemaps bln-button-switch-bigger': switches.map}\" ng-click=\"switch('map')\"><span class=\"bln-icon bln-icon-budicon-67\"></span></button> <button class=\"bln-button bln-button-switch\" ng-show=item.fields.streetview_is_available ng-class=\"{'bln-button-wannabe bln-button-switch-streetview bln-button-switch-bigger': switches.street}\" ng-click=\"switch('street')\"><span class=\"bln-icon bln-icon-budicon-66\"></span></button></div></div></header><figure class=bln-finger><div googlemaps=\"\" latitude=\"{{item.fields.latitude || '0'}}\" longitude=\"{{item.fields.longitude || '0'}}\" name=\"{{item.fields.name || 'unknown'}}\" zoom=\"{{item.fields.zoom || '11'}}\" mode=\"{{ switches.street ? 'street' : 'map' }}\" set-streetview-availability-to=item.fields.streetview_is_available class=bln-map></div></figure></switch><div class=bln-address ng-show=\"item.fields.address.city || item.fields.website || item.fields.phone_number\"><ul><li class=address ng-if=item.fields.address.city>{{ item.fields.address.city + (item.fields.address.street ? ', ' + item.fields.address.street : '') + (item.fields.address.street && item.fields.address.housenumber ? ' ' + item.fields.address.housenumber : '') + (item.fields.address.zipcode ? ' (' + item.fields.address.zipcode + ')' : '') }}</li><li class=website ng-if=item.fields.website><a href={{item.fields.website}} target=_blank><span class=\"bln-icon bln-icon-beforeline bln-icon-budicon-46\"></span> <span class=website-content simplify-website=\"\" content=item.fields.website></span></a></li><li class=phone ng-if=item.fields.phone_number><a ng-href=tel:{{item.fields.phone_number}}><span class=\"bln-icon bln-icon-beforeline bln-icon-budicon-65\"></span> {{item.fields.phone_number}}</a></li></ul></div><div ng-include=\"'/views/partials/bundle/default/partials/comment.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/items/quote.html',
    "<div class=bln-bundleitem><div class=bln-bundleitemcontent><blockquote class=bln-quote><p class=bln-quotetext>{{ item.fields.quote }}</p><p class=bln-quoteauthor ng-show=item.fields.quote_author>{{ item.fields.quote_author }}</p></blockquote></div></div>"
  );


  $templateCache.put('views/partials/bundle/default/items/soundcloud.html',
    "<section class=bln-bundleitem><div class=bln-bundleitemcontent><div class=\"bln-iframewrapper bln-iframewrapper-soundcloud\"><figure><iframe scrolling=no frameborder=no ng-src=\"{{ 'https://w.soundcloud.com/player/?url=' + item.fields.uri + '?auto_play=false&hide_related=true&show_reposts=false&visual=false&color=32B38C&show_artwork=true&show_comments=false' + (template.small ? '&visual=true' : '') }}\"></iframe></figure></div><div ng-include=\"'/views/partials/bundle/default/partials/comment.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/items/twitter_profile.html',
    "<section class=bln-bundleitem><div class=bln-bundleitemcontent><div class=\"bln-twitterprofile bln-twitterprofile-layer\" ng-style=\"{'background-color': '#' + item.fields.color, 'background-image': 'url(' + item.fields.cover_picture.original + ')'}\"><div class=background></div><div class=shadow></div><div class=content><a ng-href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" target=_blank class=link><img ng-src=\"{{ item.fields.picture.h500 || item.fields.picture.original || '/images/default.png' }}\" alt={{item.fields.name}}><header class=header><p class=name><span class=\"bln-icon bln-icon-budicon-14 bln-icon-inline\"></span> <span class=\"title text\">{{item.fields.name}}</span></p></header></a><p class=bio twitter-bio-content=item.fields.bio urls=item.fields.bio_urls user-mentions=item.fields.bio_user_mentions></p><div class=meta><span class=\"bln-icon bln-icon-budicon-17\" ng-if=\"item.fields.location && item.fields.location.length > 0\"></span> <span>{{item.fields.location}}</span> <span class=\"bln-icon bln-icon-budicon-46\" ng-if=\"item.fields.website && item.fields.website.length > 0\"></span> <a href={{item.fields.website}} target=_blank simplify-website=\"\" content=item.fields.website></a></div></div></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/items/twitter_tweet.html',
    "<section class=bln-bundleitem><div class=bln-bundleitemcontent><div class=bln-tweet><header class=\"bln-tweetauthor header\"><a ng-href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" target=_blank class=link><img ng-src=\"{{ item.fields.author.picture.original || '/images/default.png' }}\" alt=\"{{ item.fields.author.name }}\"> <span ng-bind=item.fields.author.name class=\"title text\"></span></a></header><div class=bln-tweetcontent><p twitter-tweet-content=item.fields.content urls=item.fields.urls media=item.fields.media user-mentions=item.fields.user_mentions hashtags=item.fields.hashtags></p><figure ng-repeat=\"medium in item.fields.media\" ng-if=\"medium.type === 'photo'\"><img ng-src=\"{{ medium.url.original }}\" alt=\"Tweet picture {{$index}}\"></figure></div><div class=bln-tweetmeta><span class=\"metapart left\">{{ item.fields.created_at | bundlinDate }}</span> <span class=\"bln-icon bln-icon-budicon-14 bln-icon-inline\"></span> <a ng-href=\"{{ 'http://twitter.com/' + item.fields.author.username }}\" target=_blank class=\"metapart right\">@{{item.fields.author.username}}</a></div></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/items/vimeo.html',
    "<section class=bln-bundleitem><div class=bln-bundleitemcontent><a ng-href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" target=_blank class=link><header class=header><h2 class=title><span ng-bind=item.fields.title class=text></span></h2></header></a><div class=\"bln-iframewrapper bln-iframewrapper-video\"><figure ng-style=\"{'padding-bottom': (1 / (item.fields.aspect_ratio || 16/9) * 100) + '%' }\"><iframe ng-src=\"{{ '//player.vimeo.com/video/' + item.fields.video_id + '?color=32b38c&portrait=0&title=0&byline=0&badge=0&autoplay=0' }}\" class=bln-video webkitallowfullscreen=\"\" mozallowfullscreen=\"\" allowfullscreen></iframe></figure></div><div ng-include=\"'/views/partials/bundle/default/partials/comment.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/items/vine_video.html',
    "<section class=bln-bundleitem><div class=bln-bundleitemcontent><div class=bln-vine><header class=\"bln-vineauthor header\"><a ng-href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" target=_blank class=link><img ng-src=\"{{ item.fields.author.picture.original || '/images/default.png' }}\" alt={{item.fields.author.name}}> <span ng-bind=item.fields.author.name class=\"title text\"></span></a></header><div class=bln-vinecontent><p ng-bind=item.fields.title></p><div class=\"bln-iframewrapper bln-iframewrapper-vine\"><figure><iframe ng-src=\"{{ 'https://vine.co/v/' + item.fields.video_id + '/embed/simple' }}\" reload-on-resize=\"\" frameborder=0></iframe><script async src=//platform.vine.co/static/scripts/embed.js charset=utf-8></script></figure></div></div><div class=bln-vinemeta><span class=\"metapart left\">{{ item.fields.created_at | bundlinDate }}</span> <span class=\"bln-icon bln-icon-vine-logo bln-icon-inline\"></span> <a ng-href=\"{{ item.fields.author.url }}\" target=_blank class=\"metapart right\">{{item.fields.author.username}}</a></div></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/items/youtube.html',
    "<section class=bln-bundleitem><div class=bln-bundleitemcontent><a ng-href=\"{{ bundle._sid | bundleItemLink:item._sid }}\" target=_blank class=link><header class=header><h2 class=title><span ng-bind=item.fields.title class=text></span></h2></header></a><div class=\"bln-iframewrapper bln-iframewrapper-video\"><figure ng-style=\"{'padding-bottom': (1 / (item.fields.aspect_ratio || 16/9) * 100) + '%' }\"><iframe ng-src=\"{{ '//www.youtube.com/embed/' + item.fields.video_id + '?start=' + item.fields.starts_at + '&rel=0;3&autohide=1&showinfo=0'}}\" frameborder=0 class=bln-video webkitallowfullscreen=\"\" mozallowfullscreen=\"\" allowfullscreen></iframe></figure></div><div ng-include=\"'/views/partials/bundle/default/partials/comment.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/default/partials/comment.html',
    "<div class=bln-bundleitemnote ng-if=item.fields.comment><div ng-show=item.fields.comment><ul class=bln-paragraphbuttons><li class=active><img ng-src=\"{{ bundle.author.picture.h64 || bundle.author.picture.original || '/images/default.png' }}\" alt=\"{{ bundle.author.name }}\"></li></ul><p class=\"bln-bundleitemdescription switch-paragraph\"><span class=author>{{ bundle.author.name }}</span> {{ item.fields.comment }}</p></div></div>"
  );


  $templateCache.put('views/partials/bundle/default/partials/comment_description.html',
    "<div class=bln-bundleitemnote ng-if=\"item.fields.comment || item.fields.description\"><switch vars=author,original default disableactives=\"\" ng-show=\"item.fields.comment && item.fields.description\"><ul class=bln-paragraphbuttons ng-class=\"{'bln-paragraphbuttons-horizontal': wide && !mobile}\"><li ng-class=\"{active: switches.author}\"><a ng-click=\"switch('author')\"><img ng-src=\"{{ bundle.author.picture.h64 || bundle.author.picture.original || '/images/default.png' }}\" alt=\"{{ bundle.author.name }}\"></a></li><li ng-class=\"{active: switches.original}\"><a ng-click=\"switch('original')\"><span class=bln-icon>N</span></a></li></ul><p class=bln-bundleitemdescription get-height-of-contentitem=\"\" get-height-of-contentitem-class=active get-height-of-contentitem-watch=\"{{switches.original + ' ' + switches.author}}\"><span class=switch-paragraph ng-class=\"{'active': switches.author}\"><span class=author>{{ bundle.author.name }}</span> {{ item.fields.comment }}</span> <span class=switch-paragraph ng-class=\"{'active': switches.original}\" description-content=item.fields.description></span></p></switch><div ng-show=\"item.fields.comment && !item.fields.description\"><ul class=bln-paragraphbuttons><li class=active><img ng-src=\"{{ bundle.author.picture.h64 || bundle.author.picture.original || '/images/default.png' }}\" alt=\"{{ bundle.author.name }}\"></li></ul><p class=\"bln-bundleitemdescription switch-paragraph\"><span class=author>{{ bundle.author.name }}</span> {{ item.fields.comment }}</p></div><div ng-show=\"item.fields.description && !item.fields.comment\"><p class=bln-bundleitemdescription description-content=item.fields.description></p></div></div>"
  );


  $templateCache.put('views/partials/bundle/default/partials/description.html',
    "<div class=bln-bundleitemnote ng-if=item.fields.description><div ng-show=item.fields.description><p class=bln-bundleitemdescription description-content=item.fields.description></p></div></div>"
  );


  $templateCache.put('views/partials/bundle/default/partials/experienceDescription.html',
    "<div class=bln-bundleitemnote><div ng-show=item.fields.comment><ul class=bln-paragraphbuttons><li class=active><img ng-src=\"{{ bundle.author.picture.h64 || bundle.author.picture.original || '/images/default.png' }}\" alt=\"{{ bundle.author.name }}\"></li></ul><p class=\"bln-bundleitemdescription switch-paragraph\"><span class=author>{{ bundle.author.name }}</span> {{ item.fields.comment }}</p></div><div ng-show=\"item.fields.description && !item.fields.comment\"><p class=bln-bundleitemdescription description-content=item.fields.description></p></div></div>"
  );


  $templateCache.put('views/partials/bundle/default/structures/one-container.html',
    "<template-item item=items[0] bundle=bundle template=templates[0]></template-item>"
  );


  $templateCache.put('views/partials/bundle/default/structures/three-container-alt.html',
    "<div class=bln-bundleitemcontainer><div class=\"containerside containerside-left\"><template-item item=items[0] bundle=bundle template=templates[0] classes=bln-bundleitem-small vars=small></template-item><template-item item=items[1] bundle=bundle template=templates[1] classes=\"bln-bundleitem-small bln-bundleitem-lastincontainer\" vars=small></template-item></div><div class=\"containerside containerside-right\"><template-item item=items[2] bundle=bundle template=templates[2] classes=\"bln-bundleitem-small bln-bundleitem-lastincontainer bln-bundleitem-high\" vars=small></template-item></div></div>"
  );


  $templateCache.put('views/partials/bundle/default/structures/three-container.html',
    "<div class=bln-bundleitemcontainer><div class=\"containerside containerside-left\"><template-item item=items[0] bundle=bundle template=templates[0] classes=\"bln-bundleitem-small bln-bundleitem-lastincontainer bln-bundleitem-high\" vars=small></template-item></div><div class=\"containerside containerside-right\"><template-item item=items[1] bundle=bundle template=templates[1] classes=bln-bundleitem-small vars=small></template-item><template-item item=items[2] bundle=bundle template=templates[2] classes=\"bln-bundleitem-small bln-bundleitem-lastincontainer\" vars=small></template-item></div></div>"
  );


  $templateCache.put('views/partials/bundle/default/structures/two-container.html',
    "<div class=bln-bundleitemcontainer><div class=\"containerside containerside-left\"><template-item item=items[0] bundle=bundle template=templates[0] classes=\"bln-bundleitem-small bln-bundleitem-lastincontainer\" vars=small></template-item></div><div class=\"containerside containerside-right\"><template-item item=items[1] bundle=bundle template=templates[1] classes=\"bln-bundleitem-small bln-bundleitem-lastincontainer\" vars=small></template-item></div></div>"
  );


  $templateCache.put('views/partials/bundle/editor/items/android_application.html',
    "<section class=\"bln-bundleitem bln-bundleitem-create bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><ng-include src=\"'/views/partials/bundle/editor/partials/controls.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include><header class=header><h2 class=title><p class=text>{{ item.fields.title }}</p></h2><p class=bln-bundleitemsubtitle><span class=\"bln-icon bln-icon-android bln-icon-android-logo\"></span> {{ item.fields.creator_name }}</p></header><figure><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.icon.original) + ')'}\"></div></figure><div ng-include=\"'/views/partials/bundle/editor/partials/description.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/editor/items/apple_application.html',
    "<section class=\"bln-bundleitem bln-bundleitem-create bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><ng-include src=\"'/views/partials/bundle/editor/partials/controls.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include><header class=header><h2 class=title><p class=text>{{ item.fields.title }}</p></h2><p class=bln-bundleitemsubtitle><span class=\"bln-icon bln-icon-apple bln-icon-apple-logo\"></span> {{ item.fields.creator_name }}</p></header><figure><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.icon.original) + ')'}\"></div></figure><div ng-include=\"'/views/partials/bundle/editor/partials/description.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/editor/items/article.html',
    "<section class=\"bln-bundleitem bln-bundleitem-create bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><ng-include src=\"'/views/partials/bundle/editor/partials/controls.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include><header class=header><h2 class=title><textarea ng-model=item.fields.title ng-minlength=5 ng-maxlength=80 bundle-item-property=\"\" bundle=bundle item=item property=title></textarea></h2></header><figure ng-class=\"{'border': item.fields.background_is_white || !item.fields.picture.original}\"><a class=bln-bordertoggle ng-class=\"{ 'bln-bordertoggle-active': item.fields.background_is_white }\" ng-click=\"updateItem(item, { fields: { background_is_white: !item.fields.background_is_white }})\"><p>Toggle border</p></a> <div class=bln-row ng-if=\"item.fields.selected_crawled_image_index > -1\"><div class=cell ng-if=item.fields.pictures.length><a href=# class=\"bln-button bln-button-input bln-button-input-imagecontrols\" ng-click=selectPreviousCrawledImage(item)><span class=\"bln-icon bln-icon-budicon-68\"></span></a></div><div class=\"cell stretch\"><a href=# class=\"bln-button bln-button-input bln-button-input-imagecontrols\" ng-click=selectCustomImage(item)>Change</a></div><div class=\"cell last\" ng-if=item.fields.pictures.length><a href=# class=\"bln-button bln-button-input bln-button-input-imagecontrols\" ng-click=selectNextCrawledImage(item)><span class=\"bln-icon bln-icon-budicon-70\"></span></a></div></div><div class=bln-row ng-if=\"item.fields.selected_crawled_image_index < 0\"><div class=\"cell stretch\"><a href=# class=\"bln-button bln-button-input bln-button-input-imagecontrols\" ng-if=!item.fields.pictures.length ng-click=selectCustomImage(item)>Change</a></div><div class=\"cell last\"><a href=# class=\"bln-button bln-button-input bln-button-input-imagecontrols\" ng-if=item.fields.pictures.length ng-click=closeCustomImage(item)><span class=\"bln-icon bln-icon-budicon-5\"></span></a></div></div><span class=\"bln-icon bln-icon-loading\" ng-class=\"{'bln-state-active': item.loading.changepicture}\"><span></span> <span></span> <span></span></span><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.h500 || item.fields.picture.original) + ')'}\"></div></figure><div ng-include=\"'/views/partials/bundle/editor/partials/comment_description.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/editor/items/dribbble_shot.html',
    "<section class=\"bln-bundleitem bln-bundleitem-create bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><ng-include src=\"'/views/partials/bundle/editor/partials/controls.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include><header class=header><h2 class=title><p class=text>{{ item.fields.title }}</p></h2><p class=bln-bundleitemsubtitle><span class=\"bln-icon bln-icon-dribbble bln-icon-budicon-47\"></span> {{ item.fields.author.name }}</p></header><figure><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.original) + ')'}\"></div></figure><div ng-include=\"'/views/partials/bundle/editor/partials/comment_description.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/editor/items/googlemaps.html',
    "<section class=\"bln-bundleitem bln-bundleitem-create bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><ng-include src=\"'/views/partials/bundle/editor/partials/controls.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include><header class=header><h2 class=title><span ng-bind=item.fields.name class=text></span></h2><p class=bln-bundleitemsubtitle ng-show=\"item.fields.address.city || item.fields.address.state\">{{ item.fields.address.city + (item.fields.address.city && item.fields.address.state ? ' (' + item.fields.address.state + ')' : '') + (!item.fields.address.city && item.fields.address.state ? ' ' + item.fields.address.state : '') }}</p></header><figure><div class=image ng-style=\"{ 'background-image': 'url(' + item.fields.picture.original + ')' }\"></div></figure><div ng-include=\"'/views/partials/bundle/editor/partials/comment.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/editor/items/quote.html',
    "<section class=\"bln-bundleitem bln-bundleitem-create\"><ng-include src=\"'/views/partials/bundle/editor/partials/controls_quote.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include><div class=bln-bundleitemcontent><div class=bln-smallform><fieldset><div class=\"bln-inputcontainer bln-inputcontainer-quotetext\"><textarea rows=2 ng-model=item.fields.quote bundle-item-property=\"\" bundle=bundle item=item property=quote class=bln-input></textarea></div><div class=\"bln-inputcontainer bln-inputcontainer-quoteauthor\"><input ng-model=item.fields.quote_author bundle-item-property=\"\" bundle=bundle item=item property=quote_author class=bln-input></div></fieldset></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/editor/items/soundcloud.html',
    "<section class=\"bln-bundleitem bln-bundleitem-create bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><ng-include src=\"'/views/partials/bundle/editor/partials/controls.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include><header class=header><h2 class=title><p class=text>{{ item.fields.title }}</p></h2><p class=bln-bundleitemsubtitle><span class=\"bln-icon bln-icon-soundcloud bln-icon-soundcloud-logo\"></span> {{ item.fields.author.name }}</p></header><figure><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.original) + ')'}\"></div></figure><div ng-include=\"'/views/partials/bundle/editor/partials/comment.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/editor/items/twitter_profile.html',
    "<section class=\"bln-bundleitem bln-bundleitem-create bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><ng-include src=\"'/views/partials/bundle/editor/partials/controls.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include><header class=header><h2 class=title><p class=text>{{ item.fields.name }}</p></h2><p class=bln-bundleitemsubtitle><span class=\"bln-icon bln-icon-twitter bln-icon-budicon-14\"></span> @{{ item.fields.username }}</p></header><figure><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.original) + ')'}\"></div></figure><div ng-include=\"'/views/partials/bundle/editor/partials/description.html?v=' + BLN_BUILD_TIMESTAMP\" ng-init=\"item.fields.description = item.fields.bio\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/editor/items/twitter_tweet.html',
    "<section class=\"bln-bundleitem bln-bundleitem-create bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><ng-include src=\"'/views/partials/bundle/editor/partials/controls.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include><header class=header><h2 class=title><p class=text>{{ item.fields.author.name }}</p></h2><p class=bln-bundleitemsubtitle><span class=\"bln-icon bln-icon-twitter bln-icon-budicon-14\"></span> @{{ item.fields.author.username }}</p></header><figure><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.author.picture.original) + ')'}\"></div></figure><div ng-include=\"'/views/partials/bundle/editor/partials/description.html?v=' + BLN_BUILD_TIMESTAMP\" ng-init=\"item.fields.description = item.fields.content\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/editor/items/vimeo.html',
    "<section class=\"bln-bundleitem bln-bundleitem-create bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><ng-include src=\"'/views/partials/bundle/editor/partials/controls.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include><header class=header><h2 class=title><p class=text>{{ item.fields.title }}</p></h2><p class=bln-bundleitemsubtitle><span class=\"bln-icon bln-icon-vimeo bln-icon-budicon-15\"></span> {{ item.fields.author.username }}</p></header><figure><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.original) + ')'}\"></div></figure><div ng-include=\"'/views/partials/bundle/editor/partials/comment.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/editor/items/vine_video.html',
    "<section class=\"bln-bundleitem bln-bundleitem-create bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><ng-include src=\"'/views/partials/bundle/editor/partials/controls.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include><header class=header><h2 class=title><p class=text>{{ item.fields.author.name }}</p></h2><p class=bln-bundleitemsubtitle><span class=\"bln-icon bln-icon-vine bln-icon-vine-logo\"></span> {{item.fields.author.username}}</p></header><figure><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.original) + ')'}\"></div></figure><div ng-include=\"'/views/partials/bundle/editor/partials/description.html?v=' + BLN_BUILD_TIMESTAMP\" ng-init=\"item.fields.description = item.fields.title\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/editor/items/youtube.html',
    "<section class=\"bln-bundleitem bln-bundleitem-create bln-bundleitem-figureleft\"><div class=bln-bundleitemcontent><ng-include src=\"'/views/partials/bundle/editor/partials/controls.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include><header class=header><h2 class=title><p class=text>{{ item.fields.title }}</p></h2><p class=bln-bundleitemsubtitle><span class=\"bln-icon bln-icon-youtube bln-icon-youtube-logo\"></span> {{item.fields.author.username}}</p></header><figure><div class=image ng-style=\"{'background-image': 'url(' + (item.fields.picture.original) + ')'}\"></div></figure><div ng-include=\"'/views/partials/bundle/editor/partials/comment.html?v=' + BLN_BUILD_TIMESTAMP\"></div></div></section>"
  );


  $templateCache.put('views/partials/bundle/editor/partials/comment.html',
    "<div class=bln-bundleitemnote><ul class=bln-paragraphbuttons><li class=active><img ng-src=\"{{ bundle.author.picture.h64 || bundle.author.picture.original || '/images/default.png' }}\" alt=\"{{ bundle.author.name }}\"></li></ul><p class=\"bln-bundleitemdescription switch-paragraph\"><textarea name=itemDescription class=\"bln-input bln-input-spooky bln-input-area bln-input-area-bundleitem bln-input-full\" ng-model=item.fields.comment placeholder=\"What do you want tell your audience about this item?\" bundle-item-property=\"\" bundle=bundle item=item ng-maxlength=250 property=comment></textarea></p></div>"
  );


  $templateCache.put('views/partials/bundle/editor/partials/comment_description.html',
    "<div class=bln-bundleitemnote><switch vars=comment,description default><ul class=bln-paragraphbuttons><li ng-class=\"{active: switches.description}\"><a ng-click=\"switch('description')\"><span class=bln-icon>N</span></a></li><li ng-class=\"{active: switches.comment}\"><a ng-click=\"switch('comment')\"><img ng-src=\"{{bundle.author.picture.h64 || bundle.author.picture.original}}\" alt={{bundle.author.name}}></a></li></ul><p class=bln-bundleitemdescription><span class=switch-paragraph ng-class=\"{'active': switches.comment}\"><textarea name=itemDescription class=\"bln-input bln-input-spooky bln-input-area bln-input-area-bundleitem bln-input-full\" ng-model=item.fields.comment placeholder=\"What do you want tell your audience about this item?\" ng-maxlength=250 bundle-item-property=\"\" bundle=bundle item=item property=comment></textarea></span> <span class=switch-paragraph ng-class=\"{'active': switches.description}\"><span>{{ item.fields.description }}</span></span></p></switch></div>"
  );


  $templateCache.put('views/partials/bundle/editor/partials/controls.html',
    "<div class=bln-controls><div class=bln-row><div ng-class=\"{'hover': item.url, 'nohover': !item.url}\"><div class=\"cell bln-removeitem\"><a ng-click=deleteItem(item)><span class=\"bln-icon bln-icon-budicon-5\"></span> Delete</a></div><div class=\"cell stretch\"><input class=bln-input ng-model=item.url readonly></div></div><div class=\"cell bln-sub-moveicons\" ng-if=\"publishedItems.length > 1 && item.active\"><a ng-click=\"moveItem(item, -1)\" ng-class=\"{'hide': $index === 0}\"><span class=\"bln-icon bln-icon-budicon-2\"></span></a> <a ng-click=\"moveItem(item, 1)\" ng-class=\"{'hide': $index === publishedItems.length - 1}\"><span class=\"bln-icon bln-icon-budicon-1\"></span></a></div><div class=\"cell last\"><button class=\"bln-button bln-button-switch bln-button-switch-archivepublic\" ng-class=\"{'bln-button-wannabe bln-button-switch-green bln-button-public': item.active}\" ng-click=\"!item.active && publishItem(item)\"><span ng-show=item.active>Public</span> <span ng-show=\"!item.active && item.waiting\" class=\"bln-icon bln-icon-budicon-5\"></span> <span ng-show=\"!item.active && !item.waiting\" class=\"bln-icon bln-icon-budicon-42\"></span></button> <button class=\"bln-button bln-button-switch bln-button-switch-archivepublic\" ng-class=\"{'bln-button-wannabe bln-button-switch-red bln-button-archived': !item.active}\" ng-click=\"item.active && archiveItem(item)\"><span ng-show=!item.active>Archived</span> <span ng-show=\"item.active && item.waiting\" class=\"bln-icon bln-icon-budicon-5\"></span> <span ng-show=\"item.active && !item.waiting\" class=\"bln-icon bln-icon-budicon-41\"></span></button></div></div></div>"
  );


  $templateCache.put('views/partials/bundle/editor/partials/controls_quote.html',
    "<div class=bln-controls><div class=bln-row><div ng-class=\"{'hover': item.url, 'nohover': !item.url}\"><div class=\"cell bln-removeitem\"><a ng-click=deleteItem(item)><span class=\"bln-icon bln-icon-budicon-5\"></span> Delete</a></div></div><div class=\"cell stretch\"></div><div class=\"cell bln-sub-moveicons\" ng-if=\"publishedItems.length > 1 && item.active\"><a ng-click=\"moveItem(item, -1)\" ng-class=\"{'hide': $index === 0}\"><span class=\"bln-icon bln-icon-budicon-2\"></span></a> <a ng-click=\"moveItem(item, 1)\" ng-class=\"{'hide': $index === publishedItems.length - 1}\"><span class=\"bln-icon bln-icon-budicon-1\"></span></a></div><div class=\"cell last\"><button class=\"bln-button bln-button-switch bln-button-switch-archivepublic\" ng-class=\"{'bln-button-wannabe bln-button-switch-green bln-button-public': item.active}\" ng-click=\"!item.active && publishItem(item)\"><span ng-show=item.active>Public</span> <span ng-show=\"!item.active && item.waiting\" class=\"bln-icon bln-icon-budicon-5\"></span> <span ng-show=\"!item.active && !item.waiting\" class=\"bln-icon bln-icon-budicon-42\"></span></button> <button class=\"bln-button bln-button-switch bln-button-switch-archivepublic\" ng-class=\"{'bln-button-wannabe bln-button-switch-red bln-button-archived': !item.active}\" ng-click=\"item.active && archiveItem(item)\"><span ng-show=!item.active>Archived</span> <span ng-show=\"item.active && item.waiting\" class=\"bln-icon bln-icon-budicon-5\"></span> <span ng-show=\"item.active && !item.waiting\" class=\"bln-icon bln-icon-budicon-41\"></span></button></div></div></div>"
  );


  $templateCache.put('views/partials/bundle/editor/partials/description.html',
    "<div class=bln-bundleitemnote expandable=\"\"><p class=\"bln-bundleitemdescription switch-paragraph expand\" truncate=\"\" truncate-after=a.bln-readmore><span ng-bind-html=\"item.fields.description | bundlinRaw\"></span> <a class=\"bln-readmore bln-readmore-text bln-readmore-truncate compile\" ng-click=expand()>Continue reading <span class=\"bln-icon bln-icon-budicon-1 bln-icon-inline\" style=padding-bottom:0></span></a></p></div>"
  );


  $templateCache.put('views/partials/bundletile.html',
    "<div class=\"bln-bundletile bln-bundletile-original {{type ? 'bln-bundletile-' + type : ''}}\" expandable=\"\" ng-init=\"!bundle.picture.original && setFocuspointForPlaceholder(bundle)\"><a ui-sref=\"app.view_bundle({ 'bundleId': bundle._sid })\" class=cover><div class=background ng-style=\"{'background-image': 'url(' + (bundle.picture.h600 || bundle.picture.original || '/images/bundle-placeholder.jpg') + ')'}\" focuspicture=\"\" focuspicture-x=\"{{ bundle.picture.focus_x }}\" focuspicture-y=\"{{ bundle.picture.focus_y }}\"></div><div class=shadows><div class=\"layer layer-top\"></div><div class=\"layer layer-bottom\"></div></div><h3 class=title>{{ bundle.title }}</h3><span class=\"bln-icon bln-bundleicon bln-bundleicon-collected\" ng-if=bundle.collectedByCurrentUser></span> <span class=\"bln-icon bln-bundleicon bln-bundleicon-unpublished\" ng-if=bundle.unpublishedByCurrentUser></span></a> <div class=footer><p class=relation ng-if=\"relation === 'original_bundle'\"><span class=\"bln-icon bln-icon-budicon-54 bln-icon-beforeline\"></span> Original</p><ul class=bln-tags ng-if=!relation><li ng-repeat=\"tag in bundle.tags\">{{tag}}</li></ul><p class=comment><span class=commentheader><a class=author ui-sref=\"app.view_profile.bundles({ profileScreenName: bundle.author.username })\"><img ng-src=\"{{ bundle.author.picture.h64 || bundle.author.picture.original || '/images/default.png' }}\" alt=\"{{ bundle.author.name }}\"> <span class=name>{{ bundle.author.name }}</span></a> <a ng-show=\"bundle.author._id == user._id\" ui-sref=\"app.edit_bundle({ 'bundleId': bundle._sid })\" class=bln-editbutton><span class=\"bln-icon bln-icon-greybutton bln-icon-budicon-56\"></span></a></span> <span class=\"description expand\" truncate=\"\" truncate-after=a.bln-readmore>{{ bundle.description }} <a class=\"bln-readmore bln-readmore-truncate compile\" ng-click=expand()></a></span></p></div></div>"
  );


  $templateCache.put('views/partials/modals/modal-ask-email.html',
    "<div class=\"bln-modalcontainer bln-modalcontainer-green\"><article class=\"bln-modal bln-modal-transparent bln-modal-askmail\" modal-ask-email=\"\"><h2 class=\"bln-title bln-title-greenmodal\">Thank you {{ data.user.name }}, for being one of the first Bundlin users.</h2><p class=\"bln-paragraph bln-paragraph-intro bln-paragraph-greenmodal\">We're super excited you want to help us with the development of the buggy beta version. Feel free to contact us on <a href=http://twitter.com/bundlin target=_blank>Twitter</a> or by <a href=mailto:nick@bundlin.com>mail</a> if you have any ideas, requests or found bugs. We appreciate your feedback and will get back to you personally asap. You're currently logged in through Twitter. Please provide us with your email address so we can recover your account in case you forget your password. Don't worry, we won't sell it to secret government agencies.</p><h3 class=\"bln-title bln-title-greenmodal bln-title-smaller\">What is your email address?</h3><form class=bln-row ng-submit=submitEmailForm($event)><div class=\"cell stretch stick\"><input class=\"bln-input bln-input-button bln-input-stick\" placeholder=\"Email address\" ng-model=emailAddress required></div><div class=\"cell last\"><button class=\"bln-button bln-button-input bln-button-input-greenmodal bln-button-input-stick\" ng-class=\"{'bln-button-disabled': !emailAddressValid}\">Save</button></div></form><div class=\"bln-button bln-button-invert bln-button-play\" ng-click=playVideo() ng-if=!videoIsPlaying ng-class=\"{'bln-button-played': videoPlayed}\"><span class=\"bln-icon bln-icon-play-button\"></span> Play Bundlin video</div><div class=\"bln-button bln-button-invert bln-button-stop\" ng-click=stopVideo() ng-if=videoIsPlaying><span class=\"bln-icon bln-icon-stop-button\"></span> Stop Bundlin video</div><section class=\"bln-section bln-section-video\" ng-class=\"{ 'active': videoIsPlaying }\"><div class=\"bln-iframewrapper bln-iframewrapper-video\"><figure><iframe src=\"//player.vimeo.com/video/125583287?color=fff&portrait=0&title=0&byline=0&badge=0&autoplay=0&api=1&player_id=introvideo\" class=bln-video webkitallowfullscreen=\"\" mozallowfullscreen=\"\" allowfullscreen video-status=videoIsPlaying id=modalaskemailvideo></iframe></figure></div></section></article></div>"
  );


  $templateCache.put('views/partials/modals/modal-custom-article-image.html',
    "<div class=bln-modalcontainer><article class=\"bln-modal bln-modal-customarticleimage\" modal-custom-article-image=\"\"><header class=bln-row><div class=\"cell stretch\"><h3 class=bln-title>Choose a photo you like</h3></div><div class=\"cell last\"><p><a href=# ng-click=close()>Close</a></p></div></header><form id=imageForm><div class=bln-row><div class=cell><label for=imageFileUploadButton class=\"bln-button bln-button-upload bln-button-input bln-button-input-small bln-button-input-primary\"><span class=\"bln-icon bln-icon-budicon-75\"></span> Upload</label><input type=file id=imageFileUploadButton ng-model=imageFile class=bln-hidden accept=image/*></div><div class=\"cell stretch last\"><div class=bln-row><div class=\"cell stretch stick\"><input placeholder=\"Paste image link\" class=\"bln-input bln-input-stick bln-input-whitebordered\" ng-model=imageURL></div><div class=\"cell last\"><a href=# class=\"bln-button bln-button-input bln-button-input-stick bln-button-input-small bln-button-input-primary\" ng-class=\"{'bln-button-disabled': !imageURLValid}\" ng-click=setPictureByUrl()>Add</a></div></div></div></div><div class=bln-sub-suggestions ng-show=\"picture.type === 'none' || picture.type === 'suggestion'\"><ul><li ng-repeat=\"suggestion in suggestions\" ng-class=\"{'bln-state-current': picture.data.url === suggestion.imageUrl}\"><figure ng-style=\"{'background-image': 'url(' + suggestion.imageUrl + ')'}\" ng-click=setPictureBySuggestion(suggestion)></figure></li></ul><span class=\"bln-icon bln-icon-loading bln-icon-loading-gray\" ng-class=\"{'bln-state-active': loading.suggestions}\"><span></span> <span></span> <span></span></span></div><div class=bln-sub-imagepreview ng-show=\"picture.type === 'url' || picture.type === 'upload'\"><figure><img src=\"{{ picture.data.base64 || picture.data.url }}\" alt=\"\" id=imagePreview> <a href=\"\" class=\"bln-button bln-button-input bln-button-input-imagecontrols\" ng-click=unsetPicture()><span class=\"bln-icon bln-icon-budicon-5\"></span></a></figure><span class=\"bln-icon bln-icon-loading\" ng-class=\"{'bln-state-active': loading.preview}\"><span></span> <span></span> <span></span></span></div></form><footer><a href=# class=\"bln-button bln-button-primary\" ng-class=\"{'bln-button-disabled': picture.type === 'none'}\" ng-click=close(picture)>Use this photo</a></footer></article></div>"
  );


  $templateCache.put('views/partials/sidebar.html',
    "<aside class=bln-sidebarcontainer ng-class=\"{'bln-state-disablemobile': disableMobileSidebar}\"><a class=bln-sub-toggle ng-click=toggleSidebar() ng-class=\"{'bln-state-ontop': onTop, 'bln-state-open': sidebarIsActive}\"><span class=\"bln-icon bln-icon-darkbutton\"><span class=open>\"</span> <span class=close>f</span></span></a> <nav class=bln-sidebar><ul class=content><li class=group><div class=\"bln-sidebaricon bln-sidebaricon-logo\"><a ui-sref=app.home><figure class=\"image bln-sprite bln-sprite-logo {{generalLoading ? 'bln-sprite-logo-' + generalLoading : ''}}\"></figure><span class=\"bln-icon bln-icon-budicon-4\" ng-if=\"!$state.includes('app.home')\"></span></a></div></li><li class=\"group group-animate\" ng-if=user.loggedIn><div class=\"bln-sidebaricon bln-sidebaricon-avatar\" ng-style=\"{'background-image': 'url(' + (user.picture.h128 || user.picture.original || '/images/default.png') + ')'}\"><a ui-sref=\"app.view_profile.bundles({ profileScreenName: user.username })\"></a></div></li><li class=\"group group-animate\" ng-if=!user.loggedIn><div class=\"bln-sidebaricon bln-sidebaricon-text\"><a title=\"Sign in\" class=text ng-click=login()><span class=\"bln-icon bln-icon-white bln-icon-sidebar bln-icon-budicon-23\"></span> Sign in</a></div></li><li class=top><ul class=\"group group-topmargin group-animate\" ng-if=user.loggedIn><li class=bln-sidebaricon ng-class=\"{'bln-state-active': menuStates.notifications}\"><a side-extension-toggle=notificationsMenu><span class=\"bln-sub-dotlabel bln-sub-dotlabel-horn\" ng-class=\"{ 'bln-state-active': user.hasUnreadNotifications() }\"></span> <span class=\"bln-icon bln-icon-white bln-icon-sidebar bln-icon-budicon-40\"></span></a></li><li class=\"bln-sidebaricon bln-sidebaricon-text bln-sidebaricon-text-small\" ng-class=\"{'bln-state-active': $state.includes('app.edit_bundle')}\"><a ng-click=\"user.hasRole('beta', 'admin') && createBundle()\"><span class=\"bln-icon bln-icon-white bln-icon-sidebar bln-icon-create-bundle-icon\"></span> New bundle</a></li></ul></li><li class=bottom><ul class=\"group group-bottommargin group-animate\" ng-if=user.loggedIn><li class=bln-sidebaricon ng-class=\"{'bln-state-active': menuStates.settings}\"><a side-extension-toggle=settingsMenu><span class=\"bln-icon bln-icon-white bln-icon-sidebar bln-icon-budicon-44\"></span></a></li></ul></li></ul></nav><div ng-if=user.loggedIn><section side-extension=notificationsMenu class=\"bln-sideextension bln-sideextension-notifications\" ng-class=\"{'active': sideextension.state}\"><a href=# ng-click=\"closeSideExtension('notificationsMenu')\" class=bln-sub-closesideextension><span class=\"bln-icon bln-icon-budicon-5 bln-icon-lightbutton\"></span></a><ng-include src=\"'/views/partials/sideextensions/notificationsMenu.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include></section><section side-extension=settingsMenu class=\"bln-sideextension bln-sideextension-settings\" ng-class=\"{'active': sideextension.state}\"><a href=# ng-click=\"closeSideExtension('settingsMenu')\" class=bln-sub-closesideextension><span class=\"bln-icon bln-icon-budicon-5 bln-icon-lightbutton\"></span></a><ng-include src=\"'/views/partials/sideextensions/settingsMenu.html?v=' + BLN_BUILD_TIMESTAMP\"></ng-include></section></div></aside>"
  );


  $templateCache.put('views/partials/sideextensions/defaultMenu.html',
    ""
  );


  $templateCache.put('views/partials/sideextensions/notificationsMenu.html',
    "<div class=bln-notifications notifications=\"\" ng-if=sideextension.render><h2>Your notifications</h2><ul><li class=bln-notification ng-repeat=\"notification in user.notifications\" ng-class=\"{'bln-notification-read' : notification.read}\"><div class=bln-row><div class=cell><figure class=\"bln-avatar bln-avatar-verysmall\" ng-style=\"{'background-image': 'url(' + (notification.type_data.user_image.h64 || '/images/default.png') + ')'}\"></figure></div><div class=\"cell stretch last\"><p><a ui-sref=app.view_profile.bundles({profileScreenName:notification.type_data.user_username})>{{notification.type_data.user_name}}</a> <span ng-if=\"notification.type === 'new_follower'\">is now stalking you</span> <span ng-if=\"notification.type === 'new_collect'\">collected your bundle</span> <span ng-if=\"notification.type === 'follower_published_bundle'\">published</span> <span ng-if=\"notification.type === 'became_beta_user'\">has given you beta access. Feedback? Bring it on!</span> <a ui-sref=\"app.view_bundle({bundleId: notification.type_data.bundle_sid})\" ng-if=notification.type_data.bundle_title>{{notification.type_data.bundle_title}}</a></p></div></div></li></ul></div>"
  );


  $templateCache.put('views/partials/sideextensions/settingsMenu.html',
    "<div class=bln-settings settings=\"\" ng-if=sideextension.render><section class=\"profile bln-state-open\"><a class=bln-accordion ng-click=\"expand('profile')\">Profile</a><form class=\"bln-menuform bln-sub-content\"><ul><li><label>Selfie</label><div><figure class=\"bln-avatar bln-avatar-small bln-avatar-block\" ng-style=\"{'background-image': 'url(' + (user.picture.h128 || user.picture.original || '/images/default.png') + ')'}\"></figure><a ng-click=refreshAvatar()>Reload your Twitter image</a></div></li><li><label>Twitter</label><a ng-href=\"http://twitter.com/{{userProfile.username}}?ref=bundlin\" target=_blank>@{{userProfile.username}}</a></li><li><label for=name>Name</label><input name=name id=name ng-model=userProfile.name ng-blur=\"submitProfile(userProfile.name, 'name', $event)\" placeholder=\"John Doe\"><span class=bln-inputerror>{{ inputErrors.name }}</span></li><li><label for=email>Email</label><input name=email id=email ng-model=userProfile.email ng-blur=\"submitProfile(userProfile.email, 'email', $event)\" placeholder=John.Doe@domain.com><span class=bln-inputerror>{{ inputErrors.email }}</span></li><li><label for=location>Location</label><input name=location id=location ng-model=userProfile.location ng-blur=\"submitProfile(userProfile.location, 'location', $event)\" placeholder=\"Where do {{ userProfile.name ? (userProfile.name | bundlinPlural) : 'you' }} come from?\"><span class=bln-inputerror>{{ inputErrors.location }}</span></li><li><label for=website>Website</label><input name=website id=website ng-model=userProfile.website ng-blur=\"submitProfile(userProfile.website, 'website', $event)\" placeholder=\"your personal site\"><span class=bln-inputerror>{{ inputErrors.website }}</span></li><li><label for=bio>Bio</label><textarea name=bio id=bio cols=30 rows=3 ng-model=userProfile.bio ng-blur=\"submitProfile(userProfile.bio, 'bio', $event)\" placeholder=\"For instance: I'm Batman.\"></textarea><span class=bln-inputerror>{{ inputErrors.bio }}</span></li><li><label for=spiritgif>Spirit gif</label><input name=spiritgif id=spiritgif ng-model=userProfile.spiritgif ng-blur=\"submitProfile(userProfile.spiritgif, 'spiritgif', $event)\" placeholder=\"Define your mindset with a spirit gif\"><span class=bln-inputerror>{{ inputErrors.spiritgif }}</span></li></ul></form></section><section class=about><a class=bln-accordion ng-click=\"expand('about')\">About Bundlin</a><article class=\"bln-menucontent bln-sub-content\"><p>Bundlin bridges the gap between content and users, empowering influencers in the most effortless way they can imagine. Through Bundlin, users can create, share and discover bundles of content curated by people they trust. Our product is still in an early phase of development, but we have elaborate future plans to make it growing into a large content curation platform. Please stay in touch so we can show you what’s up next.</p><p><a href=\"https://vimeo.com/125583287?ref=bundlin\" target=_blank>Check out Bundlin in 90 seconds</a></p><p class=bln-sub-intro>In its essence, content curation is a human process. As a creator, you are at the center of it all. By collecting existing web content and adding context and insight to this content, you can help your audience gain a deeper understanding of a subject you know a ton about. Only by centering our product around the curator, we are able to solve the massive problem of the ever expanding amount of content, offering an innovative way to search through it all.</p><p>Pim & Nick, founders of Bundlin.</p><ul class=bln-faces><li><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'pimverlaan'})\"><img src=/images/avatars/pim.jpg alt=\"Foto Pim Verlaan\"><div><span>Pim Verlaan</span> <span>Founder & design</span></div></a></li><li><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'nrdebruijn'})\"><img src=/images/avatars/nick.jpg alt=\"Foto Nick de Bruijn\"><div><span>Nick de Bruijn</span> <span>Founder</span></div></a></li><li><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'peterpeerdeman'})\"><img src=/images/avatars/peter.jpg alt=\"Foto Peter Peerdeman\"><div><span>Peter Peerdeman</span> <span>Lead Tech</span></div></a></li><li><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'bryantebeek'})\"><img src=/images/avatars/bryan.jpg alt=\"Foto Bryan te Beek\"><div><span>Bryan te Beek</span> <span>Coding</span></div></a></li><li><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'jessedvrs'})\"><img src=/images/avatars/jesse.jpg alt=\"Foto Jesse de Vries\"><div><span>Jesse de Vries</span> <span>Coding</span></div></a></li><li><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'nick_koster'})\"><img src=/images/avatars/nick.k.jpg alt=\"Foto Nick Koster\"><div><span>Nick Koster</span> <span>Coding</span></div></a></li><li><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'takeluutzen'})\"><img src=/images/avatars/take.jpg alt=\"Foto Take Lijzenga\"><div><span>Take Lijzenga</span> <span>Design</span></div></a></li><li><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'llaleon'})\"><img src=/images/avatars/leon.jpg alt=\"Foto Léon Smit\"><div><span>Léon Smit</span> <span>Coding</span></div></a></li><li><a ui-sref=\"app.view_profile.bundles({'profileScreenName':'jannaboekema'})\"><img src=/images/avatars/janna.jpg alt=\"Foto Janna Boekema\"><div><span>Janna Boekema</span> <span>Content strategy</span></div></a></li></ul><h4>Lifely</h4><p><a href=\"http://www.lifely.nl/\" target=_blank>Lifely</a> is the Dutch digital agency that serves as a foundation for Bundlin, founded by Pim Verlaan and Nick de Bruijn in 2013. With an amazing team of six developers, a motion graphic designer, content strategist and two founders who focus on video, ux and concepting, the agency functions as a strong creative family. From an inspiring office in Amsterdam, all family members work their hearts out developing sophisticated systems for a wide variety of clients. Systems that are often placed at the core business of successful companies.</p><p>We believe we can make a difference by combining a deep understanding of business logics with our immense passion for building great products. Lifely reinvests a large part of its revenues in Bundlin and is currently looking for outside investors.</p></article></section><section class=signout><a class=bln-accordion ng-click=\"expand('signout')\">Sign out</a><article class=\"bln-menucontent bln-sub-content\"><p>Are you sure you want to sign out?</p><a ng-click=logout() class=\"bln-button bln-button-primary bln-button-primary-signout\">Yes, but i'll be back<figure class=bln-buttongif></figure></a></article></section></div>"
  );


  $templateCache.put('views/partials/tooltip.html',
    "<div class=bln-tooltipcontainer ng-class=\"{'active': state}\" ng-style=\"{\r" +
    "\n" +
    "    left: position.x + 'px',\r" +
    "\n" +
    "    top: position.y + 'px',\r" +
    "\n" +
    "    width: position.width + 'px',\r" +
    "\n" +
    "    height: position.height + 'px'\r" +
    "\n" +
    "}\"><tooltip angle={{angle}} state={{state}} class=bln-tooltip style={{style}} size={{size}} select-selector={{selectSelector}}><partial name={{template}} scope=scope></partial></tooltip></div>"
  );


  $templateCache.put('views/partials/tooltips/beta.html',
    "<span class=title>Beta access required</span> <span class=text>You can use this functionality when you're allowed to Bundlin's beta.</span>  <span class=\"text strong\" ng-show=tooltiptoggleScope.user.loggedIn><strong>Awesome, you've signed up!</strong></span>  <button class=\"bln-button bln-button-primary\" ng-click=tooltiptoggleScope.login() ng-hide=tooltiptoggleScope.user.loggedIn><span class=\"bln-icon bln-icon-twitter-logo bln-icon-beforeline\"></span> Sign up for the beta</button>"
  );


  $templateCache.put('views/partials/tooltips/bundle-validation.html',
    "<span class=title>Epic Bundle check</span> <span class=text>We want your Bundle to look awesome. Check if it contains the following:</span><hr><ul><li ng-class=\"{'valid': tooltiptoggleScope.title}\">Title</li><li ng-class=\"{'valid': tooltiptoggleScope.description}\">Description</li><li ng-class=\"{'valid': tooltiptoggleScope.picture}\">Cover photo</li><li ng-class=\"{'valid': tooltiptoggleScope.tags}\">Tag(s)</li><li ng-class=\"{'valid': tooltiptoggleScope.items}\">Min 5 - max 8 items</li></ul>"
  );


  $templateCache.put('views/partials/tooltips/shorturl.html',
    "<input class=textselect value=\"{{ tooltiptoggleScope.absoluteUrl }}\" readonly>"
  );


  $templateCache.put('views/partials/tooltips/signin-to-use.html',
    "<span class=title>Sign up to use this</span> <span class=text>Sign up for the beta to use this functionality</span> <button class=\"bln-button bln-button-primary\" ng-click=tooltiptoggleScope.login()><span class=\"bln-icon bln-icon-twitter-logo bln-icon-beforeline\"></span> Sign in with Twitter</button>"
  );

}]);
