import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UseraccountsService } from 'src/app/services/useraccounts.service';
import { environment } from 'src/environments/environment';

type User = {
  userid: string;
  username: string;
  fullname: string;
  status: "Login Success" | "Invalid Credentials";
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class AppSideLoginComponent {
  username:string | null;
  password:string | null;

  logo = environment.logo;

  constructor(
    private user:UseraccountsService,
    private router:Router,
    private sessionStorageService:SessionStorageServiceService,
    private snackbarService:SnackbarService,
  ) {}

  onLogin() {
    if ((typeof this.username !== "string" && typeof this.password !== "string") || (this.username?.trim() === "" || this.password?.trim() === "")) {
      this.snackbarService.showError("Please fill up the login form");
      return;
    }

    if(typeof this.username === "string" && typeof this.password === "string") {
      this.user.login(this.username, this.password)
      .subscribe((data:any) => {
        let response: User = data;
        if (response.status === "Login Success") {
          this.sessionStorageService.setSession('userid', response.userid);
          this.sessionStorageService.setSession('username', response.username);
          this.sessionStorageService.setSession('password', this.password);
          this.sessionStorageService.setSession('fullname', response.fullname);

          //this.router.navigate(['/auth/dashboard'], { queryParams: { id: this.sessionStorageService.getSession('userid') } });
          this.router?.navigate(['/accounts/manage-accounts']);
        } else {
          console.log(response.status);
          this.snackbarService.showError(response.status);
        }
      });

    }
  }
}
