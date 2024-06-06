import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import { deleteAsync } from 'del';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

export const headerFooterStyles = () => {
  return gulp.src(['source/less/header.less', 'source/less/footer.less'], { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename((path) => {
      if (path.basename === 'header') {
        path.basename = 'header.min';
      } else if (path.basename === 'footer') {
        path.basename = 'footer.min';
      }
    }))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML

export const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

// Images
export const copyImages = () => {
  return gulp.src(['source/img/**/*.{jpg,png}'])
    .pipe(gulp.dest('build/img'));
}

export const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'));
}

// WebP
export const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh({
      webp: {},
    })
  )
    .pipe(gulp.dest('build/img'));
}

// SVG
export const svg = () => {
  return gulp.src(['source/img/description-items/*.svg', 'source/img/form/*.svg', '!source/img/icons/*.svg'])
  .pipe(svgo())
  .pipe(gulp.dest('build/img'));
}

// Sprite
export const sprite = () => {
  return gulp.src(['source/img/icons/*.svg'])
  .pipe(svgo())
  .pipe(svgstore( {
    inlineSvg: true
  }))
  .pipe(rename('autosprite.svg'))
  .pipe(gulp.dest('build/img'));
}

// Fonts Webmanifest Favicons
export const copy = (done) => {
  gulp.src([
    'source/fonts/lato/*.{woff2,woff}',
    'source/fonts/oswald/*.{woff2,woff}',
    'source/*.ico',
    'source/*.webmanifest',
    'source/img/sprite/*.{svg}'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

// Clean
export const clean = () => {
  return deleteAsync('build');
}

// Reload
export const reload = (done) => {
  browser.reload();
  done();
}

// Server
export const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
    browser: ['Chrome', 'Firefox']
  });
  done();
}

// Watcher
export const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
}

// Build
export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    headerFooterStyles,
    html,
    svg,
    sprite,
    createWebp
  ),
);

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    headerFooterStyles,
    html,
    svg,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  ));
