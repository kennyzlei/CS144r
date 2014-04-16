var buffer;
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
		console.log(buffer);

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
                            "&account=" + Pebble.getAccountToken()), 5000);
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
