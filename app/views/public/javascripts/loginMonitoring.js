/**
 * Created by Yan Matagne on 26/03/2014.
 */
var width = 960;
var height = 500;
var barWidth = Math.floor(width / 19) - 1;


// Creation de creer l'objet SVG qui correspond à notre graphique
var svgUser = d3.select('#graphUser').append('svg')
    .attr('width', 1000)
    .attr('height', 600)
    .append('g')
    .attr('transform', 'translate(50,50)');


//creation de la popin qui s'affiche lorsque le pointer passe sur un point sur le graphique
var popin = d3.select('body').append('div').attr('class', 'popinStat').style('opacity', 0);

//initialisation du graphique avec les données présentes dans les logs
d3.csv = d3.dsv(';', 'text/log');
d3.csv(getPathFiles('/monitoringLogin.log'), function (error, data) {
    'use strict';
    // Recuperation des données dans le CSV
    data.forEach(function (d) {
        d.hourForPopin = formatDateToHour(d.dateHeure);
        d.heure = getHourInDate(d.dateHeure);
        d.login = d.login;
        d.ip = d.ip;
        if (d.login === 'e.ev1' || d.login === 'a.testsarabis' || d.login === 'i.integra') {
            d.bot = true;
        } else {
            d.bot = false;
        }
    });

    //gestion des axes X et Y.
    var x = d3.scale.linear()
        .range([barWidth / 2, width - barWidth / 2]);
    var y = d3.scale.linear()
        .range([height, 0]);
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .tickSize(-width)
        .tickFormat(function (d) {
            if (d % 5 === 0) {
                return d;
            }
        });
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(24)
        .tickFormat(function (d) {
            return d + 'h';
        });
    var maxAxeY = d3.max(d3.values(d3.nest()
        .key(function (d) {
            return d.heure;
        })
        .rollup(function (v) {
            return v.length;
        })
        .map(data)));

    var maxAxeYUsers = d3.max(d3.values(d3.nest()
        .key(function (d) {
            return d.heure;
        })
        .rollup(function (v) {
            return v.length;
        })
        .map( data.filter(function (d) {
            if (!d.bot) {
                return d;
            }
        }))));

    var maxAxeYBots = d3.max(d3.values(d3.nest()
        .key(function (d) {
            return d.heure;
        })
        .rollup(function (v) {
            return v.length;
        })
        .map( data.filter(function (d) {
            if (d.bot) {
                return d;
            }
        }))));

    //calcul du nombre d'utilisateur Max
    var total = d3.max(d3.values(d3.nest()
        .key(function (d) {
            return d;
        })
        .rollup(function (v) {
            return v.length;
        })
        .map(data)));
    //calcul du nombre d'utilisateur Max d'utilisateurs
    var totalUser = data.filter(function (d) {
        if (!d.bot) {
            return d;
        }
    }).length;

    //calcul du nombre d'utilisateur Max de bot
    var totalBot = data.filter(function (d) {
        if (d.bot) {
            return d;
        }
    }).length;

    // Definition des domaines sur les axes
    x.domain([0, 24]);
    y.domain([0, maxAxeY]);
    yAxis.ticks(maxAxeY);

    //ajout des axes dans le graphique
    svgUser.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0)')
        .call(yAxis)
        .selectAll('g');
    svgUser.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    // mise en place d'un text indiquant le chargement du graphique
    svgUser.append('text')
        .attr('class', 'loading')
        .text('Loading ...')
        .attr('x', function () {
            return width / 2;
        })
        .attr('y', function () {
            return height / 2 - 5;
        });


    //Permet de mettre a jour le graphique avec le type de point a afficher
    function updateGraphique(value) {
        svgUser.selectAll(value).remove();
        var nameGraph = value;
        if (lstGraphUsers.has(nameGraph)) {
            lstGraphUsers.remove(nameGraph);
            svgUser.selectAll(nameGraph).remove();
        } else {
            lstGraphUsers.add(nameGraph);
        }
        initGraph(value);
    }

    //Creation des 3 titre du graphique
    svgUser.append('text')
        .attr('class', 'titleConnexions')
        .attr('dy', '0.5em')
        .text('Tous : ' + total)
        .on('mouseover', function () {
            displayPopin(popin, 'Cliquez sur un titre pour filtrer', d3);
        }).on('mouseout', function () {
            closePopin(popin);
        }).on('click', function () {
            updateGraphique('#tous');
        });
    svgUser.append('text')
        .attr('class', 'titleConnexions')
        .attr('dy', '1.5em')
        .text('Nb utilisateurs : ' + totalUser)
        .on('mouseover', function () {
            displayPopin(popin, 'Correspond au cercle vert', d3);
        }).on('mouseout', function () {
            closePopin(popin);
        }).on('click', function () {
            updateGraphique('#user');
        });
    svgUser.append('text')
        .attr('class', 'titleConnexions')
        .attr('dy', '2.5em')
        .text('Nb bots : ' + totalBot)
        .on('mouseover', function () {
            displayPopin(popin, 'Correspond au cercle violet', d3);
        }).on('mouseout', function () {
            closePopin(popin);
        }).on('click', function () {
            updateGraphique('#bot');
        });

    //suppression du text de chargement
    svgUser.selectAll('.loading').remove();

    //mise a jour du graph
    var lstGraphUsers = new d3.set();
    updateGraphique('#tous');

    //Permet d'initialiser le graphique mettre a jour le graphique avec le type de point a afficher

    function initGraph(graph) {

        d3.nest()
            .key(function (d) {
                return d.bot;
            })
            .rollup(function (v) {
                return v.map(function (d) {
                    return d;
                });
            })
            .map(data.filter(function (d) {
                    if (graph === '#tous') {
                        return d;
                    } else {
                        if (graph === '#bot' && d.bot === true) {
                            return d;
                        } else if (graph === '#user' && d.bot === false) {
                            return d;
                        }
                    }
                }
            ));

        var dataByHeure = d3.nest()
                .key(function (d) {
                    return d.heure;
                })
                .rollup(function (v) {
                    return v.map(function (d) {
                        return d;
                    });
                })
                .map(data.filter(function (d) {
                        if (graph === '#tous') {
                            return d;
                        } else {
                            if (graph === '#bot' && d.bot === true) {
                                return d;
                            } else if (graph === '#user' && d.bot === false) {
                                return d;
                            }
                        }
                    }
                ))
            ;


        var maxAxeY = d3.max(d3.values(d3.nest()
            .key(function (d) {
                return d.heure;
            })
            .rollup(function (v) {
                return v.length;
            })
            .map(data.filter(function (d) {
                    if (graph === '#tous') {
                        return d;
                    } else {
                        if (graph === '#bot' && d.bot === true) {
                            return d;
                        } else if (graph === '#user' && d.bot === false) {
                            return d;
                        }
                    }
                }
            ))));

        y.domain([0, maxAxeY]);
        yAxis.ticks(maxAxeY);

        svgUser.selectAll('g .y.axis').call(yAxis);

        svgUser.selectAll('circle').remove();
        svgUser.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .filter(function (d) {
                if (graph === '#tous') {
                    return d;
                } else {
                    if (graph === '#bot' && d.bot === true) {
                        return d;
                    } else if (graph === '#user' && d.bot === false) {
                        return d;
                    }
                }
            })
            .attr('class', 'circle')
            .attr('cx', function (d) {
                return x(d.heure);
            })
            .attr('cy', function (d) {
                if (d !== null) {
                    for (var i = 0; i < dataByHeure[d.heure].length; i++) {
                        if (d === dataByHeure[d.heure][i]) {
                            return y(i);
                        }
                    }
                }
            })
            .attr('r', function () {
                return 5;
            })
            .attr('id', function (d) {
                if (d.bot) {
                    return 'bot';
                } else {
                    return 'user';
                }
            })
            .style('fill', function (d) {
                if (d.bot) {
                    return '#25136f';
                } else {
                    return '#2fe379';
                }
            })
            .on('mouseover', function (d) {
                displayPopin(popin, createHtmlForLoginPopin(d), d3);
            }).on('mouseout', function () {
                closePopin(popin);
            });

        //Ajout des valeurs dans le tableau des statistiques
        putInResumeStat('resume_nbrUsersMax', totalUser + ' / ' + totalBot);
        putInResumeStat('resume_nbrUsersHourMax', maxAxeYUsers + ' / ' + maxAxeYBots);


    }

});