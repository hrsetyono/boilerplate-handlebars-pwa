(function($) { 'use strict';


// Start Service Worker after finished loading
window.addEventListener( 'load', () => {
  let myWorker = new MyWorker();
  myWorker.registerServiceWorker()
    // register push notification
    .then( reg => {
      console.log( 'Service Worker Ready' );

      let myPush = new MyPushNotification( reg );
      myPush.subscribe();
    });
} );


/*
  Handle Service Worker registration and behavior
*/
class MyWorker {
  constructor() { }

  /*
    Start Service Worker
    @return Promise( ServiceWorkerRegistration ) - After service worker ready
  */
  registerServiceWorker() {
    if( !('serviceWorker' in navigator) ) { return false; }

    // register SW
    navigator.serviceWorker.register( '/service-worker.js' )
      .then( this._checkForUpdate.bind( this ) )
      .catch( _onFail );

    // after SW ready (added timeout so it works in very-fast connection or localhost)
    var afterReady = new Promise( resolve => {
      setTimeout(
        resolve( navigator.serviceWorker.ready )
      );
    });

    // after new Service Worker is activated
    var refreshing; // ensure refreshes only once
    navigator.serviceWorker.addEventListener( 'controllerchange', _onControllerChange );

    return afterReady;

    // -----

    function _onFail( error ) {
      console.log( 'Service worker registration failed, error:', error );
    }

    function _onControllerChange() {
      if( refreshing ) { return; }
      window.location.reload();
      refreshing = true;
    }
  }


  /*
    Check for new version of Service Worker
    @param ServiceWorkerRegistration
  */
  _checkForUpdate( reg ) {
    // if service worker not yet take-over, don't check for update
    if( !navigator.serviceWorker.controller ) { return; }

    // if new worker is detected
    if( reg.waiting ) {
      this._notifyUpdate( reg.waiting );
      return;
    }

    // if new worker finished is installing, track its progress
    if( reg.installing ) {
      this._trackInstalling( reg.installing );
      return;
    }

    // listen for new workers installing, track its progress
    reg.addEventListener( 'updatefound', () => {
      this._trackInstalling( reg.installing );
    });
  }

  /*
    Notify user about update
    @param worker - The new service worker object
  */
  _notifyUpdate( worker ) {
    var toast = new MyToast( 'New version is available', 'Update' );

    toast.show();
    toast.answer.then( isClicked => {
      if( isClicked ) {
        worker.postMessage( {action: 'skipWaiting'} );
        location.reload(); // this should be in "controllerchange" listener
      }
    });
  }

  /*
    Listen when new worker finished installing
    @param worker - The new service worker object
  */
  _trackInstalling( worker ) {
    worker.addEventListener( 'statechange', () => {
      if( worker.state == 'installed' && navigator.serviceWorker.controller ) {
        this._notifyUpdate( worker );
      }
    });
  }
}


/*
  Push Notification

  @param ServiceWorkerRegistration
*/
class MyPushNotification {
  constructor( reg ) {
    this.reg = reg;
  }

  /*
    Prompt user to allow notification
  */
  subscribe() {
    MY_PUSH.subscribe( this.reg )
      .then( this._updateServer )
      .catch( error => console.log( error ) );
  }

  /*
    Save latest subscriber to server
  */
  _updateServer( sub ) {
    if( !sub ) { console.log( 'Subscription does not exist' ); return false; }

    var body = {
      content: JSON.stringify( sub ),
      topic: '',
      user_id: 0,
    };

    MY_API.post( 'http://wp.test/wp-json/h/v0/subscribe', body )
      .then( response => {
        console.log( 'Push Notification Subscribed' );
        console.log( response );
      } );
  }
}

})( jQuery );
