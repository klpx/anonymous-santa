/** @type {Array} */
var participants = require('./participants');
var mailer = require('./mailer')();

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function fill_ids () {
    var length = participants.length,
        ids = [];
    for (var i=1; i<=length; i++) {
        ids.push(i);
    }
    ids = shuffle(ids);
    participants.forEach(function (user) {
        user.id = ids.pop();
    })
}

var shuffleIterations = 0;
function shuffle_participants () {
    shuffleIterations++;
    var freeParticipants = shuffle(participants.slice());

    participants.forEach(function (userFrom) {
        userFrom.to = freeParticipants.pop();
        if (userFrom.to.id == userFrom.id) { //same user
            freeParticipants.unshift(userFrom.to);
            userFrom.to = freeParticipants.pop();
        }
    });

    var lastParticipant = participants[participants.length - 1];
    if (lastParticipant.id == lastParticipant.to.id) {
       shuffle_participants();
    }
}

fill_ids();
shuffle_participants();


var template = 'Привет!<br>\
Ты, будучи Анонимным Осенним Сантой, делаешь подарок котейке {name_to} (уникальный номер {id_to}).<br/>\
Котята будут получать свои подарки на ретре 10 сентября (во <a href="https://ru.wikipedia.org/wiki/%D0%92%D1%81%D0%B5%D0%BC%D0%B8%D1%80%D0%BD%D1%8B%D0%B9_%D0%B4%D0%B5%D0%BD%D1%8C_%D0%BF%D1%80%D0%B5%D0%B4%D0%BE%D1%82%D0%B2%D1%80%D0%B0%D1%89%D0%B5%D0%BD%D0%B8%D1%8F_%D1%81%D0%B0%D0%BC%D0%BE%D1%83%D0%B1%D0%B8%D0%B9%D1%81%D1%82%D0%B2">Всемирный день предотвращения самоубийств</a>).\
<br/>Клади свой подарок на алтарь.<br/><br/>\
<img src="http://i4.bebo.com/045/1/large/2008/05/09/01/19011105a7683631742l.jpg" />';

participants.forEach(function (userFrom) {
    var userTo = userFrom.to;

    //mailer.send({
    //    subject: 'Инструкция Анонимному Осеннему Санте',
    //    from: 'no-reply@inf.2gis.ru',
    //    text: template.replace('{name_to}', userTo.name_to).replace('{id_to}', userTo.id),
    //    autoSend: true,
    //    mailName: 'Anonymous Santa',
    //    to: [
    //        {
    //            email: userFrom.email,
    //            name: userFrom.name
    //        }
    //    ]
    //})
});
