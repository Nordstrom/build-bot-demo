'use strict';
var AWS = require('aws-sdk'),
    dynamodb = new AWS.DynamoDB({ region: 'us-west-2' });
module.exports = (event, context, callback) => {
    var votedFor = event['Body'].toUpperCase().trim(),
        votedForHash,
        tableName = 'vote';

    if (['RED', 'GREEN', 'BLUE', 'YELLOW'].indexOf(votedFor) >= 0) {
        /* Add randomness to our value to help spread across partitions */
        votedForHash = votedFor + '.' + Math.floor((Math.random() * 10) + 1).toString();
        /* ...updateItem into our DynamoDB database */
        dynamodb.updateItem({
            'TableName': tableName,
            'Key': {'VotedFor': {'S': votedForHash}},
            'UpdateExpression': 'add #vote :x',
            'ExpressionAttributeNames': {'#vote': 'Votes'},
            'ExpressionAttributeValues': {':x': {"N": "1"}}
        }, function (err, data) {
            if (err) {
                console.log(err);
                context.fail(err);
            } else {
                console.log("Vote received for %s", votedFor);
            }
        });
    }
};