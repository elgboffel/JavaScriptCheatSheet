const log = require("fancy-log");
const colors = require("ansi-colors");
const complimentsC = [
    "Amazing!",
    "Astonishing!",
    "Awesome!",
    "Brilliant!",
    "Cool!",
    "Cool burger!",
    "Fantastic!",
    "Good going!",
    "Great job!",
    "I dig you!",
    "I like you!",
    "I like your style!",
    "Impressive!",
    "Muy bien!",
    "Nice code!",
    "Nice going!",
    "Nice motor control!",
    "Sweet, dude!",
    "Terrific!",
    "That's good!",
    "That's really nice!",
    "That's superb!",
    "Victory!",
    "Way to go!",
    "Well done!",
    "Well played!",
    "Wonderful!",
    "You are a champ!",
    "You done good!",
    "You get an A+!",
    "You go, girl!",
    "You got the power!",
    "You have good taste.",
    "You intrigue me.",
    "You make me happy!",
    "You rock!",
    "You rule!",
    "You win!",
    "You're #1!",
    "You're awesome!",
    "You're doing well!",
    "You're grrreat!",
    "You're so rad!",
    "You're so smart!",
    "You're the bee's knees!"
];
const complimentsB = [
    "A great success!",
    "Breathtaking!",
    "Brilliant job!",
    "Even my cat likes you!",
    "Excellent!",
    "Fabulous!",
    "Formidable!",
    "Have you been working out?",
    "Keep doing what you're doing!",
    "Keep it up!",
    "Nothing can stop you!",
    "Outstanding work!",
    "Pure quality!",
    "Superior work!",
    "Stunning!",
    "That's the way - aha aha!",
    "We should start a band!",
    "You OWN that code!",
    "You complete me ♥",
    "Your glass is the fullest!",
    "Your grass is the greenest!",
    "You're in control!",
    "You're the best!"
];
const complimentsA = [
    "*tips fedora*",
    "All hail you!",
    "Are you magic?",
    "I'm proud of you!",
    "Is it hot in here or is it just you?",
    "It's perfect!",
    "Majestic!",
    "Marvelous!",
    "My mom always asks me why I can't be more like you.",
    "This is truly above and beyond.",
    "Where do you hide your wings?",
    "Wow! Is this real life?",
    "You both rock AND roll!",
    "You have powerful skills!",
    "You set a high bar!",
    "You're on a roll!",
    "You're unbelievable!",
    "You're unstoppable!"
];

const lintScore = {};

/**
 * Print lint status to log
 *
 * @param {string} lintName - Name of the lint tool (e.g. "ESLint" or "Stylelint").
 * @param {object} messages - Object of messages from the lint tool.
 * @param {"error"|"warning"} messages.type - Type of message. Error or warning.
 * @param {string} messages.rule - The name of the rule that is prohibiting this type of coding.
 * @param {number} messages.line - Line number where the error is present.
 * @param {number} messages.column - Column number where the error is present.
 * @param {string} [messages.message] - Error/warning message.
 * @param {string} [messages.source] - The part of the code that is causing problems (not currently in use).
 * @param {number} fileCount - Total number of files that have been processed.
 */
module.exports = (lintName, messages, fileCount) => {
    const filesThatAreAllJackedUp = Object.keys(messages);
    let warningCount = 0;
    let errorCount = 0;

    // Make sure there's a score for the current lint
    if (typeof lintScore[lintName] === "undefined") {
        lintScore[lintName] = 0;
    }

    // Count warnings and errors
    filesThatAreAllJackedUp.forEach(filename => {
        messages[filename].forEach(message => {
            if (message.type === "warning") {
                warningCount += 1;
            } else if (message.type === "error") {
                errorCount += 1;
            }
        });
    });

    if (warningCount + errorCount > 0) {

        // Punish!
        Object.keys(lintScore).forEach(lintScoreKey => {
            if (lintScoreKey === lintName) {
                // Decrease this lint score by 5 points
                lintScore[lintScoreKey] = Math.max(0, lintScore[lintScoreKey] - 5);
            } else {
                // Decrease all other lint scores by 1 point
                lintScore[lintScoreKey] = Math.max(0, lintScore[lintScoreKey] - 1);
            }
        });

        console.log(`           ${colors.red(colors.bold('************************************************************************************'))}`);
        log(colors.red(colors.bold(`${lintName} report - ${fileCount} file${fileCount !== 1 ? 's' : ''} processed, ${filesThatAreAllJackedUp.length} ha${filesThatAreAllJackedUp.length !== 1 ? 've' : 's'} issues`)));
        console.log(`           ${colors.red(colors.bold('************************************************************************************'))}`);
        console.log("");

        filesThatAreAllJackedUp.forEach(filename => {
            console.log(`           ${colors.red(colors.bold(filename))}`);
            messages[filename].forEach(message =>
                console.log(`               ${colors[message.type === 'error' ? 'red' : 'yellow'](`[${message.type.toUpperCase()}]`)} (${message.line}:${message.column}) ${message.message} ${colors.gray(`(${message.rule})`)}`)
            );
            console.log("");
        });

        console.log("");

        if (warningCount > 0) {
            log(colors.yellow(`*** ${lintName}: ${warningCount} warning${warningCount !== 1 ? 's' : ''} found.`));
        }
        if (errorCount > 0) {
            log(colors.red(`*** ${lintName}: ${errorCount} error${errorCount !== 1 ? 's' : ''} found.`));
            log(colors.bold(colors.red(`*** Please do not check these in!`)));
        }

        console.log(`           ${colors.red(colors.bold('************************************************************************************'))}`);

    } else {

        // Increase lint score
        lintScore[lintName] += 1;

        let successCompliment;
        if (lintScore[lintName] < 5) {

            // Score is less than 5
            // Show compliment from category C
            successCompliment = complimentsC[Math.floor(Math.random() * complimentsC.length)];

        } else if (lintScore[lintName] < 10) {

            // Score is less than 10
            // Show compliment from category C and B
            successCompliment = complimentsB.concat(complimentsC)[Math.floor(Math.random() * (complimentsB.length + complimentsC.length))];

        } else if (lintScore[lintName] < 15) {

            // Score is less than 15
            // Show compliment from category B and A
            successCompliment = complimentsA.concat(complimentsB)[Math.floor(Math.random() * (complimentsA.length + complimentsB.length))];

        } else {

            // Score is 15 or more
            // Show any compliment
            successCompliment = complimentsA.concat(complimentsB, complimentsC)[Math.floor(Math.random() * (complimentsA.length + complimentsB.length + complimentsC.length))];

        }

        log(colors.bold(colors.green(`${lintName}: no errors found in ${fileCount} scanned file${fileCount !== 1 ? 's' : ''}! ${successCompliment}`)));

    }
};
