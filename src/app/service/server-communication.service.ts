import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServerCommunicationService {
  url = '';
  constructor(private http: HttpClient) { }
  requestHotSpots(  selectedCrimeType,
                    selectedMonth,
                    selectedWeek,
                    selectedWeekday,
                    selectedTimePeriod,
                    selectedAreaID) {
    const http = this.http;
    const body = {
      'crime': selectedCrimeType,
      'month': selectedMonth,
      'week': selectedWeek,
      'weekday': selectedWeekday,
      'time': selectedTimePeriod,
      'areaID': selectedAreaID
    };
    return new Promise(function(resolve, reject) {
      http.post('', body).subscribe((data) => {
        resolve(data);
      }, err => {
        alert(err);
        reject(err);
      });
    });
  }
}
