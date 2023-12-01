import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface LogicNumber {
  id: string,
  number: string,
  remarks: string,
}

@Injectable({
  providedIn: 'root'
})
export class OfficialReceiptService {

  constructor(
    private http:HttpClient,
  ) { }

  fetchLastORNumber(remarks:string) {
    return this.http.get<LogicNumber[]>(`${environment.API_URL}/OfficialReceipt/fetchLastORNumber.php?remarks=${remarks}`, {responseType: 'json'})

  }
}
