# Developing-In-Real-Time
Developing in real time. Using automation to enhance the develop &amp; design experience.

####Example 1: Runnable demo
This is a simple example showing some of the concepts I talk about in my "Developing in Real Time" article. You can `npm install` this and then run `grunt server`. Visit http://localhost:9000] in your browser to see the results.
With this, all the source files live in the `src` folder, which is kept under version control, and the generated files all end up in the `dist` folder, which is then served by the Connect server.

When a change is made to an  HTML, JS, CSS, Image or font file, the associated task with that file type is carried out and then the browser is reloaded.

SASS files are a two step process, to take advantage of LiveReload's ability to inject CSS into a page without a refresh - the first watch runs the `sass` task, which generates the CSS and copies it to the correct place, the second watch sees a change to the CSS and livereloads it in place. This is much nicer than the page refreshing for CSS changes only.

####Example 2: Runnable demo 
This is a slightly more complex example. We use the core of what we did in Example 1 and expand upon it.

So when a JS file is saved, it is tested with JSHint, concatenated with other files, the resultant file is minified and copied to the `dist` folder.

A SASS file goes through the same two steps above, but additionally, the output is minified using CSSMin, the combine_mq task combines identical media queries into one, the dataUri embeds any small images into the CSS directly as Base64 encoded links, and there is a modification to the sass task itself, to split it into `dist` and `dev` tasks. They are identical aside from `dev` generates sourcemaps.

####Example 3: Source code
This probably won't just run for you out of the box, but is an example of wrapping an application server with connect for livereload goodness with monolithic platforms. Our example is wrapping an Adobe CQ5 instance.

connect is loaded with a proxy module. This grabs requests from port 8503 and forwards them in both directions to port 9000. Connect can take what are known as "Middlewares", basically functions that do something to request/response. So we add a rewrite middleware. We are using grunt to do all the CSS/JS concatenation and minification, then we rewrite requests to the resources inside of the app server and instead let connect serve them. The livereload middleware adds the relevant script to the page that's rendered by the app server and hey presto, we can develop JS and CSS without having to deploy into CQ or mess about in CRX or anything.

And for the final flourish, we add a grunt `SVLT` plugin, so when we modify JSPs they are deployed into the app server. OK, so it's not quite instant feedback, takes around 5-10 seconds for the live reload to work, but it's definitely much nicer than messing about in CRX.

####Example 4: Source code
A similar example, this time wrapping NodeJS. Doesn't require any of the proxy nastyness as when Node is run in dev mode it can handle FS changes.