/**
 * This is an example of how one could use this bluetooth module to connect and interact
 * with a device that supports bluetooth on the Android platform.  The module wraps a service that controls
 * all functionality.  Only one instance of the service may run at one time, but it can control up to 10 simultaneous
 * bluetooth connections.
 *
 * Known issues:
 *  In some cases, a remote device must be paired first through the OS bluetooth settings before being able to connect through
 *  this module.  This explained here: http://stackoverflow.com/questions/2268365/android-bluetooth-cross-platform-interoperability
 *
 * For questions, concerns and bug reports, don't hesitate to contact me!
 * Author: Trey Jones <trey@eyesoreinc.com>
 */
//LAST CHANGE LINE 455

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// // create tab group
// var tabGroup = Titanium.UI.createTabGroup();

// require the bluetooth module
// the constructor creates and binds a new android service with various bluetooth capabilities.
var bt = require('com.eyesore.bluetooth');
// set buffer sizes (in bytes) for all connections - optional
var IN_BUFFER = 65536;
var OUT_BUFFER = 1;
bt.setInputBuffer(IN_BUFFER);
// defaults to 8192
bt.setOutputBuffer(OUT_BUFFER);
// defaults to 8192
bt.setReadSize(65536);
// defaults to 1024

// Uncomment to allow the bluetooth service to continue running in the background after your app closes.
// bt.setKillOnDestroy(false);

// debugging - includes a logging method
var d = require('tools');
// var g = require('dygraph-combined');
var i = 0;

// global to hold the name of the device that is currently being interacted with
// not recommended for your app!  Do something better!

var activeDevice;

////////////////////////////////////////////
//
// Tab and window for device output.
//
var win2 = Titanium.UI.createWindow({
	title : 'View Log',
	height : "100%",
	width : "100%",
	backgroundColor : 'white'
});

var win3 = Titanium.UI.createWindow({
	title : 'MAP',
	height : "100%",
	width : "100%",
	backgroundColor : 'white'
});
var dataView = Ti.UI.createScrollView({
	top : 5,
	width : "100%",
	left : 0,
	showVerticalScrollIndicator : true,
	backgroundColor : 'white',
	layout : 'vertical',
	color : 'black'
});

win2.add(dataView);

var mapview = Titanium.Map.createView({
	mapType : Titanium.Map.STANDARD_TYPE,
	region : {
		latitude : 29.760193,
		longitude : -95.36939,
	},
	animate : true,
	regionFit : true,
	userLocation : true,
});

win3.add(mapview);

win2.addEventListener('android:back', function() {

	win2.close();
	win1.open();
});

win3.addEventListener('android:back', function() {
	win3.close();
	win1.open();
});
// Tab and window for bluetooth actions

var win1 = Titanium.UI.createWindow({
	title : 'Data Transfer',
	backgroundImage : './images/background1.PNG'
});

var syncView = Ti.UI.createView({
	top : '20%',
	width : "100%",
	// backgroundImage : './images/background1.PNG',
	layout : 'vertical',
});
win1.add(syncView);

// activity indicator
var style;
if (Ti.Platform.name === 'iPhone OS') {
	style = Ti.UI.iPhone.ActivityIndicatorStyle.BIG;
} else {
	style = Ti.UI.ActivityIndicatorStyle.BIG;
}
var activityIndicator = Ti.UI.createActivityIndicator({
	color : 'white',
	style : style,
	message1 : 'Please Wait...',
	top : '5%',
	left : '45%',
	font : {
		fontFamily : 'Helvetica Neue',
		fontSize : 30,
		fontWeight : 'bold'
	},
	zIndex : 15,
	modal : true
});

win1.add(activityIndicator);
win2.add(activityIndicator);
var flag = 0;

/**
 * This event carries an object at e.devices.  Keys are the names of the devices found
 * during discovery.  The values are the hardware addresses of those devices.
 * You should only need the names; hardware addresses are not needed to interact with the bluetooth module.
 */
