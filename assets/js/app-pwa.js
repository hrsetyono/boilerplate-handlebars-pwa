startServiceWorker();

function startServiceWorker() {
  if( 'serviceWorker' in navigator ) {
    var workerArgs = { scope: '/' };

    navigator.serviceWorker.register( '/service-worker.js', workerArgs )
      .then( _onSuccess ).catch( _onFail );

    navigator.serviceWorker.ready.then( _onReady );
  }

  /////

  function _onSuccess( registration ) {
    console.log('Service Worker Registered');
  }

  function _onFail( error ) {
    console.log( 'Service worker registration failed, error:', error );
  }

  function _onReady( registration ) {
    console.log( 'Service Worker Ready' );
  }
}
