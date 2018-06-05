(function($) {
'use strict';

$(document).ready( start );
$(document).on( 'page:load', start );
$(window).load( startOnLoad );

function start() {
  myApp.init();
}

// functions that needs to run only after everything loads
function startOnLoad() {
}



///// GENERAL LISTENERS

var myApp = {
  init() {
  },
};




})( jQuery );



///// SERVICE WORKER

(function(){startServiceWorker();function startServiceWorker(){if('serviceWorker' in navigator){var workerArgs={scope:'/'};navigator.serviceWorker.register('/service-worker.js',workerArgs).then(onSuccess).catch(onFail);navigator.serviceWorker.ready.then(onReady)}
function onSuccess(registration){console.log('Service Worker Registered')}
function onFail(error){console.log('Service worker registration failed, error:',error)}
function onReady(registration){console.log('Service Worker Ready')}}})()
