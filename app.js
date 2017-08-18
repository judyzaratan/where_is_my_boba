var locations = [{
    title: 'i-Tea',
    location: {
               "lat" : 37.7635227,
               "lng" : -122.4811778
            }
  },
  {
    title: 'Purple Kow',
    location: {
               "lat" : 37.7758612,
               "lng" : -122.4977786
            }
  },
  {
    title: 'Wonderful Dessert and Cafe',
    location: {
               "lat" : 37.7633039,
               "lng" : -122.4799618
            }
  },
  {
    title: 'Boba Guys',
    location: {
               "lat" : 37.759997,
               "lng" : -122.4211236
            }
  },
  {
    title: 'Teaspoon',
    location: {
               "lat" : 37.7963054,
               "lng" : -122.4221592
            }
  }
];


var map;

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 37.764245,
      lng: -122.423661
    },
    zoom: 14
  });

  function AppViewModel() {
    // Data
    var self = this;
    this.markers = ko.observableArray([]);
    this.currentMarker = ko.observable();
    // These are the real estate listings that will be shown to the user.
    // Normally we'd have these in a database instead.
    this.largeInfowindow = new google.maps.InfoWindow();

    var bounds = new google.maps.LatLngBounds();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      var position = locations[i].location;
      var title = locations[i].title;
      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i
      });

      // Push the marker to our array of markers.
      this.markers().push(marker);
      // Create an onclick event to open an infowindow at each marker.
      marker.addListener('click', function() {
        self.populateInfoWindow(this);

      });
      bounds.extend(this.markers()[i].position);
    }
    this.currentMarker(this.markers()[0]);
    map.fitBounds(bounds);


    //Behavior
    this.populateInfoWindow = function (marker) {
      // Check to make sure the infowindow is not already opened on this marker.
      console.log(self.currentMarker());
      if (self.currentMarker() !== marker){
        self.currentMarker().setAnimation(null);
      }
      self.currentMarker(marker) ;
      self.currentMarker().setAnimation(google.maps.Animation.BOUNCE);
      if (self.largeInfowindow.marker != marker ) {
        self.largeInfowindow.marker = marker;
        self.largeInfowindow.setContent('<div>' + marker.title + '</div>');
        self.largeInfowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        self.largeInfowindow.addListener('closeclick', function() {
          self.largeInfowindow.setMarker = null;
        });
      }
    };

    this.bounceMarker = function(marker){
      if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }
    // Extend the boundaries of the map for each marker
  };
  ko.applyBindings(new AppViewModel());
};


// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
