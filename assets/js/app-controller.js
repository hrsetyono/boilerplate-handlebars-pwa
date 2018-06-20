// initiate Navigo routing
const ROUTER = new Navigo( null, true, '#' );

(function($) {
'use strict';

$(document).ready( startRoute );
$(document).on( 'page:load', startRoute );

function startRoute() {
  ROUTER.on( homeController ).resolve();
  ROUTER.on( '/posts/:id', postController ).resolve();
  ROUTER.on( '/:slug', pageController ).resolve();

  routerSetting.init();
}

/*
  Home Page
*/
function homeController() {
  let homeModel = new HomeModel();
  homeModel.get().then( data => {

    var html = $('#template--posts').compile( data );
    $( '#main-wrapper' ).html( html );

  });
}

/*
  Single Post page
*/
function postController( params ) {
  let postModel = new PostModel( params.id );
  postModel.get().then( data => {

    var html = $('#template--post').compile( data );
    $( '#main-wrapper' ).html( html );

  } );
}


/*
  Single Page
*/
function pageController( params ) {
  let pageRepo = new PageRepo( params.slug );
  pageRepo.get().then( data => {

    var html = $('#template--page').compile( data );
    $( '#main-wrapper' ).html( html );

  } );
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
