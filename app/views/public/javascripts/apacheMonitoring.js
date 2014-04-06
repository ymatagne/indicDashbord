/**
 * Created by Yan Matagne on 26/03/2014.
 */
var width = 960;
var height = 500;
var barWidth = Math.floor(width / 19) - 1;


// Creation de creer l'objet SVG qui correspond à notre graphique
var svgApache = d3.select('#graphApache').append('svg')
    .attr('width', 1000)
    .attr('height', 600)
    .append('g')
    .attr('transform', 'translate(50,50)');

//creation de la popin qui s'affiche lorsque le pointer passe sur un point sur le graphique
var popin = d3.select('body').append('div').attr('class', 'popinStat').style('opacity', 0);

//initialisation du graphique avec les données présentes dans les logs
d3.csv = d3.dsv(';', 'text/log');
d3.csv(getPathFiles('/access.log'), function (error, data) {
    'use strict';

    // Recuperation des données dans le CSV
    data.forEach(function (d) {
        d.ip = d.ip;
        d.date = formatDate(getDateAnalyseInUrl(window.location.pathname), d.date.substring(12, 20));
        d.retour = d.retour;
        d.temps = parseInt(d.temps.split('/')[0]);
        d.page = d.page;

    });

    var dateMin = d3.min(data, function (d) {
        return d.date;
    });

    var dateMax = d3.max(data, function (d) {
        return d.date;
    });

    var tempsMax = d3.max(data, function (d) {
        return parseInt(d.temps);
    });

//gestion des axes X et Y.
    var x = d3.time.scale()
        .domain([dateMin, dateMax])
        .range([barWidth / 2, width - barWidth / 2]);

// Definition des domaines sur les axes
    var y = d3.time.scale()
        .domain([0, tempsMax])
        .range([height, 0]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(d3.time.seconds, 1)
        .tickFormat(d3.time.format('%S s'));

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(d3.time.minute, 60)
        .tickFormat(d3.time.format('%H h'));



    //ajout des axes dans le graphique
    svgApache.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0)')
        .call(yAxis)
        .selectAll('g');
    svgApache.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svgApache.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'circle')
        .attr('cx', function (d) {
            return x(d.date);
        })
        .attr('cy', function (d) {
            return y(parseInt(d.temps));
        })
        .attr('r', function () {
            return 5;
        })
        .style('fill', function (d) {
            if (parseInt(d.temps) >= 2) {
                return 'red';
            } else {
                return 'blue';
            }
        })
        .style('opacity', function (d) {
            if (parseInt(d.temps) >= 2) {
                return '0.5';
            } else {
                return '1';
            }
        })
        .on('mouseover',function (d) {
            displayPopin(popin, createHtmlForApachePopin(d),d3);
        }).on('mouseout', function () {
            closePopin(popin);
        });

    //Ajout des valeurs dans le tableau des statistiques
    var nbrRequete2s = data.filter(function (d) {
        if (parseInt(d.temps) >= 2) {
            return d;
        }
    }).length;
    var nbrRequete10s = data.filter(function (d) {
        if (parseInt(d.temps) >= 10) {
            return d;
        }
    }).length;
    var nbrRequete1s = data.filter(function (d) {
        if (parseInt(d.temps) < 2) {
            return d;
        }
    }).length;
    putInResumeStat('resume_nbrRequete1s', nbrRequete1s+' (' +Math.round((parseInt(nbrRequete1s*100)/data.length)*100)/100+'%)');
    putInResumeStat('resume_nbrRequete2s', nbrRequete2s+' (' +Math.round((parseInt(nbrRequete2s*100)/data.length)*100)/100+'%)');
    putInResumeStat('resume_nbrRequete10s', nbrRequete10s+' (' +Math.round((parseInt(nbrRequete10s*100)/data.length)*100)/100+'%)');
    //Permet de mettre a jour la progress bar.
    progressBarEvolution(false);
});

