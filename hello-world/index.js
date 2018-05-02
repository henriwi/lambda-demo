'use strict';

module.exports.handler = (event, context, callback) => {
    console.log('Mottok event: ', JSON.stringify(event));
    callback(null, 'Hello fagkveld!');
};