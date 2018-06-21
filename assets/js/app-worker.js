(function($) { 'use strict';

/*
  PushNotification server's key
  - You need to develop your own server and create the key
  - For DEMO, get your key at https://web-push-codelab.glitch.me
  - After allowing notification, you will see a JSON data in console, copy it to "Codelab Message Sending" and send test message.
*/
const PUBLIC_KEY = 'BJS8GuQlCDavfpzsppGGECE_CjqFoLpvw2HespGY7lQ1lyyD1gMl546xUWg1dqhuHcWa5P5FPA-kcBFUcLIdLn4';

// Start Service Worker
window.addEventListener( 'load', start );
function start() {
  let myWorker = new MyWorker();
  myWorker.registerServiceWorker();
}

/*
  Start the Service Worker module
*/
class MyWorker {
  constructor() { }

  /*
    Start Service Worker
    @return Promise( swRegistration ) - after service worker is ready
  */
  registerServiceWorker() {
    if( !('serviceWorker' in navigator) ) { return false; }
    var self = this;

    navigator.serviceWorker.register( '/service-worker.js' )
      .then( _addUpdateListener )
      .catch( error => {
        console.log( 'Service worker registration failed, error:', error );
      } );

    setTimeout( () => {
      navigator.serviceWorker.ready.then( _onReady );
    });

    // Ensure refresh is only called once.
    // This works around a bug in "force update on reload".
    var refreshing;
    navigator.serviceWorker.addEventListener( 'controllerchange', () => {
      if (refreshing) return;
      window.location.reload();
      refreshing = true;
    });

    //

    function _addUpdateListener( reg ) {
      // if controller faulty, abandon code
      if( !navigator.serviceWorker.controller ) { return; }

      // if new worker is detected
      if( reg.waiting ) {
        self._notifyUpdate( reg.waiting );
        return;
      }

      // if new worker finished is installing, track its progress
      if( reg.installing ) {
        self._trackInstalling( reg.installing );
        return;
      }

      // listen for new workers installing, track its progress
      reg.addEventListener( 'updatefound', () => {
        self._trackInstalling( reg.installing );
      });
    }


    function _onReady( reg ) {
      console.log( 'Service Worker Ready' );

      // register push notification
      let myNotif = new MyPushNotification( reg );
      myNotif.subscribe();
    }
  }

  //

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
          applicationServerKey: serverKey
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
    TODO: Make this send a POST request to server
  */
  _updateServer( sub ) {
    if( sub ) {
      console.log( JSON.stringify( sub ) );
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
