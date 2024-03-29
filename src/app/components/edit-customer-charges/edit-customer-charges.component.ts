import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Charges, ChargesService } from 'src/app/services/charges.service';
import { ConsumerService, ScheduleCharges } from 'src/app/services/consumer.service';
import { DateFormatService } from 'src/app/services/date-format.service';
import { Subscription, lastValueFrom, of, sample } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-customer-charges',
  templateUrl: './edit-customer-charges.component.html',
  styleUrls: ['./edit-customer-charges.component.scss']
})
export class EditCustomerChargesComponent {
  scheduleCharge:ScheduleCharges & {IsRecurring: number} = this.data.scheduleCharge;
  editScheduleChargeForm:FormGroup;
  IsRecurring = false;

  public currentConsumerCharge:Charges;

  chargesSubscription:Subscription

  charges:Charges[];
  months:string[];
  years:number[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:any,
    private formBuilder:FormBuilder,
    private chargesService:ChargesService,
    private dateFormat:DateFormatService,
    private consumerService:ConsumerService,
    private snackbarService:SnackbarService,
    private dialogRef:MatDialogRef<EditCustomerChargesComponent>,
    private sessionStorageService:SessionStorageServiceService,
    private router:Router
  ) {
    this.editScheduleChargeForm = this.formBuilder.group({
      ScheduleChargesID: ['', Validators.required],
      Charge: [null, Validators.required],
      IsActive: [true],
      IsRecurring: [false],
      BillingMonth: [0, Validators.required],
      BillingYear: [0, Validators.required],
      Remarks: ['', Validators.required],
    });
    if (this.scheduleCharge.Recurring === 'Yes') {
      this.scheduleCharge.IsRecurring = 1;
    } else {
      this.scheduleCharge.IsRecurring = 0;
    }
  }

  async ngOnInit() {
   // console.log(new Date().getMonth());

    await this.onLoadCharges();
    await this.getChargebyId();

    //populate the form with data from the database
    this.editScheduleChargeForm.patchValue(this.scheduleCharge);
    this.editScheduleChargeForm.patchValue({IsActive: parseInt(this.scheduleCharge.ActiveInactive)});
    this.editScheduleChargeForm.patchValue({Charge: this.currentConsumerCharge});
    //console.log(this.scheduleCharge);

    //check is recurring is ticked
    if (this.editScheduleChargeForm.get("IsRecurring")?.value === 1) {
      this.IsRecurring = false;
    } else {
      this.IsRecurring = true;
    }

    //listen for any valuechanges in IsRecurring
    this.editScheduleChargeForm.get("IsRecurring")?.valueChanges
    .subscribe(value => {
      this.IsRecurring = !value;
      if (value === false) {
        this.editScheduleChargeForm.patchValue({BillingMonth: new Date().getMonth()+1, BillingYear: new Date().getFullYear()})
      } else {
        this.editScheduleChargeForm.patchValue({BillingMonth: 0, BillingYear: 0})
      }

    });

    this.months = this.dateFormat.months;
    this.years = this.dateFormat.years;

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

  async getChargebyId() {

    try {
      const charges = await lastValueFrom(this.chargesService.loadCharges());
      const charge = charges.filter(charges => charges.ChargeID.toString() === this.scheduleCharge.ChargeID);
      this.currentConsumerCharge = charge[0];
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

  compareSelectedCharge(option:Charges, value:Charges) {
    return option?.ChargeID === value?.ChargeID;
  }

  compareSelectedMonth(option:number, value:string) {
    //subtract 1 to current month for index of array
    //const subtractMonth = parseInt(value) - 1;

    return option === parseInt(value);
  }
  compareSelectedYear(option:number, value:string) {
    return option === parseInt(value);
  }


  async saveCustomerCharge() {
    if (this.editScheduleChargeForm.valid) {
      try {
        const res:any = await lastValueFrom(this.consumerService.editScheduleCharge(this.editScheduleChargeForm.value));
        if (res.status === "Schedule Charge Updated") {
          this.snackbarService.showSuccess(res.status);

          this.consumerService.fetchConsumerCharges(this.scheduleCharge.AccountNumber).subscribe(data => {
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
