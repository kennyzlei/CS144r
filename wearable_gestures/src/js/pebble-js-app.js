// buffer for accelerometer data
var buffer;
// vector used for console logging checking
var vector = new Array();
// number of batches of accelerometer samples received
var count = 0;
// user object info
var user = {
  "name": "unknown",
  "phonenumber": "unkown",
  "email": "unknown",
  "special-feature": "off",
  "checkbox-facebook": false,
  "checkbox-linkedin": false,
  "checkbox-googleplus": false,
  "checkbox-twitter": false
};

// on ready of app
Pebble.addEventListener("ready",
  function (e) {
    // sanity check hello world!
    console.log("Hello world! - Sent from your javascript application.");
    // for each key in the user object, try get the item from persistant 
    // storage on the device
    for (key in user) {
      var val = window.localStorage.getItem(key);
      user[key] = val;
    }
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
      // show notification on pebble about the match
      Pebble.showSimpleNotificationOnPebble("weShake", http.responseText);
      // notify pebble app that it can start recording new handshakes
      var transactionId = Pebble.sendAppMessage({
          "2": "2"
        },
        function (e) {
          console.log("Successfully delivered message with transactionId=" + e.data.transactionId);
        },
        function (e) {
          console.log("Unable to deliver message with transactionId=" + e.data.transactionId +
            " Error is: " +
            e.error.message);
        }
      );

      console.log("Server response: " + http.responseText);
    }
  }
  http.send(params);
}

// on receiving an appmessage from the pebble
Pebble.addEventListener("appmessage",
  function (e) {
    // we first check if the count is less than the number of batches of 
    // 25 samples that we want
    if (count < 1) {
      // if it is, lets store this samples in our buffer and wait for another batch
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
      // if we already have the correct amount of batches of 25 samples
    } else if (count == 1) {
      //appmessage send phone to cancel sampling and that server is now matching
      var transactionId = Pebble.sendAppMessage({
          "1": "1"
        },
        // console log if message is successfully delivered or not
        function (e) {
          console.log("Successfully delivered message with transactionId=" + e.data.transactionId);
        },
        function (e) {
          console.log("Unable to deliver message with transactionId=" + e.data.transactionId +
            " Error is: " +
            e.error.message);
        }
      );
      // filter the vector using the 5 point filtering function defined below
      var filtered = filter(vector);
      /* this was an experiment to see if the max and min peaks line up by finding
	// them and getting the difference in time between the two
	// we realized that this is not accurate enough by itself to prove that two 
	// vectors are from the same handshake - hence we moved onto the sliding dot product
	// which is computed on the server side */
      console.log("min: " + min_peak(filtered));
      console.log("max: " + max_peak(filtered));
      console.log(filtered);
      console.log(vector);
      var peak_diff = Math.abs(max_peak(filtered) - min_peak(filtered));
      vector = [];
      console.log("peak difference is: " + peak_diff);

      // location data
      var latitude, longitude;
      navigator.geolocation.getCurrentPosition(function (position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        var d = new Date();

        var http = new XMLHttpRequest();
        var url = "http://gestures2.cloudapp.net:1337/";
        var time = d.getTime();

        var params = "check=false&latitude=" + latitude + "&longitude=" + longitude + "&time=" + time +
          "&account=" + Pebble.getAccountToken() + "&name=" + user["name"] + "&phonenumber=" + user[
            "phonenumber"] +
          "&email=" + user["email"] + "&special_feature=" + user["special-feature"] + "&acceleration=" +
          filtered.join();

        http.open('POST', url, true);
        //Send the proper header information along with the request
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        http.setRequestHeader("Content-length", params.length);
        http.setRequestHeader("Connection", "close");
        http.onreadystatechange = function () { //Call a function when the state changes.
          if (http.readyState == 4 && http.status == 200) {
            //Pebble.showSimpleNotificationOnPebble("SERVER", "You just met our server! lol");
            console.log("Server response: " + http.responseText);
            setTimeout(function () {
              sendPost(url, "check=true&shakeindex=" + http.responseText + "&time=" + time +
                "&account=" + Pebble.getAccountToken() + "&acceleration=" + filtered.join())
            }, 3000);
          }
        }
        http.send(params);
      });
      // reset count and buffer
      count = 0;
      buffer = '';
      // otherwise do nothing since we already have had our correct number of samples
    } else {
      return;
    };

  });

// function that finds the first min peak in a vector
function min_peak(v) {
  var length = v.length;
  for (i = 1; i < length - 1; i++) {
    if ((v[i - 1] >= v[i]) && (v[i] <= v[i + 1])) {
      return i;
    }
  }
}

// function that finds the first max peak in a vector
function max_peak(v) {
  var length = v.length;
  for (i = 1; i < length - 1; i++) {
    if ((v[i - 1] <= v[i]) && (v[i] >= v[i + 1])) {
      return i;
    }
  }
}

// 5 point smoothing filter function
function filter(v) {
  var N = v.length;
  var a = .2;
  S = new Array();
  S.push(v[0]);
  for (i = 2; i < N - 2; i++) {
    S.push((a * v[i - 2] + a * v[i - 1] + a * v[i] + a * v[i + 1] + a * v[i + 2]));
  }
  S.push(v[N - 1]);

  return S;
}

// show configuration html page for setting user data such as phone number
// on the device when open settings from the pebble app
Pebble.addEventListener("showConfiguration", function () {
  console.log("showing configuration");
  Pebble.openURL('http://kennyzlei.github.io/CS144r');
});

// on close of the settings page, we need to store this data into the iphone's
// persistent storage for use every time that the app is activated
Pebble.addEventListener("webviewclosed",
  function (e) {
    // decode the response and format as JSON
    var configuration = JSON.parse(decodeURIComponent(e.response));
    // for each record store this in local storage
    for (key in configuration) {
      window.localStorage.setItem(key, configuration[key]);
    }

    // sanity check: did we get the correct data back?
    console.log("Configuration window returned: ", JSON.stringify(configuration));
  }
);
