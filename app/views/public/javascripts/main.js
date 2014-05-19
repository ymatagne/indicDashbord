'use strict';
/**
 * Permet de retourner une code couleur different en fonction de la somme des caracteres du mot passe en parametre
 * @param word mot a convertir en couleur
 * @returns {string} code couleur
 */
function getValueOfPageName(word) {

    var sommeChartCode = 0;
    for (var i = 0; i < word.length; i++) {
        sommeChartCode += word.charCodeAt(i);
    }
    return '#' + Math.floor(parseFloat('0.' + sommeChartCode) * 16777215).toString(16);
}


/**
 * Permet de retourner les fichiers present dans le cookie
 * @return {*|Array}
 */
function getFilesInCookie() {
    var coockietab = document.cookie.split(';')
    for (var i = 0; i < coockietab.length; i++) {
        if (coockietab[i].split('=')[0].trim() == 'files') {
            return coockietab[i].split('=')[1].split('%3B')

        }
    }
}
/**
 * Permet de retourner le nom du noeud passé en parametre de l'url
 * @returns {string} le noeud a afficher
 */
function getNodeValueInUrl(urlPath) {
    if (urlPath.split('/').length === 4) {
        return window.location.pathname.split('/')[3];
    }
    return null;
}

/**
 * Permet de retourner la date de l'analyse
 * @returns {string} la date a analyser
 */
function getDateAnalyseInUrl(urlPath) {
    if (urlPath.split('/').length === 4) {
        return window.location.pathname.split('/')[2];
    }
    return null;
}
/**
 * Retourne le chemin complet du fichier
 * @param file nom du fichier
 * @return {String} chemin du fichier
 */
function getPathFiles(file) {
    return '/files/' + getDateAnalyseInUrl(window.location.pathname) + '/' + getNodeValueInUrl(window.location.pathname) + file;
}

/**
 * Permet de mettre a jour le titre de la page en fonction du nom du noeud passé en parametre
 * @param nomDuNoeud
 * @param dateAnalyse
 */
function updatePageTitre(nomDuNoeud, dateAnalyse) {
    document.title += ' | ' + dateAnalyse + ' | ' + nomDuNoeud;
    if (document.getElementById('titreDeLaPage') !== null) {
        document.getElementById('titreDeLaPage').innerHTML = document.getElementById('titreDeLaPage').innerHTML + formatDateForDatePicker(dateAnalyse, true) + ' - ' + nomDuNoeud;
    }
    if (document.getElementById('breadcrumb') !== null) {
        document.getElementById('breadcrumb').innerHTML = nomDuNoeud;
    }
}

/**
 * Permet de recuperer l'heure dans une date
 * @param date ou l on souhaite recuperer l'heure
 * @returns {string} heure
 */
function getHourInDate(date) {
    return date.substring(0, 2);
}

/**
 * Permet de formater la date en une heure lisible
 * @param date a formater
 * @returns {string} date formaté
 */
function formatDateToHour(date) {
    return date.substring(0, 2) + ':' + date.substring(2, 4);
}

/**
 * Permet de formater les dates dans le but de les utiliser en javascript
 * @param date
 * @return {Date}
 */
function formatDate(date, heure) {
    return new Date(date.substring(0, 4), parseInt(date.substring(4, 6)) - 1, date.substring(6, 8), heure.substring(0, 2), heure.substring(3, 5), '00', '00');
}


/**
 * Permet de formater les dates dans le but de les utiliser en javascript
 * @param date`
 * @param forIn determine s'il s'agit du format d'entree ou de sortie du datepicker
 * @return {Date}
 */
function formatDateForDatePicker(date, forIn) {
    if (forIn) {
        return date.substring(6, 8) + '/' + date.substring(4, 6) + '/' + date.substring(0, 4);
    } else {
        return date.substring(6, 10) + date.substring(3, 5) + date.substring(0, 2);
    }

}

/**
 * Permet de formater les dates dans le but d'obtenir la date du jour sous forme de String
 * @param date
 * @return {String}
 */
function formatDateForGetToday(date) {
    return date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6, 8);
}

/**
 * Permet de remplir le tableau de statistique sur l'onglet résume
 * @param key id de la div a mettre a jour
 * @param value valeur a inscrire dans la div
 */
function putInResumeStat(key, value) {
    if (document.getElementById(key).innerHTML === '') {
        document.getElementById(key).innerHTML = value;
    }
}

/**
 * Permet de faire apparaitre le parametre html dans la popin passée en parametre
 * @param popin a afficher
 * @param html message a afficher
 */
function displayPopin(popin, html, d3) {
    popin.transition().style('opacity', .9);
    popin.html(html)
        .style('left', (d3.event.pageX + 10) + 'px')
        .style('top', (d3.event.pageY - 30) + 'px');
}

/**
 * Fait disparaitre la popin passée en paramètre
 * @param popin
 */
function closePopins() {
    $('.popinGraphPointStat').css('opacity', 0);
    $('.popinStat').css('opacity', 0);
}

