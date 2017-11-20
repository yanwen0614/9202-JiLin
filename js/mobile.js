//=======================================指南针组件===================================
CCCss(C.AbrPath + "/bse/mapi/css/compass.css", "compass.css");

(function () {

    L.Control.Compass = L.Control.extend({

        includes: L.Mixin.Events,
        //
        //Managed Events:
        //	Event				Data passed		Description
        //
        //	compass_loaded		{angle}			fired after compass data is loaded
        //	compass_activated					fired when compass is activated
        //	compass_deactivated					fired when compass is deactivated
        //
        //Methods exposed:
        //	Method 			Description
        //
        //  getAngle		return Azimut angle
        //  activate		active tracking on runtime
        //  deactivate		deactive tracking on runtime
        //
        options: {
            autoActive: true, 	//activate control at startup
            textErr: null, 		//error message on alert notification
            callErr: null, 		//function that run on compass error activating
            position: 'topright'
            //TODO timeout autoActive
        },

        initialize: function (options) {
            if (options && options.style)
                options.style = L.Util.extend({}, this.options.style, options.style);
            L.Util.setOptions(this, options);
            this._errorFunc = this.options.callErr || this.showAlert;
            this._isActive = false; //global state of compass
            this._firstMoved = false; //global state of compass
            this._currentAngle = null; //store last angle
        },

        onAdd: function (map) {

            this._map = map;

            var container = L.DomUtil.create('div', 'leaflet-compass');

            this._button = L.DomUtil.create('a', 'compass-button', container);
            this._button.href = '#';

            this._divcompass = L.DomUtil.create('div', 'compass-icon', this._button);
            this._divcompass.src = 'images/compass-icon.png';
            //TODO change button from rotating image

            L.DomEvent
			.on(this._button, 'click', L.DomEvent.stop, this)
			.on(this._button, 'click', this._switchCompass, this);

            this._alert = L.DomUtil.create('div', 'compass-alert', container);
            this._alert.style.display = 'none';

            this._map
			.on('anglefound', this._rotateCompass, this)
			.on('angleerror', this._errorCompass, this);

            if (this.options.autoActive)
                this.activate();

            return container;
        },

        onRemove: function (map) {
            this.deactivate();
        },

        _switchCompass: function () {
            if (this._isActive)
                this.deactivate();
            else
                this.activate();
        },

        getAngle: function () {	//get last angle loaded
            return this._currentAngle;
        },

        activate: function () {
            this._isActive = true;

            this._divcompass.style.display = 'block';

            //API DOC
            //	http://goo.gl/5wfxN2
            //
            var self = this;
            window.addEventListener('deviceorientation', function (e) {

                self._rotateCompass(e.webkitCompassHeading);

            }, false);

            this.fire('compass_activated');
        },

        _rotateCompass: function (angle) {

            //L.DomUtil.get('copy').innerHTML = angle;

            angle = 360 - angle;

            this._divcompass.style.webkitTransform = "rotate(" + angle + "deg)";

            this._currentAngle = angle;

            this.fire('compasslocated', { angle: angle });

            L.DomUtil.addClass(this._button, 'active');
        },

        _errorCompass: function (e) {
            this.deactivate();
            this._errorFunc.call(this, this.options.textErr || e.message);
        },

        deactivate: function () {
            this._isActive = false;
            this._firstMoved = false;

            //TODO STOP COMPASS ENGINE this._map.stopLocate();

            L.DomUtil.removeClass(this._button, 'active');
            this.fire('compass_deactivated');
        },

        showAlert: function (text) {
            this._alert.style.display = 'block';
            this._alert.innerHTML = text;
            var that = this;
            clearTimeout(this.timerAlert);
            this.timerAlert = setTimeout(function () {
                that._alert.style.display = 'none';
            }, 2000);
        }
    });

    L.control.compass = function (options) {
        return new L.Control.Compass(options);
    };

}).call(this);

var CCompass = L.Control.Compass;

CMapLayers.include({
    addCompass: function (show) {
        if (this.compress) this.removeControl(this.compass);
        if (show == false) return;
        this.compass = new CCompass();
        this.addControl(this.compass);
    }
});



