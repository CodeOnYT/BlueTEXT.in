const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();

// Clean dist folder
function clean() {
  return del(['dist']);
}

// Process HTML files
function html() {
  return src('*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true
    }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

// Process CSS files
function styles() {
  return src('styles/**/*.css')
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(concat('main.min.css'))
    .pipe(dest('dist/styles'))
    .pipe(browserSync.stream());
}

// Process JavaScript files
function scripts() {
  return src('scripts/**/*.js')
    .pipe(terser())
    .pipe(concat('main.min.js'))
    .pipe(dest('dist/scripts'))
    .pipe(browserSync.stream());
}

// Optimize images
function images() {
  return src('assets/**/*')
    .pipe(imagemin())
    .pipe(dest('dist/assets'))
    .pipe(browserSync.stream());
}

// Copy other files
function copyFiles() {
  return src([
    'CNAME',
    'app-ads.txt',
    'robots.txt',
    'sitemap.xml'
  ], { allowEmpty: true })
    .pipe(dest('dist'));
}

// Development server
function serve(cb) {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });
  
  watch('*.html', html);
  watch('styles/**/*.css', styles);
  watch('scripts/**/*.js', scripts);
  watch('assets/**/*', images);
  
  cb();
}

// Build task
const build = series(
  clean,
  parallel(html, styles, scripts, images, copyFiles)
);

// Development task
const dev = series(build, serve);

// Export tasks
exports.clean = clean;
exports.build = build;
exports.serve = dev;
exports.default = dev;