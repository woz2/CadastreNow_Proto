// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require jquery.ui.slider
//= require twitter/bootstrap
//= require_tree

$(function() {
    // Setup drop down menu
    $('.dropdown-toggle').dropdown();

    // Fix input element click problem
    $('.dropdown input, .dropdown label').click(function(e) {
        e.stopPropagation();
    });
});


var map;
var goecoder;

var cadastre = new google.maps.LatLng(52.069167, 19.480556);
//Define OSM as base layer in addition to the default Google layers
var osmMapType = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
        return "http://tile.openstreetmap.org/" +
            zoom + "/" + coord.x + "/" + coord.y + ".png";
    },
    tileSize: new google.maps.Size(256, 256),
    isPng: true,
    alt: "OpenStreetMap",
    name: "OSM",
    maxZoom: 19,
    minZoom: 3
});

//Code inspired by the solution found on the following website: http://www.sumbera.com/lab/GoogleV3/tiledWMSoverlayGoogleV3.htm
//Code adjusted to work with the WMS server of Geoportal.gov.pl and to display data only for the relevant zoom levels and geographical boundries of Poland.
//Define custom WMS tiled layer
//The user will enter the address to the public WMS layer here. The data must be in WGS84


var PlotBoundariesLayer = new google.maps.ImageMapType({
    getTileUrl: function (tile, zoom) {
        if (zoom <= 16) {
            return;
        }
        var baseURL = "http://sdi.geoportal.gov.pl/WMS_DzKat/service.svc/get?";
        var version = "1.3.0";
        var request = "GetMap";
        var format = "image%2Fpng"; //type of image returned or image/jpeg
        //The layer ID. Can be found when using the layers properties tool in ArcMap or from the WMS settings
        var layers = "Dzialki";
        //projection to display. This is the projection of google map. Don't change unless you know what you are doing.
        //Different from other WMS servers that the projection information is called by crs, instead of srs
        var crs = "EPSG:4326";
        var service = "WMS";
        //the size of the tile, must be 256x256
        var width = "256";
        var height = "256";
        //Some WMS come with named styles. The user can set to default.
        var styles = "Default";
        var projection = map.getProjection();
        var zpow = Math.pow(2, zoom);
        var ul = new google.maps.Point(tile.x * 256.0 / zpow, (tile.y + 1) * 256.0 / zpow);
        var lr = new google.maps.Point((tile.x + 1) * 256.0 / zpow, (tile.y) * 256.0 / zpow);
        var ulw = projection.fromPointToLatLng(ul);
        var lrw = projection.fromPointToLatLng(lr);

        if (!(ulw.lat() >= 49 && ulw.lat() <= 54.833333 && ulw.lng() >= 14.116667 && ulw.lng() <= 24.15)) {
            return;
        }

        //With the 1.3.0 version the coordinates are read in LatLon, as opposed to LonLat in previous versions
        var bbox = ulw.lat() + "," + ulw.lng() + "," + lrw.lat() + "," + lrw.lng();

        //Establish the baseURL. Several elements, including &EXCEPTIONS=INIMAGE and &Service are unique to openLayers addresses.
        var url = baseURL
            + "Layers=" + layers
            + "&version=" + version
            + "&Service=" + service
            + "&request=" + request
            + "&Styles=" + styles
            + "&format=" + format
            + "&CRS=" + crs
            + "&BBOX=" + bbox
            + "&width=" + width
            + "&height=" + height;

        console.log(bbox)
        console.log(ulw.lat())
        console.log(ulw.lng())
        console.log(url)

        return url
    },
    tileSize: new google.maps.Size(256, 256),
    isPng: true,
    opacity: 0.5
});

