import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Consumer, ConsumerInput, ConsumerService } from 'src/app/services/consumer.service';
import { DateFormatService } from 'src/app/services/date-format.service';
import { RateScheduleService } from 'src/app/services/rate-schedule.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { ZoneService } from 'src/app/services/zone.service';
import { Router } from '@angular/router';
import { Observable, Subscription, from, lastValueFrom, map, of,  } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';

type Status = "Adding Failed" | "Consumer Added";

type CustomerStatus = {
  id: number,
  status_name: string,
};

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.scss']
})
export class AccountFormComponent {
  @ViewChild('stepper') stepper: MatStepper;
  @Input() formData: any;
  @Output() response = new EventEmitter<any>();

  errorMessage:string[] = [];
  accountNumber:string;
  userName:string = this.sessionStorageService.getSession("username")!;

  createAccountForm:ConsumerInput;
  consumerInfoFormGroup:FormGroup; //stepper 1
  addressFormGroup:FormGroup;   //stepper 2
  installationFormGroup:FormGroup;  //stepper 3

  orgConsumerInfoFormGroup:any;
  orgAddressFormGroup:any;
  orgInstallationFormGroup:any;

  customerStatuses:CustomerStatus[];
  zones:any;
  rates:any;

  headerData = {
    title: "Create Account",
    url: "./acounts/manage-accounts",
  };

  constructor(
    private formBuilder:FormBuilder,
    private snackbarService:SnackbarService,
    private consumerService:ConsumerService,
    private zoneService:ZoneService,
    private router:Router,
    private rateService:RateScheduleService,
    private dateFormatService:DateFormatService,
    private sessionStorageService:SessionStorageServiceService,
  ) {}

  ngOnInit(): void {
    this.consumerInfoFormGroup = this.formBuilder.group({
      Lastname: ['', Validators.required],
      Firstname: ['', Validators.required],
      Middlename: [''],
      IsSenior: [false, Validators.required],
      ContactNo: ['', [Validators.required, this.numberValidator]],
    });

    this.addressFormGroup = this.formBuilder.group({
      ServiceAddress: ['', Validators.required],
      LandMark: ['', Validators.required],
    });

    this.installationFormGroup = this.formBuilder.group({
      MeterNo: ['', Validators.required],
      ReadingSeqNo: ['', [Validators.required]],
      ZoneName: ['', Validators.required],
      RateSchedule: ['', Validators.required],
      dateCreated: [{value: new Date(), disabled: true}, Validators.required],
      dateInstalled: [new Date(), Validators.required],
    });

    this.loadCustomerStatuses();
    this.loadZones();
    this.loadRates();

    //this.onZoneAndClassChange();

    this.setOriginalValues();

     //listen to reading seq no valuechanges
     if (this.formData.action === "Create") {
        this.installationFormGroup.get("ReadingSeqNo")?.valueChanges
      .subscribe(readingSeqNo => {
        this.accountNumber = readingSeqNo;
      });
     }


     if (this.formData.action === "Edit" && this.formData.consumerInfo) {
        this.populateAccountForm(this.formData.consumerInfo);

     }

  }

  populateAccountForm(consumerInfo$:Observable<Consumer[]>) {
    consumerInfo$.subscribe(infos => {
      const info = infos[0];
      console.log(info);

      this.consumerInfoFormGroup.patchValue(info);
      this.addressFormGroup.patchValue(info);
      this.installationFormGroup.patchValue(info);

      this.accountNumber = info.AccountNo;
      this.installationFormGroup.patchValue({
        ZoneName: info.Zone,
        dateInstalled: info.DateInstalled
      });
    });
  }

  setOriginalValues() {
    this.orgConsumerInfoFormGroup = { ...this.consumerInfoFormGroup.getRawValue() };
    this.orgAddressFormGroup = { ...this.addressFormGroup.getRawValue() };
    this.orgInstallationFormGroup = { ...this.installationFormGroup.getRawValue() };
  }

