'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');

const SIO_URL = 'https://www.sio.no/mat-og-drikke/spisesteder-og-kaffebarer';

const postToSlack = (message, callback) => {
    const body = {
        response_type: 'in_channel',
        attachments: [
            {
                fallback: message,
                color: 'good',
                title: 'Dagens middag på Ole Johan Dahls hus',
                text: message
            }
        ]
    }
    console.log('Sender respons til Slack: ', body);
    callback(null, { statusCode: '200', body: JSON.stringify(body) });
}

module.exports.handler = (event, context, callback) => {
    console.log('Mottok event: ', JSON.stringify(event));

    fetch(SIO_URL)
        .then(res => res.text())
        .then(data => {
            const $ = cheerio.load(data);
            const todaysDinner = $('#jump284 .dagensmiddag ul:first-of-type li').text();
            postToSlack(todaysDinner, callback);
        })
        .catch(error => callback(error));
};