Pebble.addEventListener("ready",
    function(e) {
        console.log("Hello world! - Sent from your javascript application.");
    }
);

Pebble.addEventListener("appmessage",
                        function(e) {

	var output;
	for (var i=0;i < 25;i++)
	{
		var onemeasure = e.payload[i] + "\n";
		output += onemeasure;
	}              
	console.log(output);

	var location;
	navigator.geolocation.getCurrentPosition(function(position){
		location = position.coords;
	});
	var d = new Date();

	var http = new XMLHttpRequest();
	var url = "http://140.247.0.19:1337/";
	var params = "latitude="+location.latitude+"&longitude="+location.longitude+"&time="+d.getTime();
	http.open('POST', url, true);
	//Send the proper header information along with the request
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.setRequestHeader("Content-length", params.length);
	http.setRequestHeader("Connection", "close");

	http.onreadystatechange = function() {//Call a function when the state changes.
		if(http.readyState == 4 && http.status == 200) {
			console.log("Server response: "+http.responseText);
		}
	}
	http.send(params);
});


