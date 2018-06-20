# Handlebars PWA Boilerplate

PWA (Progressive Web App) Boilerplate for my favorite templating engine: [Handlebars](https://handlebarsjs.com/)!

It's a very simple engine and has very low learning curve.

## The Demo App

We provide you with a Blog app that are pulling data from my Wordpress.com account. You can use your own blog by changing `API_BASE` variable in  `/assets/js/helpers.js`.

**HOW TO RUN**

1. Install "Web Server for Chrome" via Chrome Market.
1. Point this project directory and start the Server.
1. Click the Web server URL.

**HOW TO DEBUG**

The cache in PWA is very persistent, so new changes won't be reflected even if you do Hard Refresh.

Easiest solution is:

1. In Chrome Dev Tools, go to **Application** tab.
1. Select "Service Workers" and tick "Update on reload".

**HOW TO UPDATE LIVE APP**

You can't expect your user to clear cache to see if the app is updated.

In this demo, a dialog box will appear when there's new update. To trigger it, do the following:

1. Any changes to `service-worker.js` will trigger the dialog box. So simply increment the VERSION variable.
1. Upload the changes to your host.
1. When the user clicks the box, it will delete the old cache.

## Useful Links

1. [Edje Documentation](https://github.com/hrsetyono/edje/wiki)
1. [Edje Wordpress Documentation](https://github.com/hrsetyono/edje-wp/wiki)
1. [How to compile Sass files](https://github.com/hrsetyono/edje/wiki#installation)
1. [How to debug mobile browser](https://github.com/hrsetyono/generator-edje/wiki/My-Workflow#debugging-in-mobile)
