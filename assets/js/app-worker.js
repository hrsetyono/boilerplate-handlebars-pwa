(function($) { 'use strict';

window.addEventListener( 'load', () => {
  let myWorker = new MyWorker();

  myWorker.register( '/service-worker.js' )
   .then( reg => {
     console.log( 'Service Worker Ready' );

     // TODO: Uncomment this to enable Web Push
     // let myPush = new MyPush();
     // myPush.subscribe( reg );
   });
} );

/*
  Handle Service Worker registration
*/
class MyWorker {
  constructor() { }

  /*
    Register service worker

    @param workerFile (string) - Path to service worker JS file
    @return Promise( ServiceWorkerRegistration ) - After successfully registered
  */
  register( workerFile ) {
    H_WORKER.register( workerFile, this._notifyUpdate );

    return H_WORKER.afterReady(); // check if service worker is ready
  }

  /*
    Notify user about update

    @param worker (ServiceWorker) - The new service worker object
  */
  _notifyUpdate( worker ) {
    // You can replace this with your own Toast / Alert box
    if( confirm( 'New version is available, Update?') ) {
      worker.postMessage( { action: 'skipWaiting' } ); // this will refresh the page and show new version
    }
  }
}

/*
  Handle push notification
*/
class MyPush {
  constructor() { }

  /*
    Prompt user to allow notification

    @param reg (ServiceWorkerRegistration)
  */
  subscribe( reg ) {
    H_PUSH.subscribe( reg )
      .then( this._updateServer )
      .catch( error => console.log( error ) );
  }

  /*
    Save latest subscriber to server.

    @param sub (PushSubscription) - Unique data to identify this client
  */
  _updateServer( sub ) {
    if( !sub ) { console.log( 'Subscription does not exist' ); return false; }

    var body = {
      content: JSON.stringify( sub ),
      topic: '',
      user_id: 0,
    };

    /*
      I'm using WordPress to save the subscription data
      Read more: https://github.com/hrsetyono/wp-edje/wiki/Web-Push
    */
    H_API.post( PUSH_SAVE_ENDPOINT, body )
      .then( response => {
        console.log( 'Push Notification Subscribed' );
        console.log( response );
      } );
  }
}

})( jQuery );
