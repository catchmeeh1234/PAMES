import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface MeterReader {
  reader_id: number
  reader_name: string
  reader_username: string
  reader_password: string
}

@Injectable({
  providedIn: 'root'
})
export class MeterReaderService {

  constructor(
    private http:HttpClient,
    ) { }

  fetchMeterReader(reader_id:string) {
    return this.http.get<MeterReader[]>(`${environment.API_URL}/MeterReaders/loadMeterReader.php?reader_id=${reader_id}`);
  }
}
