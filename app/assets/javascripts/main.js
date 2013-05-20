
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

var PlotBoundariesLayer = new google.maps.ImageMapType({
    getTileUrl: function (tile, zoom) {
        if (zoom <= 16) {
            return;
        }

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
        map.setCenter(new google.maps.LatLng(marker.position.lat(), marker.position.lng()));
    });

    google.maps.event.addListener(marker, 'dblclick', function() {
        map.setZoom(17);
    });
}

function codeAddress() {
    var address = document.getElementById('address').value;
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            marker.setPosition(results[0].geometry.location);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

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
