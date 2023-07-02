const { src, dest, parallel, series, watch }   = require('gulp');
const exec                                     = require('child_process').exec;
const sass                                     = require('gulp-sass')(require('sass'));
const bs                                       = require('browser-sync').create();
const imagemin                                 = require('gulp-imagemin');
const webp                                     = require('gulp-webp');
const resize                                   = require('gulp-image-resize');
const rename                                   = require('gulp-rename');
const newer                                    = require('gulp-newer');



function jekyllBuild(done) {
  exec('jekyll build', function (error, stdout, stderr) {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    done();
  });
}

exports.jekyllBuild = jekyllBuild;

function browserSync() {
  bs.init({
    server: {
      baseDir: '_site'
    },
    notify: false
  });
}
exports.browserSync = browserSync;

function img(cb) {
  [700, 1400].forEach(function (size) {
    src(['assets/images/src/**/*.jpg', '!assets/images/src/**/*-thumb.jpg'])
      .pipe(resize({ width: size }))
      .pipe(rename(function (path) { path.basename = `${path.basename}@${size}w`; }))
      .pipe(newer('assets/images'))
      .pipe(imagemin([ imagemin.mozjpeg({quality: 75, progressive: true}) ]))
      .pipe(dest('assets/images'))
      .pipe(webp({quality: 75}))
      .pipe(dest('assets/images'))
  });
  [700, 350].forEach(function (size) {
    src('assets/images/src/**/*-thumb.jpg')
      .pipe(resize({ width: size }))
      .pipe(rename(function (path) { path.basename = `${path.basename}@${size}w`; }))
      .pipe(newer('assets/images'))
      .pipe(imagemin([ imagemin.mozjpeg({quality: 75, progressive: true}) ]))
      .pipe(dest('assets/images'))
      .pipe(webp({quality: 75}))
      .pipe(dest('assets/images'))
  });
  return src('assets/images/src/**/*.svg')
    .pipe(newer('assets/images'))
    .pipe(imagemin([ imagemin.svgo({ plugins: [ {removeViewBox: true}, {cleanupIDs: true} ] }) ]))
    .pipe(dest('assets/images'))
  cb()
}
exports.imgs = img;

function watcher() {
  watch(['*.html', 'assets/**/*.scss', '_layouts/*.html', '_includes/*.html', '_posts/*.md', '_pages/*.html', '_config.yml', '_data/*.yml', 'en/**']).on('change', series(jekyllBuild, bs.reload));
}

exports.watcher             = watcher;
exports.default             = series(jekyllBuild, browserSync, watcher);
