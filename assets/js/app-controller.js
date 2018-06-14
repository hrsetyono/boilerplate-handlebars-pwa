/*
  Handle ServiceWorker and other Network interaction
*/

class MyController {
  constructor() {
    // if serviceWorker isn't supported, abandon code
    if ( !('serviceWorker' in navigator) ) { return false; }

    this._registerServiceWorker();
  }

  /*
    Start Service Worker
  */
  _registerServiceWorker() {
    var self = this;
    var reloading; // to detect controllerchange

    navigator.serviceWorker.register( '/service-worker.js', { scope: '/' } )
    .then( addUpdateListener )
    .catch( onFail );

    navigator.serviceWorker.ready.then( onReady );

    // TODO: works in live, but a nuisance when Force Reload is enabled during debugging.
    // navigator.serviceWorker.addEventListener( 'controllerchange', onControllerChange );

    //

    function addUpdateListener( reg ) {
      // if controller faulty, abandon code
      if( !navigator.serviceWorker.controller ) { return; }

      console.log( 'Service Worker Registered' );

      // if new worker is detected
      if( reg.waiting ) {
        console.log( 'waiting' );
        self._notifyUpdate( reg.waiting );
        return;
      }

      // if new worker finished is installing, track its progress
      if( reg.installing ) {
        console.log( 'installing' );
        self._trackInstalling( reg.installing );
        return;
      }

      // listen for new workers installing, track its progress
      reg.addEventListener( 'updatefound', () => {
        console.log( 'update found' );
        self._trackInstalling( reg.installing );
      });
    }

    function onFail( error ) {
      console.log( 'Service worker registration failed, error:', error );
    }

    function onReady( reg ) {
      console.log( 'Service Worker Ready' );
    }

    /*
      Reload page if new service worker is installed
    */
    function onControllerChange() {
      if( reloading ) { return false; } // ensure reload only called once
      window.location.reload();
      reloading = true;
    }
  }

  /*
    Notify user about update

    @param worker - The new service worker object
  */
  _notifyUpdate( worker ) {
    var toast = new Toast( 'New version is available', 'Update' );

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
