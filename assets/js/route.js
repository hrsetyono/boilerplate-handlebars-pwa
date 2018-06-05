// initiate Navigo routing
const ROUTER = new Navigo( null, true, '#' );

(function($) {
'use strict';

$(document).ready( startRoute );
$(document).on( 'page:load', startRoute );
function startRoute() {
  ROUTER.on( routeHome ).resolve();
  ROUTER.on( '/posts/:id', routePost ).resolve();
  ROUTER.on( '/:slug', routePage ).resolve();

  //

  routerSetting.init();
}


/*
  Home Page
*/
function routeHome() {
  this.source = document.getElementById( 'template--posts' ).innerHTML;
  this.$target = $( '#main-wrapper' );

  // Get data then Render
  get().then( data => {
    var template = Handlebars.compile( this.source );

    var html = template( data );
    this.$target.html( html );
  } );

  //

  function get() {
    let postsRepo = new PostsRepo();
    return postsRepo.get();
  }
}

/*
  Single Post page
*/
function routePost( params ) {
  var source = document.getElementById( 'template--post' ).innerHTML;
  var $target = $( '#main-wrapper' );

  // Get data then Render
  get().then( data => {
    var template = Handlebars.compile( source );
    var html = template( data );
    $target.html( html );
  } );

  //

  function get() {
    let postRepo = new PostRepo( params.id );
    return postRepo.get();
  }
}


/*
  Single Page
*/
function routePage( params ) {
  var source = document.getElementById( 'template--page' ).innerHTML;
  var $target = $( '#main-wrapper' );

  // Get data then Render
  get().then( data => {
    var template = Handlebars.compile( source );
    var html = template( data );
    $target.html( html );
  } );

  //

  function get() {
    let pageRepo = new PageRepo( params.slug );
    return pageRepo.get();
  }
}


////


var routerSetting = {
  init() {
    $(document).on( 'click', 'a[href]', this.onClick );

    ROUTER.hooks({
      after: this.afterNavigate
    });
  },

  /*
    Prevent default link action and navigate using NAVIGO
  */
  onClick( e ) {
    e.preventDefault();
    var href = $(this).attr('href');
    $( '#main-wrapper' ).addClass( 'is-loading' );

    // make it not so fast.
    setTimeout( () => {
      ROUTER.navigate( href );
    }, 200);
  },

  /*
    After navigate, remove loading overlay and scroll to top
  */
  afterNavigate( params ) {
    $( '#main-wrapper' ).removeClass( 'is-loading' );
    window.scrollTo( 0, 0 );
  }
};


})( jQuery );
