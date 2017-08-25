var locations =
        [
            {
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

var Pin = function(i, map, title, position, view) {
  "use strict";
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


function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  var map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: 37.764245,
      lng: -122.423661
    },
    mapTypeControl: false,
    fullscreenControl: false,
    zoom: 2
  });

  var self = this;

  function AppViewModel() {
    // Data
    var self = this;
    // Create a new blank array for all the listing markers.
    this.markers = ko.observableArray([]);
    this.currentMarker = ko.observable();
    var bounds = new google.maps.LatLngBounds();
    this.largeInfowindow = new google.maps.InfoWindow();
    // These are the real estate listings that will be shown to the user.
    // Normally we"d have these in a database instead.
    this.query = ko.observable("");
    this.filteredSearch = ko.computed(function() {
      var filter = self.query();
      if (!filter) {
        self.markers().forEach(function(item) {
          item.isVisible(true);
        });
        return self.markers();
      } else {
        return ko.utils.arrayFilter(self.markers(), function(pin) {
          var doesMatch = pin.title.toLowerCase().indexOf(filter.toLowerCase()) > -1;
          pin.isVisible(doesMatch);
          return doesMatch;
        });
      }

    });

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      var position = locations[i].location;
      var title = locations[i].title;
      var pin = new Pin(i, map, title, position);

      // Push the marker to our array of markers.
      this.markers().push(pin);

      (function(pinIn) {
        google.maps.event.addListener(pin.marker, "click", function() {
          self.populateInfoWindow(pinIn, pin.marker);
        });
      })(pin);
      this.currentMarker(this.markers()[0]);
      // Create an onclick event to open an infowindow at each marker.

      bounds.extend(this.markers()[i].position);
    }
    map.fitBounds(bounds);


    //Behavior
    this.populateInfoWindow = function(pin, marker) {
      // Check to make sure the infowindow is not already opened on this marker.
      if (self.currentMarker() !== pin) {
        self.currentMarker().marker.setAnimation(null);
        self.currentMarker(pin);
      }
      self.currentMarker().marker.setAnimation(google.maps.Animation.BOUNCE);
      if (self.largeInfowindow.marker != pin.marker) {
        self.largeInfowindow.marker = pin.marker;
        var CLIENT_ID = "IJ4ZSXNUB5KE4R4JA44HHGEZLIY14RQSRTTINKCQERGC1K0H";
        var CLIENT_SECRET = "XBDJ5CCCAOD4Z0Y1RORM1HXUVNMCWGO5ZYGBVKQGZ5EFMIJI";

        var settings1 = {
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

        var information;
        $.ajax(settings1, function() {
          alert("done2");
        }).done(function(response) {
          information = {
            name: response.response.venues[0].name,
            address: response.response.venues[0].location.formattedAddress,
            website: response.response.venues[0].url
          }
          var html = "<div>" +
            "<p>" + information.name + "</p>" +
            "<p>" + information.address[0] + "</p>" +
            "<p>" + information.address[1] + "</p>" +
            "<p>" + information.website + "</p>" +
            "</div>";

          self.largeInfowindow.setContent(html);
          self.largeInfowindow.open(map, pin.marker);
        });
        // Make sure the marker property is cleared if the infowindow is closed.
        self.largeInfowindow.addListener("closeclick", function() {
          self.largeInfowindow.marker.setAnimation(null);
          self.largeInfowindow.setMarker = null;
        });
      }
    };

    this.bounceMarker = function(marker) {
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    }
    // Extend the boundaries of the map for each marker
  };
  ko.applyBindings(new AppViewModel());
  // AppViewModel.query.subscribe(AppViewModel.search);

};
