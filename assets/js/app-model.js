/*
  Get latest blog posts.
  https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/
*/
class HomeModel extends MyModel {
  constructor() {
    super( '/posts', 'posts' );
  }

  _setCache( data ) {
    data.posts = data.posts.map( post => {
      // shorten excerpt
      post.excerpt = post.excerpt.substring( 0, 160 );

      // get the first category only
      for( var c in post.terms.category ) {
        post.terms.category = post.terms.category[c];
        break;
      }

      return post;
    });

    localforage.setItem( this.cacheKey, data.posts );
    return data.posts;
  }
}


/*
  Get a single post
  https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/%24post_ID/
*/
class PostModel extends MyModel {
  constructor( id ) {
    super( '/posts/' + id, 'post_' + id );
  }
}



/*
  Get a single page
  https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/slug:%24post_slug/
*/
class PageModel extends MyModel {
  constructor( slug ) {
    super( '/posts/slug:' + slug, 'page_' + slug );
  }
}
