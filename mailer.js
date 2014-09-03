module.exports = function() {
    var mailer,
        emailRegexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

        mailerUrl = '',
        mailerKey = '',

        request = require('request'),
        _ = require('underscore');

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    function _getXML(options) {

            var xml = '<?xml version="1.0" encoding="utf-8" ?>';
            xml += '<LetterSendRequest ' +
                    'EmailFrom="' + options.from +
                    '" Subject="' + options.subject +
                    '" Text="' + escapeHtml(options.text) +
                    '" Name="' + options.mailName +
                    '" IsAutoSend="' + options.autoSend.toString()
                + '">';
            xml += '<Recipients>';
            options.to.forEach(function(to) {
                xml += '<Recipient EmailTo="' + to.email + '" EmailName="' + escapeHtml(to.name) + '" />';
            });
            xml += '</Recipients>';
            xml += '</LetterSendRequest>';
            
            return xml;
    }
    
    mailer = {
        
        /*
         * Отправить письмо
         * 
         * @param {object} options {to: {String|Array}, subject: {String}, text: {String}, from: {String}, autoSend: {Boolean}, mailName: {String}, callback: {Function}}
         */
        send: function (options) {

            if(!options) {
                return false;
            }

            _.defaults(options, {
                subject: 'Анонимный Осенний Санта',
                from: 'no-reply@inf.2gis.ru',
                text: '',
                autoSend: false,
                mailName: 'Anonymous Santa',
                callback: function () {}
            });

            if (!options.to) {
                options.callback(false);
                return false;
            }

            if (typeof options.to === 'string') {
                options.to = [{
                    email: options.to,
                    name: ''
                }];
            }

            options.to.forEach(function(to, index) {
                if (!emailRegexp.test(to.email)) {
                    options.to.splice(index, 1);
                    return;
                }

                if(!to.name) {
                    to.name = '';
                }
            });
            
            if (options.to.length === 0) {
                options.callback(false);
                return false;
            }

            var xml = _getXML(options);

            return request({
                url: mailerUrl + '&key=' + mailerKey,
                method: 'post',
                type: 'xml',
                body: xml,
                success: function(response) {
                    if (response.indexOf('<success>1</success>') !== -1) {
                        options.callback(true, response);
                        console.info('Succesfully send email to ' + options.email, {options: options, xml: xml, response: response});
                    } else {
                        console.error('Error send email to ' + options.email, {options: options, xml: xml, response: response});
                        options.callback(false, response);
                    }
                },
                error: function(xhr, error) {
                    console.error('Error send email to ' + options.email, {options: options, xml: xml, error: error});
                    options.callback(false, error);
                }
            });
        }
    };
    
    return mailer;
};