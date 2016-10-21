'use strict';
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    babel = require('gulp-babel'),
    webpack = require('gulp-webpack'),
    sourcemaps = require('gulp-sourcemaps'),
    jsGlob = './src/**/*.js',
    webpackEntry = './dist/components/index.js',
    sassGlob = './src/scss/**/*.scss',
    uncompiledGlob = './src/**/*.!(js|scss)';

gulp.task('run:js', function() {
    return gulp.src(jsGlob)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['react', 'es2015'],
            plugins: ['transform-es2015-destructuring', 'transform-object-rest-spread', 'syntax-object-rest-spread']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});

gulp.task('run:webpack', function() {
    gulp.src(webpackEntry)
        .pipe(webpack({
            output: {filename: '[name].js'}
        }))
        .pipe(gulp.dest('./dist/public/js'));
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

gulp.task('js', ['run:js', 'watch:js']);
gulp.task('sass', ['run:scss', 'watch:scss']);
gulp.task('uncompiled', ['run:uncompiled', 'watch:uncompiled']);
gulp.task('webpack', ['run:webpack', 'watch:webpack']);
gulp.task('run-all', ['js', 'webpack', 'sass', 'uncompiled']);
