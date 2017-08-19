var locations = [{
    title: 'i-Tea',
    location: {
      "lat": 37.7635227,
      "lng": -122.4811778
    }
  },
  {
    title: 'Purple Kow',
    location: {
      "lat": 37.7758612,
      "lng": -122.4977786
    }
  },
  {
    title: 'Wonderful Dessert and Cafe',
    location: {
      "lat": 37.7633039,
      "lng": -122.4799618
    }
  },
  {
    title: 'Boba Guys',
    location: {
      "lat": 37.759997,
      "lng": -122.4211236
    }
  },
  {
    title: 'Teaspoon',
    location: {
      "lat": 37.7963054,
      "lng": -122.4221592
    }
  }
];

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 37.764245,
      lng: -122.423661
    },
    zoom: 14
  });
  var self = this;

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




  function AppViewModel() {
    // Data
    var self = this;
    // Create a new blank array for all the listing markers.
    this.markers = ko.observableArray([]);
    this.currentMarker = ko.observable();
    // These are the real estate listings that will be shown to the user.
    // Normally we'd have these in a database instead.
    this.largeInfowindow = new google.maps.InfoWindow();
    this.query = ko.observable("");
    this.filteredSearch = ko.computed(function() {
      var filter = self.query();
      if (!filter) {
        self.markers().forEach(function(item){
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
    var bounds = new google.maps.LatLngBounds();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      var position = locations[i].location;
      var title = locations[i].title;
      var pin = new Pin(i, map, title, position);

      // Push the marker to our array of markers.
      this.markers().push(pin);

      (function(pinIn) {
        google.maps.event.addListener(pin.marker, 'click', function () {
          self.populateInfoWindow( pinIn,pin.marker);
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
        self.largeInfowindow.setContent('<div>' + pin.title + '</div>');
        self.largeInfowindow.open(map, pin.marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        self.largeInfowindow.addListener('closeclick', function() {
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