//======================================GPS=========================================
CCCss(C.AbrPath + "/bse/mapi/css/gps.css", "gps.css");
(function() {

L.Control.Gps = L.Control.extend({

	includes: L.Mixin.Events, 
	//
	//Managed Events:
	//	Event			Data passed			Description
	//
	//	gpslocated		{latlng, marker}	fired after gps marker is located
	//	gpsdisabled							fired after gps is disabled
	//
	//Methods exposed:
	//	Method 			Description
	//
	//  getLocation		return Latlng and marker of current position
	//  activate		active tracking on runtime
	//  deactivate		deactive tracking on runtime
	//
	options: {		
		autoActive: false,		//activate control at startup
		autoCenter: false,		//move map when gps location change
		maxZoom: null,			//max zoom for autoCenter
		textErr: null,			//error message on alert notification
		callErr: null,			//function that run on gps error activating
		style: {				//default L.CircleMarker styles
			radius: 5,		
			weight: 2,			
			color: '#c20',
			opacity: 1,			
			fillColor: '#f23',
			fillOpacity: 1			
		},
		marker: null,			//L.Marker used for location, default use a L.CircleMarker		
		accuracy: true,		//show accuracy Circle
		title: 'Center map on your location',
		position: 'topright'
		//TODO add gpsLayer
		//TODO timeout autoCenter		
	},

	initialize: function(options) {
		if(options && options.style)
			options.style = L.Util.extend({}, this.options.style, options.style); 
		L.Util.setOptions(this, options);
		this._errorFunc = this.options.callErr || this.showAlert;
		this._isActive = false;//global state of gps
		this._firstMoved = false;//global state of gps
		this._currentLocation = null;	//store last location
	},

	onAdd: function (map) {

		this._map = map;	
			
		var container = L.DomUtil.create('div', 'leaflet-control-gps');

		this._button = L.DomUtil.create('a', 'gps-button', container);
		this._button.href = '#';
		this._button.title = this.options.title;
		L.DomEvent
			.on(this._button, 'click', L.DomEvent.stop, this)
			.on(this._button, 'click', this._switchGps, this);

		this._alert = L.DomUtil.create('div', 'gps-alert', container);
		this._alert.style.display = 'none';

		this._gpsMarker = this.options.marker ? this.options.marker : new L.CircleMarker([0,0], this.options.style);
		//if(this.options.accuracy)
		//	this._accuracyCircle = new L.Circle([0,0], this.options.style);
		
		this._map
			.on('locationfound', this._drawGps, this)
			.on('locationerror', this._errorGps, this);
			
		if(this.options.autoActive)
			this.activate();

		return container;
	},

	onRemove: function(map) {
		this.deactivate();
	},
	
	_switchGps: function() {
		if(this._isActive)
			this.deactivate();
		else
			this.activate();
	},
	
	getLocation: function() {	//get last location
		return this._currentLocation;
	},

	activate: function() {
		this._isActive = true;
		this._map.addLayer( this._gpsMarker );
		this._map.locate({
			enableHighAccuracy: true,
			watch: true,
			//maximumAge:s
			setView: false,	//automatically sets the map view to the user location
			maxZoom: this.options.maxZoom   
		});
	},

	deactivate: function() {
			this._isActive = false;    
		this._firstMoved = false;
		this._map.stopLocate();
		L.DomUtil.removeClass(this._button, 'active');
		this._map.removeLayer( this._gpsMarker );
		//this._gpsMarker.setLatLng([-90,0]);  //move to antarctica!
		//TODO make method .hide() using _icon.style.display = 'none'
		this.fire('gpsdisabled');
	},

	_drawGps: function(e) {
		//TODO use e.accuracy for gps circle radius/color
		this._currentLocation = e.latlng;
			
		this._gpsMarker.setLatLng(e.latlng);

		if(this._isActive && (!this._firstMoved || this.options.autoCenter))
			this._moveTo(e.latlng);
	//    	if(this._gpsMarker.accuracyCircle)
	//    		this._gpsMarker.accuracyCircle.setRadius((e.accuracy / 2).toFixed(0));
			
		this.fire('gpslocated', {latlng: e.latlng, marker: this._gpsMarker});
		
		L.DomUtil.addClass(this._button, 'active');	
	},

	_moveTo: function(latlng) {
		this._firstMoved = true;
		if(this.options.maxZoom)
			this._map.setView(latlng, Math.min(this._map.getZoom(), this.options.maxZoom) );
		else
			this._map.panTo(latlng);    
	},

	_errorGps: function(e) {
		this.deactivate();
		this._errorFunc.call(this, this.options.textErr || e.message);
	},

/*	_updateAccuracy: function (event) {
		var newZoom = this._map.getZoom(),
			scale = this._map.options.crs.scale(newZoom);
		this._gpsMarker.setRadius(this.options.style.radius * scale);
		this._gpsMarker.redraw();
	},
*/
	showAlert: function(text) {
		this._alert.style.display = 'block';
		this._alert.innerHTML = text;
		var that = this;
		clearTimeout(this.timerAlert);
		this.timerAlert = setTimeout(function() {
			that._alert.style.display = 'none';
		}, 2000);
	}
});

L.control.gps = function (options) {
	return new L.Control.Gps(options);
};

}).call(this);


