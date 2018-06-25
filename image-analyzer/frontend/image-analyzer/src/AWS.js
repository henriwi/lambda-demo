import AWS from 'aws-sdk'

AWS.config.region = 'eu-west-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: '',
});

const dynamodb = new AWS.DynamoDB();

const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
});

export {
    dynamodb,
    s3
};