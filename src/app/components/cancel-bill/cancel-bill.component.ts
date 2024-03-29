import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { BillInfo, BillService } from 'src/app/services/bill.service';
import { DateFormatService } from 'src/app/services/date-format.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UseraccountsService } from 'src/app/services/useraccounts.service';

interface CancelBill {
  ReferenceNo: string;
  CurrentDate: Date | string;
  AccountNumber: string;
  CustomerName: string;
  BillNo: string;
  BillingMonth: Date;
  AmountDue: string;
  Remarks: string;
  BillStatus: string;
}

@Component({
  selector: 'app-cancel-bill',
  templateUrl: './cancel-bill.component.html',
  styleUrls: ['./cancel-bill.component.scss']
})
export class CancelBillComponent {
  cancelBillForm:FormGroup;
  billInfo: BillInfo;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef:MatDialogRef<CancelBillComponent>,
    private formBuilder:FormBuilder,
    private userAccountsService:UseraccountsService,
    private snackbarService:SnackbarService,
    private sessionStorageService:SessionStorageServiceService,
    private billService:BillService,
    private dateFormatService:DateFormatService,
    private router:Router
  ) {}

  async ngOnInit() {
    this.billInfo = this.data.billInfo;

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
      this.cancelBillForm = this.formBuilder.group({
        ReferenceNo: ['', Validators.required],
        CurrentDate: [new Date(), Validators.required],
        AccountNumber: ['', Validators.required],
        CustomerName: ['', Validators.required],
        BillNo: ['', Validators.required],
        BillingMonth: ['', Validators.required],
        AmountDue: ['', Validators.required],
        SeniorDiscount: ['', Validators.required],
        Remarks: ['', Validators.required],
        BillStatus: ['', Validators.required],
        Username: [this.sessionStorageService.getSession("username"), Validators.required],
        isPaid: ['', Validators.required],
      });

      this.cancelBillForm.get("CurrentDate")?.disable();

      this.cancelBillForm.patchValue(this.billInfo);

      //get cancel bill no
      try {
        const cancelBillNo = await lastValueFrom(this.userAccountsService.fetchLogicNumbers("CancelBill"));
        if (cancelBillNo.length === 1) {
          this.cancelBillForm.patchValue({ReferenceNo: cancelBillNo[0].number});
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


  async onSaveCancelBill(details:CancelBill) {
    if (details.Remarks === '') {
      this.snackbarService.showError("Please add a remarks");
      return;
    }

    const newDate = this.dateFormatService.formatDate(this.cancelBillForm.get("CurrentDate")?.value);
    details.CurrentDate = newDate;

    try {
      const res:any = await lastValueFrom(this.billService.cancelBill(details));
      //console.log(res);
      if (res.status === "Bill Cancelled") {
        this.dialogRef.close(res);
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
