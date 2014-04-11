var http = require('http');
http.createServer(function (request, response) {
  //res.writeHead(200, {'Content-Type': 'text/plain'});
  //res.end('Hello World\n');
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
      //response.writeHead(200, {'Content-Type': 'text/html'});
      //response.write('<!doctype html><html><head><title>response</title></head><body>');
      //response.write('Thanks for the data!<br />User Name: '+formData.UserName);
      //response.write('<br />Repository Name: '+formData.Repository);
      //response.write('<br />Branch: '+formData.Branch);

      //send data to universal database

      //wait

      //check database for match
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end('got it')
      //response.end('</body></html>');
    });
}).listen(1337);
console.log('Server running at http://127.0.0.1:1337/');