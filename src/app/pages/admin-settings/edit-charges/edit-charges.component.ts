import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Charges, ChargesService } from 'src/app/services/charges.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

interface DialogData {
  charge_id:number
}

@Component({
  selector: 'app-edit-charges',
  templateUrl: './edit-charges.component.html',
  styleUrls: ['./edit-charges.component.scss']
})
export class EditChargesComponent {
  chargeInfo:Charges;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:DialogData,
    private chargesService:ChargesService,
    private dialogRef: MatDialogRef<EditChargesComponent>,
    private snackbarService:SnackbarService,
    private sessionStorageService:SessionStorageServiceService,
    private router:Router
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.onLoadChargesInfo();
  }

  onLoadChargesInfo() {
    const charges = this.chargesService.dataSource.data
    const chargeInfo = charges?.filter(charges => charges.ChargeID === this.data.charge_id)
    .map(charges => {
      if (charges.Amount === ".00") {
        return { ...charges, Amount: "0.00" };
      }
      if (charges.ComputeRate === ".00") {
        return { ...charges, ComputeRate: "0.00" };
      }
      return charges
    });

    if (chargeInfo.length === 1) {
      this.chargeInfo = chargeInfo[0];
    }
  }

  async onSave(chargesInfo:Charges) {
    try {
      //console.log(chargesInfo);
      const res:any = await lastValueFrom(this.chargesService.updateCharges(chargesInfo));
      if (res.status === "Charges Updated") {
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
