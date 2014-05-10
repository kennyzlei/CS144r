/*
This is a sliding dot product cross-correlation function.
The vector a is first padded with 0's on either side
This is to enable the shifting of the signal over the other signal in all positions
The signals are then sliced accordingly such that the match up as best as possible
Then cosine similarity is calculated across these 2 sliced vectors
and the result is returned which indicates percentage similarity from 0-100
*/

function shiftCompare(a, b) {
    // dot product array
    var dotproductvals = new Array();
    // limit of shifting i.e. vector a length
    var lim;
    // vector a and inverse vector a
    var siga, invsiga;
    // vector b
    var sigb;
    // first normalize signal a to unit vector
    siga = normalize(a);
    // reverse the signal then pad with 0's
    siga.reverse();
    for (i = 0; i < b.length; i++) {
        siga.push(0);
    }
    // reverse signal again and pad the other side with 0's
    siga.reverse();
    for (i = 0; i < b.length; i++) {
        siga.push(0);
    }
    // normalize vector b
    sigb = normalize(b);
    // set limit to length of padded vector a
    lim = siga.length;
    // for each location in signal a, slowly move it one element at a time
    // over signal b, and compute the dot product at each of these locations
    for (var i = 0; i < lim; i++) {
        // slicing signal a based on the shifting		
        var shiftsig = siga.slice(lim - i - 1);
        dotproductvals.push(dotproduct(shiftsig, sigb));
    };
    // see this function below
    var result = returnMatchedVectors(siga, sigb, dotproductvals);
    return result;
};

// computes the dot product of two vectors
function dotproduct(a, b) {
    var n = 0,
        lim = Math.min(a.length, b.length);
    for (var i = 0; i < lim; i++) n += a[i] * b[i];
    return n;
}

// normalizes a vector to a unit vector
function normalize(a) {
    var length = Math.sqrt(dotproduct(a, a));
    var result = a.map(function (d) {
        return d / length
    });
    return result;
}

// returns the magnitude of a vector
function magnitude(a) {
    var length = Math.sqrt(dotproduct(a, a));
    return length;
}

/*
this function takes in the two vectors and the computed dot product array,
and then calculates where in the dotproduct array was the highest value/correlation
and then slices the vectors accordingly.
After which, it calls the cosine similarity function on these sliced vectors and
returns the similarity result
*/
function returnMatchedVectors(a, b, dotprodvals) {
    // search for max value and index in array
    var max = dotprodvals[0];
    var maxIndex = 0;

    for (var i = 1; i < dotprodvals.length; i++) {
        if (dotprodvals[i] > max) {
            maxIndex = i;
            max = dotprodvals[i];
        }
    }

    // slice signal a such that is correlates to the position where the max value was found
    // in the dot product array when shifting
    a.reverse();
    var warpeda = a.slice(maxIndex - b.length + 1, maxIndex + 1).reverse();
    var warpedb = b;
    // call cosine similarity function and return result
    var result = cosineSimilarity(warpeda, warpedb);
    return result;
}

// using above defined functions, compute the cosine similarity
// between 2 vectors that have been shifted to line up as best as possible
// the result is multiplied by 100 which gives a value 0-100 as to how
// similar the two vectors are.
function cosineSimilarity(a, b) {
    var dotprod = dotproduct(a, b);
    var maga = magnitude(a);
    var magb = magnitude(b);
    var multmag = maga * magb;
    return ((dotprod / multmag) * 100);
}
