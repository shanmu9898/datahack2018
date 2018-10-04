/// <reference types="@types/googlemaps" />

import {Component, OnInit, ViewChild} from '@angular/core';
import {AppComponent} from '../../app.component';
import {ServerCommunicationService} from '../../service/server-communication.service';

@Component({
  selector: 'app-crime',
  templateUrl: './crime.component.html',
  styleUrls: ['./crime.component.css']
})
export class CrimeComponent implements OnInit {
  mapProp = {
    center: new google.maps.LatLng(AppComponent.LA_LATITUDE, AppComponent.LA_LONGITUDE),
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  circles: google.maps.Circle[] = [];
  crimeTypes = [
    'Dummy1', 'Dummy2'
  ];
  timePeriods = [
    '0-2', '2-4', '4-6', '6-8', '8-10', '10-12'
  ];
  periods = ['am', 'pm'];

  selectedCrimeType = null;
  selectedTimePeriod = null;
  selectedPeriod = this.periods[0];

  constructor(private communicationService: ServerCommunicationService) { }

  ngOnInit() {

  }

  ngAfterContentInit() {
    this.map = new google.maps.Map(this.gmapElement.nativeElement, this.mapProp);
  }

  clearCircles() {
    for (let i = 0; i < this.circles.length; i++) {
      this.circles[i].setMap(null);
      google.maps.event.clearListeners(this.circles[i], 'mouseover');
      google.maps.event.clearListeners(this.circles[i], 'mouseout');
    }
    this.circles = [];
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
    this.renderCrimeHotSpots();
  }

  renderCrimeHotSpots() {
    this.clearCircles();
    const dummyHotSpots = [
      {
        'crime': 'Burglary', 'center': {lat: 34.152235, lng: -118.143683}, 'ps': 40, 'intensity': 3
      },
      {
        'crime': 'Burglary', 'center': {lat: 34.067, lng: -118.203683}, 'ps': 100, 'intensity': 2
      },
      {
        'crime': 'Burglary', 'center': {lat: 34.172235, lng: -118.123683}, 'ps': 30, 'intensity': 1
      },
      {
        'crime': 'Burglary', 'center': {lat: 34.087, lng: -118.103683}, 'ps': 150, 'intensity': 4
      }
    ];
    const crimeHotSpots = dummyHotSpots;
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
}
