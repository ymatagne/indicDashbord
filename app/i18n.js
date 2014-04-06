var i18n = require('i18n');
i18n.configure({
    locales:['fr'],
    directory: './locales',
    defaultLocale: 'fr'
});

module.exports = function(req, res, next) {
    i18n.init(req, res);
    res.locals.__ = res.__ = function() {
        return i18n.__.apply(req, arguments);
    };
    return next();
};