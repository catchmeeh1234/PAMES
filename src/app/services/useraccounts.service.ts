import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface PasswordStatus {
  status: "access granted" | "access denied";
}

export interface LogicNumber {
  id: string;
  number: string;
  remarks: string;
}

@Injectable({
  providedIn: 'root'
})
export class UseraccountsService {

  constructor(private http:HttpClient) { }

  login(username:string, password:string) {
    return this.http.get(`${environment.API_URL}/UserAccounts/authUser.php?username=${username}&password=${password}`, {responseType: 'json'})
  }

  validateAuthorizationPassword(password:string) {
    return this.http.get(`${environment.API_URL}/UserAccounts/validateAuthorizationPassword.php?password=${password}`, {responseType: 'json'})
  }

  fetchLogicNumbers(remarks:string) {
    return this.http.get<LogicNumber[]>(`${environment.API_URL}/LogicNumbers/fetchLogicNumbers.php?remarks=${remarks}`, {responseType: 'json'})
  }
}
