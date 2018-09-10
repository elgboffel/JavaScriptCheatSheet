const { gulp } = global.akqa;
const dependencyResolver = require('../helpers/dependencyResolver');

const setProduction = require('./helpers/setProduction');
const setCastlab = require('./helpers/setCastlab');


const defaultTask = gulp.series(dependencyResolver("build", "watch"));


module.exports = {
    "default": defaultTask,
    "default:castlab": gulp.series(setCastlab, defaultTask),
    "default:production": gulp.series(setProduction, defaultTask)
};

