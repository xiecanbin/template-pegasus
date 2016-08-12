require('colors');
var requireg = require('requireg');
var del = require('del');
var gulp = require('gulp');
var code = requireg('gulp-seed');
var gulpif = require('gulp-if');
var less = require('gulp-less');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');
var path = require('path');
var runGulp = require('run-gulp-task');
var autoprefixer = require('gulp-autoprefixer');
var pkgFilePath = path.join(process.cwd(), 'package.json');
var pkg = require(pkgFilePath);
var removeUseStrict = require("gulp-remove-use-strict");
var isBuild = true;

function err(error) {
  console.error('[ERROR]'.red + error.message);
  this.emit('end');
}

gulp.task('clean', function (cb) {
  isBuild ? del(['build'], cb) : cb();
});

var ifless = function (file) {
  var extname = path.extname(file.path);
  return extname === '.less' ? true : false;
};

gulp.task('css', ['clean'], function () {
  return gulp.src(['src/**/*.css', 'src/**/*.less'])
    .pipe(gulpif(!isBuild, plumber(err)))
    .pipe(gulpif(ifless, less()))
    .pipe(autoprefixer({
        browsers: ['Firefox >= 3', 'Opera 12.1', 'Android > 1.5', 'Explorer >= 8', 'iOS >= 5'],
        cascade: false
    }))
    .pipe(gulpif(isBuild, code.lint()))
    .pipe(gulpif(isBuild, code.minify()))
    .pipe(gulp.dest('build'));
});

// 读取更新后的package.json
gulp.task('update_pkg', () => {
  delete require.cache[require.resolve(pkgFilePath)];
  try{
    pkg = require(pkgFilePath);
  }
  catch(e){
    console.error('[ERROR]'.red + 'package.json is not avaliable');
  }
});

gulp.task('js', ['clean'], function () {
  return gulp.src(['src/**/*.js'])
    .pipe(gulpif(!isBuild, plumber(err)))
    .pipe(babel({
      presets: ['es2015','react', 'stage-1']
    }))
    .pipe(removeUseStrict({"force": true}))
    .pipe(gulpif(isBuild, code.lint()))
    .pipe(code.dep({
      name: 'pegasus/'+pkg.name,
      version: pkg.version,
      path: '//g.alicdn.com/pegasus/' + pkg.name + '/' + pkg.version + '/',
      group: 'tm',
      feDependencies: pkg.feDependencies,
      kissyConfig: {
        packages: {
          kissy: {
            base: '//g.alicdn.com/kissy/k/' + pkg.kissyVersion + '/',
            version: pkg.kissyVersion
          }
        },
        combine: true
      },
      exports:["*"],
      useMuiCache: true
    }))
    .pipe(gulpif(isBuild, code.minify()))
    .pipe(gulp.dest('build'));
});

gulp.task('data', function () {
    return gulp.src(['src/data.json', 'src/schema.json'])
        .pipe(gulp.dest('demo'));
});

gulp.task("copy", ["data","clean"], function () {
  return gulp.src(["package.json", "src/**/*.png", "src/**/*.jpg", "src/**/*.jpeg", "src/**/*.gif", "src/**/*.html", "src/**/*.htm", "src/**/*.ttf", "src/**/*.eot", "src/**/*.svg", "src/theme-pc.less", "src/theme.less", "src/**/*.xtpl", "src/**/*.woff", "src/**/*.json"])
    .pipe(gulp.dest("build"));
});

gulp.task("seed2demo", ['js'], function(){
  return gulp.src(["src/seed.json"])
    .pipe(gulp.dest("demo"));
});

gulp.task('default', ['data', 'clean', 'css', 'js', 'copy', 'seed2demo']);

gulp.task("watch", [], function () {
  isBuild = false;
  runGulp('default', gulp)
    .then(() => {
      gulp.watch(['src/**/*.js', '!src/seed.js', 'src/**/*.xtpl'], ["js", "seed2demo"]);
      gulp.watch(['src/**/*.css', 'src/**/*.less'], ["css"]);
      gulp.watch(['src/theme-pc.less', 'src/theme.less'], ["copy"]);
      gulp.watch(['./package.json'], ['update_pkg', 'js']);
    });
});
