const app = require('../services/app.service');
const config = require(__dirname + '/../config/app.json')[app['env']];

const sendNotification = async function (data, tokens) {

    var notificationData = JSON.stringify({
        notification: data,
        registration_ids: tokens
    });

    return FCM.sendPushNotification(notificationData)
        .then(function (response) {
            return true
        })
        .catch(function (error) {
            return false
        });
}

module.exports = {
    sendNotification
}