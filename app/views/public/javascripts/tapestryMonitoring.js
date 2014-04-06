/**
 * Created by ymatagne on 26/03/2014.
 */

var width = 960;
var height = 500;
var barWidth = Math.floor(width / 19) - 1;

// Creation du SVG
var svgTapestry = d3.select('#graphTapestry').append('svg')
    .attr('width', 1000)
    .attr('height', 600)
    .append('g')
    .attr('transform', 'translate(50,50)');

//Creation du graphique
d3.csv = d3.dsv(';', 'text/log');
d3.csv(getPathFiles('/monitoringPoolPageTapestry.log'), function (error, data) {
    'use strict';
    var maxCache = 0;
    var dateDuJour = null;
    // Recuperation des données dans le CSV
    data.forEach(function (d) {
        if (dateDuJour === null) {
            dateDuJour = d.date;
        }
        d.dateHeure = formatDate(d.date, d.heure);
        d.page = d.page.replace(/\//g, '_');
        d.inuse = d.inuse;
        d.color = getValueOfPageName(d.page);
        if (parseInt(d.inuse) > parseInt(maxCache)) {
            maxCache = parseInt(d.inuse);
        }
    });

//liste des différentes pages présentes dans le log
    var lstPageName = d3.keys(d3.nest()
        .key(function (d) {
            return d.page;
        })
        .map(data.filter(function (d) {
            if (d.inuse > 0) {
                return d;
            }
        })));


//gestion des axes X et Y.
    var x = d3.time.scale()
        .domain([ formatDate(dateDuJour,'00:00:00'), formatDate(dateDuJour,'23:59:00')])
        .range([barWidth / 2, width - barWidth / 2]);

// Definition des domaines sur les axes
    var y = d3.scale.linear()
        .domain([0, maxCache])
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


//Creation de la liste des noms de pages
    d3.select('#tabNomPage').append('ul').selectAll('ul').data(lstPageName)
        .enter()
        .append('li')
        .text(function (value) {
            return value;
        }).style('color',function (value) {
            return getValueOfPageName(value);
        }).attr('colorCode',function (value) {
            return getValueOfPageName(value);
        }).on('click', function (value, i) {
            updateColorOnClick(value, i);
        });

//ajout des axes dans le graphique
    svgTapestry.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0)')
        .call(yAxis)
        .selectAll('g');
    svgTapestry.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

//Definition de l'objet ligne qui permet de dessiner les lignes sur le graphique
    var line = d3.svg.line()
// assign the X function to plot our line as we wish
        .x(function (d) {
            return x(d.dateHeure);
        })
        .y(function (d) {
            return y(d.inuse);
        });

//affichage du titre du graphique

    svgTapestry.append('text')
        .attr('class', 'titleConnexions')
        .attr('dy', '1em')
        .text('Pool Tapestry');

//Cette liste va contenir les differents nom des pools Tapestry que l'on va faire apparaitre sur le graphique
    var lstPageNameInGraph = new d3.set();

    function updateColorOnClick(value, i) {
        updateGraphWithPage(value);

        if (lstPageNameInGraph.has(value)) {
            d3.select('#tabNomPage').selectAll('li')[0][i].style.color = 'white';
            d3.select('#tabNomPage').selectAll('li')[0][i].style.backgroundColor = d3.select('#tabNomPage').selectAll('li')[0][i].getAttribute('colorcode');
        } else {
            d3.select('#tabNomPage').selectAll('li')[0][i].style.color = d3.select('#tabNomPage').selectAll('li')[0][i].getAttribute('colorcode');
            d3.select('#tabNomPage').selectAll('li')[0][i].style.backgroundColor = 'white';
        }
    }

//Cette fonction permet d'afficher les differentes courbes lors du clique sur le nom du pool
    function updateGraphWithPage(value) {
        var namePage = value;
        if (lstPageNameInGraph.has(namePage)) {
            lstPageNameInGraph.remove(namePage);
            svgTapestry.selectAll('#' + namePage).data([]).exit().remove();
            svgTapestry.selectAll('#' + namePage + '_circle').remove();
        } else {
            lstPageNameInGraph.add(namePage);
            //on filtre les donnees sur les noms selectionne
            var lstData = data.filter(function (d) {
                if (d.page === namePage) {
                    return d;
                }
            });

            var path = svgTapestry.append('path');
            path.datum(lstData).style('stroke',function (d) {
                return d[0].color;
            }).attr('id', namePage).attr('d', line);
        }
    }

    // Selection de toutes les couleurs
    d3.select('#tabNomPage').selectAll('li').each(function (value, i) {
        updateColorOnClick(value, i);
    });

    //Ajout des valeurs dans le tableau des statistiques
    putInResumeStat('resume_nbrTapestryMax', maxCache);

});
