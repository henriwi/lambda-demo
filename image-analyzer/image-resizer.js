'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
    signatureVersion: 'v4',
});

const gm = require('gm').subClass({ imageMagick: true });

const getSNSMessageObject = msgString => {
    var x = msgString.replace(/\\/g, '');
    var y = x.substring(1,x.length-1);
    var z = JSON.parse(y);
    return z;
 }

const gmToBuffer = data => {
    return new Promise((resolve, reject) => {
        data.stream((err, stdout, stderr) => {
            if (err) { return reject(err) }
            const chunks = []
            stdout.on('data', (chunk) => { chunks.push(chunk) })
            // these are 'once' because they can and do fire multiple times for multiple errors,
            // but this is a promise so you'll have to deal with them one at a time
            stdout.once('end', () => { resolve(Buffer.concat(chunks)) })
            stderr.once('data', (data) => { reject(String(data)) })
        })
    })
}
const saveToS3 = (resizedData, bucketName, imageName, data, callback) => {
    gmToBuffer(resizedData)
    .then(data => {
        const imageKey = "thumbnails/" + imageName;
        console.log('Saving thumbnail to S3', imageKey)
        S3.putObject({
            Bucket: bucketName,
            Key: imageKey,
            Body: data,
            ContentType: "image/jpg"
        }).promise()
            .then(() => callback(null, "Thumbnail saved!"));
    })
    .catch(error => callback(error));
};

module.exports.handler = (event, context, callback) => {
    console.log('Mottok event: ', JSON.stringify(event));
    const snsMsgString = JSON.stringify(event.Records[0].Sns.Message);
    const snsMsgObject = getSNSMessageObject(snsMsgString);
    const bucketName = snsMsgObject.Records[0].s3.bucket.name;
    const objectKey = snsMsgObject.Records[0].s3.object.key;
    const imageName = objectKey.split('/')[1];

    S3.getObject({ Bucket: bucketName, Key: objectKey }).promise()
        .then(data => {
            console.log('data fetched from S3. Resizing image.')
            const resizedData = gm(data.Body).resize(400);
            saveToS3(resizedData, bucketName, imageName, data, callback);
        }).catch(error => callback(error));
};