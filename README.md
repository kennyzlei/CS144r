weShake
=======
wearable technology with a purpose 
----------------------------------
David Boone, Kenny Lei, Benjy Levin
-----------------------------------


shift_server.js
---------------

This file contains the code which is used for comparing the two pebble's accelerometer data from the handshake. 
The code is commented about the methodology used: 
performing sliding dot product cross-correlation on the 5 point filtered data, and then performing
cosine similarity accross the two signals. 

/wearable_gestures/src/wearable_gestures.c
------------------------------------------

This file contains the C code which is run on the pebble watch app. It is responsible for subscribing to the accelerometer
events and transferring this data to the phone app on detection of handshake.

/wearable_gestures/src/js/pebble-js-app.js
------------------------------------------

This file contains the javascript code that is run through the pebble app on the iPhone. It is responsible for making post
requests to our node server, as well as sending messages to the pebble about the handshake match. This code also allows
for the storing of the users data in the iPhone's persistent memory upon configuration. 

index.html
----------

This is the website page that is run on configuration. It is hosted by our gh-page.

/wearable_gestures/appinfo.json
-------------------------------

This file contains the meta data for the app such as our app logo, location service utilization and configurability. 

/node_server/app.js
-------------------

This file contains the javascript code that is run on the Azure cloud server.  It handles POST requests and matches handshakes.
