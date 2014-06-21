var gulp = require('gulp')
var eslint = require('gulp-eslint')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var header = require('gulp-header')
var tap = require('gulp-tap')
var merge = require('merge-stream')
var pkg = require('./package.json')
var path = require('path')

var jsFiles = ['src/**/*.js', 'test/**/*.js', '!test/lib/**/*.js']
var shortcutTitles = {
  'infinite': 'Waypoints Infinite Scroll Shortcut',
  'inview': 'Waypoints Inview Shortcut',
  'sticky': 'Waypoints Sticky Element Shortcut'
}

function fileHeader(title) {
  return [
    '/*!',
    title + ' - ' + pkg.version,
    'Copyright © 2011-' + new Date().getFullYear() + ' Caleb Troughton',
    'Licensed under the MIT license.',
    'https://github.com/imakewebthings/waypoints/blog/master/licenses.txt',
    '*/\n'
  ].join('\n')
}

gulp.task('lint', function() {
  return gulp.src(jsFiles).pipe(eslint('.eslintrc')).pipe(eslint.format())
})

gulp.task('build-core', function() {
  var streams = ['noframework', 'jquery', 'zepto'].map(function(adapter) {
    return gulp.src([
      'src/waypoint.js',
      'src/context.js',
      'src/group.js',
      'src/adapters/' + adapter + '.js'
    ])
    .pipe(concat(adapter + '.waypoints.js'))
    .pipe(header(fileHeader('Waypoints')))
    .pipe(gulp.dest('lib/'))
    .pipe(rename(adapter + '.waypoints.min.js'))
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(gulp.dest('lib/'))
  })
  return merge.apply(null, streams)
})

gulp.task('build-shortcuts', function() {
  return gulp.src([
    'src/shortcuts/*.js'
  ])
  .pipe(tap(function(file) {
    var title = path.basename(file.path, '.js')
    file.contents = Buffer.concat([
      new Buffer(fileHeader(shortcutTitles[title])),
      file.contents
    ])
  }))
  .pipe(gulp.dest('lib/shortcuts/'))
  .pipe(rename(function(path) {
    path.basename += '.min'
  }))
  .pipe(uglify({
    preserveComments: 'some'
  }))
  .pipe(gulp.dest('lib/shortcuts/'))
})

gulp.task('build', ['build-core', 'build-shortcuts'])

gulp.task('watch', function() {
  gulp.watch(jsFiles, ['lint', 'build'])
})

gulp.task('default', ['lint', 'build', 'watch'])