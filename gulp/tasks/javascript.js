/*global global, __dirname */
const { config } = global.akqa;
const destMultiple = require("../helpers/destMultiple");
const buildFolderCollection = require("../helpers/buildFolderCollection");
const notifier = require("node-notifier");
const path = require("path");
const defaultOutputFolders = buildFolderCollection(config.tasks.javascript.targetFolder);
const colors = require("ansi-colors");
const log = require("fancy-log");


function errorHandler(err) {
    notifier.notify({
        title: 'JS compile error',
        message: err.message,
        icon: path.resolve(__dirname, '../icons/js.png')
    });

    log(colors.red("******************************************************************************"));
    if (err.loc) {
        const msg = `: ${err.message}`;
        log(`${colors.red(colors.bold(err.loc.file))}${colors.yellow(msg)}`);
    } else {
        log(colors.red(colors.bold(err.message)));
    }
    if (err.snippet) {
        log(colors.yellow(err.snippet));
    }
    log(colors.red("******************************************************************************"));

    if (global.akqa.production) {
        throw new Error(err.message);
    }

    this.emit('end');
}



let baseConfiguration;


/**
 * Build and return the base configuration. Done once and then cached so we
 * won't have to do it constantly.
 *
 * @private
 * @returns {object}
 */
function getBaseConfiguration() {

    if (!baseConfiguration) {
        const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
        const MiniCssExtractPlugin = require("mini-css-extract-plugin");
        const jsonSASSImporter = require("node-sass-json-importer");

        // Find out whether or not to build for production use.
        const buildForProduction = global.akqa.production || !config.disableMinificationDuringDevelopment;

        const optimization = {};

        // Begin an array containing all our Webpack-plugins. We will be using this later.
        const plugins = [];

        const webpackModuleRules = [];

        // Add the plugins you need for Babel to this array. Babel is configured just before the output stage.
        const babelPlugins = [
            ["@babel/proposal-class-properties"],
            ["@babel/proposal-object-rest-spread", { "useBuiltIns": true }]
        ];




        // ****************************************************************************************************************
        // ****************************************************************************************************************
        // ****************************************************************************************************************
        //
        //
        // STYLES-IN-JS CONFIGURATION
        //
        // If you are not going to use CSS-in-JS, you can skip this entire section (the next ~200 lines or so). If you do
        // want to use it, you should probably familiarize yourself with what is possible in our pipeline. Basic
        // documentation is included below.
        //
        //
        // ****************************************************************************************************************
        // ****************************************************************************************************************
        // ****************************************************************************************************************

        const processedCSSLocation = `../${config.tasks.scss.targetFolder}/${config.tasks.javascript.stylesInJS.outputFolderName}/`;




        // We want some configuration for both the CSS-loader and the SCSS-loader that we're configuring soon.
        const cssLoaderConfig = {
            minimize: buildForProduction,
            // Enable CSS modules or nah?
            modules: config.tasks.javascript.stylesInJS && config.tasks.javascript.stylesInJS.cssModulesEnabled,
            localIdentName: buildForProduction
                ? config.tasks.javascript.stylesInJS.classNamePatternProduction  || '[name]--[hash:base64:6]'
                : config.tasks.javascript.stylesInJS.classNamePatternDevelopment || '[path][name]__[local]--[hash:base64:6]'
        };



        const scssLoaderConfig = {
            includePaths: [path.resolve(config.folders.root, config.folders.sourceFolder, config.tasks.scss.sourceFolder)],
            importer: [jsonSASSImporter],
            outputStyle: buildForProduction ? "compressed" : "compact"
        };


        let cssLoader;
        let scssLoader;


        if (config.tasks.javascript.stylesInJS.useDynamicIncludes) {

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // If we're here, we're gonna export our CSS (and SCSS) to CSS-files in the CSS output folder (usually these
            // end up as "css/components/whatever.hashValue.css"), and the JS will include them dynamically when needed.
            // Please note that if you have enabled "useStyleInjectionInDevelopment", the styles will be injected as style
            // blobs during runtime - this is cool for fast testing, and possibly hot module replacement (if supported),
            // but you should test it in production mode as well.
            //
            //
            // PROS: This is really cool, and your initial stylesheets will be a lot smaller.
            //
            // CONS: BE AWARE THAT THIS MIGHT LEAD TO FOUC (Flash Of Unstyled Content) IF THE CONNECTION IS SLOW!
            //       You can alleviate this problem by setting the initial styles of your app to hidden inside your
            //       critical CSS, and then override it using the component styles here.
            //
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            // Style injection will be forced if CSS modules are enabled (because `style-loader/url` doesn't seem to work
            // with the CSS module syntax..?), or if we've enabled injection during development and production building
            // is disabled.
            const injectStyles = config.tasks.javascript.stylesInJS.cssModulesEnabled || (config.tasks.javascript.stylesInJS.useStyleInjectionInDevelopment && !buildForProduction);

            // Configure the basic loaders
            const fileLoader = { loader: "file-loader", options: { name: `${processedCSSLocation}${config.tasks.javascript.stylesInJS.dynamicFilename}` } };
            const styleLoaderName = injectStyles ? 'style-loader' : 'style-loader/url';

            // If we're not in production, and we want to inject the styles, use the css-loader. Otherwise use the file-loader.
            const loaderToUse     = injectStyles ? { loader: 'css-loader', options: cssLoaderConfig } : fileLoader;

            // Configure the CSS-loader.
            cssLoader = {
                test: /\.css$/,
                use: [
                    { loader: styleLoaderName, options: { sourceMap: !buildForProduction } },
                    loaderToUse
                ]
            };

            // Configure the SCSS-loader.
            scssLoader = {
                test: /\.scss$/,
                use: [
                    { loader: styleLoaderName, options: { sourceMap: !buildForProduction } },
                    loaderToUse,
                    {
                        loader: 'sass-loader',
                        options: scssLoaderConfig
                    }
                ]
            };



        } else {

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // If we're here, we will process the styles like above, but we will NOT dynamically import the styles. Not
            // even if "useStyleInjectionInDevelopment" is enabled.
            //
            //
            // PROS: This prevents the FOUCs, because you will have to manually include the files in your viewfiles
            //       or wherever you are using this. Also, if any of your styling should be independent of JS-support,
            //       this is the way to go.
            //
            // CONS: You WILL have to manually include the files to see any of your styling.
            //
            //
            // HOWEVER: if you dynamically import code that imports styles, these will be dynamically imported automatically
            // as well. This means that any styling imported inside your main script will NOT be injected, but merely output
            // to a file (named like your entry point). Any styling imported inside files you import() dynamically will be
            // put into separate files and included dynamically at runtime.
            //
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            // Make sure we have a plugin ready to extract SCSS from our JS-files.
            const extractStylesPlugin = new MiniCssExtractPlugin({
                filename: `${processedCSSLocation}${config.tasks.javascript.stylesInJS.staticFilename}`
            });

            plugins.push(extractStylesPlugin);


            cssLoader = {
                test: /\.css$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: 'css-loader', options: cssLoaderConfig }
                ]
            };

            scssLoader = {
                test: /\.scss$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    {
                        loader: 'css-loader',
                        options: cssLoaderConfig
                    },
                    {
                        loader: 'sass-loader',
                        options: scssLoaderConfig
                    },
                ]
            };
        }



        // Our various Webpack loader modules need some rules, so let's set them now.
        webpackModuleRules.push(cssLoader);
        webpackModuleRules.push(scssLoader);






        // ****************************************************************************************************************
        // ****************************************************************************************************************
        // ****************************************************************************************************************
        //
        //
        // SVG INLINE IMPORT LOADER
        // ... because loading SVGs as resources for use in the frontend is pretty damned awesome.
        //
        // If you need other file types, and they shouldn't pass through the SVG optimizer first, use the
        // "raw loader" instead: https://github.com/webpack-contrib/raw-loader
        //
        //
        // ****************************************************************************************************************
        // ****************************************************************************************************************
        // ****************************************************************************************************************

        webpackModuleRules.push({
            test: /\.svg$/,
            loader: 'svg-inline-loader'
        });







        // ****************************************************************************************************************
        // ****************************************************************************************************************
        // ****************************************************************************************************************
        //
        //
        // CODE UGLIFY
        //
        //
        // ****************************************************************************************************************
        // ****************************************************************************************************************
        // ****************************************************************************************************************

        // Uglify the code if we're building for production.
        if (buildForProduction) {
            plugins.push(
                new UglifyJSPlugin({
                    uglifyOptions: {
                        output: { beautify: false },
                        compress: { "drop_debugger": global.akqa.production }
                    }
                })
            );
        }










        // ****************************************************************************************************************
        // ****************************************************************************************************************
        // ****************************************************************************************************************
        //
        //
        // CODE SPLITTING CONFIGURATION
        //
        //
        // ****************************************************************************************************************
        // ****************************************************************************************************************
        // ****************************************************************************************************************

        // We'll need a plugin for dynamically loading stuff "through" Babel, too. Really,
        // this is all that's needed with Webpack 4. Crazy.
        babelPlugins.push('@babel/syntax-dynamic-import');







        // ****************************************************************************************************************
        // ****************************************************************************************************************
        // ****************************************************************************************************************
        //
        //
        // CODE TRANSPILING
        //
        //
        // ****************************************************************************************************************
        // ****************************************************************************************************************
        // ****************************************************************************************************************

        // Time to add Babel. Because reasons.
        webpackModuleRules.unshift({
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        ["@babel/env", config.tasks.javascript.babelPresetEnv],
                        "@babel/react"
                    ],
                    plugins: babelPlugins
                }
            }
        });






        // ****************************************************************************************************************
        // ****************************************************************************************************************
        // ****************************************************************************************************************
        //
        //
        // OUTPUT STAGE
        //
        //
        // ****************************************************************************************************************
        // ****************************************************************************************************************
        // ****************************************************************************************************************


        baseConfiguration = {
            // Generate a ("cheap") source map in line inside the JS-file if we're not building for production.
            devtool: !global.akqa.production ? 'cheap-module-eval-source-map' : false,
            mode: buildForProduction ? 'production' : 'development',
            plugins,
            optimization,
            output: {
                filename: "[name].min.js",
                // publicPath is needed for dynamically imported code. It should point to the folder on the server where we can find the "lazy" files.
                publicPath: config.folders.dynamicJSImportSource,
                chunkFilename: "[name].min.js",
                pathinfo: true
            },
            module: {
                rules: webpackModuleRules
            }
        };
    }


    return baseConfiguration;

}





