var gulp = require("gulp"),
    babelify = require('babelify'),
    browserify = require("browserify"),
    connect = require("gulp-connect"),
    sass = require('gulp-sass'),
    source = require("vinyl-source-stream");


gulp.task("build:js", function(){
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

gulp.task('build:scss', function() {
    return gulp.src('./scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('watch:js', function() {
    return gulp.watch('./jsx/**/*.*', ['build:js']);
});

gulp.task('watch:scss', function() {
    return gulp.watch('./scss/**/*.scss', ['build:scss']);
});