bt.addEventListener('bluetooth:discovery', function(e) {
	// device names are returned in this variable - see log output
	d.log(e.devices);
	activeDevice = "linvor";

	// var device;
	for (device in e.devices)
	if (activeDevice == device)
		flag = 1;
	activityIndicator.show();
	if (flag == 1) {
		alert("Inhaler found. Trying to Pair");
		activityIndicator.show();
		bt.quickPair(activeDevice);
	} else
		alert("Inhaler not found, please try again");
	// activityIndicator.hide();
});

//pair button
var pairbutton = Ti.UI.createButton({
	title : 'PAIR',
	color : 'white',
	font : {
		fontSize : 30,
		fontFamily : 'Helvetica Neue'
	},
	height : 100,
	top : '5%',
	width : 100,
	left : '43%',
	backgroundImage : './images/blackcircle.png',
	backgroundSelectedImage : './images/graycircle.png'
});

pairbutton.addEventListener('click', function(e) {
	var intent = Ti.Android.createIntent({
		action : "android.settings.SETTINGS"
	});
	Ti.Android.currentActivity.startActivity(intent);

	activityIndicator.show();
	bt.findDevices();
});
syncView.add(pairbutton);
// get data
var syncbutton = Ti.UI.createButton({
	title : 'SYNC',
	color : 'white',
	font : {
		fontSize : 30,
		fontFamily : 'Helvetica Neue'
	},
	height : 100,
	top : '5%',
	width : 100,
	left : '43%',
	backgroundImage : './images/blackcircle.png',
	backgroundSelectedImage : './images/graycircle.png'
});

var count = 0;
var countim = 0;
var bt_data = Ti.createBuffer();
if (Ti.Filesystem.isExternalStoragePresent())
	var txt = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, 'logfile.txt');
else
	alert("External storage is not present in the tablet. Please insert a micro sd card.");
var flag_view = 0;
syncbutton.addEventListener('click', function(e) {
	var send_prot = Ti.createBuffer({
		length : 1
	});
	bt_data.release();
	i = 0;
	flag_view = 0;
	//timestamp protocol
	send_prot[0] = 62;
	streamData(send_prot.toBlob());

	activityIndicator.show();
});
syncView.add(syncbutton);

syncView.add(syncbutton);
// sync time
var synctimeButton = Ti.UI.createButton({
	title : 'Set Time',
	color : 'white',
	font : {
		fontSize : 25,
		fontFamily : 'Helvetica Neue'
	},
	height : 100,
	top : '5%',
	width : 100,
	left : '43%',
	backgroundImage : './images/blackcircle.png',
	backgroundSelectedImage : './images/graycircle.png'
});

synctimeButton.addEventListener('click', function(e) {
	var synctime_protocol = Ti.createBuffer({
		length : 1
	});
	//timestamp protocol

	synctime_protocol[0] = 61;
	streamData(synctime_protocol.toBlob());
	var t = new Date();
	synctime_protocol[0] = t.getHours();
	streamData(synctime_protocol.toBlob());
	synctime_protocol[0] = t.getMinutes();
	streamData(synctime_protocol.toBlob());
	synctime_protocol[0] = t.getSeconds();
	streamData(synctime_protocol.toBlob());
	synctime_protocol[0] = t.getDate();
	streamData(synctime_protocol.toBlob());
	synctime_protocol[0] = t.getMonth() + 1;
	streamData(synctime_protocol.toBlob());
	synctime_protocol[0] = 221;
	streamData(synctime_protocol.toBlob());
	synctime_protocol[0] = 7;
	streamData(synctime_protocol.toBlob());
	activityIndicator.hide();

});
syncView.add(synctimeButton);
// sync time
var mapButton = Ti.UI.createButton({
	title : 'MAP',
	color : 'white',
	font : {
		fontSize : 25,
		fontFamily : 'Helvetica Neue'
	},
	height : 100,
	top : '5%',
	width : 100,
	left : '43%',
	backgroundImage : './images/blackcircle.png',
	backgroundSelectedImage : './images/graycircle.png'
});

