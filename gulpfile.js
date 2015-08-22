'use strict';

var gulp       = require('gulp');
var rsync      = require('gulp-rsync');

// gulp.task('default', ['deploy']);


gulp.task('deploy-prod', [], function(){
    return gulp.src('./')
      .pipe(rsync({
        root: './',
        hostname: 'api.manganext-app.com',
        username: 'peter',
        destination: '/home/peter/scripts/manganext-bot',
        recursive: true,
        emptyDirectories: true,
        incremental: true,
        progress: true,
        exclude: ['.DS_Store', '.git', '.gitignore', '.gitkeep', 'node_modules']
    }));
});