/**
 * Perform compilation of a single javascript file.
 *
 * @param {object} entrypoints - The files to process.
 * @returns {*}
 */
function doCompile(entrypoints) {

    const webpackStream = require("webpack-stream");

    const configuration = getBaseConfiguration();
    configuration.entry = entrypoints;


    // Okay, that's enough configuration. Go! GO GO GO!
    const pipe = webpackStream(configuration)
        .on('error', errorHandler) // Handle errors in Rollup gracefully
        .pipe(destMultiple(defaultOutputFolders));


    // We can't use gulp-if here, since the instance might be undefined, which screws up everything.
    // This, however ugly, works fine.
    if (global.akqa.browsersyncInstance) {
        pipe.pipe(global.akqa.browsersyncInstance.stream({match: '**/*.js'}));
    }

    return pipe;

}


function javascript() {

    const filesToRender = {};

    if (typeof config.tasks.javascript.entryPoints === "object") {
        config.tasks.javascript.entryPoints.forEach(entry =>
            filesToRender[path.basename(entry, path.extname(entry))] = path.resolve(config.folders.root, config.folders.sourceFolder, config.tasks.javascript.sourceFolder, entry)
        );

    } else {

        filesToRender[path.basename(config.tasks.javascript.entryPoints, path.extname(config.tasks.javascript.entryPoints))] = path.resolve(config.folders.root, config.folders.sourceFolder, config.tasks.javascript.sourceFolder, config.tasks.javascript.entryPoints);

    }

    return doCompile(filesToRender);

}



module.exports = javascript;
