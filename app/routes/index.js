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
    res.render('template_rapport',
        {
            seuilIndicateur3: settings.seuil.indicateur3,
            seuilIndicateur4: settings.seuil.indicateur4,
            seuilIndicateur5: settings.seuil.indicateur5,
            seuilIndicateur6: settings.seuil.indicateur6,
            seuilIndicateur7: settings.seuil.indicateur7,
            seuilIndicateur8: settings.seuil.indicateur8,
            seuilIndicateur9: settings.seuil.indicateur9,
            seuilIndicateur10: settings.seuil.indicateur10,
            seuilIndicateur11: settings.seuil.indicateur11,
            maxIndicateur3: settings.max.indicateur3,
            maxIndicateur4: settings.max.indicateur4,
            maxIndicateur5: settings.max.indicateur5,
            maxIndicateur6: settings.max.indicateur6,
            maxIndicateur7: settings.max.indicateur7,
            maxIndicateur8: settings.max.indicateur8,
            maxIndicateur9: settings.max.indicateur9,
            maxIndicateur10: settings.max.indicateur10,
            maxIndicateur11: settings.max.indicateur11
        });
};