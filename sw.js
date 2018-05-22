// Handle Offline capability (caching) and Push notification
//
// https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/


const VERSION = "1.0.0";
const CACHE_NAME = `my-app-${ VERSION }`;

var filesToCache = [
  '/',
  '/index.html',

  // '/assets/js/app.js',
  // '/assets/js/app-pwa.js',
  // '/assets/js-vendor/jquery.min.js',
  // '/assets/js-vendor/handlebars.min.js',
  // '/assets/js-vendor/fastclick.min.js',

  // '/assets/css/app.css',
  '/assets/css/framework.css',
  // '/assets/css/dashicons.css',

  // '/assets/images/loading.gif',
  '/assets/images/icon-128x128.png',
  // '/assets/images/icon-192x192.png',
  // '/assets/images/icon-splash-512x512.jpg',
];

// Start service worker
self.addEventListener( 'install', swInstall );
self.addEventListener( 'activate', swActivate );
self.addEventListener( 'fetch', swFetch );


/////

// Add Cache
function swInstall( e ) {
  console.log( '[ServiceWorker] Install' );
  const timeStamp = Date.now();

  e.waitUntil(
    caches.open( CACHE_NAME ).then( _afterOpen )
  );

  /////

  function _afterOpen( cache ) {
    console.log( '[ServiceWorker] Caching app shell' );
    return cache.addAll( filesToCache ).then( _skipWaiting );
  }

  function _skipWaiting() {
    self.skipWaiting();
  }
}


// Look for cache
function swActivate( e ) {
  console.log( '[ServiceWorker] Activate' );

  e.waitUntil( self.clients.claim() );
}


// Get AJAX data
function swFetch( e ) {
  e.respondWith(
    caches.open( CACHE_NAME )
      .then( _matchCache ).then( _fetchResponse )
  );

  /////

  function _matchCache( cache ) {
    cache.match( e.request, { ignoreSearch: true } );
  }

  function _fetchResponse( response ) {
    return response || fetch( e.request );
  }
}
