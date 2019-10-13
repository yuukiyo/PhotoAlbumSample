export var amplify_config = {
    Auth: {
        identityPoolId: '', // Amazon Cognito Identity Pool ID. such as us-west-2:701434d1-a5b7-4ad5-a1bb-88e96af455bc
        region: 'us-west-2', // Amazon Cognito Region
        userPoolId: '', //Amazon Cognito User Pool ID. such as us-west-2_abcDEFEg
        userPoolWebClientId: '', // Amazon Cognito Web Client ID. such as 33ud1vufabcedfgee866r9k0hnm
    },
    Storage: {
        bucket: '', //  Amazon S3 bucket. 
        region: 'us-west-2' //Amazon service region
    },
    API: {
        endpoints: [{
            name: 'DevAWSomeDayAPI',
            endpoint: '', // API Gateway Endpoint. such as https://abcdefghij.execute-api.us-west-2.amazonaws.com/prod
            region: 'us-west-2' //Amazon service region
        }]
    }
};

export default amplify_config;
