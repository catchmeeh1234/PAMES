import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface RateSchedule {
  RateSchedulesID: string
  CustomerType: string
  kwh: number
}

@Injectable({
  providedIn: 'root'
})
export class RateScheduleService {

  constructor(
    private http: HttpClient,
  ) { }

  loadRateSchedule(rate_name:string) {
    return this.http.get<RateSchedule[]>(`${environment.API_URL}/RateSchedules/loadRateSchedule.php?rate_name=${rate_name}`);
  }
}
