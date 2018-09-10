import svg4everybody from 'svg4everybody';
import onReady from './utils/events/onReady';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from "./app/App";

// import { reactBootstrapper } from './utils/bootstrapper';
// import { CookiePolicy } from "./react-modules";
// reactBootstrapper({
//     CookiePolicy
// });


ReactDOM.render((
    <BrowserRouter>
        <App />
    </BrowserRouter>
), document.getElementById("react-root"));

// Run secondary functions at low priority, giving our own modules time to instantiate first.
onReady(() => {
    svg4everybody();


    /*
    // If you want to properly utilize code splitting, this entire file (main.js) should ONLY do what is absolutely
    // necessary for getting your page off the ground. After that, you can either dynamically import the code you
    // need when you need it (useful for SPA's), or set up multiple entry points and just point to them in gulp/config.json.
    // The latter is useful for "regular" CMS-driven sites.

    // Dynamically import "not-main.js", run it's content and then print a nice message about it:
    import("./not-main").then(() => window.console.info(`notmain.js loaded!`));

    */
}, 150);
