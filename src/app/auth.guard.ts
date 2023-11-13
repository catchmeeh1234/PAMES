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

      const username = this.sessionStorageService.getSession('username');
      const uid = this.sessionStorageService.getSession('userid');

      if (username === null || uid === null) {
        console.log(1)
        this.router.navigate(['/authentication/login']);
        return false;
      } else {
        //console.log(2, "test")
        return true;
      }
  }

}
