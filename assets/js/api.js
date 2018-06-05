const API_BASE = 'https://public-api.wordpress.com/rest/v1.1/sites/hrsetyono.wordpress.com';

/*
  Data Repository. Get data from cache, if empty, do API call.

  To use this, create new class and extend this.
*/
class MyRepo {
  constructor( endpoint, cacheKey ) {
    this.endpoint = API_BASE + endpoint;
    this.cacheKey = cacheKey;
  }

  get() {
    return localforage.getItem( this.cacheKey ).then( data => {
      if( data === null ) {
        return this.set(); // if data is empty, fetch new one
      }

      return data;
    } );
  }


  set() {
    return MY_API.get( this.endpoint )
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
  Get latest blog posts.
  https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/
*/
class PostsRepo extends MyRepo {
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
class PostRepo extends MyRepo {
  constructor( id ) {
    super( '/posts/' + id, 'post_' + id );
  }
}



/*
  Get a single page
  https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/slug:%24post_slug/
*/
class PageRepo extends MyRepo {
  constructor( slug ) {
    super( '/posts/slug:' + slug, 'page_' + slug );
  }
}



/*
  Simple GET and POST functions that return Promise.
  Example:

    MY_API.get( url ).then( result => {
      ...
    });

    MY_API.post( url, data ).then( result => {
      ...
    });
*/
const MY_API={get(endpoint){return window.fetch(endpoint,{method:'GET',headers:{'Accept':'application/json'}}).then(this._handleError).then(this._handleContentType).catch(error=>{throw new Error(error)})},post(endpoint,body){return window.fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:body,}).then(this._handleError).then(this._handleContentType).catch(error=>{throw new Error(error)})},_handleError(err){return err.ok?err:Promise.reject(err.statusText)},_handleContentType(res){const contentType=res.headers.get('content-type');if(contentType&&contentType.includes('application/json')){return res.json()}
return Promise.reject('Oops, we haven\'t got JSON!')},}
