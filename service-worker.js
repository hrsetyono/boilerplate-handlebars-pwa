// Handle Offline capability (caching) and Push notification
//
// https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/
'use strict';

const VERSION = '0.1.10';
const CACHE_BASE = 'my-app-';
const STATIC_CACHE = CACHE_BASE + 'static-' + VERSION;
const IMAGES_CACHE = CACHE_BASE + 'images';
const ALL_CACHES = [ STATIC_CACHE, IMAGES_CACHE ];

const IMAGE_URL_INDICATOR = 'files.wordpress.com'; // part of URL that indicate it's image request

var staticFiles = [
  '/',
  '/index.html',

  '/assets/js/framework.js',
  '/assets/js/app.js',
  '/assets/js/app-model.js',
  '/assets/js/app-controller.js',
  '/assets/js/handlebars-setting.js',
  '/assets/js/route.js',

  '/assets/js-vendor/jquery.min.js',
  '/assets/js-vendor/handlebars.min.js',
  '/assets/js-vendor/bundle.min.js',

  '/assets/css/app.css',
  '/assets/css/framework.css',

  '/assets/images/loading.gif',
  '/assets/images/icon-128x128.png',
];


self.addEventListener( 'install', swInstall );
self.addEventListener( 'activate', swActivate );
self.addEventListener( 'fetch', swFetch );

self.addEventListener( 'message', swMessage );

/////

/*
  When Service Worker finished installing
*/
function swInstall( e ) {
  e.waitUntil(
    caches.open( STATIC_CACHE )
      .then( addCache )
  );

  //

  function addCache( cache ) {
    return cache.addAll( staticFiles );
  }
}

/*
  When Service Worker has been activated
*/
function swActivate( e ) {
  e.waitUntil(
    caches.keys().then( deleteOldCache )
  );

  // remove old caches
  function deleteOldCache( allCaches ) {
    return Promise.all(
      allCaches.filter( c => {
        return c.startsWith( CACHE_BASE ) && !ALL_CACHES.includes( c );
      } ).map( c => {
        return caches.delete( c );
      } )
    );
  }
}

/*
  When the page requests data
*/
function swFetch( e ) {
  var requestUrl = new URL( e.request.url );

  // if request image, cache it
  if( requestUrl.href.includes( IMAGE_URL_INDICATOR ) ) {
    e.respondWith( _cachePhoto( e.request) );
    return;
  }

  e.respondWith(
    caches.match( e.request ).then( response => {
      // return cache, if not available then get from online
      return response || fetch( e.request );
    } )
  );

}

/*
  When a new message is posted to Service Worker
*/
function swMessage( e ) {
  if( e.data.action === 'skipWaiting' ) {
    self.skipWaiting();
  }
}


///

function _cachePhoto( request ) {
  var storageUrl = request.url.replace( /-\d+px\.jpg$/, '' );

  return caches.open( IMAGES_CACHE ).then( c => {
    // check for cache
    return c.match( storageUrl ).then( response => {
      // if cache exist, return it
      if( response ) { return response; }

      // else, fetch it from internet
      return fetch( request ).then( netResponse => {
        c.put( storageUrl, netResponse.clone() );
        return netResponse;
      });
    });
  });
}
