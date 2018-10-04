import {Component, ViewChild} from '@angular/core';
import { ServerCommunicationService } from './service/server-communication.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public static LA_LATITUDE = 34.052235;
  public static LA_LONGITUDE = -118.243683;
  public static INTENSITY_COLORS = ['#ffff00', '#ffd000', '#ff9000', '#ff5d00', '#ff0000'];

  constructor() { }

  ngOnInit() {
  }
  ngAfterContentInit() {
  }
}
