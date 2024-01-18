import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ChargeType, Charges, ChargesService } from 'src/app/services/charges.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-add-charges',
  templateUrl: './add-charges.component.html',
  styleUrls: ['./add-charges.component.scss']
})
export class AddChargesComponent {
  chargeType:ChargeType = "Fixed";

  addChargesForm:FormGroup;

  constructor(
    private formBuilder:FormBuilder,
    private chargesService:ChargesService,
    private dialogRef: MatDialogRef<AddChargesComponent>,
    private snackbarService:SnackbarService,
    private sessionStorageService:SessionStorageServiceService,
    private router:Router
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }


  async onSave(chargesInfo:Charges) {
    try {
      const res:any = await lastValueFrom(this.chargesService.addCharges(chargesInfo));
      if (res.status === "Charges Added") {
        this.snackbarService.showSuccess(res.status);

        this.chargesService.loadCharges().subscribe(data => {
          this.chargesService.dataSource.data = data;
        });
        this.dialogRef.close();
      } else {
        this.snackbarService.showError(res.status);
      }
    } catch(error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          console.log('Forbidden:', error.error);
          this.sessionStorageService.removeSession();
          this.router.navigate(['./authentication/login']);
        }
      }
    }

  }

}
