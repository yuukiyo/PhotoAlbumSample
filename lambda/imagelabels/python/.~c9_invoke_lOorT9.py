# Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except
# in compliance with the License. A copy of the License is located at
#
# https://aws.amazon.com/apache-2-0/
#
# or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
from __future__ import print_function
import json
import boto3
from datetime import datetime

s3 = boto3.client('s3')
rek = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    "Process upload event, get labels and update database"
    bucket = event['Records'][0]["s3"]["bucket"]["name"]
    key = event['Records'][0]["s3"]["object"]["key"]
    key = key.replace("%3A", ":");
    print("Received event. Bucket: [%s], Key: [%s]" % (bucket, key))

    response = s3.head_object(Bucket=bucket, Key=key)
    username =  response['Metadata']['username'];
    description = response['Metadata']['description']
    print("username : %s" % username)
    print("description : %s" % description)
    
    response = rek.detect_labels(
        Image={
            'S3Object': {
                'Bucket': bucket,
                'Name': key
            }
        })
    all_labels = [label['Name'] for label in response['Labels']]
    csv_labels = ", ".join(all_labels)
    print("Detect_labels finished. Key: [%s], Labels: [%s]" % (key, csv_labels))
    
    table    = dynamodb.Table('devawsome-photos')
    response = table.put_item(
        Item={
            'username': username,
            'objectkey': key,
            'description': description,
            'labels': csv_labels,
            'updatetime': datetime.now().strftime('%Y%m%d%H%M%S')
        }
    )
    
    return True

# This is used for debugging, it will only execute when run locally
if __name__ == "__main__":
    # simulated sns event
    fake_sns_event = {
        "Records": [
            {
                "EventSource": "aws:sns",
                "EventVersion": "1.0",
                "EventSubscriptionArn": "...",
                "Sns": {
                    "Message": """{\"Records\":[{\"eventVersion\":\"2.0\",
                    \"eventSource\":\"aws:s3\",\"awsRegion\":\"us-west-2\",
                    \"eventTime\":\"...\",\"eventName\":\"ObjectCreated:Put\",
                    \"s3\":{\"bucket\":{\"name\":\"fake-bucket\"},
                    \"object\":{\"key\":\"photos/8d2567bc34013c97.png\"}}}]}""",
                    "MessageAttributes": {}
                }
            }
        ]
    }
    fake_context = []
    lambda_handler(fake_sns_event, fake_context)
