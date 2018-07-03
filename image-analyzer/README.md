Simple app consisting of two lambda functions which are triggered via a SNS topic when an image is uploaded to a S3 bucket. The first lambda (image-resizer) fetches the image, resizes it and saves it back to the S3 bucket. The second lambda (image-analyzer) calls AWS Rekognition to fetch a list of labels describing the content of the image. After fetching the labels the lambda saves the labels together with the image name to a DynamoDB table.

There's also a frontend application (written in React) that fetches the metadata of all images (name and labels) from DynamoDB and the image from S3. It uses AWS Cognito to get hold of credentials that allows the client to call DynamoDB and S3.

To run the frontend you must create a `.env` file in the root of the `frontend`-folder with the following content:

```
REACT_APP_COGNITO_IDENTITY_POOL_ID=<id of your cognito identity pool>
```

The Cognito Identity Pool must be configured to return a set of credentials which allows unauthorized users to access your DynamoDB table and S3 bucket.