// Load Gulp
const { src, dest, task, watch, series, parallel } = require('gulp');

// CSS related plugins
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const purgecss = require('gulp-purgecss');
const cleanCss = require('gulp-clean-css');

// JS related plugins
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

// Image Plugin
const imagemin = require('gulp-imagemin');

// Utility plugins
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const notifier = require('node-notifier');
const plumber = require('gulp-plumber');
const clean = require('gulp-clean');

// Browers related plugins
const browserSync = require('browser-sync').create();

// Project related variables
const styleSRC = './src/scss/main.scss';
const styleURL = './dist/css/';
const mapURL = './';

const jsSRC = './src/js/**/*.js';
const jsURL = './dist/js/';

const imgSRC = './src/images/**/*';
const imgURL = './dist/images/';

const fontsSRC = './src/fonts/**/*';
const fontsURL = './dist/fonts/';

const htmlSRC = './src/**/*.html';
const htmlURL = './dist/';

const styleWatch = './src/scss/**/*.scss';
const jsWatch = './src/js/**/*.js';
const imgWatch = './src/images/**/*.*';
const fontsWatch = './src/fonts/**/*.*';
const htmlWatch = './src/**/*.html';

// Tasks
function browser_sync() {
  browserSync.init({
    server: {
      baseDir: './dist/'
    }
  });
}

function reload(done) {
  browserSync.reload();
  done();
}

function compileScss(done) {
  src([styleSRC])
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', error => {
      const errorMessage = `Path: ${error.relativePath} at line ${error.line}`;
      notifier.notify({
        title: 'Error: Styles',
        message: errorMessage
      });
    })
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 2 versions', '> 5%', 'Firefox ESR']
      })
    )
    .pipe(purgecss({ content: [htmlSRC] }))
    .pipe(cleanCss({ level: 2 }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write(mapURL))
    .pipe(dest(styleURL))
    .pipe(browserSync.stream());
  done();
}

function compileJs(done) {
  src([jsSRC])
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(jsURL))
    .pipe(browserSync.stream());
  done();
}

function minifyImages(done) {
  src([imgSRC], { allowEmpty: true })
    .pipe(
      imagemin([
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 })
      ])
    )
    .pipe(dest(imgURL));
  done();
}

// Clean images folder before minifyImages runs
function cleanImages(done) {
  src([imgURL], { allowEmpty: true }).pipe(clean({ force: true }));
  done();
}

function copyFonts() {
  return triggerPlumber(fontsSRC, fontsURL);
}

function triggerPlumber(src_file, dest_file) {
  return src(src_file)
    .pipe(plumber())
    .pipe(dest(dest_file));
}

function html() {
  return triggerPlumber(htmlSRC, htmlURL);
}

function buildDocs() {
  return triggerPlumber('./dist/**/*.*', './docs/');
}

function watch_files() {
  watch(styleWatch, series(compileScss, reload));
  watch(imgWatch, series(cleanImages, reload));
  watch(imgWatch, series(minifyImages, reload));
  watch(jsWatch, series(compileJs, reload));
  watch(htmlWatch, series(html, reload));
  watch(fontsWatch, series(copyFonts, reload));
}

task('css', compileScss);
task('cleanImages', cleanImages);
task('js', compileJs);
task('images', minifyImages);
task('html', html);
task('fonts', copyFonts);
task('build', buildDocs);
task(
  'default',
  parallel(compileScss, compileJs, cleanImages, minifyImages, copyFonts, html)
);
task('watch', parallel(browser_sync, watch_files));
