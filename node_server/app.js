var http = require('http');
var qs = require('querystring');

var shake = [];

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
            index = shake[formData.shakeindex].indexOf([formData.account, formData.time]);
            //check before and after
            before = shake[formData.shakeindex].get(index-1)[1];
            after = shake[formData.shakeindex].get(index+1)[1];
            if (before == null) {
                account = shake[formData.shakeindex].get(index+1)[0];
            }
            else if (after == null) {
                account = shake[formData.shakeindex].get(index-1)[0];
            }
            else if (abs(before - formData.time) < abs(after - formData.time)) {
                account = shake[formData.shakeindex].get(index-1)[0];
            }
            else {
                account = shake[formData.shakeindex].get(index+1)[0];
            }
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end(account);
            console.log(requestBody);
        }
        else {
            //place in array
            i = 0;
            set = false;
            while (i < shake.length) {
                if (Math.sqrt(Math.pow(shake[i].latitude - formData.latitude, 2) + Math.pow(shake[i].longitude - formData.longitude, 2)) < 1000){
                    shake[i].push([formData.account, formData.time]);
                    set = true;
                    break;
                }
                i++;
            }
            if (set == false) {
                new_shake = new Stack(formData.latitude, formData.longitude);
                new_shake.push([formData.account, formData.time]);
                shake.append(new_shake);
            }
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end(String.valueOf(i));
            console.log(requestBody);
        }
    });
}).listen(1337);
console.log('Server running at http://127.0.0.1:1337/');