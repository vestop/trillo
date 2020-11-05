const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const htmlmin = require("gulp-htmlmin");
const uglify = require('gulp-uglify');
const sync = require("browser-sync").create();
const concat = require("gulp-concat");

// HTML

const html = () =>
  src("src/**/*.html")
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
      })
    )
    .pipe(dest("dist"))
    .pipe(sync.stream());

exports.html = html;

// Styles

const styles = () =>
  src("src/sass/main.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([require("autoprefixer"), require("postcss-csso")]))
    // .pipe(replace(/\.\.\//g, ""))
    .pipe(rename("main.css"))
    .pipe(dest("dist/css"))
    .pipe(sync.stream());

exports.styles = styles;

const styleLibs = () =>
  src("src/libs/css/**/*.css")
    .pipe(postcss([require("postcss-csso")]))
    .pipe(concat('libs.min.css'))
    .pipe(dest("dist/css"))
    .pipe(sync.stream());

exports.styleLibs = styleLibs


// Scripts

// const scripts = () =>
//   src([
//     'src/js/paper-core.min.js',
//     'src/js/particles.min.js',
//     'src/js/simplex-noise.min.js',
//     'src/js/main.js',
//   ])
//     // .pipe(uglify())
//     .pipe(concat('main.js'))
//     .pipe(dest("dist/js"))
//     .pipe(sync.stream());

// exports.scripts = scripts;

// Copy

const copy = () =>
  src(["src/fonts/**/*", "src/img/**/*"], {
    base: "src",
  })
    .pipe(dest("dist"))
    .pipe(
      sync.stream({
        once: true,
      })
    );

exports.copy = copy;

// Paths

const paths = () =>
  src("dist/**/*.html")
    .pipe(
      replace(/(<link rel="stylesheet" href=")styles\/(main.css">)/, "$1$2")
    )
    .pipe(replace(/(<script src=")scripts\/(main.js">)/, "$1$2"))
    .pipe(dest("dist"));

exports.paths = paths;

// Server

const server = () => {
  sync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: "dist",
      routes: {
        "/node_modules": "node_modules",
      },
    },
  });
};

exports.server = server;

// Watch

const watchChanges = () => {
  watch("src/**/*.html", series(html, paths));
  watch("src/**/*.scss", series(styles));
  // watch("src/js/**/*.js", series(scripts));
  watch(["src/fonts/**/*", "src/img/**/*"], series(copy));
};

exports.watchChanges = watchChanges;

// Default

exports.default = series(
  parallel(html, styles, styleLibs, copy),
  paths,
  parallel(watchChanges, server)
);
