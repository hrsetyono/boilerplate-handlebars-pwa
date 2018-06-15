(function($) {
'use strict';

$(document).ready( start );
$(document).on( 'page:load', start );
$(window).load( startOnLoad );

function start() {
  myApp.init();
  new MyController(); // from app-controller.js
}

// functions that needs to run only after everything loads
function startOnLoad() {
}



///// GENERAL LISTENERS

var myApp = {
  init() {
    $('#nav-refresh').on( 'click', this.refreshCache );
  },

  /*
    Clear database and images. Static files should stay the same.
  */
  refreshCache( e ) {
    localforage.clear(); // clear db

    // clear images
    caches.keys().then(function( allCaches ) {
      allCaches.map( c => {
        c.includes('image') ? caches.delete( c ) : '';
      });
    }).then( () => {
      location.reload();
    });
  }
};


})( jQuery );
