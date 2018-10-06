/// <reference types="@types/googlemaps" />

import {Component, OnInit, ViewChild} from '@angular/core';
import {AppComponent} from '../../app.component';
import {ServerCommunicationService} from '../../service/server-communication.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

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
    {'text': '0:00-4:00', value: 0},
    {'text': '4:00-8:00', value: 1},
    {'text': '8:00-12:00', value: 2},
    {'text': '12:00-16:00', value: 3},
    {'text': '16:00-20:00', value: 4},
    {'text': '20:00-24:00', value: 5},
  ];
  months = [
    {'text': 'Jan', value: 0},
    {'text': 'Feb', value: 1},
    {'text': 'Mar', value: 2},
    {'text': 'Apr', value: 3},
    {'text': 'May', value: 4},
    {'text': 'Jun', value: 5},
    {'text': 'Jul', value: 6},
    {'text': 'Aug', value: 7},
    {'text': 'Sep', value: 8},
    {'text': 'Oct', value: 9},
    {'text': 'Nov', value: 10},
    {'text': 'Dec', value: 11},
  ];
  weeks = [0, 1, 2, 3];
  weekdays = [
    {'text': 'Mon', value: 0},
    {'text': 'Tue', value: 1},
    {'text': 'Wed', value: 2},
    {'text': 'Thu', value: 3},
    {'text': 'Fri', value: 4},
    {'text': 'Sat', value: 5},
    {'text': 'Sun', value: 6},
  ];

  selectedCrimeType;
  selectedMonth;
  selectedWeek;
  selectedWeekday;
  selectedTimePeriod;
  selectedAreaID;
  hotspots: any[] = [];
  predictedCases = 0;

  constructor(private communicationService: ServerCommunicationService,
              private spinner: NgxSpinnerService,
              private modalService: NgbModal) {
  }

  public static getColorIntensity(density) {
    const index = Math.floor(density / 50);
    if (index > 4) {
      return AppComponent.INTENSITY_COLORS[4];
    } else {
      return AppComponent.INTENSITY_COLORS[index];
    }
  }

  ngOnInit() {

  }

  ngAfterContentInit() {
    this.map = new google.maps.Map(this.gmapElement.nativeElement, this.mapProp);
  }

  openModal(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      console.log('close');
    }, (reason) => {
      console.log('not close');
    });
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
    this.spinner.show();
    this.communicationService.requestHotSpots(
      this.selectedCrimeType,
      this.selectedMonth,
      this.selectedWeek,
      this.selectedWeekday,
      this.selectedTimePeriod,
      this.selectedAreaID).then(data => {
      this.predictedCases = data['prediction'];
      this.hotspots = data['centroids'];
      this.renderCrimeHotSpots();
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
      alert('Error');
    });
  }



  renderCrimeHotSpots() {
    this.clearCircles();
    const crimeHotSpots = this.hotspots;
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
}
