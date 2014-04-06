/**
 * Created by ymatagne on 26/03/2014.
 */
var width = 960;
var height = 500;
var barWidth = Math.floor(width / 19) - 1;


// Creation du SVG
var svgThreadPool = d3.select('#graphThreadPool').append('svg')
    .attr('width', 1000)
    .attr('height', 600)
    .append('g')
    .attr('transform', 'translate(50,50)');


//creation de la popin permettant de donner les stats.
var popinGraphPointStat = d3.select('body').append('div').attr('class', 'popinGraphPointStat').style('opacity', 0);


//Creation du graphique
d3.csv = d3.dsv(';', 'text/log');
d3.csv(getPathFiles('/monitoring_app_thread_http.log'), function (error, data) {
    'use strict';
    var maxY = 0;
    var dateDuJour = null;

    //L heure est donnne en AM PM dans le fichier CSV monitoring app thread http.
    // Pour differencier les deux, nous allons placer un boolean permettant de savoir si nous avons passe
    // l'heure du midi. Si cette heure est passé nous sommes donc en PM.
    var isAm = true;
    var isPm = false;

    // Recuperation des données dans le CSV
    data.forEach(function (d) {
        var heure = d.date.substring(11, 19);

        if (parseInt(heure.substring(0, 2)) === 11) {
            isAm = false;
        }
        var dateFormat = d.date.substring(6, 10) + '-' + d.date.substring(3, 5) + '-' + d.date.substring(0, 2);

        if (isPm || (!isAm && parseInt(heure.substring(0, 2)) == parseInt('01'))) {
            isPm=true;
            heure = (parseInt(heure.substring(0, 2), '10') + 12) + ':' + heure.substring(3, 5);
        } else {
            if(isAm && parseInt(heure.substring(0, 2))===12){
                heure=heure.replace('12','00');
            }else{
                heure = heure;
            }
        }
        if (dateDuJour === null) {
            dateDuJour = d.date.substring(6, 10) + d.date.substring(3, 5) + d.date.substring(0, 2);
        }
        d.dateHeure = formatDate(dateDuJour, heure);
        d.currentThreadsBusy = d.currentThreadsBusy;
        d.currentThreadCount = d.currentThreadCount;
        d.maxSpareThreads = d.maxSpareThreads;
        d.maxThreads = d.maxThreads;
        if (parseInt(d.maxThreads) + 5 > parseInt(maxY)) {
            maxY = 60;
        }
    });


//gestion des axes X et Y.
    var x = d3.time.scale()
        .domain([ formatDate(dateDuJour, '00:00:00'), formatDate(dateDuJour, '23:59:00')])
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
    svgThreadPool.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0)')
        .call(yAxis)
        .selectAll('g');
    svgThreadPool.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

//creation d'un filtre au dessus du graphique pour permettre de creer une ligne qui se balade
    var rect = svgThreadPool.append('rect').attr({
        w: 0,
        h: 0,
        width: width,
        height: height,
        fill: '#ffffff'
    });

//creation de la ligne 'current threads busy'
    var createCurrentThreadsBusy = d3.svg.line()
        .x(function (d) {
            return x(d.dateHeure);
        })
        .y(function (d) {
            return y(d.currentThreadsBusy);
        });

    var lineThreadsBusy = svgThreadPool.append('path').datum(data).style('stroke',function () {
        return 'blue';
    }).attr('d', createCurrentThreadsBusy);

    var circleThreadsBusy = svgThreadPool.append('circle')
        .attr('opacity', 0)
        .attr({
            r: 6,
            fill: 'darkred'

        });

//creation de la ligne 'current threads count'
    var createCurrentThreadCount = d3.svg.line()
        .x(function (d) {
            return x(d.dateHeure);
        })
        .y(function (d) {
            return y(d.currentThreadCount);
        });

    var lineCurrentThreadCount = svgThreadPool.append('path').datum(data).style('stroke',function () {
        return 'pink';
    }).attr('d', createCurrentThreadCount);

    var circleCurrentCount = svgThreadPool.append('circle')
        .attr('opacity', 0)
        .attr({
            r: 6,
            fill: 'darkred'

        });


//creation de la ligne 'max spare threads'
    var createMaxSpareThreads = d3.svg.line()
        .x(function (d) {
            return x(d.dateHeure);
        })
        .y(function (d) {
            return y(d.maxSpareThreads);
        });

    var lineMaxSpareThreads = svgThreadPool.append('path').datum(data).style('stroke',function () {
        return 'green';
    }).attr('d', createMaxSpareThreads);

    var circleMaxSpareThreads = svgThreadPool.append('circle')
        .attr('opacity', 0)
        .attr({
            r: 6,
            fill: 'darkred'

        });


//creation de la ligne 'max spare threads'
    var createMaxThreads = d3.svg.line()
        .x(function (d) {
            return x(d.dateHeure);
        })
        .y(function (d) {
            return y(d.maxThreads);
        });

    var lineMaxThreads = svgThreadPool.append('path').datum(data).style('stroke',function () {
        return 'red';
    }).attr('d', createMaxThreads);

    var circleMaxThreads = svgThreadPool.append('circle')
        .attr('opacity', 0)
        .attr({
            r: 6,
            fill: 'darkred'

        });

//Creation de l'axe se baladant sur le graphqique
    svgThreadPool.append('line').classed('linePointerX', 1).style('stroke', 'black');

//ajout du titre
    svgThreadPool.append('text')
        .attr('class', 'titleConnexions')
        .attr('dy', '1em')
        .text('Thread Http');

//Action sur le mouvement de la sourie
    rect.on('mousemove', function () {

            //declaration des variables
            var pathLength = lineCurrentThreadCount.node().getTotalLength();
            var xPos = d3.mouse(this)[0];
            var beginning = xPos;
            var end = pathLength;
            var target;
            var pos;
            var valueYCurrentCount = 0;
            var valueYThreadBusy = 0;
            var valueYThreadMaxSpare = 0;
            var valueYMaxThread = 0;

            //deplacement de l'axe
            svgThreadPool.select('.linePointerX').attr('y1', 0).attr('y2', height).attr('x1', xPos).attr('x2', xPos);

            //Modification de l'emplacement pour le cercle sur la ligne 'current thread count'
            while (true) {
                target = Math.floor((beginning + end) / 2);
                pos = lineCurrentThreadCount.node().getPointAtLength(target);
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
            circleCurrentCount.attr('opacity', 1)
                .attr('cx', xPos)
                .attr('cy', pos.y);

            valueYCurrentCount = parseInt(y.invert(pos.y));

            //Modification de l'emplacement pour le cercle sur la ligne 'current thread count'
            pathLength = lineThreadsBusy.node().getTotalLength();
            xPos = d3.mouse(this)[0];
            beginning = xPos;
            end = pathLength;

            while (true) {
                target = Math.floor((beginning + end) / 2);
                pos = lineThreadsBusy.node().getPointAtLength(target);
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
            circleThreadsBusy.attr('opacity', 1)
                .attr('cx', xPos)
                .attr('cy', pos.y);


            valueYThreadBusy = parseInt(y.invert(pos.y));

            //Modification de l'emplacement pour le cercle sur la ligne 'current thread count'
            pathLength = lineMaxSpareThreads.node().getTotalLength();
            xPos = d3.mouse(this)[0];
            beginning = xPos;
            end = pathLength;

            while (true) {
                target = Math.floor((beginning + end) / 2);
                pos = lineMaxSpareThreads.node().getPointAtLength(target);
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
            circleMaxSpareThreads.attr('opacity', 1)
                .attr('cx', xPos)
                .attr('cy', pos.y);


            valueYThreadMaxSpare = parseInt(y.invert(pos.y));

            //Modification de l'emplacement pour le cercle sur la ligne 'current thread count'
            pathLength = lineMaxThreads.node().getTotalLength();
            xPos = d3.mouse(this)[0];
            beginning = xPos;
            end = pathLength;

            while (true) {
                target = Math.floor((beginning + end) / 2);
                pos = lineMaxThreads.node().getPointAtLength(target);
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
            circleMaxThreads.attr('opacity', 1)
                .attr('cx', xPos)
                .attr('cy', pos.y);

            valueYMaxThread = parseInt(y.invert(pos.y));

            displayPopin(popinGraphPointStat, createHtmlForThreadHttpPopin(x, xPos, valueYMaxThread, valueYCurrentCount, valueYThreadMaxSpare, valueYThreadBusy), d3);

        }
    )
    ;

    //Ajout des valeurs dans le tableau des statistiques
    var maxBusyThread = d3.max(data, function (d) {
        return parseInt(d.currentThreadsBusy);
    });
    var maxCountThread = d3.max(data, function (d) {
        return parseInt(d.currentThreadCount);
    });
    putInResumeStat('resume_nbrThreadBusyMax', maxBusyThread);
    putInResumeStat('resume_nbrThreadUtilise', maxCountThread);
});