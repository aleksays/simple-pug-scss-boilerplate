const gulp         = require('gulp');
const sass         = require('gulp-sass');
const browsersync  = require('browser-sync').create();
const del          = require('del');
const imagemin     = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const csso         = require('gulp-csso');
const pug          = require('gulp-pug');
const data         = require('gulp-data');
const htmlmin      = require('gulp-htmlmin');
const uglify       = require('gulp-uglify');
const concat       = require('gulp-concat');
const pump         = require('pump');
const svgSprite    = require('gulp-svg-sprite');


const path = {
    build:    './build',
    css:      {
        source:      './scss/main.+(scss|sass)',
        dest:        './build',
        watchSource: './scss/**/*.scss',
    },
    html:     {
        indexSource: './*.html',
        dest:        './build',
        watchSource: './*.html',
    },
    scripts:  {
        source:      './js/**/*',
        dest:        './build/js/',
        watchSource: './js/**/*.js',
    },
    images:   {
        source: './assets/img/',
        dest:   './build/assets/img/',
    },
    fonts:    {
        source: './assets/fonts/**/*',
        dest:   './build/assets/fonts/',
    },
    svgSprite: {
        source: './assets/img/svg/*.svg',
        dest: './build/assets/img/svg/',
    }
};

// Clean
gulp.task('clean', done => {
    del.sync(path.build);
    done();
});

// Svg Sprite
gulp.task('svgSprite', done => {
    gulp.src(path.svgSprite.source)
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg',
                }
            }
        }))
        .pipe(gulp.dest(path.svgSprite.dest));
    done();
});

// Css
gulp.task('css', done => {
    gulp
        .src(path.css.source)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(['last 5 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
        .pipe(csso())
        .pipe(gulp.dest(path.css.dest))
        .pipe(browsersync.stream());
    done();
});

// De-caching for Data files
function requireUncached($module) {
    delete require.cache[require.resolve($module)];
    return require($module);
}

// Html
gulp.task('html', done => {
    gulp
        .src(path.html.indexSource)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(path.build))
        .pipe(browsersync.stream());
    done();
});

// Scripts
gulp.task('scripts', cb => {
    pump([
            gulp.src(path.scripts.source),
            concat('script.js'),
            uglify(),
            gulp.dest(path.scripts.dest),
        ],
        cb,
    );
});

// Images
gulp.task('images', done => {
    gulp
        .src(path.images.source)
        .pipe(gulp.dest(path.images.dest));
    done();
});

//Fonts
gulp.task('fonts', done => {
    gulp
        .src(path.fonts.source)
        .pipe(gulp.dest(path.fonts.dest));
    done();
});

// BrowserSync
function reload(done) {
    browsersync.reload();
    done();
}

gulp.task('browser-sync', done => {
    browsersync.init({
        server: {
            baseDir: path.build,
        },
        notify: false,
    });
    done();
});

// Watch files
gulp.task('watch', done => {
    gulp.watch(path.css.watchSource, gulp.series('css', reload));
    gulp.watch(path.html.watchSource, gulp.series('html', reload));
    gulp.watch(path.scripts.watchSource, gulp.series('scripts', reload));
    done();
});

gulp.task('default', gulp.parallel('clean', 'css', 'html', 'scripts', 'fonts', 'svgSprite', 'images', 'browser-sync', 'watch'));
