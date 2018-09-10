const dependencyResolver = require('../helpers/dependencyResolver');

const { gulp, config } = global.akqa;

const setProduction = require('./helpers/setProduction');

module.exports = {
    'build': gulp.parallel(dependencyResolver(config.tasks.build.tasks)),
    'build:production': gulp.series(dependencyResolver(setProduction, "clean", config.tasks.build.tasks))
};

