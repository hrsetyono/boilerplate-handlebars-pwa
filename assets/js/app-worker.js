(function($) { 'use strict';
/*
  PushNotification server's key
  - You need to develop your own server and create the key
  - For DEMO, get your key at https://web-push-codelab.glitch.me
  - After allowing notification, you will see a JSON data in console, copy it to "Codelab Message Sending" and send test message.
*/
const PUBLIC_KEY = 'BPqhA8ofNI5_FTDZRfv1y2Ov0GXH9XU6SgWrbgNTO7MmZVwUZzqSflmIl8UxoimCr57BKnDJPtF6gctN0kmmUnM';


// Start Service Worker after finished loading
window.addEventListener( 'load', () => {
  let myWorker = new MyWorker();
  myWorker.registerServiceWorker()
    // register push notification
    .then( reg => {
      console.log( 'Service Worker Ready' );
      let myNotif = new MyPushNotification( reg );
      myNotif.subscribe();
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
    if( !('PushManager' in window) ) { return false; }

    // check if already subscribed
    this._checkSubscription()
      .then( isSubscribed => {
        if( isSubscribed ) { throw new Error( 'User already subscribed' ); }

        const serverKey = this._urlB64ToUint8Array( PUBLIC_KEY );
        // prompt user to allow / block
        return this.reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: serverKey,
        });
      })
      // update server after finish subscribing
      .then( sub => {
        console.log( 'Push Notification Subscribed' );
        this._updateServer( sub );
      })
      .catch( error => console.log( error ) );
  }


  //

  /*
    Check current state of subscription
  */
  _checkSubscription() {
    return this.reg.pushManager.getSubscription()
      .then( sub => {
        this._updateServer( sub );
        return sub !== null;
      });
  }

  /*
    Save latest subscriber to server
  */
  _updateServer( sub ) {
    if( sub ) {
      var body = {
        content: JSON.stringify( sub ),
        topic: '',
        user_id: 0,
        h_push_id: sub.endpoint.substr( -12 ),
      };

      fetch( 'http://wp.test/wp-json/h/v0/subscribe', {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify( body ),
      }).then( response => {
        console.log( response );
      } );
    } else {
      console.log( 'Subscription does not exist' );
    }
  }


  /*
    Convert Server Key
  */
  _urlB64ToUint8Array( base64String ) {
    const padding = '='.repeat( (4 - base64String.length % 4) % 4 );
    const base64 = ( base64String + padding )
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob( base64 );
    const outputArray = new Uint8Array( rawData.length );

    for( let i = 0; i < rawData.length; ++i ) {
      outputArray[ i ] = rawData.charCodeAt( i );
    }
    return outputArray;
  }
}

})( jQuery );
