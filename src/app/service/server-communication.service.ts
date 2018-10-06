import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServerCommunicationService {
  url = '';

  constructor(private http: HttpClient) {
  }

  requestHotSpots(selectedCrimeType,
                  selectedMonth,
                  selectedWeek,
                  selectedWeekday,
                  selectedTimePeriod,
                  selectedAreaID) {
    const http = this.http;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    const body = {
      'Readings':
        [{
          'CrimeCodeDescription': selectedCrimeType,
          'month': Number(selectedMonth),
          'Week': Number(selectedWeek),
          'Day_of_Week': selectedWeekday,
          'TimeBin': Number(selectedTimePeriod),
          'AreaID': this.parseAreaID(selectedAreaID)
        }]
    };
    console.log(body);
    return new Promise(function (resolve, reject) {
      http.post('http://datahack2018.ml/api/predictedCrime', body, {headers: headers}).subscribe((data) => {
        console.log(data);
        resolve(data);
      }, err => {
        reject(err);
      });
    });
  }

  requestHotSpotsForUsers(selectedTimePeriod) {
    const http = this.http;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    console.log(selectedTimePeriod);
    const body = {'time' : Number(selectedTimePeriod)};
    return new Promise(function (resolve, reject) {
      http.post('http://datahack2018.ml/api/predictUserRoute', body, {headers: headers}).subscribe((data) => {
        console.log(data);
        resolve(data);
      }, err => {
        reject(err);
      });
    });
  }

  private parseAreaID(selectedIDs) {
    let IDs = [];
    console.log(selectedIDs);
    if (selectedIDs.includes(',')) {
      return selectedIDs.split(',').map(x => Number(x) - 1);
    } else if (selectedIDs.includes('-')) {
      const startEnd = selectedIDs.split('-');
      for (let i = Number(startEnd[0]) - 1; i < Number(startEnd[1]); i++) {
        IDs.push(i);
      }
    } else {
      IDs.push(Number(selectedIDs) - 1);
    }
    return IDs;
  }
}
