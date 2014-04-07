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
});


