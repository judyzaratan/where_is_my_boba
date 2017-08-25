var locations = [{
    title: "i-Tea",
    location: {
      "lat": 37.7635227,
      "lng": -122.4811778
    }
  },
  {
    title: "Purple Kow",
    location: {
      "lat": 37.7758612,
      "lng": -122.4977786
    }
  },
  {
    title: "Wonderful Dessert and Cafe",
    location: {
      "lat": 37.7633039,
      "lng": -122.4799618
    }
  },
  {
    title: "Boba Guys",
    location: {
      "lat": 37.759997,
      "lng": -122.4211236
    }
  },
  {
    title: "Teaspoon",
    location: {
      "lat": 37.7963054,
      "lng": -122.4221592
    }
  }
];

function myFunction() {
  var x = document.getElementById("myfilters");
  if (x.className === "filters") {
    x.className += " responsive";
  } else {
    x.className = "filters";
  }
}


//Model
var Pin = function(i, map, title, position, view) {
  var thisMarker = this;
  this.title = title;
  this.position = position;
  this.isVisible = ko.observable(true);
  this.marker = new google.maps.Marker({
    map: map,
    position: position,
    title: title,
    animation: google.maps.Animation.DROP,
    id: i,
    visible: true
  });

  this.isVisible.subscribe(function(currentState) {
    if (currentState) {
      thisMarker.marker.setMap(map);
    } else {
      thisMarker.marker.setMap(null);
    }
  });

};


//View
function AppViewModel(map, markers) {

  var self = this;
  this.largeInfowindow = new google.maps.InfoWindow();
  this.markers = ko.observableArray(markers);
  this.currentMarker = ko.observable(this.markers()[0]);
  this.query = ko.observable("");

  // Behavior : Filter locations based on query string
  this.filteredSearch = ko.computed(function() {
    var filter = self.query();
    if (!filter) {
      self.markers().forEach(function(item) {
        item.isVisible(true);
      });
      // Return original markers if no query needed
      return self.markers();
    } else {
      // Return an array that matches string query
      return ko.utils.arrayFilter(self.markers(), function(pin) {
        var doesMatch = pin.title.toLowerCase().indexOf(filter.toLowerCase()) > -1;
        pin.isVisible(doesMatch);
        return doesMatch;
      });
    }
  });


  // Create an onclick event to open an infowindow at each marker.
  this.markers().forEach(function(item, i) {
    google.maps.event.addListener(item.marker, "click", function() {
      self.populateInfoWindow(item);
    });
  });


  this.showMarkerInfo = function(data) {
    var html = "<div id='iwindow'>" +
      "<p>" + data.name + "</p>" +
      "<p>" + data.address[0] + "</p>" +
      "<p>" + data.address[1] + "</p>" +
      "<p>" + data.website + "</p>" +
      "</div>";

    self.largeInfowindow.setContent(html);
    map.setCenter(this.currentMarker().position);
    self.largeInfowindow.open(map, this.currentMarker().marker);
  };


  this.getMarkerInfo = function(pin) {
    var CLIENT_ID = "IJ4ZSXNUB5KE4R4JA44HHGEZLIY14RQSRTTINKCQERGC1K0H";
    var CLIENT_SECRET = "XBDJ5CCCAOD4Z0Y1RORM1HXUVNMCWGO5ZYGBVKQGZ5EFMIJI";

    var settings = {
      "url": "https://api.foursquare.com/v2/venues/search",
      "method": "GET",
      "data": {
        ll: pin.position.lat + "," + pin.position.lng,
        query: pin.title,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        v: 20151016,
        limit: 1
      }
    };

    $.ajax(settings).done(function(response) {
      var information = {
        name: response.response.venues[0].name,
        address: response.response.venues[0].location.formattedAddress,
        website: response.response.venues[0].url
      }
      self.showMarkerInfo(information);
    });
  };


  this.populateInfoWindow = function(pin) {
    $('#myfilters').removeClass('responsive');
    if (pin !== self.currentMarker()) {
      self.currentMarker().marker.setAnimation(null);
    }
    self.currentMarker(pin);
    self.currentMarker().marker.setAnimation(google.maps.Animation.BOUNCE);
    self.getMarkerInfo(pin);

    // Make sure the marker property is cleared if the infowindow is closed.
    self.largeInfowindow.addListener("closeclick", function() {
      pin.marker.setAnimation(null);
    });
  };
};


// Callback after accessing Google Maps API
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  var bounds = new google.maps.LatLngBounds();
  var markers = [];
  var map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: 37.764245,
      lng: -122.423661
    },
    mapTypeControl: false,
    fullscreenControl: false,
    zoom: 2
  });


  // The following group uses the location array to create an array of markers on initialize.
  locations.forEach(function(item, i) {
    // Get the position from the location array.
    var position = item.location;
    var title = item.title;
    var pin = new Pin(i, map, title, position);

    //Extend bounds
    bounds.extend(position);
    map.fitBounds(bounds);

    // Array of markers to send to viewmodel
    markers.push(pin);
  });

  ko.applyBindings(new AppViewModel(map, markers));
};
