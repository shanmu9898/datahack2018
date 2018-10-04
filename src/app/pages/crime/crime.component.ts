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
    'Alcohol-related crimes',
    'Arson',
    'Assault',
    'Burglary',
    'False pretenses',
    'Firearm',
    'Forgery',
    'Homicide',
    'Kidnapping',
    'Robbery',
    'sex crimes'
  ];
  timePeriods = [
    {'text': '0:00-4:00', value: 200},
    {'text': '4:00-8:00', value: 600},
    {'text': '8:00-12:00', value: 1000},
    {'text': '12:00-16:00', value: 1400},
    {'text': '16:00-20:00', value: 1800},
    {'text': '20:00-24:00', value: 2200},
  ];
  months = [
    {'text': 'Jan', value: 1},
    {'text': 'Feb', value: 2},
    {'text': 'Mar', value: 3},
    {'text': 'Apr', value: 4},
    {'text': 'May', value: 5},
    {'text': 'Jun', value: 6},
    {'text': 'Jul', value: 7},
    {'text': 'Aug', value: 8},
    {'text': 'Sep', value: 9},
    {'text': 'Oct', value: 10},
    {'text': 'Nov', value: 11},
    {'text': 'Dec', value: 12},
  ];
  weeks = [1, 2, 3, 4];
  weekdays = [
    {'text': 'Mon', value: 1},
    {'text': 'Tue', value: 2},
    {'text': 'Wed', value: 3},
    {'text': 'Thu', value: 4},
    {'text': 'Fri', value: 5},
    {'text': 'Sat', value: 6},
    {'text': 'Sun', value: 7},
  ];
  areaIDs = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];

  selectedCrimeType;
  selectedMonth;
  selectedWeek;
  selectedWeekday;
  selectedTimePeriod;
  selectedAreaID;

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
     this.selectedMonth,
     this.selectedWeek,
     this.selectedWeekday,
     this.selectedTimePeriod,
     this.selectedAreaID).then(data => {
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
        radius: crimeHotSpots[i].ps
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
