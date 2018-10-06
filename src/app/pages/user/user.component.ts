/// <reference types="@types/googlemaps" />

import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {AppComponent} from '../../app.component';
import {ServerCommunicationService} from '../../service/server-communication.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {CrimeComponent} from '../crime/crime.component';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  mapProp = {
    center: new google.maps.LatLng(AppComponent.LA_LATITUDE, AppComponent.LA_LONGITUDE),
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  transportModes = [
    {'text': 'Walking', value: 'WALKING'},
    {'text': 'Driving', value: 'DRIVING'},
    {'text': 'Transit', value: 'TRANSIT'},
    {'text': 'Bicycling', value: 'BICYCLING'}
  ];
  timePeriods = [
    {'text': '0:00-4:00', value: 0},
    {'text': '4:00-8:00', value: 1},
    {'text': '8:00-12:00', value: 2},
    {'text': '12:00-16:00', value: 3},
    {'text': '16:00-20:00', value: 4},
    {'text': '20:00-24:00', value: 5},
  ];
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  startPoint: string;
  endPoint: string;
  transportMode: string;
  timePeriod: number;
  startMarker: any = null;
  endMarker: any = null;
  circles: google.maps.Circle[] = [];
  circlesWithinRange = [];
  directionsService;
  directionsDisplay;
  inputMode = true;
  routes: any = null;
  crimeSpotNumber = 0;
  currentRoute = 0;
  hotspots: any[] = [];

  constructor(private communicationService: ServerCommunicationService,
              private zone: NgZone,
              private spinner: NgxSpinnerService) {
  }

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
    let obj = this;
    return new Promise(function(resolve, reject) {
      obj.communicationService.requestHotSpotsForUsers(obj.timePeriod).then( data => {
        console.log(data);
        obj.hotspots = data['centroids'];
        resolve(data);
      }, err => {
        reject(err);
      });
    });
  }

  renderCrimeHotSpots(centroids) {
    this.clearCircles();
    const crimeHotSpots = centroids;
    for (let i = 0; i < crimeHotSpots.length; i++) {
      let centroid = crimeHotSpots[i];
      let color = CrimeComponent.getColorIntensity(centroid['Density']);
      const hotSpot = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35,
        map: this.map,
        center: {'lat': centroid['Lat'], 'lng': centroid['Lng']},
        radius: centroid['Radius'] * 1000
      });
      const mouseOverText = `Crime: ${centroid['Crime']}\nPredicted number of crime per year per km square: ${centroid['Density']}`;
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

  renderRoute(i) {
    this.directionsDisplay.setRouteIndex(i);
    this.findNearbyCrimeHotspots(i);
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
      travelMode: google.maps.TravelMode[this.transportMode],
      provideRouteAlternatives: true
    };
    const directionsDisplay = this.directionsDisplay;
    const userComponent = this;
    this.spinner.show();
    let obj = this;
    this.queryServer().then(() => {
      this.directionsService.route(request, function (response, status) {
        obj.spinner.hide();
        if (status.toString() === 'OK') {
          userComponent.inputMode = false;
          userComponent.routes = response.routes;
          directionsDisplay.setDirections(response);
          userComponent.findNearbyCrimeHotspots(0);
        } else {
          console.log(status);
          alert('Error Querying Route');
        }
      });
    }, err => {
      obj.spinner.hide();
      console.log(err);
    });

  }

  findNearbyCrimeHotspots(routeID) {
    this.currentRoute = routeID;
    this.circlesWithinRange = [];
    this.crimeSpotNumber = 0;
    for (let i = 0; i < this.hotspots.length; i++) {
      const location = new google.maps.LatLng(this.hotspots[i]['Lat'], this.hotspots[i]['Lng']);
      let polyline = new google.maps.Polyline({
        path: [],
      });
      let bounds = new google.maps.LatLngBounds();
      let legs = this.routes[routeID].legs;
      for (let i = 0; i < legs.length; i++) {
        let steps = legs[i].steps;
        for (let j = 0; j < steps.length; j++) {
          let nextSegment = steps[j].path;
          for (let k = 0; k < nextSegment.length; k++) {
            polyline.getPath().push(nextSegment[k]);
            bounds.extend(nextSegment[k]);
          }
        }
      }

      if (google.maps.geometry.poly.isLocationOnEdge(
        location,
        polyline,
         4 * 10e-4 * Math.sqrt(this.hotspots[i]['Radius']))) {
        this.circlesWithinRange.push(this.hotspots[i]);
        this.crimeSpotNumber++;
      }
    }
    this.renderCrimeHotSpots(this.circlesWithinRange);
  }

  showAllHotspots() {
    this.renderCrimeHotSpots(this.hotspots);
  }
}
