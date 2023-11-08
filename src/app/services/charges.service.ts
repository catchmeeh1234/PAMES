import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';

export interface Charges {
  ChargeID: number
  ChargeType: string
  Category: string
  Entry: string
  Particular: string
  Amount: string
  ComputeRate: string
}

export type ChargeType = "Fixed" | "Amount Percentage" | "Cons. Rate"

@Injectable({
  providedIn: 'root'
})
export class ChargesService {
  dataSource:MatTableDataSource<Charges>;

  constructor(private http:HttpClient) { }

  loadCharges() {
    return this.http.get<Charges[]>(`${environment.API_URL}/Charges/viewCharges.php`);
  }

  addCharges(chargeInfo:Charges) {
    let params = new FormData();
    let json = JSON.stringify(chargeInfo);
    params.append('chargeInfo', json);

    return this.http.post(`${environment.API_URL}/Charges/addCharges.php`, params, {responseType: 'json'});
  }

  updateCharges(chargeInfo:Charges) {
    let params = new FormData();
    let json = JSON.stringify(chargeInfo);
    params.append('chargeInfo', json);

    return this.http.post(`${environment.API_URL}/Charges/editCharges.php`, params, {responseType: 'json'});
  }
}
