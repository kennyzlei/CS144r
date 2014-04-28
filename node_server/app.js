var http = require('http');
var qs = require('querystring');

var shake = new Array();

function shiftCompare(a,b){
    var dotproductvals = new Array();
    var lim;
    var siga,invsiga;
    var sigb;
    //if (a.length <= b.length){
        siga = normalize(a);
        siga.reverse();
    for (i=0; i<b.length;i++)
        {
            siga.push(0);
        }   
        siga.reverse();
        for (i=0; i<b.length;i++)
        {
            siga.push(0);
        }

        //invsiga.reverse();
        sigb = normalize(b);
        lim = siga.length;
        for (var i = 0; i < lim; i++) {
            var shiftsig = siga.slice(lim-i-1);
            dotproductvals.push(dotproduct(shiftsig,sigb));
        };
        var result = returnMatchedVectors(siga,sigb,dotproductvals);
        return result;
    };

function dotproduct(a,b) {
    var n = 0, lim = Math.min(a.length,b.length);
    for (var i = 0; i < lim; i++) n += a[i] * b[i];
    return n;
 }

function normalize(a){
    var length = Math.sqrt(dotproduct(a,a));
    var result = a.map(function(d){return d/length});
    return result;
}

function magnitude(a){
    var length = Math.sqrt(dotproduct(a,a));
    return length;  
}

function returnMatchedVectors(a,b,dotprodvals){
    var max = dotprodvals[0];
    var maxIndex = 0;

for (var i = 1; i < dotprodvals.length; i++) {
    if (dotprodvals[i] > max) {
        maxIndex = i;
        max = dotprodvals[i];
    }
}
a.reverse();

var warpeda = a.slice(maxIndex - b.length+1,maxIndex+1).reverse();
var warpedb = b;

var result = cosineSimilarity(warpeda,warpedb);
return result;
}

function cosineSimilarity(a,b){
var dotprod = dotproduct(a,b);
var maga = magnitude(a);
var magb = magnitude(b);
var multmag = maga*magb;
return ((dotprod/multmag)*100);
}


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
            formData.acceleration = formData.acceleration.split(",").map(function(d){return +d;});

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
                response.write(entry[2]+"\n");
                response.write(entry[3]+"\n");
                response.write(shiftCompare(entry[5], formData.acceleration).toString())
                response.end(entry[4]);

                console.log("Entry 5:");
                console.log(shiftCompare(entry[5], formData.acceleration));
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
            formData.acceleration = formData.acceleration.split(",").map(function(d){return +d;});
            while (i < shake.length) {
                if (Math.sqrt(Math.pow(shake[i].latitude - formData.latitude, 2) + Math.pow(shake[i].longitude - formData.longitude, 2)) < 1000){
                    shake[i].push([formData.account, formData.time, formData.name, formData.phonenumber, formData.email, formData.acceleration]);
                    set = true;
                    break;
                }
                i++;
            }
            if (set == false) {
                new_shake = new Stack(formData.latitude, formData.longitude);
                new_shake.push([formData.account, formData.time, formData.name, formData.phonenumber, formData.email, formData.acceleration]);
                shake.push(new_shake);
            }
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end(i.toString());
            console.log(requestBody);
        }
    });
}).listen(1337);
console.log('Server running at http://127.0.0.1:1337/');