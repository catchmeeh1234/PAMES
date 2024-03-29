import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Charges, ChargesService } from 'src/app/services/charges.service';
import { ConsumerService, ScheduleCharges } from 'src/app/services/consumer.service';
import { DateFormatService } from 'src/app/services/date-format.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-add-customer-charges',
  templateUrl: './add-customer-charges.component.html',
  styleUrls: ['./add-customer-charges.component.scss']
})
export class AddCustomerChargesComponent {
  addChargeForm:FormGroup;
  IsRecurring = true;

  charges:Charges[];
  months:string[];
  years:number[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:any,
    private chargesService:ChargesService,
    private dateFormat:DateFormatService,
    private formBuilder: FormBuilder,
    private sessionStorageService:SessionStorageServiceService,
    private consumerService:ConsumerService,
    private snackbarService:SnackbarService,
    private dialogRef:MatDialogRef<AddCustomerChargesComponent>,
    private router:Router,
  ) {}

  ngOnInit(): void {
    //instantiate form group properties
    this.addChargeForm = this.formBuilder.group({
      Charge: ['', Validators.required],
      IsActive: [true],
      IsRecurring: [false],
      BillingMonth: [new Date().getMonth(), Validators.required],
      BillingYear: [new Date().getFullYear(), Validators.required],
      Remarks: ['', Validators.required],
      AccountNumber: [this.data.account_no, Validators.required],
      CreatedBy: [this.sessionStorageService.getSession("username"), Validators.required],
    });

    //listen to changes in checkstate of Reucurring checkbox
    this.addChargeForm.get("IsRecurring")?.valueChanges
    .subscribe(value => {
      //console.log(this.addChargeForm.get("Charge")?.value);
      console.log(this.addChargeForm?.value);

      this.IsRecurring = !value;
      if (value === false) {
        this.addChargeForm.patchValue({BillingMonth: new Date().getMonth(), BillingYear: new Date().getFullYear()})
      } else {
        this.addChargeForm.patchValue({BillingMonth: -1, BillingYear: 0})
      }
    })

    this.months = this.dateFormat.months;
    this.years = this.dateFormat.years;
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.onLoadCharges();
  }

 async onLoadCharges() {
    try {
      this.charges = await lastValueFrom(this.chargesService.loadCharges());
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

  async addCustomerCharge() {
    if (this.addChargeForm.valid) {

      try {
        const res:any = await lastValueFrom(this.consumerService.addScheduleCharge(this.addChargeForm.value));

        if (res.status === "Schedule Charge Added") {
          this.snackbarService.showSuccess(res.status);

          this.consumerService.fetchConsumerCharges(this.data.account_no).subscribe(data => {
            this.consumerService.consumerChargesDataSource.data = data;
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

}
