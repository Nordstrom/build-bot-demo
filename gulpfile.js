var _ = require('lodash'),
    Promise = require('bluebird'),
    path = require('path'),
    fs = require('fs'),
    dir = Promise.promisifyAll(require('node-dir')),
    AWS = require('./src/aws.js'),
    exec = require('child_process').exec,
    gulp = require('gulp'),
    shell = require('gulp-shell'),
    gutil = require('gulp-util'),
    exit = require('gulp-exit'),
    size = require('gulp-size'),
    rename = require('gulp-rename'),
    apidoc = require('gulp-apidoc'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    nodemon = require('gulp-nodemon'),
    replace = require('gulp-replace'),
    help = require('gulp-task-listing'),
    debug = require('gulp-debug'),
    zip = require('gulp-zip'),
    sequence = require('gulp-sequence'),
    del = require('del'),
    yaml = require('js-yaml'),
    args = require('yargs').argv;
function run(cmd, opts) {
    return function () {
        if (opts && opts.cwd) {
            opts.cwd = path.resolve(opts.cwd);
        }
        return new Promise(function (resolve, reject) {
            gutil.log('Run ' + cmd);
            exec(cmd, opts, function (err, stdout, stderr) {
                gutil.log('Ran ' + cmd);
                if (stdout && stdout.length > 0) gutil.log(stdout);
                if (stderr && stderr.length > 0) gutil.log(stderr);
                if (err) {
                    reject(stderr);
                }
                resolve(stdout);
            });
        });
    };
}
function deploySite() {
    var s3 = Promise.promisifyAll(new AWS.S3()),
        fileParams = [];
    return dir.filesAsync('./website')
        .then(function (data) {
            _.forEach(data, function (fileName) {
                var fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1)
                fileParams.push({
                    Bucket: 'vote-app-hackathon',
                    Key: fileName.replace('website/', ''),
                    Body: fs.readFileSync(fileName),
                    ContentType: fileExtension === 'js' ? 'application/x-javascript' : 'text/' + fileExtension
                });
            });
        })
        .then(function () {
            return Promise.each(fileParams, function (params) {
                return s3.putObjectAsync(params);
            });
        })

}
gulp.task('deploy:services', function() {
    return run('sls deploy')()
        .then(function () {
            return deploySite();
        })
});
gulp.task('deploy:site', deploySite);

gulp.task('deploy', ['deploy:services']);