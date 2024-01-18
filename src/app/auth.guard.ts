import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionStorageServiceService } from './services/session-storage-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router:Router, private sessionStorageService:SessionStorageServiceService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      const token = this.sessionStorageService.getSession('token');
      console.log(token);

      if (token) {
        //console.log(1);
        //this.router?.navigate(['/accounts/manage-accounts']);
        return true;
      } else {
        this.router?.navigate(['/authentication/login']);
        return false;
      }
  }

}
