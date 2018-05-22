// Handle Offline capability (caching) and Push notification
//
// https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/
'use strict';

const VERSION = "0.1.0";
const CACHE_NAME = `my-app-${VERSION}`;

var filesToCache = [
  '/',
  '/index.html',

  '/assets/js/app.js',
  '/assets/js/app-pwa.js',
  '/assets/js-vendor/jquery.min.js',
  // '/assets/js-vendor/handlebars.min.js',
  // '/assets/js-vendor/fastclick.min.js',

  '/assets/css/app.css',
  '/assets/css/framework.css',
  '/assets/css/dashicons.css',

  '/assets/images/loading.gif',
  '/assets/images/icon-128x128.png',
  '/assets/images/icon-splash-512x512.jpg',
];


self.addEventListener('install', swInstall );
self.addEventListener('activate', swActivate );
self.addEventListener('fetch', swFetch );

/////

function swInstall( e ) {
  var timeStamp = Date.now();
  e.waitUntil( caches.open( CACHE_NAME ).then( _addCache ) );

  //

  function _addCache( cache ) {
    return cache.addAll(filesToCache).then( _skipWaiting );
  }

  function _skipWaiting() {
    return self.skipWaiting();
  }
}


function swActivate( e ) {
  e.waitUntil( self.clients.claim() );
}


function swFetch( e ) {
  e.respondWith(
    caches.open( CACHE_NAME ).then( _afterOpen ).then( _fetchCache )
  );

  function _afterOpen( cache ) {
    return cache.match( e.request, { ignoreSearch: true } );
  }

  function _fetchCache( response ) {
    return response || fetch( e.request );
  }
}
