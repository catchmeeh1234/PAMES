import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { DateFormatService } from 'src/app/services/date-format.service';
import { CollectionDetails, OfficialReceiptService } from 'src/app/services/official-receipt.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UseraccountsService } from 'src/app/services/useraccounts.service';

@Component({
  selector: 'app-cancel-or',
  templateUrl: './cancel-or.component.html',
  styleUrls: ['./cancel-or.component.scss']
})
export class CancelOrComponent {
  headerData = {
    title: `Cancel OR`,
  };

  cancelORForm:FormGroup;
  orDetails:CollectionDetails;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder:FormBuilder,
    private sessionStorageService:SessionStorageServiceService,
    private userAccountsService:UseraccountsService,
    private snackbarService:SnackbarService,
    private dateFormatService:DateFormatService,
    private officialReceiptService:OfficialReceiptService,
    private dialogRef:MatDialogRef<CancelOrComponent>,
    private router:Router
  ) {}

  async ngOnInit() {
    this.orDetails = this.data.orDetails;


    this.cancelORForm = this.formBuilder.group({
      CollectionID: ['', Validators.required],
      ReferenceNo: ['', Validators.required],
      CurrentDate: [new Date(), Validators.required],
      AccountNo: ['', Validators.required],
      AccountName: ['', Validators.required],
      CRNo: ['', Validators.required],
      TotalAmountDue: ['', Validators.required],
      Remarks: ['', Validators.required],
      CollectionStatus: ['', Validators.required],
      Username: [this.sessionStorageService.getSession("username"), Validators.required],
    });

    this.cancelORForm.get("CurrentDate")?.disable();

    this.cancelORForm.patchValue(this.orDetails);

    //get cancel cr reference number
    try {
      const cancelBillNo = await lastValueFrom(this.userAccountsService.fetchLogicNumbers("CancelCollection"));
      if (cancelBillNo.length === 1) {
        this.cancelORForm.patchValue({ReferenceNo: cancelBillNo[0].number});
        //console.log(this.cancelBillForm.value);
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

  async onSave(details:any) {
    if (details.Remarks === '') {
      this.snackbarService.showError("Please add a remarks");
      return;
    }

    const newDate = this.dateFormatService.formatDate(this.cancelORForm.get("CurrentDate")?.value);
    details.CurrentDate = newDate;

    try {
      const res:any = await lastValueFrom(this.officialReceiptService.cancelOR(details));
      if (res.status === "OR Cancelled") {
        this.dialogRef.close(res.status);
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
