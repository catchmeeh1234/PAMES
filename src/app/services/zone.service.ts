import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface Zone {
  ZoneID: string;
  ZoneName: string;
  LastNumber: string;
  checked?: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class ZoneService {

  constructor(private http:HttpClient) { }

  fetchZones() {
    return this.http.get<Zone[]>(`${environment.API_URL}/Zones/loadZones.php`, {responseType: 'json'})
  }
}
