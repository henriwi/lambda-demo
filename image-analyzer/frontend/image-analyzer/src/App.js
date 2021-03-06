import React, { Component } from 'react';
import './App.css';
import Image from './Image';
import {dynamodb} from './AWS';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      imageMetadata: []
    }
  }

  componentDidMount() {
    dynamodb.scan({ TableName: 'image-labels' }, (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(data);
      const imageMetadata = data.Items
        .map(item => {
          return {
            imageKey: item.image.S,
            thumbnailImageKey: 'thumbnails/' + item.image.S.split('/')[1],
            bucketName: item.bucketName.S,
            labels: item.labels.L
          }
        }
        );
      console.log('imageMetadata', imageMetadata);
      this.setState({ imageMetadata: imageMetadata })

    });
  };

  render() {
    const images = this.state.imageMetadata.map(image=> {
      return (<div key={image.imageKey}>
        <Image
          key={image.imageKey}
          thumbnailKey={image.thumbnailImageKey}
          bucketName={image.bucketName}
          imageKey={image.imageKey}
          labels={image.labels} />
      </div>)
    });
    return (
      <div className="App">
        {images}
      </div>
    );
  }
}

export default App;
