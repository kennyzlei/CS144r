var buffer;
var vector = new Array();
var count = 0;

Pebble.addEventListener("ready",
    function (e) {
        console.log("Hello world! - Sent from your javascript application.");
    }
);

function sendPost(url, params) {
    var http = new XMLHttpRequest();
    http.open('POST', url, true);
    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.setRequestHeader("Content-length", params.length);
    http.setRequestHeader("Connection", "close");

    http.onreadystatechange = function () { //Call a function when the state changes.
        if (http.readyState == 4 && http.status == 200) {
   
            Pebble.showSimpleNotificationOnPebble("SERVER", "Match: " + http.responseText);
         
    	    var transactionId = Pebble.sendAppMessage({
                    "2": "2"
                },
                function (e) {
                    console.log("Successfully delivered message with transactionId=" + e.data.transactionId);
                },
                function (e) {
                    console.log("Unable to deliver message with transactionId=" + e.data.transactionId + " Error is: " +
                        e.error.message);
                }
            );

            console.log("Server response: " + http.responseText);
        }
    }
    http.send(params);
}

Pebble.addEventListener("appmessage",
    function (e) {


        if (count < 3) {
            var output;
            for (var i = 0; i < 25; i++) {
                var onemeasure = e.payload[i] + "\n";
                output += onemeasure;
                if (e.payload[i])
                    vector.push(+e.payload[i]);
            }
            //console.log(count + ": " + output);
            buffer += output;
            count++;
        } else if (count == 3) {
            //appmessage send phone to cancel
            var transactionId = Pebble.sendAppMessage({
                    "1": "1"
                },
                function (e) {
                    console.log("Successfully delivered message with transactionId=" + e.data.transactionId);
                },
                function (e) {
                    console.log("Unable to deliver message with transactionId=" + e.data.transactionId + " Error is: " +
                        e.error.message);
                }
            );
             //console.log("BUFFFFFFFEERRRRR: " + buffer);
		//console.log(buffer);
		console.log("min: " + min_peak(vector));
		console.log("max: " + max_peak(vector));		
		console.log(vector);
		var peak_diff = Math.abs(max_peak(vector)-min_peak(vector));
		vector =[];
        console.log("peak difference is: " + peak_diff);

            var latitude, longitude;
            navigator.geolocation.getCurrentPosition(function (position) {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;

                var d = new Date();

                var http = new XMLHttpRequest();
                var url = "http://gestures2.cloudapp.net:1337/";
                var time = d.getTime();
                var params = "check=false&latitude=" + latitude + "&longitude=" + longitude + "&time=" + time +
                    "&account=" + Pebble.getAccountToken();
                http.open('POST', url, true);
                //Send the proper header information along with the request
                http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                http.setRequestHeader("Content-length", params.length);
                http.setRequestHeader("Connection", "close");

                http.onreadystatechange = function () { //Call a function when the state changes.
                    if (http.readyState == 4 && http.status == 200) {
                        //Pebble.showSimpleNotificationOnPebble("SERVER", "You just met our server! lol");
                        console.log("Server response: " + http.responseText);
                        setTimeout(sendPost(url, "check=true&shakeindex=" + http.responseText + "&time=" + time +
                            "&account=" + Pebble.getAccountToken()), 7000);
                    }
                }
                http.send(params);
            });
            // reset count and buffer
            count = 0;
            buffer = '';
            // otherwise do nothing since we already have had our 3 samples
        } else {
            return;
        };

    });

function min_peak(v){
    var length = v.length;
    for (i=1; i< length-1;i++)
    {
        if((v[i-1]>= v[i]) && (v[i] <= v[i+1]))
        {
            return i;
        }  
    }
}

function max_peak(v){
    var length = v.length;
    for (i=1; i< length-1;i++)
    {
        if((v[i-1]<= v[i]) && (v[i] >= v[i+1]))
        {
            return i;
        }  
    }
}

Pebble.addEventListener("showConfiguration", function() {
  console.log("showing configuration");
  Pebble.openURL('http://assets.getpebble.com.s3-website-us-east-1.amazonaws.com/pebble-js/configurable.html');
});

Pebble.addEventListener("webviewclosed",
  function(e) {
    var configuration = JSON.parse(decodeURIComponent(e.response));
    console.log("Configuration window returned: ", JSON.stringify(configuration));
  }
);
