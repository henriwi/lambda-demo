'use strict';

const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();
const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();

const getSNSMessageObject = msgString => {
    var x = msgString.replace(/\\/g, '');
    var y = x.substring(1,x.length-1);
    var z = JSON.parse(y);
    return z;
 }

const detectLabels = (bucketName, objectKey) => {
    const params = {
        Image: {
            S3Object: {
                Bucket: bucketName,
                Name: objectKey
            }
        },
        MaxLabels: 10,
        MinConfidence: 70
    };

    return new Promise((res, rej) => {
        rekognition.detectLabels(params, (err, data) => {
            if (err) {
                console.log(err);
                rej(err);
            }
            console.log(data);
            const labels = data.Labels
                .map(label => label.Name)
            res(labels);
        });
    });
}

const saveToDynamoDB = (bucketName, objectKey, labels, callback) => {
    const item = {
        image: objectKey,
        bucketName: bucketName,
        labels: labels
    }

    dynamo.putItem({ TableName: 'image-labels', Item: item }, (err, res) => {
        if (err) {
            console.log(err);
            callback(err);
        }
        console.log(res);
        callback(null, "Finished");
    });
};

module.exports.handler = (event, context, callback) => {
    console.log('Mottok event: ', JSON.stringify(event));
    const snsMsgString = JSON.stringify(event.Records[0].Sns.Message);
    const snsMsgObject = getSNSMessageObject(snsMsgString);
    const bucketName = snsMsgObject.Records[0].s3.bucket.name;
    const objectKey = snsMsgObject.Records[0].s3.object.key;

    detectLabels(bucketName, objectKey)
        .then(labels => saveToDynamoDB(bucketName, objectKey, labels, callback))
        .catch(err => callback(null, err))
};