mapButton.addEventListener('click', function(e) {
	win3.open();
});
syncView.add(mapButton);

// view and save logs
var viewlogButton = Ti.UI.createButton({
	title : 'LOGS',
	color : 'white',
	font : {
		fontSize : 30,
		fontFamily : 'Helvetica Neue'
	},
	height : 100,
	top : '5%',
	width : 100,
	left : '43%',
	backgroundImage : './images/blackcircle.png',
	backgroundSelectedImage : './images/graycircle.png'
});

/**
 * This event contains the name of the device that has been connected at e.device.
 * It occurs when pairing is completed, which is intiated with bt.pairDevice(deviceName, serviceName)
 */
bt.addEventListener('bluetooth:paired', function(e) {
	d.log('Device is paired!');
	alert('Pairing finished');
	activityIndicator.show();
	listenForData(e.device);
	activityIndicator.hide();

});

/**
 * This function is just a simple implementation of streaming file data incrementally to allow buffering.
 * @param {Ti.Filesystem.File object} file
 */
var streamData = function(data) {
	var blobStream = Ti.Stream.createStream({
		mode : Ti.Stream.MODE_READ,
		source : data
	}), buffer = Ti.createBuffer({
		length : 1
	});

	while (blobStream.read(buffer) > -1) {

		bt.write(activeDevice, buffer.toBlob());
		buffer.clear();
	}
	blobStream.close();
	// bt.write(activeDevice, data);
	activityIndicator.show();
};

