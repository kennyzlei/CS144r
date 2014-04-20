var http = require('http');
var qs = require('querystring');

var shake = new Array();

function Stack(lat, longit)
{
    this.latitude = lat
    this.longitude = longit
    this.stac = new Array();
    this.pop = function(){
        return this.stac.pop();
    }
    this.push = function(item){
        this.stac.push(item);
    }
    this.indexOf = function(tuple){
        return this.stac.indexOf(tuple);
    }
    this.get = function(index){
        if (index >= 0 && index < this.stac.length){
            return this.stac[index];
        }
        else {
            return null;
        }
    }
    this.length = function(){
        return this.stac.length;
    }
}

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

        if (formData.check == "true") {
            account = "No match"
            min = Number.MAX_VALUE;

            for(i=0; i<shake[formData.shakeindex].length(); i++) {
                if (shake[formData.shakeindex].get(i)[0] != formData.account){
                    if (Math.abs(formData.time - shake[formData.shakeindex].get(i)[1]) < min) {
                        //account = shake[formData.shakeindex].get(i)[0];
                        entry = shake[formData.shakeindex].get(i);
                        min = Math.abs(formData.time - shake[formData.shakeindex].get(i)[1]);
                    }
                }
            }
            response.writeHead(200, {'Content-Type': 'text/plain'});
            if (min < 2000) {
                response.write(entry[2]+"/n");
                response.write(entry[3]+"/n");
                response.end(entry[2]);
            }
            else {
                response.end("No match");
            }
            console.log(requestBody);
        }
        else {
            //place in array
            i = 0;
            set = false;
            while (i < shake.length) {
                if (Math.sqrt(Math.pow(shake[i].latitude - formData.latitude, 2) + Math.pow(shake[i].longitude - formData.longitude, 2)) < 1000){
                    shake[i].push([formData.account, formData.time, formData.name, formData.phonennumber, formData.email]);
                    set = true;
                    break;
                }
                i++;
            }
            if (set == false) {
                new_shake = new Stack(formData.latitude, formData.longitude);
                new_shake.push([formData.account, formData.time, formData.name, formData.phonennumber, formData.email]);
                shake.push(new_shake);
            }
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end(i.toString());
            console.log(requestBody);
        }
    });
}).listen(1337);
console.log('Server running at http://127.0.0.1:1337/');