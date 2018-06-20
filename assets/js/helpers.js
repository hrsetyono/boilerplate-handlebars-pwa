const API_BASE = 'https://public-api.wordpress.com/rest/v1.1/sites/hrsetyono.wordpress.com';


/*
  Data Model - Get data from cache, if empty, do API call.

  This is only for parent class, extend it and call super() to override variable.
  Example in `app-model.js`
*/
class MyModel {
  constructor( endpoint, cacheKey ) {
    this.endpoint = API_BASE + endpoint;
    this.cacheKey = cacheKey;
  }

  get() {
    return localforage.getItem( this.cacheKey )
      .then( data => {
        // if data is empty, fetch new one
        if( data === null ) {
          return this.set();
        }
        return data;
      });
  }


  set() {
    return MyAPI.get( this.endpoint )
      .then( this._setCache.bind( this ) );
  }

  /*
    Save the data to cache
    TIPS: override this in Child class to modify the data before saving.
  */
  _setCache( data ) {
    localforage.setItem( this.cacheKey, data );
    return data;
  }
}


/*
  Simple GET and POST functions that return Promise.

  Example:
    MyAPI.get( url ).then( result => { .. } );
    MyAPI.post( url, data ).then( result => { ... } );
*/
const MyAPI = {
  get( endpoint ) {
    return window
      .fetch(endpoint, {
        method: "GET",
        headers: { Accept: "application/json" }
      })
      .then( this._handleError )
      .then( this._handleContentType )
      .catch( error => {
        throw new Error( error );
      });
  },

  post( endpoint, body ) {
    return window
      .fetch( endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body
      })
      .then( this._handleError )
      .then( this._handleContentType )
      .catch( error => {
        throw new Error( error );
      });
  },

  _handleError( err ) {
    return err.ok ? err : Promise.reject( err.statusText );
  },

  _handleContentType( res ) {
    const contentType = res.headers.get( 'content-type' );
    if( contentType && contentType.includes( 'application/json' ) ) {
      return res.json();
    }
    return Promise.reject( 'Oops, we haven\'t got JSON!' );
  }
};


/*
  My JQuery Extension
*/
jQuery.fn.extend({
  /* Compile template with data provided
    Example:
      $( '#script-template-id' ).compile( data );
  */
  compile: function( data ) {
    var source = this[0].innerHTML;
    var template = Handlebars.compile( source );
    return template( data );
  },
});



/*
  Create a small alert box.

  Example:
    var toast = new Toast( 'Are you sure?', 'Yes' );
    toast.show();
    toast.answer.then( isClicked => {
      if( isClicked ) { ... }
    });
*/
class MyToast {
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
