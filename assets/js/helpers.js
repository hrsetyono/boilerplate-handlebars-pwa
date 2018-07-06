const API_BASE = 'https://public-api.wordpress.com/rest/v1.1/sites/hrsetyono.wordpress.com';
const PUSH_PUBLIC_KEY = 'BPqhA8ofNI5_FTDZRfv1y2Ov0GXH9XU6SgWrbgNTO7MmZVwUZzqSflmIl8UxoimCr57BKnDJPtF6gctN0kmmUnM';
const PUSH_SAVE_ENDPOINT = 'http://wp.test/wp-json/h/v0/subscribe';

/*
  All extensions for jquery
*/
class H_JQuery {
  constructor() {
    jQuery.fn.extend({
      compile: this.compile,
    });
  }

  /*
    Compile Handlebars template with data provided
    Example:
      $( '#script-template-id' ).compile( data );
  */
  compile( data ) {
    var source = this[0].innerHTML;
    var template = Handlebars.compile( source );
    return template( data );
  }
}
new H_JQuery();


/*
  Data Model - Get data from cache, if empty, do API call.

  This is only for parent class, extend it and call super() to override constructor.
  Example in `app-model.js`
*/
class H_Model {
  constructor( endpoint, cacheKey ) {
    this.endpoint = API_BASE + endpoint;
    this.cacheKey = cacheKey;
  }

  get() {
    return localforage.getItem( this.cacheKey )
      .then( data => {
        // if data is empty, fetch new one
        if( data === null ) { return this.set(); }

        return data;
      });
  }


  set() {
    return H_API.get( this.endpoint );
      .then( data => {
        localforage.setItem( this.cacheKey, data );
        return data;
      } );
  }
}


/*
  Simple GET and POST functions that return Promise.

  Example:
    H_API.get( url ).then( result => { .. } );
    H_API.post( url, data ).then( result => { ... } );
*/
const H_API = {
  get( endpoint ) {
    return window.fetch( endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    } )
    .then( this._handleError )
    .then( this._handleContentType )
    .catch( this._throwError );
  },

  post( endpoint, body ) {
    return window.fetch( endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify( body ),
    } )
    .then( this._handleError )
    .then( this._handleContentType )
    .catch( this._throwError );
  },

  _handleError( err ) {
    return err.ok ? err : Promise.reject( err.statusText )
  },

  _handleContentType( res ) {
    const contentType = res.headers.get( 'content-type' );
    if( contentType && contentType.includes( 'application/json' ) ) {
      return res.json()
    }
    return Promise.reject( 'Oops, we haven\'t got JSON!' )
  },

  _throwError( err ) {
    throw new Error( err );
  }
}

/*
  Service Worker helpers
  Example: See /js/app-worker.js
  }
*/
const H_WORKER = {
  /*
    Register service worker

    @param workerFile (string) - Path to the service worker JS file
    @param notifyUpdateCallback (function) - Called when update to service worker is found
  */
  register( workerFile, notifyUpdateCallback ) {
    if( !('serviceWorker' in navigator) ) { return false; }

    this.notifyUpdateCallback = notifyUpdateCallback;
    this._addUpdateListener();

    return navigator.serviceWorker.register( workerFile )
      .then( this._checkForUpdate.bind( this ) )
      .catch( err => {
        console.log( 'Service worker registration failed, error:', err );
      } );
  },

  /*
    Check if service worker is ready
  */
  afterReady() {
    return new Promise( resolve => {
      setTimeout(
        resolve( navigator.serviceWorker.ready )
      );
    });
  },


  /*
    Refresh page after new Service Worker is activated
  */
  _addUpdateListener() {
    var refreshing;
    navigator.serviceWorker.addEventListener( 'controllerchange', () => {
      if( refreshing ) { return; }
      window.location.reload();
      refreshing = true;
    } );
  },


  /*
    Check for new version of Service Worker

    @param ref (ServiceWorkerRegistration)
  */
  _checkForUpdate( reg ) {
    // if service worker not yet take-over, don't check for update
    if( !navigator.serviceWorker.controller ) { return; }

    // if new worker is detected
    if( reg.waiting ) {
      this.notifyUpdateCallback( reg.waiting );
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
  },

  /*
    Listen when new worker finished installing

    @param worker (ServiceWorker) - The new service worker object
  */
  _trackInstalling( worker ) {
    worker.addEventListener( 'statechange', () => {
      if( worker.state == 'installed' && navigator.serviceWorker.controller ) {
        this.notifyUpdateCallback( worker );
      }
    });
  },
};

/*
  Web Push helpers

  Example: See /js/app-worker.js
*/
const H_PUSH = {
  /*
    Create subscription data using the Public Key

    @param reg (ServiceWorkerRegistration)
  */
  subscribe( reg ) {
    if( !('PushManager' in window) ) { return false; }

    return this._check( reg )
      .then( isSubbed => {
        if( isSubbed ) { throw new Error( 'ERROR - User already subscribed' ); }

        const serverKey = this._urlB64ToUint8Array( PUSH_PUBLIC_KEY );

        // prompt user to allow / block
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: serverKey,
        });
      } );
  },

  /*
    Check if client already subscribed

    @param reg (ServiceWorkerRegistration)
  */
  _check( reg ) {
    return reg.pushManager.getSubscription()
      .then( sub => {
        return sub !== null;
      });
  },

  /*
    Encrypt Public Key
    
    @param base64String (string)
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

};





/*
  Create a small alert box.

  Example:
    var toast = new Toast( 'Are you sure?', 'Yes' );
    toast.show();
    toast.answer.then( isClicked => {
      if( isClicked ) { ... }
    });
*/
class HToast {
  /*
    @param message (string)
    @param buttonText (string)
  */
  constructor( message, buttonText ) {
    this.message = message;
    this.buttonText = buttonText;

    this._addListener();

    this.answer = new Promise( resolve => {
      this._resolve = resolve;
    });
  }

  show() {
    var html = `<div class="toast toast--shown"> <p>${ this.message }</p> <a> ${ this.buttonText} </a> </div>`;
    jQuery('body').append( html );
  }

  hide() {
    jQuery('.toast').removeClass( 'toast--shown' );
  }

  _addListener() {
    jQuery(document).on( 'click', '.toast a', (e) => {
      this._resolve( true );
      this.hide();
    } );
  }
}
