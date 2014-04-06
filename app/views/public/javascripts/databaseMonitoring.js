/**
 * Created by ymatagne on 26/03/2014.
 */
var width = 960;
var height = 500;
var barWidth = Math.floor(width / 19) - 1;


// Creation du SVG
var svgJDBC = d3.select('#graphJDBC').append('svg')
    .attr('width', 1000)
    .attr('height', 600)
    .append('g')
    .attr('transform', 'translate(50,50)');


//creation de la popin permettant de donner les stats.
var popinGraphPointStat = d3.select('body').append('div').attr('class', 'popinGraphPointStat').style('opacity', 0);

//Creation du graphique
d3.csv = d3.dsv(';', 'text/log');
d3.csv(getPathFiles('/monitoringPoolDatabase.log'), function (error, data) {
    'use strict';
    var maxY = 0;
    var dateDuJour = null;
    // Recuperation des données dans le CSV
    data.forEach(function (d) {
        if (dateDuJour === null) {
            dateDuJour = d.date;
        }
        d.dateHeure = formatDate(d.date, d.heure);
        d.nbrConnexion = d.nbrConnexion;
        d.nbrConnexionOccupe = d.nbrConnexionOccupe;
        d.nbrIdleUseConnexion = d.nbrIdleUseConnexion;
        d.maxPoolSize = d.maxPoolSize;
        if (parseInt(d.maxPoolSize) > parseInt(maxY)) {
            maxY = parseInt(d.maxPoolSize);
        }
    });


//gestion des axes X et Y.
    var x = d3.time.scale()
        .domain([ formatDate(dateDuJour,'00:00:00'), formatDate(dateDuJour,'23:59:00')])
        .range([barWidth / 2, width - barWidth / 2]);

// Definition des domaines sur les axes
    var y = d3.scale.linear()
        .domain([0, maxY])
        .range([height, 0]);
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .tickSize(-width)
        .tickFormat(function (d) {
            return d;
        });

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(d3.time.minute, 60)
        .tickFormat(d3.time.format('%H h'));


//ajout des axes dans le graphique
    svgJDBC.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0)')
        .call(yAxis)
        .selectAll('g');
    svgJDBC.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

//Definition de l'objet ligne qui permet de dessiner les lignes sur le graphique
    var lineNbrConnexion = d3.svg.line()
        .x(function (d) {
            return x(d.dateHeure);
        })
        .y(function (d) {
            return y(d.nbrConnexion);
        });

    var lineNbrConnexionOccupe = d3.svg.line()
        .x(function (d) {
            return x(d.dateHeure);
        })
        .y(function (d) {
            return y(d.nbrConnexionOccupe);
        });

    var lineNbrIdleUseConnexion = d3.svg.line()
        .x(function (d) {
            return x(d.dateHeure);
        })
        .y(function (d) {
            return y(d.nbrIdleUseConnexion);
        });

    var lineMaxPoolSize = d3.svg.line()
        .x(function (d) {
            return x(d.dateHeure);
        })
        .y(function (d) {
            return y(d.maxPoolSize);
        });

    //creation d'un filtre au dessus du graphique pour permettre de creer une ligne qui se balade
    var rect = svgJDBC.append('rect').attr({
        w: 0,
        h: 0,
        width: width,
        height: height,
        fill: '#ffffff'
    });

    //Creation de l'axe se baladant sur le graphqique
    svgJDBC.append('line').classed('linePointerX', 1).style('stroke', 'black');

    var mainNbrConnexion = svgJDBC.append('path').datum(data).style('stroke',function () {
        return 'red';
    }).attr('d', lineNbrConnexion);

    var circleNbrConnexion = svgJDBC.append('circle')
        .attr('opacity', 0)
        .attr({
            r: 6,
            fill: 'darkred'

        });

    var mainNbrConnexionOccupe = svgJDBC.append('path').datum(data).style('stroke',function () {
        return 'black';
    }).attr('d', lineNbrConnexionOccupe);

    var circleNbrConnexionOccupe = svgJDBC.append('circle')
        .attr('opacity', 0)
        .attr({
            r: 6,
            fill: 'darkred'

        });

    var mainNbrIdleUse = svgJDBC.append('path').datum(data).style('stroke',function () {
        return 'green';
    }).attr('d', lineNbrIdleUseConnexion);

    var circleNbrIdleUse = svgJDBC.append('circle')
        .attr('opacity', 0)
        .attr({
            r: 6,
            fill: 'darkred'

        });

    var mainMaxPoolSize = svgJDBC.append('path').datum(data).style('stroke',function () {
        return 'blue';
    }).attr('d', lineMaxPoolSize);

    var circleMaxPool = svgJDBC.append('circle')
        .attr('opacity', 0)
        .attr({
            r: 6,
            fill: 'darkred'

        });

    svgJDBC.append('text')
        .attr('class', 'titleConnexions')
        .attr('dy', '1em')
        .text('Pool JDBC');

    rect.on('mousemove', function () {
        //declaration des variables
        var pathLength = mainNbrConnexion.node().getTotalLength();
        var xPos = d3.mouse(this)[0];
        var beginning = xPos;
        var end = pathLength;
        var target;
        var pos;

        //deplacement de l'axe
        svgJDBC.select('.linePointerX').attr('y1', 0).attr('y2', height).attr('x1', xPos).attr('x2', xPos);

        //Modification de l'emplacement pour le cercle sur la ligne 'nbr Connexion'
        while (true) {
            target = Math.floor((beginning + end) / 2);
            pos = mainNbrConnexion.node().getPointAtLength(target);
            if ((target === end || target === beginning) && pos.x !== xPos) {
                break;
            }
            if (pos.x > xPos) {
                end = target;
            }
            else if (pos.x < xPos) {
                beginning = target;
            }
            else {
                break; //position found
            }
        }
        circleNbrConnexion.attr('opacity', 1)
            .attr('cx', xPos)
            .attr('cy', pos.y);

        var valueYNbrConnexion = parseInt(y.invert(pos.y));


        //Modification de l'emplacement pour le cercle sur la ligne 'nbr connexion occupe'
        pathLength = mainNbrConnexionOccupe.node().getTotalLength();
        xPos = d3.mouse(this)[0];
        beginning = xPos;
        end = pathLength;

        while (true) {
            target = Math.floor((beginning + end) / 2);
            pos = mainNbrConnexionOccupe.node().getPointAtLength(target);
            if ((target === end || target === beginning) && pos.x !== xPos) {
                break;
            }
            if (pos.x > xPos) {
                end = target;
            }
            else if (pos.x < xPos) {
                beginning = target;
            }
            else {
                break; //position found
            }
        }
        circleNbrConnexionOccupe.attr('opacity', 1)
            .attr('cx', xPos)
            .attr('cy', pos.y);

        var valueYNbrConnexionOccupe = parseInt(y.invert(pos.y));


        //Modification de l'emplacement pour le cercle sur la ligne 'nbr connexion idle'
        pathLength = mainNbrIdleUse.node().getTotalLength();
        xPos = d3.mouse(this)[0];
        beginning = xPos;
        end = pathLength;

        while (true) {
            target = Math.floor((beginning + end) / 2);
            pos = mainNbrIdleUse.node().getPointAtLength(target);
            if ((target === end || target === beginning) && pos.x !== xPos) {
                break;
            }
            if (pos.x > xPos) {
                end = target;
            }
            else if (pos.x < xPos) {
                beginning = target;
            }
            else {
                break; //position found
            }
        }
        circleNbrIdleUse.attr('opacity', 1)
            .attr('cx', xPos)
            .attr('cy', pos.y);

        var valueYNbrIdleUse = parseInt(y.invert(pos.y));


        //Modification de l'emplacement pour le cercle sur la ligne 'max pool size'
        pathLength = mainMaxPoolSize.node().getTotalLength();
        xPos = d3.mouse(this)[0];
        beginning = xPos;
        end = pathLength;


        while (true) {
            target = Math.floor((beginning + end) / 2);
            pos = mainMaxPoolSize.node().getPointAtLength(target);
            if ((target === end || target === beginning) && pos.x !== xPos) {
                break;
            }
            if (pos.x > xPos) {
                end = target;
            }
            else if (pos.x < xPos) {
                beginning = target;
            }
            else {
                break; //position found
            }
        }
        circleMaxPool.attr('opacity', 1)
            .attr('cx', xPos)
            .attr('cy', pos.y);

        var valueYNbrMaxPoolSize = parseInt(y.invert(pos.y));

        displayPopin(popinGraphPointStat, createHtmlForJdbcPopin(x, xPos, valueYNbrConnexion, valueYNbrConnexionOccupe, valueYNbrIdleUse, valueYNbrMaxPoolSize), d3);


    });

    //Ajout des valeurs dans le tableau des statistiques
    var maxConnexionJDBC = d3.max(data, function (d) {
        return parseInt(d.nbrConnexion);
    });
    var maxConnexionBusy = d3.max(data, function (d) {
        return parseInt(d.nbrConnexionOccupe);
    });

    var maxConnexionIdle = d3.max(data, function (d) {
        return parseInt(d.nbrIdleUseConnexion);
    });
    putInResumeStat('resume_nbrMaxConnexionJDBC', maxConnexionJDBC);
    putInResumeStat('resume_nbrMaxConnexionBusy', maxConnexionBusy);
    putInResumeStat('resume_nbrMaxConnexionIdle', maxConnexionIdle);


});