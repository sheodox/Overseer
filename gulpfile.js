var gulp = require("gulp"),
    babelify = require('babelify'),
    browserify = require("browserify"),
    connect = require("gulp-connect"),
    source = require("vinyl-source-stream");


gulp.task("build", function(){
    return browserify({
        entries: ["./jsx/index.js"],
        extensions: [".js", ".jsx"]
    })
        .transform(babelify.configure({
            presets : ["es2015", "react"]
        }))
        .bundle()
        .pipe(source("bundle.js"))
        .pipe(gulp.dest("./public/javascripts"));
});