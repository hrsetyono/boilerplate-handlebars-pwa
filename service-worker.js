// Handle Offline capability (caching) and Push notification
//
// https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/
'use strict';

const VERSION = '0.2.3';
const CACHE_BASE = 'my-app-';
const STATIC_CACHE = CACHE_BASE + 'static-' + VERSION;
const IMAGES_CACHE = CACHE_BASE + 'images';
const ALL_CACHES = [ STATIC_CACHE, IMAGES_CACHE ];

const IMAGE_URL_INDICATOR = 'files.wordpress.com'; // part of URL that indicate it's image request

var staticFiles = [
  '/index.html',

  '/assets/js/helpers.js',
  '/assets/js/hbs-helpers.js',
  '/assets/js/app.js',
  '/assets/js/app-model.js',
  '/assets/js/app-controller.js',
  '/assets/js/app-worker.js',

  '/assets/js-vendor/jquery.min.js',
  '/assets/js-vendor/handlebars.min.js',
  '/assets/js-vendor/fecha.min.js',
  '/assets/js-vendor/localforage.min.js',
  '/assets/js-vendor/navigo.min.js',

  '/assets/css/app.css',

  '/assets/images/loading.gif',
  '/assets/images/icon-128x128.png',
];


self.addEventListener( 'install', swInstall );
self.addEventListener( 'activate', swActivate );
self.addEventListener( 'fetch', swFetch );

self.addEventListener( 'message', swMessage );
self.addEventListener( 'push', swPush );
self.addEventListener( 'notificationclick', swNotificationClick );


/////

/*
  When Service Worker finished installing
*/
function swInstall( e ) {
  console.log( 'sw install' );

  e.waitUntil(
    caches.open( STATIC_CACHE ).then( addCache )
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
  console.log( 'sw activate' );
  e.waitUntil(
    caches.keys().then( _deleteOldCache )
  );

  // remove old caches
  function _deleteOldCache( allCaches ) {
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
    e.respondWith( _cacheImage( e.request) );
    return;
  }

  // return cache, if not available then get from online
  e.respondWith(
    caches.match( e.request ).then( response => {
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

/*
  Listen for Push notification
*/
function swPush( e ) {
  // abandon if data is empty
  if( !( e && e.data ) ) { return false; }

  console.log( '[Service Worker] Push Received.' );

  var data = e.data.json();
  console.log( data );

  const title = data.title || 'Hello World';
  const options = {
    body: data.body,
    icon: 'assets/images/icon.png',
    badge: 'assets/images/badge.png'
  };

  e.waitUntil(
    self.registration.showNotification( title, options )
  );
}

/*
  Listener when Notification is clicked
*/
function swNotificationClick( e ) {
  console.log( '[Service Worker] Notification click Received.' );
  e.notification.close();

  // DO Something
  e.waitUntil(
    clients.openWindow('https://developers.google.com/web/')
  );
}


///


function _cacheImage( request ) {
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
