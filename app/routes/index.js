/*
 * GET home page.
 */
var fs = require('fs');
var config = require('yaml-config');
var settings = config.readConfig('./settings.yml'); // path from your app root without slash


exports.index = function(req, res){
    fs.readdir(settings.shell.dirFile, function (err, files) { // '/' denotes the root folder
       var filesCookie ="";
        files.forEach( function (file) {
            filesCookie +=file+";"
        });
        res.cookie('files', filesCookie,{ secure: false });
        res.render('index');
    });
};
exports.template_rapport = function(req, res){
    res.render('template_rapport');
};