IndicDashbord
================

Presentation
------------------
IndicDashbord is a web application.

This application is a demo whose functionality purpose graphically view of the logs of Tomcat / Apache application.


This application performs the following actions:
- Launch of a Expressjs server.
- Launch of a cron:
  - Execute a shell script to retrieve the logs of the day on a SFTP server,
  - Sending an email to warn the availability of logs.
- Viewing logs by charts.


This application uses the following frameworks:
- [Node.js](http://nodejs.org/), [Grunt](http://gruntjs.com/), [Bower](http://bower.io/),
- [Express.js]() and other package (cron, nodemailler, yaml-config, ejb and i18n),
- [d3.js](http://d3js.org/), [jquery](http://jquery.com/), [BootStrap](http://getbootstrap.com/).


Prerequisite
---------------------------------------
- Clone, fork or download the source code from this Github page.
- [Node.js](http://nodejs.org/) must be installed.
- Add right on directory app/script in application.


Installation for developpers
---------------------------------------
- Enter in the project,
- Run npm install : 'npm install',
- Run bower install : 'bower install',
- Enter in the app folder : 'cd app',
- Start server : 'node app'.

Email delivery and recuperation by sftp are disabled on the development version.

Files to configure the application can be found here:
  - app/locales/fr.json for Internationalization,
  - app/settings.yml : configure application (sftp, mail ...)

Installation for production use
---------------------------------------
- Enter in the project,
- Run npm install : 'npm install',
- Run bower install : 'bower install',
- Create production version : 'grunt --force',
- Enter in the app folder : 'cd dist',
- Start server : 'NODE_ENV=production node app'.