// Add bluetooth Event Listeners
var listenForData = function(deviceName) {

	/**
	 * The event fired when data is transmitted from the connected device looks like this:
	 *      'bluetooth:data:deviceName'
	 *
	 * In order to connect to multiple devices simultaneously, you can listen to these events from all of them.
	 *
	 * e.data is device of type Titanium.Blob
	 */
	d.log('Listener:');
	d.log('bluetooth:data:' + deviceName);
	bt.addEventListener('bluetooth:data:' + deviceName, function(e) {
		d.log('Data received:');
		d.log(e.data);
		// just dump the data into the container as an example
		// chances are you want to do something a little bit more sophisticated!
		activityIndicator.show();
		var blobStream = Ti.Stream.createStream({
			source : e.data,
			mode : Ti.Stream.MODE_READ
		});
		var newBuffer = Ti.createBuffer({
			length : e.data.length
		});
		blobStream.read(newBuffer);

		bt_data.append(newBuffer, 0, e.data.length);

		activityIndicator.hide();
	});

};
syncView.add(viewlogButton);
viewlogButton.addEventListener('click', function(e) { window:win2;
	//show logs
	// count = 0;
	activityIndicator.show();
	if (bt_data.length == 0) {
		alert("No new logs received! Sync your Inhaler and try again.");
	}
	//display and write pictures
	if (flag_view == 0)
		while (i < bt_data.length) {

			// print the Date, time
			// count = count + 1;

			var pic_length = (bt_data[i + 19] + bt_data[i + 20] * 256) * 512 - 1;
			if (bt_data.length < 21 + pic_length) {
				alert("error, please try again! Bytes received: " + bt_data.length + " pic length:" + pic_length);
				return;
			}
			var f = Ti.Filesystem.getFile('header');
			var header = f.read();
Ti.API.info(header.length);
			var headstream = Ti.Stream.createStream({
				source : header,
				mode : Ti.Stream.MODE_READ
			});
			var pic = Ti.createBuffer({
				length : header.length
			});
			headstream.read(pic);
			pic.append(bt_data, i + 21, pic_length);

			var picture = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, 'pic' + (bt_data[i + 5] + bt_data[i + 6] * 256) + bt_data[i + 3] + bt_data[i + 4] + bt_data[i + 1] + bt_data[i] + bt_data[i + 2] + '.jpg');
			picture.write(pic.toBlob(), true);

			var k;
			for ( k = 0; k < 5; k++)
				txt.write(bt_data[i + k] + ',', true);
			txt.write((bt_data[i + 5] + bt_data[i + 6] * 256) + ',', true);
			for ( k = 7; k < 19; k++)
				txt.write(bt_data[i + k] + ',', true);
			i = i + 21 + pic_length;
			pic.release();
			countim = countim + 1;
			flag_view =1;
		}
		
	i = 0;
	var log = txt.read();
	var str = log.toString();
	var log = str.split(",");
	var j = 0;
	removeChildren(dataView);

	for ( j = 0; j < countim; j++) {
		var myImage = Ti.UI.createImageView({
			width : '400',
			height : '400',
			top : '5',
			left : '20%',
			anchorPoint : {
				x : '40',
				y : '15'
			},

		});

		var data = new Array();
		for ( k = 0; k < 18; k++)
			data[k] = log[j * 18 + k];

		myImage.image = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, 'pic' + data[5] + data[3] + data[4] + data[1] + data[0] + data[2] + '.jpg');
		//rotate image
		var t = Ti.UI.create2DMatrix();
		t = t.rotate(180);
		// in degrees
		// matrix2d = matrix2d.scale(1.5); // scale to 1.5 times original size
		var a = Ti.UI.createAnimation();
		a.transform = t;
		dataView.add(myImage);
		myImage.animate(a);

		dataView.add(Ti.UI.createLabel({
			text : '\nTime of dosage = ' + data[1] + ':' + data[0] + ':' + data[2] + ', Date= ' + data[4] + '/' + data[3] + '/' + data[5] + '\n' + 'SSID : ' + data[6] + ':' + data[7] + ':' + data[8] + ':' + data[9] + ':' + data[10] + ':' + data[11] + '\n' + data[12] + ':' + data[13] + ':' + data[14] + ':' + data[15] + ':' + data[16] + ':' + data[17] + '\n-----------------------------------------------------------',
			color : '#000',
			font : {
				fontSize : 20,
				fontFamily : 'Helvetica Neue'
			},
			width : "100%"
		}));

		var url = "https://maps.googleapis.com/maps/api/browserlocation/json?browser=firefox&sensor=true";
		var mac = new Array();
		for ( k = 0; k < 12; k++) {
			mac[k] = data[k + 6];
			mac[k] = Number(mac[k]);
			mac[k] = mac[k].toString(16);
			while (mac[k].length < 2)
			mac[k] = "0" + mac[k];
		}

		var url = url + "&wifi=mac" + ":" + mac[0] + ":" + mac[1] + ":" + mac[2] + ":" + mac[3] + ":" + mac[4] + ":" + mac[5];
		var url = url + "&wifi=mac" + ":" + mac[6] + ":" + mac[7] + ":" + mac[8] + ":" + mac[9] + ":" + mac[10] + ":" + mac[11];
		
		var json, lng, lat;
		var xhr = Ti.Network.createHTTPClient({
			onload : function(e) {
				// this.responseText holds the raw text return of the message (used for JSON)
				// this.responseXML holds any returned XML (used for SOAP web services)
				// this.responseData holds any returned binary data
				json = JSON.parse(this.responseText);
				lng = json.location.lng;
				lat = json.location.lat;

				var url2 = "http://ws.geonames.org/findNearbyPostalCodesJSON?formatted=true&lat=" + lat + " &lng=" + lng;

				var code, postalc, index;

				var xhr1 = Ti.Network.createHTTPClient();
				xhr1.open("GET", url2);
				xhr1.send();

				xhr1.onload = function(e) {
					json = JSON.parse(this.responseText);
					for ( k = 0; k < json.postalCodes.length; k++) {
						postalc = json.postalCodes[k];
						if ((postalc.lng == lng) && (postalc.lat == lat))
							index = k;
					}
					code = json.postalCodes[index].postalCode;
					var url3 = "http://ws1.airnowgateway.org/GatewayWebServiceREST/Gateway.svc/forecastbyzipcode?zipcode=" + code + "&format=json&key=54BFF651-D561-4066-95B9-3C8AC5982BC0&nocache=";
					var xhr2 = Ti.Network.createHTTPClient();
					xhr2.open("GET", url3);
					xhr2.send();
					var aqi = new Array();
					xhr2.onload = function(e) {
						json = JSON.parse(this.responseText);
						var forecasts = json.forecast;
						for ( k = 0; k < json.forecast.length; k++) {
							aqi[k] = forecasts[k].AQI;
							if (aqi[k] == -1)
								aqi[k] = forecasts[k].CategoryName;
						}

						createannot("AQI \nOzone : " + aqi[0] + "\nPM2.5 : " + aqi[1] + "\nPM10 : " + aqi[2], lat, lng);

					};
				};
			},
			onerror : function(e) {
				Ti.API.debug(e.error);
				alert('Location not available');
			},
			timeout : 5000
		});

		xhr.open("GET", url);
		xhr.send();
		function createannot(code, lat, lng) {
			var point = Titanium.Map.createAnnotation({
				latitude : lat,
				longitude : lng,
				title : code,
				pincolor : Titanium.Map.ANNOTATION_RED,
				// image : "./images/red_pin.jpeg",
				animate : true,
				leftButton : '../images/appcelerator_small.png',
				myid : 1 // Custom property to uniquely identify this annotation.
			});
			var region1 = {
				latitude : lat,
				longitude : lng,
				animate : true
			};
			mapview.addAnnotation(point);
			mapview.setLocation(region1);
		}

	}

	win2.open();

	activityIndicator.hide();

});

