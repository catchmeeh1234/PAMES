import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { PasswordStatus, UseraccountsService } from 'src/app/services/useraccounts.service';


@Component({
  selector: 'app-password-prompt',
  templateUrl: './password-prompt.component.html',
  styleUrls: ['./password-prompt.component.scss']
})
export class PasswordPromptComponent {
  password:string = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef:MatDialogRef<PasswordPromptComponent>,
    private userAccountsService:UseraccountsService,
    private snackbarService:SnackbarService,
    private dialog:MatDialog,
  ) { }

  ngOnInit(): void {
    // this.cancel_pr = new FormGroup({
    //   cancel_remarks: new FormControl(null, Validators.required),
    // });
  }

  async submitPassword(password:string) {
    if (password === "") {
      return;
    }

    const res:any = await this.userAccountsService.validateAuthorizationPassword(password).toPromise();
    const newRes:PasswordStatus = res;

    if (newRes.status === "access granted") {
      this.dialogRef.close(newRes);
    } else {
      this.snackbarService.showError(newRes.status);
      this.password = "";
    }

  }
}
