/*
  Create a small alert box'

  Example:

    var toast = new Toast( 'Are you sure?', 'Yes' );
    toast.show();
    toast.answer.then( isClicked => {
      if( isClicked ) { ... }
    });
*/
class Toast {
  /*
    @param message (string)
    @param buttonText (string)
  */
  constructor( message, buttonText ) {
    this.message = message;
    this.buttonText = buttonText;

    this._addListener();

    // Keep resolve as class variable, so it can be used inside listener
    this.answer = new Promise( resolve => {
      this._resolve = resolve;
    });
  }

  /*
    Append the toast markup to body
  */
  show() {
    var html = `<div class="toast toast--shown"> <p>${ this.message }</p> <a> ${ this.buttonText} </a> </div>`;

    jQuery('body').append( html );
  }

  /*
    Hide the Toast
  */
  hide() {
    jQuery('.toast').removeClass( 'toast--shown' );
  }

  /*
    Add click listener to Toast that resolve the promise
  */
  _addListener() {
    jQuery(document).on( 'click', '.toast a', (e) => {
      this._resolve( true );
      this.hide();
    } );
  }
}
