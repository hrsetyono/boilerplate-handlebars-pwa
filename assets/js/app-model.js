/*
  Get latest blog posts.
  https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/
*/
class HomeModel extends H_Model {
  constructor() {
    super( '/posts', 'posts' );
  }

  set() {
    super.set() // Override set() calls because we want to modify data before caching
    .then( data => {
      // format posts data
      data.posts = data.posts.map( post => {
        post.excerpt = post.excerpt.substring( 0, 160 ); // shorten excerpt

        for( var c in post.terms.category ) {
          post.terms.category = post.terms.category[c]; // get the first category only
          break;
        }
        return post;
      });

      localforage.setItem( this.cacheKey, data.posts );
      return data.posts;
    } );
  }
}


/*
  Get a single post
  https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/%24post_ID/
*/
class PostModel extends H_Model {
  constructor( id ) {
    super( '/posts/' + id, 'post_' + id );
  }
}



/*
  Get a single page
  https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/slug:%24post_slug/
*/
class PageModel extends H_Model {
  constructor( slug ) {
    super( '/posts/slug:' + slug, 'page_' + slug );
  }
}
