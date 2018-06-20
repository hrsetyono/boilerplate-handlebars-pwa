/*
  Helpers and Partials for HANDLEBARS JS
*/
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
    Handlebars.registerPartial( 'postMeta', $('#partial--post-meta').get(0).innerHTML );
  },
};


///// HELPERS

const hbsHelpers = {
  init() {
    // Format Date
    Handlebars.registerHelper( 'formatDate', this.formatDate );
  },

  formatDate( dateString ) {
    return new Handlebars.SafeString(
      fecha.format( new Date(dateString), 'DD MMM YYYY').toUpperCase()
    );
  }
};




})( jQuery );