function getGeoportalServiceUrl(latLng) {
    return 'http://sdi.geoportal.gov.pl/WMS_DzKat/service.svc/get?Query_Layers=Numery_dzialek&version=1.3.0&Service=WMS&request=GetFeatureInfo&Styles=Default&info_format=text%2Fhtml&CRS=EPSG:4326&BBOX=52.06937709602394,19.478759765625,52.07106540690666,19.48150634765625&width=256&height=256&i=10&j=10';


        var baseURL = "http://sdi.geoportal.gov.pl/WMS_DzKat/service.svc/get?";
        var version = "1.3.0";
        var request = "GetFeatureInfo";
        var info_format = "text%2Fhtml"; //type of image returned or image/jpeg
        //The layer ID. Can be found when using the layers properties tool in ArcMap or from the WMS settings
        var Query_layers = "Numery_dzialek";
        //projection to display. This is the projection of google map. Don't change unless you know what you are doing.
        //Different from other WMS servers that the projection information is called by crs, instead of srs
        var crs = "EPSG:4326";
        var service = "WMS";
        //the size of the tile, must be 256x256
        var width = "256";
        var height = "256";
        //Some WMS come with named styles. The user can set to default.
        var styles = "Default";
        var projection = map.getProjection();
        var zpow = Math.pow(2, map.getZoom());
        var ul = new google.maps.Point(tile.x * 256.0 / zpow, (tile.y + 1) * 256.0 / zpow);
        var lr = new google.maps.Point((tile.x + 1) * 256.0 / zpow, (tile.y) * 256.0 / zpow);
        var ulw = projection.fromPointToLatLng(ul);
        var lrw = projection.fromPointToLatLng(lr);


        //With the 1.3.0 version the coordinates are read in LatLon, as opposed to LonLat in previous versions
        var bbox = ulw.lat() + "," + ulw.lng() + "," + lrw.lat() + "," + lrw.lng();

        var scale = Math.pow(2, map.getZoom());
        var nw = new google.maps.LatLng(
            map.getBounds().getNorthEast().lat(),
            map.getBounds().getSouthWest().lng()
        );
        var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
        var worldCoordinate = map.getProjection().fromLatLngToPoint(latLng);
        var pixelOffset = new google.maps.Point(
            Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
            Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
        );

        var i = pixelOffset.x
        var j = pixelOffset.y
        //Establish the baseURL. Several elements, including &EXCEPTIONS=INIMAGE and &Service are unique to openLayers addresses.
        var url = baseURL
            + "Query_layers=" + Query_layers
            + "&version=" + version
            + "&Service=" + service
            + "&request=" + request
            + "&Styles=" + styles
            + "&info_format=" + info_format
            + "&CRS=" + crs
            + "&BBOX=" + bbox
            + "&width=" + width
            + "&height=" + height
            + "&i=" + i
            + "&i=" + j;





        return url
    };

// http://sdi.geoportal.gov.pl/WMS_DzKat/service.svc/get?Layers=Dzialki&version=1.3.0&Service=WMS&request=GetMap&Styles=Default&format=image%2Fpng&CRS=EPSG:4326&BBOX=52.07106540690666,23.5986328125,52.0727536539532,23.60137939453125&width=256&height=256

// http://sdi.geoportal.gov.pl/WMS_DzKat/service.svc/get?Query_Layers=Numery_dzialek&version=1.3.0&Service=WMS&request=GetFeatureInfo&Styles=Default&info_format=text%2Fhtml&CRS=EPSG:4326&BBOX=52.06937709602394,19.478759765625,52.07106540690666,19.48150634765625&width=256&height=256&i=10&j=10

function plotnumber (e) {

    console.log (e)
    var url = getGeoportalServiceUrl(e.latLng);
    console.log(url);
    $.get(url, function(data) {console.log(data)});

}



