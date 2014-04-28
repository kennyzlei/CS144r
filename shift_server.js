
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
