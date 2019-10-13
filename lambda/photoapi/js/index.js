const AWS = require('aws-sdk');

const BUCKET_NAME = process.env['BUCKET_NAME'];
const ddb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = (event, context, callback) => {

    console.log('Received event: ', event);

    // Because we're using a Cognito User Pools authorizer, all of the claims
    // included in the authentication token are provided in the request context.
    // This includes the username as well as other attributes.
    const username = event.pathParameters.username;

    console.log('username : ' + username);

    var params = {
        TableName: "devawsome-photos",
        IndexName: "username-updatetime-index",
        KeyConditionExpression: "#un = :un",
        ExpressionAttributeNames: {
            "#un": "username"
        },
        ExpressionAttributeValues: {
            ":un": username
        },
        ScanIndexForward: false
    };

    ddb.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            errorResponse(err.message, context.awsRequestId, callback)

        }
        else {
            console.log("Query succeeded.: " + JSON.stringify(data));

            var promises = [];
            data.Items.forEach(function(item) {
                var params = {
                    Bucket: BUCKET_NAME,
                    Key: item.objectkey,
                    Expires: 3600
                };

                promises.push(getSignedUrlPromise('getObject', params));

            });

            Promise.all(promises).then(function(results) {
                console.log("Promise Results: " + results);
                for (var i = 0; i < results.length; i++) {
                    console.log("Result[" + i + "]:" + results[i]);
                    data.Items[i].preSignedURL = results[i]
                }

                callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(data),
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    }
                });

            });

        }
    });


};

function getSignedUrlPromise(method, params) {
    return new Promise(function(resolve, reject) {
        s3.getSignedUrl(method, params, function(err, url) {
            if (err) {
                console.log("getSignedUrlPromise Error: " + err);
                reject(err);
            }
            else {
                console.log("Signed Url: " + url);
                resolve(url);
            }
        });
    });

}

function errorResponse(errorMessage, awsRequestId, callback) {
    callback(null, {
        statusCode: 500,
        body: JSON.stringify({
            Error: errorMessage,
            Reference: awsRequestId,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}
