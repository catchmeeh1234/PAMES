import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

interface ReadingSettings {
  id: string;
  name: string;
  value: string;
  zone: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReadingSettingsService {

  constructor(
    private http:HttpClient,
  ) { }

  loadReadingSettings(name:string, zone:string) {
    return this.http.get<ReadingSettings[]>(`${environment.API_URL}/ReadingSettings/loadReadingSettings.php?name=${name}&zone=${zone}`);

  }
}
