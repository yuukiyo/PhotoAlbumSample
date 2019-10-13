import React, { Component } from 'react';
import { Storage, API } from 'aws-amplify';
import Moment from 'react-moment';

class MyPhotos extends Component {

    render() {
        if (!this.props.authState) {
            return (
                <div className="jumbotron" >
                <h2>Welcome to My Photo App. <br></br>Let's develop this application.</h2>
                </div>
            );
        }
        else if (this.props.authState === "signedIn") {
            return (
                <div className="jumbotron" >
                    <MyPhotoUpload authData={this.props.authData} authState={this.props.authState} />
                    <MyPhotoList authData={this.props.authData} authState={this.props.authState} />
                </div>
            );
        }
        else {
            return (
                <div></div>
            );
        }
    }
}

class MyPhotoUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            desc: ''
        };
        this.onTextAreaChange = this.onTextAreaChange.bind(this);

    }

    uploadPhoto(username) {

        var files = document.getElementById('photo').files;
        if (!files.length) {
            return alert('Please choose a file to upload first.');
        }

        var file = files[0];
        var now = new Date();
        var photokey = now.getTime() + '_' + file.name;
        var ext = file.name.split(/(?=\.[^.]+$)/)[1];
        var contentType = (ext => {
            switch (ext.toLowerCase()) {
                case '.jpeg':
                    return 'image/jpeg';
                case '.jpg':
                    return 'image/jpeg';
                case '.png':
                    return 'image/png';
                default:
                    return null;
            }
        })(ext);

        if (!contentType) {
            alert("Please choose an image file (jpeg or png).");
            return;
        }


        // Task: S3 Upload
        console.log("Define S3 Put Operation here.");
        /*
        Storage.put(photokey, file, {
                level: 'private',
                contentType: contentType,
                metadata: {
                    username: username,
                    description: Base64.encode(this.state.desc)
                }
            })
            .then(result => {
                console.log(result);
                alert("Uploading succeeded");
            })
            .catch(err => {
                console.log(err);
                alert("Err: " + err);
            });
        */
    }

    onTextAreaChange(e) {
        this.setState({ desc: e.target.value });
    }
    render() {
        let username;
        if (this.props.authState === 'signedIn') {
            username = this.props.authData.username;
        }

        return (
            <div className="control-group">
              <h4>Upload Photo</h4>
              <div className="control-group">
               <label className="control-label">Photo</label>
                <input id="photo" name="photo" type="file" />
              </div>
              <div className="control-group">
                <label className="control-label">Description</label>
                <div className="controls">
                    <textarea className="form-control" id="description" name="description" onChange={this.onTextAreaChange}></textarea>
                </div>
              </div>
              <div className="control-group">
                <div className="controls">
                      <input className="btn btn-primary" type="button" id="upload_btn" value="Upload" onClick={() => this.uploadPhoto(username)} />
                </div>
              </div>
            </div>
        );
    }
}



class MyPhotoList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            photos: []
        };
    }

    getMyPhotos(username) {

        // Task: API Call
        console.log("Define Get photos API Call here.");
        /*
        let apiName = 'DevAWSomeDayAPI';
        let path = `/photos/${username}`;
        let myInit = {
            headers: {},
            response: true
        };
        API.get(apiName, path, myInit).then(response => {
                var data = response.data;
                console.log("API call GetPhotos is succeeded!");
                this.setState({
                    photos: data.Items
                });
            })
            .catch(err => {
                console.log(err);
                alert("Err: " + err);
            });
        */
    }

    render() {
        let username;
        if (this.props.authState === 'signedIn') {
            username = this.props.authData.username;
        }

        const photoList = this.state.photos.map((photo) => {
            return (
                <MyPhotoItem key={photo.objectkey} photo={photo} />
            );
        });
        return (
            <div>
                <hr></hr>
                <input className="btn btn-primary" type="button" value="My Photo List" onClick={() => this.getMyPhotos(username)} />
                <div>
                {photoList}
                </div>
            </div>
        );
    }
}

class MyPhotoItem extends Component {
    render() {
        var labels = this.props.photo.labels;
        var preSignedURL = this.props.photo.preSignedURL;
        var description = Base64.decode(this.props.photo.description);
        var updatetime = this.props.photo.updatetime;

        return (
            <table className="table table-bordered">
                <tbody>
                    <tr><td rowSpan="4" className="col-md-2 text-center"><img alt="phogo" width="150" src={preSignedURL} /></td></tr>
                    <tr><th scope="row" className="col-md-2">Description</th><td>{description}</td></tr>
                    <tr><th scope="row" className="col-md-2">Labels</th><td>{labels}</td></tr>
                    <tr><th scope="row" className="col-md-2">Created</th><td><Moment parse="YYYYMMDDHHmmss" format="YYYY/MM/DD HH:mm:ss">{updatetime}</Moment></td></tr>
                </tbody>
            </table>
        )
    }
}

var Base64 = {
    encode: function(str) {
        if (!str) str = " ";
        return btoa(unescape(encodeURIComponent(str)));
    },
    decode: function(str) {
        return decodeURIComponent(escape(atob(str)));
    }
};

export default MyPhotos;
