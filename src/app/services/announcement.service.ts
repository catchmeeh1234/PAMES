import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface Announcement {
  AnnounceID: string;
  Announce: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  constructor(
    private http:HttpClient,
  ) { }

  loadAnnouncement() {
    return this.http.get<Announcement[]>(`${environment.API_URL}/Announcements/viewAnnouncement.php`, {responseType: 'json'});
  }

  updateAnnouncement(message:string, contactNo:string) {
    let params = new FormData();
    params.append('message', message);
    params.append('contactNo', contactNo);

    return this.http.post(`${environment.API_URL}/Announcements/updateAnnouncement.php`, params, {responseType: 'json'});
  }
}