/**
 * TODO add specifics about when messages are sent
 *
 * You should listen for messages from the bluetooth service.
 */
bt.addEventListener('bluetooth:message', function(e) {
	d.log(e.message);
});

// remove child views
var removeChildren = function(view) {
	// var children = view.getChildren(), c;
	// for ( c = 0; c < children.length;c++) {
	// view.remove(children[c]);
	// }
	if (view.children) {
		for (var c = view.children.length - 1; c >= 0; c--) {
			view.remove(view.children[c]);
		}
	}
};

// just keep dataview from reaching critical mass
var manageWinSize = function() {
	var children = dataView.getChildren();
	if (children.length > 30) {
		dataView.remove(children[0]);
	}
};

/**
 * You should definitely listen for errors from the bluetooth service.
 * They are also transmitted in e.message
 */
var errorHandler = function(e) {
	Ti.API.error('Error in bluetooth module: ');
	d.log(e.message);
	alert(e.message);

	// prevent alert spam
	bt.removeEventListener('bluetooth:error', errorHandler);
	setTimeout(function() {
		bt.addEventListener('bluetooth:error', errorHandler);
	}, 3000);
};
bt.addEventListener('bluetooth:error', errorHandler);

// new 1.3 events
// see log to find out when these events fire
// also see http://developer.android.com/reference/android/app/Activity.html
var broadcastEvent = function(eventName) {
	d.log('Firing event: ' + eventName);
};
bt.addEventListener('bluetooth:resume', function(e) {
	broadcastEvent('Resume');
});
bt.addEventListener('bluetooth:pause', function(e) {
	broadcastEvent('Pause');
});
bt.addEventListener('bluetooth:start', function(e) {
	broadcastEvent('Start');
});
bt.addEventListener('bluetooth:stop', function(e) {
	broadcastEvent('Stop');
});
bt.addEventListener('bluetooth:destroy', function(e) {
	broadcastEvent('Destroy');
});

win1.open();

