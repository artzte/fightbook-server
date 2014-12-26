var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	jshintReporter = require('jshint-stylish'),
  nodemon = require('gulp-nodemon'),
  mocha = require('gulp-mocha'),
  exit = require('gulp-exit');

/*
 * Create variables for our project paths so we can change in one place
 */
var paths = {
	'src':['./models/**/*.js','./routes/**/*.js', 'keystone.js', 'package.json', './utils/**/*.js', './config/*.js', './config/*.json']
};

// gulp lint
gulp.task('lint', function(){
	gulp.src(paths.src)
		.pipe(jshint())
		.pipe(jshint.reporter(jshintReporter));

});

gulp.task('test', function() {
  return gulp.src(['test/*-test.js', 'test/**/*-test.js'], { read: false })
    .pipe(mocha({
      reporter: 'spec',
      globals: {
        should: require('should')
      }
    }))
    .pipe(exit());
});

gulp.task('develop', function () {
  nodemon({ script: 'keystone.js', ext: 'jade js', ignore: [] })
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('restarted!');
    });
});


gulp.task('default', ['lint', 'develop']);



