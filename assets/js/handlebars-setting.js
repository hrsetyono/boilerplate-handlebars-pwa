(function($) {
'use strict';

$(document).ready( start );
$(document).on( 'page:load', start );

function start() {
  hbsPartials.init();
  hbsHelpers.init();
}

///// PARTIALS

const hbsPartials = {
  init() {
    Handlebars.registerPartial( 'postMeta', document.getElementById('partial--post-meta').innerHTML );
  },
};


///// HELPER

const hbsHelpers = {
  init() {
    // Format Date
    Handlebars.registerHelper( 'formatDate', function( dateString ) {
      return new Handlebars.SafeString(
        moment( dateString ).format('DD MMM YYYY').toUpperCase()
      );
    });
  },
};




})( jQuery );