  async loadCustomerStatuses() {
    try {
      const statuses = await lastValueFrom(this.consumerService.fetchConsumerStatus());
      this.customerStatuses = statuses;
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

  async loadZones() {
    try {
      const zones = await lastValueFrom(this.zoneService.fetchZones());
      this.zones = zones;

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

  async loadRates() {

    try {
      const rates = await lastValueFrom(this.rateService.loadRateSchedule("All"));
      this.rates = rates;
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

  onZoneAndClassChange() {
    this.installationFormGroup.get("ZoneName")?.valueChanges
    .subscribe(zone => {
      let rateName = this.installationFormGroup.get("RateSchedule")?.value;
      if (rateName === "") {
        return;
      }
      const newZone = this.zones.filter((zones:any) => zones.ZoneName === zone);
      const newRate = this.rates.filter((rates:any) => rates.CustomerType === rateName);

      if (newZone.length === 1 && newRate.length === 1) {
        //console.log(newZone, newRate);
        const {ZoneID, LastNumber} = newZone[0];
        const {RateSchedulesID} = newRate[0];

        const accno = this.generateAccountNumber(ZoneID, LastNumber, RateSchedulesID);
        this.accountNumber = accno;
      }
    });

    this.installationFormGroup.get("RateSchedule")?.valueChanges
    .subscribe(rateName => {
      let zone = this.installationFormGroup.get("ZoneName")?.value;
      if (zone === "") {
        return;
      }
      const newZone = this.zones.filter((zones:any) => zones.ZoneName === zone);
      const newRate = this.rates.filter((rates:any) => rates.CustomerType === rateName);

      if (newZone.length === 1 && newRate.length === 1) {
        //console.log(newZone, newRate);
        const {ZoneID, LastNumber} = newZone[0];
        const {RateSchedulesID} = newRate[0];

        const accno = this.generateAccountNumber(ZoneID, LastNumber, RateSchedulesID);
        this.accountNumber = accno;
      }
    });
  }

  generateAccountNumber(zoneID:string, lastNumber:string, type:string) {
    const newZoneID = zoneID.padStart(2, '0');
    const newLastNumber = lastNumber.padStart(5, '0');
    return `${newZoneID}-${newLastNumber}-${type}`;
  }

  //CUSTOM FORM VALIDATORS
  numberValidator(control: AbstractControl): { [key: string]: any } | null {
    const valid = /^\d+$/.test(control.value);

    if (!valid) {
      return { onlyNumbers: true };
    }
    return null;
  }

  validateFormData(formGroup:FormGroup) {
    this.errorMessage = [];


    //validation for consumer's personal information STEPPER 1
    if (formGroup.get("Lastname")?.hasError('required')) {
      const message = "Last name is required";
      this.errorMessage.push(message);
    }

    if (formGroup.get("Firstname")?.hasError('required')) {
      const message = "First name is required";
      this.errorMessage.push(message);
    }

    if (formGroup.get("ContactNo")?.hasError('required')) {
      const message = "Contact Number is required";
      this.errorMessage.push(message);
    }

    if (formGroup.get("ContactNo")?.hasError('onlyNumbers')) {
      const message = "Contact Number must contain only numbers";
      this.errorMessage.push(message);
    }


    //validation for consumer's address  STEPPER 2

    if (formGroup.get("ServiceAddress")?.hasError('required')) {
      const message = "Service Address is required";
      this.errorMessage.push(message);
    }

    if (formGroup.get("LandMark")?.hasError('required')) {
      const message = "Land mark is required";
      this.errorMessage.push(message);
    }

    //validation for consumer's installation details  STEPPER 2

    if (formGroup.get("MeterNo")?.hasError('required')) {
      const message = "Meter Number is required";
      this.errorMessage.push(message);
    }

    if (formGroup.get("ReadingSeqNo")?.hasError('required')) {
      const message = "Reading Sequnece Number is required";
      this.errorMessage.push(message);
    }

    if (formGroup.get("ReadingSeqNo")?.hasError('onlyNumbers')) {
      const message = "Reading Sequnece Number must contain only numbers";
      this.errorMessage.push(message);
    }

    if (formGroup.get("ZoneName")?.hasError('required')) {
      const message = "Zone is required";
      this.errorMessage.push(message);
    }

    if (formGroup.get("RateSchedule")?.hasError('required')) {
      const message = "Customer type is required";
      this.errorMessage.push(message);
    }

    if (formGroup.get("dateCreated")?.hasError('required')) {
      const message = "Date Created is required";
      this.errorMessage.push(message);
    }

    if (formGroup.get("dateInstalled")?.hasError('required')) {
      const message = "Date Installed is required";
      this.errorMessage.push(message);
    }

    //console.log(this.errorMessage);

  }

  async onCreateOrEditAccount(formData:{action:"Create" | "Edit"; consumerInfo?: Observable<Consumer[]>}) {

    if (!this.consumerInfoFormGroup.valid || !this.addressFormGroup.valid || !this.installationFormGroup.valid) {
      return;
    }

    if (this.accountNumber === "" || !this.accountNumber) {
      this.snackbarService.showError("No account number provided please contact admin");
      return;
    }

    const isSenior = this.consumerInfoFormGroup.get("IsSenior")?.value;
    let newIsSenior:string;
    if (typeof isSenior === 'string') {
      if (isSenior === "1") {
        newIsSenior = "Yes";
      } else {
        newIsSenior = "No";
      }
    } else {
      newIsSenior = this.consumerInfoFormGroup.get("IsSenior")?.value
    }

    const allFormData = {
      ...this.consumerInfoFormGroup.getRawValue(),
      ...this.addressFormGroup.getRawValue(),
      ...this.installationFormGroup.getRawValue(),
      CustomerStatus: 'Closed',
      AccountNo: this.accountNumber,
      Username: this.userName,
      IsSenior: newIsSenior,
      // Add other steps' form values similarly
    };

    const dateCreated = this.installationFormGroup.get("dateCreated")?.value;
    const dateInstalled = this.installationFormGroup.get("dateInstalled")?.value;

    if (dateCreated instanceof Date) {
      const newDateCreated = this.dateFormatService.formatDate(dateCreated);
      allFormData.dateCreated = newDateCreated;
    } else {
      allFormData.dateCreated = dateCreated;
    }

    if (dateInstalled instanceof Date) {
      const newDateInstalled = this.dateFormatService.formatDate(dateInstalled);
      allFormData.dateInstalled = newDateInstalled;
    } else {
      allFormData.dateInstalled = dateInstalled;
    }

    //console.log(allFormData);

    if (formData.action === "Create") {
      try {
        const res:any = await lastValueFrom(this.consumerService.addConsumers(allFormData));
        let status: Status = res.status;
        if (status === "Consumer Added") {
          this.snackbarService.showSuccess(status);

          //this.loadZones();
          this.stepper.reset();

          this.consumerInfoFormGroup.setValue(this.orgConsumerInfoFormGroup);
          this.addressFormGroup.setValue(this.orgAddressFormGroup);
          this.installationFormGroup.setValue(this.orgInstallationFormGroup);


          this.accountNumber = "";
          // const newDataSource:any = this.createAccountForm.value;
          // newDataSource.push(this.createAccountForm.value);
          // this.consumerService.fetchConsumers().subscribe(data => {
          //   this.consumerService.dataSource.data = data;
          // });

          // this.consumerService.loadConsumerSummary();

        } else {
          this.snackbarService.showError(status);
          //console.log(status);
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


    } else if(formData.action === "Edit") {
      try {
        const res:any = await lastValueFrom(this.consumerService.updateConsumerInfo(allFormData));

        if (res?.status === undefined) {
          return;
        }

        if (res.status === "Consumer Info updated successfully") {
          this.snackbarService.showSuccess(res.status);

          try {
             this.consumerService.fetchConsumerInfoByAccNo(this.accountNumber).subscribe(result => {

              this.consumerService.consumerInfo$ = of([result]);
              console.log("Test", result);
              const data = {
                status: res.status,
                consumerInfo: result,
              }
              this.response.emit(data);

              // for (const consumerInfo of data) {
              //   if (consumerInfo.Consumer_id === allFormData.Consumer_id) {
              //     this.consumerService.consumerInfo$ = of([consumerInfo]);
              //   }
              // }
            });
            this.consumerService.loadConsumerSummary();
          } catch(error) {
            if (error instanceof HttpErrorResponse) {
              if (error.status === 401) {
                console.log('Forbidden:', error.error);
                this.sessionStorageService.removeSession();
                this.router.navigate(['./authentication/login']);
              }
            }
          }

        } else {
          console.log(res.status);

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

  backButton() {
    this.router.navigate(['./acounts/manage-accounts']);
  }

  stepperBack() {
    this.errorMessage = [];
  }

}
