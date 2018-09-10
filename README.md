# PROJECT NAME

**This is the default README file. It is _your_ responsibility to ensure it's actually filled out.**

Insert a short synopsis describing the project here. This README should only contain information pertaining
to the frontend-aspects, as it is assumed the backend code (and relevant documentation) is located
elsewhere.

Need help with Markdown syntax?
Use the [Markdown cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)



## Contributors

Team members: 

Date of creation: 

Modified by: 

Modified date: 



## FRONTEND DOCUMENTATION

All assets are located in the `/static/src` folder.
Resources are compiled for production using [Gulp](https://www.npmjs.com/package/gulp) (a NodeJS-module).
All build configuration is handled by `/setup/config.js`. All build dependencies are listed in `package.json`.


### How to install frontend build tools

#### Install NodeJS
To compile the source files for production you need to use Gulp, and in order to use Gulp, you need NodeJS.
If you've already installed it on your system, skip this bit. Otherwise, get NodeJS v8.9 or better here:

[Install Node.js](https://nodejs.org/ "Node JS website")

... and install it (Node 8 LTS will suffice, but 10+ is supported).



#### Install site-specific Gulp modules
Running this command installs Gulp and all needed dependencies for this site:

```
c:\path\to\project\root\folder> install.bat
```

Wait for the NodeJS package manager (npm) to install all required Gulp modules. You need only do this once,
or if the package information (found inside `package.json`) changes.
If you're on a Mac, you'll have to run `npm install` (or `npm i`) manually.



### Run Gulp
Run this command to start Gulp:

```
c:\path\to\project\root\folder> npm start
```

This is the same as typing `npm run gulp`. Gulp builds all assets from the source files automatically, and then 'watches'
the source files for changes. 


### Running "watch" task without building
Instead of running `npm run gulp`, use `npm run watch`. This will set up the file watchers, but not perform the
initial "compile" of your files. This allows for a faster start.


### Building for production
Run `npm run deploy`. This will prepare and compile all assets for production. Source maps will be disabled.



### Configuring output folders and other settings
Almost anything you need to change about the build process can be found in `setup/config.js`. The file is not
annotated, but is divided into tasks, so it should be fairly easy to discern the meaning of the various
options and their impact on the output. Otherwise, ask Anders Gissel.



### Stylesheets

SCSS is located in `/static/src/scss/` and Gulp builds it to `(output-folder-here)/css/`. There are two main files:
`critical.scss` (meant to be inlined and used for above-the-fold styling) and `main.scss` (all the other stuff, meant
to be lazy-loaded). It is YOUR responsibility to ensure that you only include what you need in each file, so be careful
with wildcard inclusions. `index.shtml` will show you how to use this pattern, but you need to do the footwork yourself.

Because several styles are generated, z-index optimizations (`zindex`) and ident-name optimizations (`reduceIdents`) are
disabled in the CSSNano config file by default. You probably shouldn't re-enable either unless you have good reason
to do so.

Breakpoints are defined in `/static/src/site-settings.json`, and utilized by SCSS and JS.

> Please use [BEM-syntax](http://getbem.com/naming/)!

> Remember to describe any SCSS-specific structures and wizardry that is not immediately obvious.


### Javascript
All JS is based on ES6 module syntax, and is compiled using Webpack v4. 
Transpiling from ES6 (and ES7, and above) is handled by Babel using the `babel-preset-env`
and `babel-preset-react` presets. CommonJS imports are supported, as are imports from NPM.
Entrypoints for the JS are defined in `setup/config.js`. Each entrypoint will result in a
separate payload, but please only use a single entrypoint and dynamically import your needed
sub-components instead. Webpack and Babel will automatically handle all uses of `import()`,
and this is by far the most future-proof way of doing things. See the comments in `main.js`
for usage examples.

Do not use jQuery. Period.

ESLint is used to ensure code quality, with additional configuration for React-linting baked in.
In most cases you should be unable to check anything in that produces errors, but even so, please
respect the linting and avoid the errors when you can.

Modernizr is built on the fly using `setup/modernizr.json`. You'll need to configure it
to include the detections you need. You can [create your configuration on Modernizr.com](https://modernizr.com/download/)
and choose "Command line config" when building. The results can be pasted directly into
the configuration file.

CSS-in-JS is enabled and supports SCSS, using the same settings as the main styling pipeline,
and using the main SCSS-folders as an include-dir. The script will automatically handle CSS-
and SCSS extraction, but you have a couple of options of what to do with the results:

1. Automatically load styles when encountered (`stylesInJS.useDynamicIncludes = true`). This will insert a style tag when your component is loaded. This can lead to a flash of unstyled content (FOUC), so use with care on slow connections. If you enable `stylesInJS.cssModulesEnabled`, the styles will be injected as blobs instead (see #2).
2. Automatically load styles, and inject them directly during development (`stylesInJS.useDynamicIncludes = true`, `stylesInJS.useStyleInjectionInDevelopment = true`, or `stylesInJS.useDynamicIncludes = true` and `stylesInJS.cssModulesEnabled = true`). This will load the styles as before, but will instead inject them as blobs (in case of the former: only during development; in case of the latter: always). Whether or not this is good for you is up to you.
3. Do not automatically load anything (`stylesInJS.useDynamicIncludes = false`). The CSS-files will still be generated for you, but you will have to include them on your page. This increases your payloads, but may be better in some circumstances. You will only have to load the styles for the entrypoint (ie. `components/main.min.css`) manually, as dynamically imported components will get their styles loaded automatically.

CSS Modules spec is disabled by default. Enabling CSS Modules will obfuscate your imported classnames to
a certain degree, but you can configure this using `classNamePatternDevelopment` and `classNamePatternProduction`,
and even disable it for selected classes using `:global(.whatever) {}`. You can [read more about the way this works here](https://webpack.js.org/loaders/css-loader/#modules)
if you wish. If you do go down this route, remember that all your classnames should be loaded through references, ie.
`import styles from './whatever.scss'; element.className = styles.yourClassNameHere;`.




### BrowserSync.
BrowserSync is enabled by default, and has support for SHTML-files. If you don't want or need BrowserSync,
just disable the task in `setup/config.js`. There are several other useful configuration options, including
port changing and HTTPS-support.

#### Using BrowserSync with a proxy.
You can setup BrowserSync to act as a proxy instead of a server. This lets you serve a local site (from IIS or Visual Studio)
to your local network for easier debugging and testing. Do this by setting the target address in the `tasks.browsersync.proxy`-parameter in
`setup/config.js`. The address must be without the protocol-prefix (`http://` or `https://`).
For example: `"proxy": "localhost:52456"` or `"proxy": "frontline.dis-play.local"`




### Documentation
All the utilities in frontline are documented using [JSDoc](http://usejsdoc.org/) for Javascript and [SassDoc](http://sassdoc.com/annotations/) for SCSS.

Run `npm run docs`. This will generate an easy-to-read set of HTML-files with descriptions and examples for all our utilities.
Good for beginners and for brushing up.

#### Using JSDoc
All utilites and modules need the **@module** annotation.
`@module utils/nameOfUtility` for utilities and `@module nameOfModule` for modules. If the module is a class, write the name with an uppercase first letter.

Use `@param` and `@returns` for functions and methods, when relevant.
Add `@private` for code, that isn't supposed to be accessible outside the utility/module.

Give some examples with `@example` and maybe start it off by writing a description using `<caption>...</caption>`. Captions uses markdown.
If the code in the example is not Javascript, state the correct language by adding a line (after `<caption>` but before the code) like so: `{@lang html}`.

#### Using SassDoc
SassDoc goes through all the scss-files in the folder `utilities` looks for comments starting with **three slashes** and splits them into the groups *helpers*, *placeholders* and *mixins and tools*, by reading the `@group` annotation.

Like in JSDoc, use `@param`, `@returns` and `@example` ... Examples use a bit different syntax. If you need a description, you also need to define the code language `@example scss - Description`.
Add `@access private` for code, that isn't supposed to be shown in the generated documentation files.

There are plenty more annotation to use. Take a look at the existing files, if you need inspiration, and ... oh, yeah ...
Remember to give yourself some credit using the `@author` annotation in both Javascript and SCSS.





