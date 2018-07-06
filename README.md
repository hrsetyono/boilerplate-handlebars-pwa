# Handlebars PWA Boilerplate

PWA (Progressive Web App) Boilerplate for my favorite templating engine: [Handlebars](https://handlebarsjs.com/)!

It's a very simple engine and has very low learning curve.

## The Demo App

This is a blog app that's pulling data from my Wordpress.com account.

- You can use your own account by changing `API_BASE` variable in  `/assets/js/helpers.js`.

**HOW TO RUN**

1. Install "Web Server for Chrome" via Chrome Market.
1. Point this project directory and start the Server.
1. Click the Web server URL.

To make debug easier, open Chrome DevTools > Application tab > Service Worker sidebar > tick "Update on reload".

## Features

1. **SIMPLE HTML & JS** - No compiler, no headache.

1. **WORKS OFFLINE** - Loaded images and JSON data pulled using `MY_API.get()` is automatically cached.

    Image cache in Demo app is hardcoded to only work with WordPress.com site.

    You need to adapt IMAGE_URL_INDICATOR in `/service-worker.js`. URL containing this value will be cached. For example self-install WordPress is `/wp-content/uploads/`.

1. **UPDATE PROMPT** - Triggered when there is any changes to **service-worker.js**.

1. **WEB PUSH NOTIFICATION** - Require a lot of setups.

    - First unncomment line 11 and 12 in `/assets/js/app-worker.js`.
    - Then you need to setup Push server. [Read here](https://github.com/hrsetyono/wp-edje/wiki/Web-Push) for example using WordPress.
    - Change PUSH_PUBLIC_KEY and PUSH_SAVE_ENDPOINT in `/assets/js/helpers.js` to fit yours.

## Useful Links

1. [Edje Documentation](https://github.com/hrsetyono/edje/wiki)
1. [Edje Wordpress Documentation](https://github.com/hrsetyono/edje-wp/wiki)
1. [How to compile Sass files](https://github.com/hrsetyono/edje/wiki#installation)
1. [How to debug mobile browser](https://github.com/hrsetyono/generator-edje/wiki/My-Workflow#debugging-in-mobile)
