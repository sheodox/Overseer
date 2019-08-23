'use strict';
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    babel = require('gulp-babel'),
    _webpack = require('gulp-webpack'),
    _svgmin = require('gulp-svgmin'),
    sourcemaps = require('gulp-sourcemaps'),
    jsGlob = './src/**/*.js',
    webpackEntry = './dist/components/index.js',
    adminWebpackEntry = './dist/admin/admin-main.js',
    sassGlob = './src/scss/**/*.scss',
    uncompiledGlob = './src/**/*.!(js|scss|svg)',
    svgGlob = './src/**/*.svg';

 function runjs() {
    return gulp.src(jsGlob)
        .pipe(babel({
            presets: ['@babel/react'],
            plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-object-rest-spread']//, 'transform-class-properties']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
};
exports.runjs = runjs;
function runwebpack() {
    return gulp.src(webpackEntry)
        .pipe(_webpack({
            output: {filename: '[name].js'},
            devtool: 'source-map'
        }))
        .pipe(gulp.dest('./dist/public/js'));
}
exports.runwebpack = gulp.series(runjs, runwebpack);
function runwebpackadmin() {
    return gulp.src(adminWebpackEntry)
        .pipe(_webpack({
            output: {filename: '[name].js'},
            devtool: 'source-map'
        }))
        .pipe(gulp.dest('./dist/admin'));
}
exports.runwebpackadmin = gulp.series(runjs, runwebpackadmin);
function runscss() {
    return gulp.src(sassGlob)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/public/css'));
}
exports.runscss = runscss;
function rununcompiled() {
    return gulp.src(uncompiledGlob)
        .pipe(gulp.dest('./dist'));
}
exports.rununcompiled = rununcompiled;
function runsvgmin() {
    return gulp.src(svgGlob)
        .pipe(_svgmin(function(file) {
                return {
                    plugins: [
                        { cleanupIDs: false },
                        { removeAttrs: { attrs: ['(fill|stroke|class|style)'] }},
                    ]
                }
            }
        ))
        .pipe(gulp.dest('./dist'));
}
exports.runsvgmin = runsvgmin;
function watchjs() {
    return gulp.watch(jsGlob, runjs);
}
exports.watchjs = watchjs;
function watchscss() {
    return gulp.watch(sassGlob, runscss);
};
exports.watchscss = watchscss;
function watchuncompiled() {
    return gulp.watch(uncompiledGlob, rununcompiled);
}
exports.watchuncompiled = watchuncompiled;
function watchwebpack() {
    return gulp.watch(webpackEntry, runwebpack);
}
exports.watchwebpack = watchwebpack;
function watchwebpackadmin() {
    return gulp.watch(adminWebpackEntry, runwebpackadmin);
}
exports.watchwebpackadmin = watchwebpackadmin;
function watchsvgmin() {
    return gulp.watch(svgGlob, runsvgmin);
}
exports.watchsvgmin = watchsvgmin;

const js = gulp.series(runjs, watchjs);
exports.js = js;
const scss = gulp.series(runscss, watchscss);
exports.scss = scss;
const uncompiled = gulp.series(rununcompiled, watchuncompiled);
exports.uncompiled = uncompiled;
const webpack = gulp.series(runwebpack, watchwebpack);
exports.webpack = webpack;
const webpackadmin = gulp.series(runwebpackadmin, watchwebpackadmin);
exports.webpackadmin = webpackadmin;
const svgmin = gulp.series(runsvgmin, watchsvgmin);
exports.svgmin = svgmin;
const runall = gulp.series(js, webpack, webpackadmin, scss, uncompiled, svgmin);
exports.runall = runall;
const build = gulp.series(runjs, runwebpack, runwebpackadmin, runscss, rununcompiled, runsvgmin);
exports.build = build;
