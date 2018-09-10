const { gulp, config } = global.akqa;



const appveyor = () => gulp.series(config.tasks.appveyor.tasks);

module.exports = appveyor;
