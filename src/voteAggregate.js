'use strict';
var AWS = require('aws-sdk'),
    dynamodb = new AWS.DynamoDB({ region: 'us-west-2' }),
    aggregatesTable = 'voteAggregate';

function updateAggregateForColor(votedFor, numVotes) {

    console.log('Inside update Aggregate function');
    console.log("Updating Aggregate Color ", votedFor);
    console.log("For NumVotes: ", numVotes);

    dynamodb.updateItem({
        'TableName': aggregatesTable,
        'Key': { 'VotedFor' : { 'S': votedFor }},
        'UpdateExpression': 'add #vote :x',
        'ExpressionAttributeNames': {'#vote' : 'Vote'},
        'ExpressionAttributeValues': { ':x' : { "N" : numVotes.toString() } }
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log("Vote received for %s", votedFor);
            console.log('Successfully updated voteAggregate table');
        }
    });
}

module.exports.voteAggregate = (event, context, callback) => {
    var totalRed = 0,
        totalGreen = 0,
        totalBlue = 0,
        totalYellow = 0,
        votedFor;

    event.Records.forEach(function(record) {

        var votedForHash = record.dynamodb['NewImage']['VotedFor']['S'];
        var numVotes = record.dynamodb['NewImage']['Votes']['N'];

        // Determine the color on which to add the vote
        if (votedForHash.indexOf("RED") > -1) {
            votedFor = "RED";
            totalRed += parseInt(numVotes);
        } else if (votedForHash.indexOf("GREEN") > -1) {
            votedFor = "GREEN";
            totalGreen +=  parseInt(numVotes);
        } else if (votedForHash.indexOf("BLUE") > -1) {
            votedFor = "BLUE";
            totalBlue += parseInt(numVotes);
        } else if (votedForHash.indexOf("YELLOW") > -1) {
            votedFor = "YELLOW";
            totalYellow += parseInt(numVotes);
        }
        else {
            console.log("Invalid vote: ", votedForHash);
        }
    });

    // Update the aggregation table with the total of RED, GREEN, and BLUE
    // votes received from this series of updates
    if (totalRed > 0) updateAggregateForColor("RED", totalRed);
    if (totalBlue > 0) updateAggregateForColor("BLUE", totalBlue);
    if (totalGreen > 0) updateAggregateForColor("GREEN", totalGreen);
    if (totalYellow > 0) updateAggregateForColor("YELLOW", totalYellow);
};