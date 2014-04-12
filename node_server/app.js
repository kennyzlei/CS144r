var http = require('http');
var qs = require('querystring');
http.createServer(function (request, response) {
    var requestBody = "";
    if (request.method == "POST")
    	request.on('data', function(data) {
            requestBody += data;
            if(requestBody.length > 1e7) {
                response.writeHead(413, "Request Entity Too Large", {'Content-Type': 'text/html'});
                response.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
            }
    });
    request.on('end', function() {
        var formData = qs.parse(requestBody);
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('got it');
        console.log(requestBody);
    });
}).listen(1337);
console.log('Server running at http://127.0.0.1:1337/');