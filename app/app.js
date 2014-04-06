var express = require('express')
    , http = require('http')
    , path = require('path')
    , cronJob = require('cron').CronJob
    , nodemailer = require("nodemailer")
    , config = require('yaml-config')
    , routes = require('./routes')
    , i18n = require('./i18n.js')
    , exec = require('child_process').exec;

// init config file
settings = config.readConfig('./settings.yml'); // path from your app root without slash

//Permet de logger les erreurs du serveur
function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}

// init serveur HTTP
var app = express();
app.set('port', settings.http.port);
app.use(i18n);
app.use(app.router);
app.use(express.urlencoded());
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
app.use(logErrors);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


if (process.env.NODE_ENV === "production") {
    app.use('/views/public', express.static(path.join(__dirname, '/views/public')));
    app.use('/files', express.static(settings.shell.dirFile));
    app.use('/views/bower_components', express.static(__dirname + '/views/bower_components'));
    app.use('/views/public/stylesheets/images', express.static(__dirname + '/views/public/images'));
} else {
    app.use('/public', express.static(path.join(__dirname, '/views/public')));
    app.use('/files', express.static(settings.shell.dirFile));
    app.use('/bower_components', express.static(__dirname + '/views/bower_components'));
}


app.get('/', routes.index);
app.get('/index', routes.index);
app.get('/index/:date', routes.index);
app.get('/template_rapport/:date/:node', routes.template_rapport);


http.createServer(app).listen(app.get('port'), function () {

    console.log("Express server listening on port %d in %s mode", app.get('port'), app.get('env'));
});

// init send mail
var smtpTransport = nodemailer.createTransport('SMTP', {
    service: settings.mailer.service,
    auth: {
        user: settings.mailer.user,
        pass: settings.mailer.password
    }
});

// init cronjob
new cronJob(settings.cron.time, function () {
    if (process.env.NODE_ENV === "production") {
        // option send mail
        var mailOptionsGetFilesOK = {
            from: settings.mailer.fromUser,
            to: settings.mailer.toUserOK,
            subject: settings.mailer.sujectMailOK,
            html: 'Les indicateurs sont disponibles'
        }

        var mailOptionsGetFilesKO = {
            from: settings.mailer.fromUser,
            to: settings.mailer.toUserKO,
            subject: settings.mailer.sujectMailKO,
            html: 'Les indicateurs ne sont  pas disponibles car une erreur est intervenue.'
        }

        // Lancement du script shell pour recuperer les fichiers via sftp.
        exec(' sh ./scripts/getFilesOfSFTP.sh ' + settings.shell.sftpServer + ' ' + settings.shell.dirFile,
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    smtpTransport.sendMail(mailOptionsGetFilesKO, function (error, response) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("Message sent: " + response.message);
                        }
                    });
                } else {
                    smtpTransport.sendMail(mailOptionsGetFilesOK, function (error, response) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("Message sent: " + response.message);
                        }
                    });
                }
            });
    }
}, null, true);
