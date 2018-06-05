'use strict';
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    babel = require('gulp-babel'),
    webpack = require('gulp-webpack'),
    svgmin = require('gulp-svgmin'),
    sourcemaps = require('gulp-sourcemaps'),
    jsGlob = './src/**/*.js',
    webpackEntry = './dist/components/index.js',
    adminWebpackEntry = './dist/admin/admin-main.js',
    sassGlob = './src/scss/**/*.scss',
    uncompiledGlob = './src/**/*.!(js|scss|svg)',
    svgGlob = './src/**/*.svg';

gulp.task('run:js', function() {
    return gulp.src(jsGlob)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['react', 'es2015'],
            plugins: ['transform-es2015-destructuring', 'transform-object-rest-spread', 'syntax-object-rest-spread'],
            sourceMap: true
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});

gulp.task('run:webpack', ['run:js'], function() {
    gulp.src(webpackEntry)
        .pipe(webpack({
            output: {filename: '[name].js'},
            devtool: 'source-map'
        }))
        .pipe(gulp.dest('./dist/public/js'));
});

gulp.task('run:webpack-admin', ['run:js'], function() {
    gulp.src(adminWebpackEntry)
        .pipe(webpack({
            output: {filename: '[name].js'},
            devtool: 'source-map'
        }))
        .pipe(gulp.dest('./dist/admin'));
});

gulp.task('run:scss', function() {
    gulp.src(sassGlob)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/public/css'));
});

gulp.task('run:uncompiled', function() {
    gulp.src(uncompiledGlob)
        .pipe(gulp.dest('./dist'));
});

gulp.task('run:svgmin',  function() {
    gulp.src(svgGlob)
        .pipe(svgmin(function(file) {
                return {
                    plugins: [{
                        cleanupIDs: false
                    }]
                }
            }
        ))
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch:js', function() {
    gulp.watch(jsGlob, ['run:js']);
});

gulp.task('watch:scss', function() {
    gulp.watch(sassGlob, ['run:scss']);
});

gulp.task('watch:uncompiled', function() {
    gulp.watch(uncompiledGlob, ['run:uncompiled']);
});

gulp.task('watch:webpack', function() {
    gulp.watch(webpackEntry, ['run:webpack']);
});

gulp.task('watch:webpack-admin', function() {
    gulp.watch(adminWebpackEntry, ['run:webpack-admin']);
});

gulp.task('watch:svgmin', function() {
    gulp.watch(svgGlob, ['run:svgmin']);
});

gulp.task('js', ['run:js', 'watch:js']);
gulp.task('sass', ['run:scss', 'watch:scss']);
gulp.task('uncompiled', ['run:uncompiled', 'watch:uncompiled']);
gulp.task('webpack', ['run:webpack', 'watch:webpack']);
gulp.task('webpack-admin', ['run:webpack-admin', 'watch:webpack-admin']);
gulp.task('svgmin', ['run:svgmin', 'watch:svgmin']);
gulp.task('run-all', ['js', 'webpack', 'webpack-admin', 'sass', 'uncompiled', 'svgmin']);
gulp.task('build', ['run:js', 'run:webpack', 'run:webpack-admin', 'run:scss', 'run:uncompiled', 'run:svgmin']);