var CGPS = L.Control.Gps;
CMapLayers.include({
    addGPS:function(show){
        if (this.gps) this.removeControl(this.gps);
        if (show == false) return;
        this.gps = new CGPS();
        this.addControl(this.gps);
    } 
 });

//================================User Marker,类似于Google Map当前位置的Marker================================//
CCCss(C.AbrPath + "/bse/mapi/css/usermarker.css", "usermarker.css");
(function (window) {
    var icon = L.divIcon({
        className: "leaflet-usermarker",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
        labelAnchor: [11, -3],
        html: ''
    });
    var iconPulsing = L.divIcon({
        className: "leaflet-usermarker",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
        labelAnchor: [11, -3],
        html: '<i class="pulse"></i>'
    });

    var iconSmall = L.divIcon({
        className: "leaflet-usermarker-small",
        iconSize: [17, 17],
        iconAnchor: [9, 9],
        popupAnchor: [0, -10],
        labelAnchor: [3, -4],
        html: ''
    });
    var iconPulsingSmall = L.divIcon({
        className: "leaflet-usermarker-small",
        iconSize: [17, 17],
        iconAnchor: [9, 9],
        popupAnchor: [0, -10],
        labelAnchor: [3, -4],
        html: '<i class="pulse"></i>'
    });
    var circleStyle = {
        stroke: true,
        color: "#03f",
        weight: 3,
        opacity: 0.5,
        fillOpacity: 0.15,
        fillColor: "#03f",
        clickable: false
    };

    L.UserMarker = L.Marker.extend({
        options: {
            pulsing: false,
            smallIcon: false,
            accuracy: 0,
            circleOpts: circleStyle
        },

        initialize: function (latlng, options) {
            options = L.Util.setOptions(this, options);

            this.setPulsing(this.options.pulsing);
            this._accMarker = L.circle(latlng, this.options.accuracy, this.options.circleOpts);

            // call super
            L.Marker.prototype.initialize.call(this, latlng, this.options);

            this.on("move", function () {
                this._accMarker.setLatLng(this.getLatLng());
            }).on("remove", function () {
                this._map.removeLayer(this._accMarker);
            });
        },

        setPulsing: function (pulsing) {
            this._pulsing = pulsing;

            if (this.options.smallIcon) {
                this.setIcon(!!this._pulsing ? iconPulsingSmall : iconSmall);
            } else {
                this.setIcon(!!this._pulsing ? iconPulsing : icon);
            }
        },

        setAccuracy: function (accuracy) {
            this._accuracy = accuracy;
            if (!this._accMarker) {
                this._accMarker = L.circle(this._latlng, accuracy, this.options.circleOpts).addTo(this._map);
            } else {
                this._accMarker.setRadius(accuracy);
            }
        },

        onAdd: function (map) {
            // super
            L.Marker.prototype.onAdd.call(this, map);
            this._accMarker.addTo(map);
        }
    });

    L.userMarker = function (latlng, options) {
        return new L.UserMarker(latlng, options);
    };
})(window);
var CUserMarker = L.UserMarker;
