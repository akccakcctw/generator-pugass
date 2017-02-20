const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
// const pug = require('gulp-pug'); // compile pug(jade)
// const compass = require('gulp-compass'); // compile sass
// const uglify = require('gulp-uglify'); // minify js
// const plumber = require('gulp-plumber'); // error handler
// const notify = require('gulp-notify'); // notify message
// const livereload = require('gulp-livereload'); // browser livereload
// const browserSync = require('browser-sync').create(); // browser auto reload

const $ = gulpLoadPlugins();

gulp.task('default', ['css', 'js', 'views']);

gulp.task('watch', () => {
  $.livereload.listen();
  gulp.watch('src/sass/**/*.scss', ['css']);
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('src/views/**/*.pug', ['views']);
});

gulp.task('css', () => {
  gulp.src('src/sass/**/*.scss')
    .pipe($.plumber())
    .pipe($.compass({
      config_file: './config.rb',
      sass: 'src/sass/',
      css: 'dist/css/',
    }))
    .pipe(gulp.dest('dist/css')) // output folder
    .pipe($.notify("Compile Sass Complete!"))
    .pipe($.livereload());
});

gulp.task('js', () => {
  gulp.src('src/js/**/*.js')
    .pipe($.plumber())
    .pipe($.babel())
    .pipe($.uglify()) // minify
    .pipe(gulp.dest('dist/js')) // output folder
    .pipe($.notify("Minify Javascript Complete!"))
    .pipe($.livereload());
});

gulp.task('views', () => {
  gulp.src('src/views/**/*.pug')
    .pipe($.plumber())
    .pipe($.pug({
      pretty: true,
    }))
    .pipe(gulp.dest('dist')) // output folder
    .pipe($.notify("Compile Pug Complete!"))
    .pipe($.livereload());
});