function initialize()  {
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var mapOptions = {
        zoom: 6,
        minZoom: 3,
        center: cadastre,
        disableDefaultUI: false,
        panControl: false,
        mapTypeId: 'OSM',
        mapTypeControlOptions: {
            mapTypeIds: ['OSM', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN],
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
    };
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    map.mapTypes.set('OSM', osmMapType);
    map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    //add WMS layer
    map.overlayMapTypes.push(PlotBoundariesLayer);

    $(function() { $( "#slider" ).slider({
        value: 50,
        slide: function( event, ui ) {
            PlotBoundariesLayer.setOpacity(ui.value/100);
        }
    });
    });

    marker = new google.maps.Marker({
        map:map,
        draggable:true,
        animation: google.maps.Animation.DROP,
    });

    google.maps.event.addListener(marker, 'dragend', function() {
        map.setCenter(new google.maps.LatLng(marker.position.lat(), marker.position.lng())),
        markerLat = marker.position.lat(),
        markerLng = marker.position.lng();

    });

    google.maps.event.addListener(marker, 'dblclick', function() {
        map.setZoom(17);
    });

    //var contentString = "<p>Test</p> </br><p>google.maps.LatLng(marker.position.lat(), marker.position.lng())</p>"

    //var infowindow = new google.maps.InfoWindow({
        //infowindow.setContent(marker.address),
        //content: contentString,
    //    maxWidth: 300
    //});


    //google.maps.event.addListener(marker, 'click', function() {
    //    markerLat = marker.position.lat(),
    //    markerLng = marker.position.lng(),
    //    data = markerLat.toString() + " " + markerLng.toString(),
    //    infowindow.setContent(data),
    //    infowindow.open(map,marker);
    //});


    google.maps.event.addListener(marker, 'click', function(evt){
        geocoder.geocode({'latLng': evt.latLng}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
                if (results[4]) {
                    var markeradress = (results[0].formatted_address);
                }
                else {
                alert('No results found');
                }
          } else {
            alert('Geocoder failed due to: ' + status);
          }
        //var pos = marker.getPosition();
            //var overlay = new google.maps.OverlayView();
            //overlay.draw = function() {};
            //overlay.setMap(map);
            //
            //var proj = overlay.getProjection();
            //var pos = marker.getPosition();
            //var point = proj.fromLatLngToContainerPixel(pos);

            var scale = Math.pow(2, map.getZoom());
            var nw = new google.maps.LatLng(
                map.getBounds().getNorthEast().lat(),
                map.getBounds().getSouthWest().lng()
            );
            var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
            var worldCoordinate = map.getProjection().fromLatLngToPoint(marker.getPosition());
            var pixelOffset = new google.maps.Point(
                Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
                Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
            );

        //var point = google.maps.MapCanvasProjection.fromLatLngToContainerPixel({'latLng': evt.latLng});
            console.log(pixelOffset.x);
        document.getElementById('marker_info').innerHTML = '<p>Marker placed at: Current Lat: ' + evt.latLng.lat().toFixed(4) + ' Current Lng: ' + evt.latLng.lng().toFixed(4) + '  ' + markeradress + ' </p>';
        });
    });


    var PlotPixelData = new google.maps.ImageMapType({
    getQuerryeUrl: function (tile, zoom) {
        if (zoom <= 16) {
            return;
        }
        var baseURL = "http://sdi.geoportal.gov.pl/WMS_DzKat/service.svc/get?";
        var version = "1.3.0";
            var request = "GetFeatureInfo";
            var info_format = "text%2Fhtml"; //type of image returned or image/jpeg
        //The layer ID. Can be found when using the layers properties tool in ArcMap or from the WMS settings
            var Query_layers = "Numery_dzialek";
        //projection to display. This is the projection of google map. Don't change unless you know what you are doing.
        //Different from other WMS servers that the projection information is called by crs, instead of srs
        var crs = "EPSG:4326";
        var service = "WMS";
        //the size of the tile, must be 256x256
        var width = "256";
        var height = "256";
        //Some WMS come with named styles. The user can set to default.
        var styles = "Default";
        var projection = map.getProjection();
        var zpow = Math.pow(2, zoom);
        var ul = new google.maps.Point(tile.x * 256.0 / zpow, (tile.y + 1) * 256.0 / zpow);
        var lr = new google.maps.Point((tile.x + 1) * 256.0 / zpow, (tile.y) * 256.0 / zpow);
        var ulw = projection.fromPointToLatLng(ul);
        var lrw = projection.fromPointToLatLng(lr);

        if (!(ulw.lat() >= 49 && ulw.lat() <= 54.833333 && ulw.lng() >= 14.116667 && ulw.lng() <= 24.15)) {
            return;
        }

        //With the 1.3.0 version the coordinates are read in LatLon, as opposed to LonLat in previous versions
        var bbox = ulw.lat() + "," + ulw.lng() + "," + lrw.lat() + "," + lrw.lng();

            var scale = Math.pow(2, map.getZoom());
            var nw = new google.maps.LatLng(
                map.getBounds().getNorthEast().lat(),
                map.getBounds().getSouthWest().lng()
            );
            var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
            var worldCoordinate = map.getProjection().fromLatLngToPoint(marker.getPosition());

        x = parseInt(worldCoordinate.x * Math.pow(2, zoom), 10)
        y = parseInt(worldCoordinate.y * Math.pow(2, zoom), 10)

            var pixelOffset = new google.maps.Point(
                Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
                Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
            );

        var i = Math.floor.x
        var j = Math.floor.y
        //Establish the baseURL. Several elements, including &EXCEPTIONS=INIMAGE and &Service are unique to openLayers addresses.
        var url = baseURL
            + "Query_layers=" + Query_layers
            + "&version=" + version
            + "&Service=" + service
            + "&request=" + request
            + "&Styles=" + styles
            + "&info_format=" + info_format
            + "&CRS=" + crs
            + "&BBOX=" + bbox
            + "&width=" + width
            + "&height=" + height;
            + "&i=" + i;
            + "&i=" + j;



        console.log(bbox)
        console.log(ulw.lat())
        console.log(ulw.lng())
        console.log(url)

        return url
     },
    //console.log(url)
    });
   // http://sdi.geoportal.gov.pl/WMS_DzKat/service.svc/get?Layers=Dzialki&version=1.3.0&Service=WMS&request=GetMap&Styles=Default&format=image%2Fpng&CRS=EPSG:4326&BBOX=52.07106540690666,23.5986328125,52.0727536539532,23.60137939453125&width=256&height=256

   // http://sdi.geoportal.gov.pl/WMS_DzKat/service.svc/get?Query_Layers=Numery_dzialek&version=1.3.0&Service=WMS&request=GetFeatureInfo&Styles=Default&info_format=text%2Fhtml&CRS=EPSG:4326&BBOX=52.06937709602394,19.478759765625,52.07106540690666,19.48150634765625&width=256&height=256&i=10&j=10

    //var pos = marker.getPosition();
    //var p = proj.fromLatLngToContainerPixel(pos);

    //LatLngControl.prototype.updatePosition = function(latLng) {
    //    var projection = this.getProjection();
    //    var point = projection.fromLatLngToContainerPixel(latLng);
    //
    //    // Update control position to be anchored next to mouse position.
    //    this.node_.style.left = point.x + this.ANCHOR_OFFSET_.x + 'px';
    //    this.node_.style.top = point.y + this.ANCHOR_OFFSET_.y + 'px';
    //
    //    // Update control to display latlng and coordinates.
    //    this.node_.innerHTML = [
    //        latLng.toUrlValue(4),
    //        '<br/>',
    //        point.x,
    //        'px, ',
    //         point.y,
    //        'px'
    //    ].join('');
    //};






    google.maps.event.addListener(marker, 'dragend', function(evt){
        plotnumber(evt);
        geocoder.geocode({'latLng': evt.latLng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[4]) {
                    var markeradress = (results[0].formatted_address);
                }
                else {
                    alert('No results found');
                }
            } else {
                alert('Geocoder failed due to: ' + status);
            }
            document.getElementById('marker_info').innerHTML = '<p>Marker placed at: Current Lat: ' + evt.latLng.lat().toFixed(4) + ' Current Lng: ' + evt.latLng.lng().toFixed(4) + '  ' + markeradress + ' </p>';
        });
    });

    google.maps.event.addListener(marker, 'dragstart', function(evt){
        document.getElementById('marker_info').innerHTML = '<p>Currently dragging marker...</p>';
    });

}