/**
 * Cree le contenu HTML pour la popin des login
 * @param data a transformer en HTML
 * @returns {string} HTML
 */
function createHtmlForLoginPopin(data) {
    var html = '';
    html += 'Login: ';
    html += data.login;
    html += '<br/>IP: ';
    html += data.ip;
    html += '<br/> Heure: ';
    html += data.hourForPopin;
    html += '<br/>';
    return html;
}

function createHtmlForApachePopin(data) {
    var html = '';
    html += 'Temps: ';
    html += data.temps;
    html += 's <br/>IP: ';
    html += data.ip;
    html += '<br/> Page: ';
    html += data.page;
    html += '<br/>';
    return html;
}
/**
 * Cree le contenu HTML pour la popin des threads
 * @param data a transformer en HTML
 * @returns {string} HTML
 */
function createHtmlForThreadHttpPopin(x, xPos, valueYMaxThread, valueYCurrentCount, valueYThreadMaxSpare, valueYThreadBusy) {
    var html = '';
    html += '<h4>Statistiques</h4>';
    html += '<div><label>Heure : </label><span class=\'label label-default\'>';
    html += (x.invert(xPos)).toLocaleTimeString();
    html += '</span></div>';
    html += '<div  style=\'color:red;\' ><label>Nbr Thread Max : </label><span class=\'label label-default\'>';
    html += valueYMaxThread;
    html += '</span></div>';
    html += '<div  style=\'color:pink;\' ><label>Nbr Thread Current : </label><span class=\'label label-default\'>';
    html += valueYCurrentCount;
    html += '</span></div>';
    html += '<div  style=\'color:green;\' ><label>Nbr Thread Max Spare  : </label><span class=\'label label-default\'>';
    html += valueYThreadMaxSpare;
    html += '</span></div>';
    html += '<div  style=\'color:blue;\' ><label>Nbr Thread Busy : </label><span class=\'label label-default\'>';
    html += valueYThreadBusy;
    html += '</span></div>';
    return html;
}

/**
 * Cree le contenu HTML pour la popin JDBC
 * @param data a transformer en HTML
 * @returns {string} HTML
 */
function createHtmlForJdbcPopin(x, xPos, valueYNbrConnexion, valueYNbrConnexionOccupe, valueYNbrIdleUse, valueYNbrMaxPoolSize) {
    var html = '';
    html += '<h4>Statistiques</h4>';
    html += '<div><label>Heure : </label><span class=\'label label-default\'>';
    html += (x.invert(xPos)).toLocaleTimeString();
    html += '</span></div>';
    html += '<div  style=\'color:red;\' ><label>Nb Connexions : </label><span class=\'label label-default\'>';
    html += valueYNbrConnexion;
    html += '</span></div>';
    html += '<div  style=\'color:black;\' ><label>Nb Connexions busy : </label><span class=\'label label-default\'>';
    html += valueYNbrConnexionOccupe;
    html += '</span></div>';
    html += '<div  style=\'color:green;\' ><label>Nb Connexions Idle : </label><span class=\'label label-default\'>';
    html += valueYNbrIdleUse;
    html += '</span></div>';
    html += '<div  style=\'color:blue;\' ><label>Max pool size : </label><span class=\'label label-default\'>';
    html += valueYNbrMaxPoolSize;
    html += '</span></div>';
    return html;
}

/**
 * Permet de mettre a jour la barre de progression.
 * @param value chargement de la barre
 */
function progressBarEvolution(value) {
    if (value) {
        $('.filter').css('visibility', 'visible');
        $('#progressBar').css('visibility', 'visible');
        $('.progress-bar').css('width', '100%');
        $('.progress-bar').css('height', '20px');
    } else {
        $('.filter').css('visibility', 'hidden');
        $('#progressBar').css('visibility', 'hidden');
    }
}

/**
 * Permet de mettre a jour le tableau de statistique sur la page d'accueil dans le but d'afficher si des seuils sont depassées
 */
function updateIndicateur() {
    $('.table tbody tr').each(function (index) {
        var valeur = NaN;
        var seuil = NaN;
        var indicateurPourcentageRequetes = false;
        $(this).find('td').each(function (index) {
            if (index == 0 && $(this).text().trim() == '7') {
                indicateurPourcentageRequetes = true;
            }
            if (index == 2) {
                valeur = parseFloat($(this).text().trim(), 10);
            }
            if (index == 3) {
                seuil = parseFloat($(this).text(), 10);
            }
        });
        if (!isNaN(seuil)) {
            $(this).css('font-weight', 'bolder');
            if (indicateurPourcentageRequetes) {
                if (valeur >= seuil) {
                    $(this).css('color', 'green');
                } else {
                    $(this).css('color', 'red');
                }
            } else {
                if (valeur <= seuil) {
                    $(this).css('color', 'green');
                } else {
                    $(this).css('color', 'red');
                }
            }
        }
    });
}

