
// Region and IdentityPoolId should be set to your own values
AWS.config.region = 'us-west-2'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-west-2:4df34432-3a85-478d-b92d-5cd2154063b4',
});

var dynamodb = new AWS.DynamoDB();
var params = { TableName: 'voteAggregate' };

/* Create the context for applying the chart to the HTML canvas */
var ctx = $("#graph").get(0).getContext("2d");

/* Set the options for our chart */
var options = { segmentShowStroke : false,
								animateScale: true,
								percentageInnerCutout : 50,
                showToolTips: true,
                tooltipEvents: ["mousemove", "touchstart", "touchmove"],
                tooltipFontColor: "#fff",
								animationEasing : 'easeOutCirc'
              }

/* Set the initial data */
var init = [
  {
      value: 1,
      color: "#e74c3c",
      highlight: "#c0392b",
      label: "Red"
  },
  {
      value: 1,
      color: "#2ecc71",
      highlight: "#27ae60",
      label: "Green"
  },
  {
      value: 1,
      color: "#3498db",
      highlight: "#2980b9",
      label: "Blue"
  },
    {
        value: 1,
        color: "#dfce52",
        highlight: "#b9af28",
        label: "Yellow"
    }
];

graph = new Chart(ctx).Pie(init, options);

$(function() {
  getData();
  $.ajaxSetup({ cache: false });
  /* Get the data every 3 seconds */
  setInterval(getData, 3000);
});

/* Makes a scan of the DynamoDB table to set a data object for the chart */
function getData() {
  dynamodb.scan(params, function(err, data) {
    if (err) {
      console.log(err);
      return null;
    } else {
      var redCount = 0;
      var greenCount = 0;
      var blueCount = 0;
        var yellowCount=0;

      for (var i in data['Items']) {
        if (data['Items'][i]['VotedFor']['S'] == "RED") {
          redCount = parseInt(data['Items'][i]['Vote']['N']);
        }
        if (data['Items'][i]['VotedFor']['S'] == "GREEN") {
          greenCount = parseInt(data['Items'][i]['Vote']['N']);
        }
        if (data['Items'][i]['VotedFor']['S'] == "BLUE") {
          blueCount = parseInt(data['Items'][i]['Vote']['N']);
        }
          if (data['Items'][i]['VotedFor']['S'] == "YELLOW") {
              yellowCount = parseInt(data['Items'][i]['Vote']['N']);
          }
      }

      var data = [
        {
            value: redCount,
            color:"#e74c3c",
            highlight: "#c0392b",
            label: "Red"
        },
        {
            value: greenCount,
            color: "#2ecc71",
            highlight: "#27ae60",
            label: "Green"
        },
        {
            value: blueCount,
            color: "#3498db",
            highlight: "#2980b9",
            label: "Blue"
        },
        {
            value: yellowCount,
            color: "#dfce52",
            highlight: "#b9af28",
            label: "Yellow"
        }
      ];

      /* Only update if we have new values (preserves tooltips) */
      if (  graph.segments[0].value != data[0].value ||
            graph.segments[1].value != data[1].value ||
            graph.segments[2].value != data[2].value ||
            graph.segments[3].value != data[3].value
         )
      {
        graph.segments[0].value = data[0].value;
        graph.segments[1].value = data[1].value;
        graph.segments[2].value = data[2].value;
        graph.segments[3].value = data[3].value;
        graph.update();
      }

    }
  });
}