function codeAddress() {
    var address = document.getElementById('address').value;
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            console.log(results[0]);
            map.setCenter(results[0].geometry.location);
            marker.setPosition(results[0].geometry.location);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function codeLatLng() {
    var input = document.getElementById('address').value;
    var latlngStr = input.split(',', 2);
    var lat = parseFloat(latlngStr[0]);
    var lng = parseFloat(latlngStr[1]);
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                map.setZoom(11);
                marker = new google.maps.Marker({
                    position: latlng,
                    map: map
                });
            } else {
                alert('No results found');
            }
        } else {
            alert('Geocoder failed due to: ' + status);
        }
    });
}



function saveLocation() {
    var address = document.getElementById('address').value;
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            console.log(results[0]);

                console.log(address);
                $.ajax({
                    url: "http://lvh.me:3000/locations.json",
                    data: {
                       //'location.street': 0,
                       //'postal_code': 0,
                       //'city': address
                       //'country': 0,
                       //'coordinates': 0
                    },
                    //dataType: "json",
                    type: "POST",
                    //processData: false,
                    contentType: "application/json",
                    success :function(data) {
                        console.log(data)
                    }
                });

            }
         else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

//    @location = Location.new(:street => params['street'], :postal_code => params['postal_code'], :city => params['city'], :country => params['country'], :coordinates => params['coordinates'])


google.maps.event.addDomListener(window, 'load', initialize);

//this function prevents reloadnig the page when "Enter" button is hit in the search form and submits the input to the codeAddress() fucntion.
$('#address').keypress(function (e) {
    if (e.which == 13) {
        e.preventDefault();
        codeAddress();
    }
});


function getLocation() {
    navigator.geolocation.watchPosition(showCurrentPosition, errorMessage);
}

//navigator.geolocation.getCurrentPosition(success, error, options);

function showCurrentPosition(position) {
    //console.log(position)
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    //console.log(latLng);
    map.setCenter(latLng);
    marker.setPosition(latLng);
}

function errorMessage(err) {
    alert("Sorry, ther's an error! It seems that: " + err.message);
    //console.warn('ERROR(' + err.code + '): ' + err.message);
};
