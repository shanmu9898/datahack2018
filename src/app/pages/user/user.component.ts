/// <reference types="@types/googlemaps" />

import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {AppComponent} from '../../app.component';
import {ServerCommunicationService} from '../../service/server-communication.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  startPoint: string;
  endPoint: string;
  startMarker: any = null;
  endMarker: any = null;
  mapProp = {
    center: new google.maps.LatLng(AppComponent.LA_LATITUDE, AppComponent.LA_LONGITUDE),
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  circles: google.maps.Circle[] = [];
  circlesWithinRange = [];
  directionsService;
  directionsDisplay;
  dummyHotSpots = [
    {
      'crime': 'Burglary', 'center': {lat: 34.152235, lng: -118.143683}, 'ps': 60, 'intensity': 3
    },
    {
      'crime': 'Burglary', 'center': {lat: 34.067, lng: -118.203683}, 'ps': 200, 'intensity': 2
    },
    {
      'crime': 'Burglary', 'center': {lat: 34.172235, lng: -118.123683}, 'ps': 80, 'intensity': 1
    },
    {
      'crime': 'Burglary', 'center': {lat: 34.087, lng: -118.103683}, 'ps': 250, 'intensity': 4
    }
  ];

  constructor(private communicationService: ServerCommunicationService,
              private zone: NgZone) { }

  ngOnInit() {

  }

  ngAfterContentInit() {
    this.map = new google.maps.Map(this.gmapElement.nativeElement, this.mapProp);
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.directionsDisplay.setMap(this.map);
  }

  setStart(addrObj) {
    // We are wrapping this in a NgZone to reflect the changes
    // to the object in the DOM.
    this.zone.run(() => {
      this.startPoint = addrObj.formatted_address;
      this.createStartMarker(addrObj.coords, addrObj.formatted_address);
    });
  }

  setEnd(addrObj) {
    // We are wrapping this in a NgZone to reflect the changes
    // to the object in the DOM.
    this.zone.run(() => {
      this.endPoint = addrObj.formatted_address;
      this.createEndMarker(addrObj.coords, addrObj.formatted_address);
    });
  }

  createStartMarker(location, name) {
    if (this.startMarker != null) {
      this.startMarker.setMap(null);
    }
    this.startMarker = new google.maps.Marker({
      position: location,
      map: this.map,
      title: name
    });
  }

  createEndMarker(location, name) {
    if (this.endMarker != null) {
      this.endMarker.setMap(null);
    }
    this.endMarker = new google.maps.Marker({
      position: location,
      map: this.map,
      title: name
    });
  }

  queryServer() {
    /**
     this.communicationService.requestHotSpots(
     this.selectedCrimeType,
     this.selectedTimePeriod,
     this.selectedPeriod).then( data => {
        console.log(data);
    }, err => {
      alert(err);
    });
     **/
    this.renderCrimeHotSpots(this.circlesWithinRange);
  }

  renderCrimeHotSpots(circles) {
    this.clearCircles();
    // const crimeHotSpots = this.circlesWithinRange;
    const crimeHotSpots = circles;
    for (let i = 0; i < crimeHotSpots.length; i++) {
      const hotSpot = new google.maps.Circle({
        strokeColor: AppComponent.INTENSITY_COLORS[crimeHotSpots[i].intensity],
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: AppComponent.INTENSITY_COLORS[crimeHotSpots[i].intensity],
        fillOpacity: 0.35,
        map: this.map,
        center: crimeHotSpots[i].center,
        radius: crimeHotSpots[i].ps * 10
      });
      const mouseOverText = `Crime: ${crimeHotSpots[i].crime}\nPredicted number of crime: ${crimeHotSpots[i].ps}`;
      // circle is the google.maps.Circle-instance
      google.maps.event.addListener(hotSpot, 'mouseover', function () {
        this.getMap().getDiv().setAttribute('title', mouseOverText);
      });

      google.maps.event.addListener(hotSpot, 'mouseout', function () {
        this.getMap().getDiv().removeAttribute('title');
      });
      this.circles.push(hotSpot);
    }
  }

  clearCircles() {
    for (let i = 0; i < this.circles.length; i++) {
      this.circles[i].setMap(null);
      google.maps.event.clearListeners(this.circles[i], 'mouseover');
      google.maps.event.clearListeners(this.circles[i], 'mouseout');
    }
    this.circles = [];
  }


  findShortestRoute() {
    const request = {
      origin: this.startPoint,
      destination: this.endPoint,
      travelMode: google.maps.TravelMode['DRIVING'],
    };
    const directionsDisplay = this.directionsDisplay;
    const userComponent = this;
    this.directionsService.route(request, function(response, status) {
      if (status.toString() === 'OK') {
        directionsDisplay.setDirections(response);
        userComponent.findNearbyCrimeHotspots(response);
      } else {
        console.log(status);
        alert('Error Querying Route');
      }
    });
  }

  showAllHotspots() {
    this.renderCrimeHotSpots(this.dummyHotSpots);
  }

  findNearbyCrimeHotspots(response) {
    this.circlesWithinRange = [];
    for (let i = 0; i < this.dummyHotSpots.length; i++) {
      const location = new google.maps.LatLng(this.dummyHotSpots[i].center.lat, this.dummyHotSpots[i].center.lng);
      let polyline = new google.maps.Polyline({
        path: [],
      });
      let bounds = new google.maps.LatLngBounds();
      let legs = response.routes[0].legs;
      for (let i = 0; i < legs.length;i++) {
        let steps = legs[i].steps;
        for (let j = 0; j < steps.length; j++) {
          let nextSegment = steps[j].path;
          for (let k = 0; k < nextSegment.length;k++) {
            polyline.getPath().push(nextSegment[k]);
            bounds.extend(nextSegment[k]);
          }
        }
      }

      if (google.maps.geometry.poly.isLocationOnEdge(
        location,
        polyline,
        10e-3)) {
        this.circlesWithinRange.push(this.dummyHotSpots[i]);
      }
    }
    console.log(this.circlesWithinRange);
    this.renderCrimeHotSpots(this.circlesWithinRange);
  }
}
