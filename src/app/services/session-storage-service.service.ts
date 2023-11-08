import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageServiceService {

  constructor() { }

  setSession(key: string, value: any): void {
    localStorage.setItem(key, value);
    //sessionStorage.setItem(key, value);
  }
  getSession(key:string) {
    //return sessionStorage.getItem(key);
    return localStorage.getItem(key);
  }
  removeSession() {
    localStorage.clear();
  }

}
