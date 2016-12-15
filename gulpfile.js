const gulp = require('gulp');
const child = require('child_process');
const gutil = require('gulp-util');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const bump = require('gulp-bump');

const siteRoot = '_site';

// start browsersync and build site
gulp.task('serve', ['prefix', 'jekyll-build'], () => {
  browserSync.init({
    files: [siteRoot],
    port: 4000,
    server: {
      baseDir: siteRoot
    }
  });
});

// compile sass and prefix, save to '_site/css' for live injection and to 'css' for rebuild.
gulp.task('prefix', () => {
  gulp.src('_sass/main.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('_site/css'))
    .pipe(browserSync.stream())
    .pipe(gulp.dest('css'));
});

// watch file's for changes
gulp.task('watch', () => {
    gulp.watch(['_sass/**/*.scss','_sass/*.scss'], ['prefix']);
    gulp.watch(['*.html', '_layouts/*.html', '_posts/*', '_includes/*.html', '_includes/**/*.html', 'js/*.js'], ['jekyll-rebuild']);
});

// rebuild site and reload page
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

// log jekyll output to console
const Logger = (buffer) => {
  buffer.toString()
  .split(/\n/)
  .forEach((message) => gutil.log(message));
};

// build site
gulp.task('jekyll-build', () => {
  const jekyll = child.spawn('jekyll', ['build']);

  jekyll.stdout.on('data', Logger);
  jekyll.stderr.on('data', Logger);
});

// build site in production enviroment
gulp.task('release', ['prefix'], () => {
  const jekyll = child.exec('./build.sh')

  jekyll.stdout.on('data', Logger);
  jekyll.stderr.on('data', Logger);
});

// bump version number
gulp.task('bump', () => {
  gulp.src('package.json')
  .pipe(bump())
  .pipe(gulp.dest('./'));
});

gulp.task('bump-feature', () => {
  gulp.src('package.json')
  .pipe(bump({type:'minor'}))
  .pipe(gulp.dest('./'));
});

gulp.task('bump-version', () => {
  gulp.src('package.json')
  .pipe(bump({type:'major'}))
  .pipe(gulp.dest('./'));
});

gulp.task('default', ['serve', 'watch']);
