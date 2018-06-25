import React, { Component } from 'react';
import AWS from 'aws-sdk'
import Spinner from 'react-spinkit';
import './Image.css';

AWS.config.region = 'eu-west-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: '',
});

var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
});

class Image extends Component {

    constructor(props) {
        super(props);
        this.state = {
            url: undefined
        }
    }

    encode = data => {
        var str = data.reduce(function (a, b) { return a + String.fromCharCode(b) }, '');
        return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
    };

    componentDidMount() {
        const { bucketName, thumbnailKey } = this.props;
        s3.getObject({ Bucket: bucketName, Key: thumbnailKey }).promise()
            .then(data => {
                console.log(data);
                this.setState({ url: 'data:image/jpeg;base64,' + this.encode(data.Body) });
            }).catch(error => console.log(error));
    }

    render() {
        const labels = this.props.labels.map(label => {
            return <span key={label.S}>{label.S}&nbsp;</span>
        });

        return (<div className="image">
            {this.state.url ? (
                <img width="400px" src={this.state.url} alt={this.props.imageKey} />
            ) : (
                    <Spinner name="circle" className="spinner"/>
                )}
            <p>{labels}</p>
        </div>);
    }
}

export default Image;


