/*eslint no-console: 0 */
/*global global */ // heh.

const log = require('fancy-log');
const colors = require('ansi-colors');

const gulp = require('gulp');
const config = require('./setup/config');
const siteSettings = require('./setup/site-settings');
const packageJson  = require('./package');

// Register a namespace on the global-variable for later use.
global.akqa = { gulp, config, siteSettings };



// Let's see if the project has been named and described. If not, it really should be fixed.
const nameIsUnchanged = packageJson.name === "frontline";
const descriptionIsUnchanged = packageJson.description === "AKQA Denmark frontline";


if (nameIsUnchanged || descriptionIsUnchanged) {

    // Set up a promise to resolve once the repo-name-checker is done.
    const checker = new Promise((everythingIsAwesome, everythingIsHorrible) => {

        // "child_process" is a native Node module. Don't worry about it.
        // https://nodejs.org/docs/latest-v8.x/api/child_process.html
        const { spawn } = require('child_process');

        // Run the command "git remote get-url origin".
        const gitCheck = spawn('git', ['remote', 'get-url', 'origin']);

        // We got data back! Hopefully this is the most regular use case. The data is a buffer that should contain
        // the name of the upstream repository... if that matches Frontline v3, we know the user is working on
        // Frontline itself, and they shouldn't be warned. If not, they're working on another repository, and that
        // is a problem.
        gitCheck.stdout.on('data', data => {
            if (data.toString().indexOf("displaydk/frontline-v3") > -1) {
                everythingIsAwesome();
            } else {
                everythingIsHorrible();
            }
        });

        // If a non-fatal error is returned, we'll assume everything is fine. It's probably because there isn't an
        // active git repo here, but either way we shouldn't assume the worst. We'll only warn about it if the user
        // is actively working in a repository.
        gitCheck.stderr.on('data', () => everythingIsAwesome);

        // If the process crashes entirely, it's possible git isn't even installed. Again, not a problem for us.
        gitCheck.on('error', () => everythingIsAwesome);

    });

    // If the promise is rejected, something is fucky. We should warn the user that their documentation is lacking.
    checker.catch(
        () => {

            // We like consistency.
            const primaryColor = "yellow";
            const secondaryColor = "red";

            // A tiny helper to tell which field is jacked up.
            const warnAboutField = fieldName => log(
                colors[primaryColor](colors.bold(`*** Please update `)) +
                colors[secondaryColor](colors.bold(fieldName)) +
                colors[primaryColor](colors.bold(` in `)) +
                colors[secondaryColor](colors.bold('package.json')) +
                colors[primaryColor](colors.bold(` to suit your project.`)));

            console.log('');

            log(colors[primaryColor](colors.bold(`*************************************************************************`)));
            log(colors[primaryColor](colors.bold(`***`)));
            log(colors[primaryColor](colors.bold(`*** IMPORTANT! You are not working on the Frontline repo itself, but:`)));
            log(colors[primaryColor](colors.bold(`***`)));

            if (nameIsUnchanged) {
                log(colors[primaryColor](colors.bold(`*** Your project title is set to `)) + colors[secondaryColor](colors.bold(packageJson.name)));
                warnAboutField('title');
                if (descriptionIsUnchanged) {
                    log(colors[primaryColor](colors.bold(`***`)));
                }
            }

            if (descriptionIsUnchanged) {
                log(colors[primaryColor](colors.bold(`*** Your project description is set to `)) + colors[secondaryColor](colors.bold(packageJson.description)));
                warnAboutField('description');
            }

            log(colors[primaryColor](colors.bold(`***`)));
            log(colors[primaryColor](colors.bold(`*************************************************************************`)));
            console.log('');
        }
    );


}

require('./gulp/taskLoader')();
