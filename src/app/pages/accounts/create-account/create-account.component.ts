import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';
import { Consumer, ConsumerInput, ConsumerService } from 'src/app/services/consumer.service';
import { DateFormatService } from 'src/app/services/date-format.service';
import { RateScheduleService } from 'src/app/services/rate-schedule.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { ZoneService } from 'src/app/services/zone.service';

type Status = "Adding Failed" | "Consumer Added";

type CustomerStatus = {
  id: number,
  status_name: string,
};


@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})

export class CreateAccountComponent {

  formData = {
    action: "Create"
  }

  @ViewChild('stepper') stepper: MatStepper;

  errorMessage:string[] = [];
  accountNumber:string;
  userName:string = this.sessionStorageService.getSession("username")!;

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
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
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
    this.installationFormGroup.get("ReadingSeqNo")?.valueChanges
    .subscribe(readingSeqNo => {
      this.accountNumber = readingSeqNo;
    });
  }

  setOriginalValues() {
    this.orgConsumerInfoFormGroup = { ...this.consumerInfoFormGroup.getRawValue() };
    this.orgAddressFormGroup = { ...this.addressFormGroup.getRawValue() };
    this.orgInstallationFormGroup = { ...this.installationFormGroup.getRawValue() };
  }

  async loadCustomerStatuses() {
    const statuses = await this.consumerService.fetchConsumerStatus().toPromise();
    if (statuses) {
      this.customerStatuses = statuses;
    }
  }

  async loadZones() {
    const response = await this.zoneService.fetchZones().toPromise();
    if (response) {
      this.zones = response;
    }
  }

  async loadRates() {
    const rates = await this.rateService.loadRateSchedule("All").toPromise();
    if (rates) {
      this.rates = rates;
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

  async onCreateAccount() {

    if (!this.consumerInfoFormGroup.valid || !this.addressFormGroup.valid || !this.installationFormGroup.valid) {
      return;
    }

    if (this.accountNumber === "" || !this.accountNumber) {
      this.snackbarService.showError("No account number provided please contact admin");
      return;
    }

    const allFormData = {
      ...this.consumerInfoFormGroup.getRawValue(),
      ...this.addressFormGroup.getRawValue(),
      ...this.installationFormGroup.getRawValue(),
      CustomerStatus: 'Closed',
      AccountNo: this.accountNumber,
      Username: this.userName,
      // Add other steps' form values similarly
    };

    //console.log(consumerInfo);
    const newDateCreated = this.dateFormatService.formatDate(this.installationFormGroup.get("dateCreated")?.value);
    allFormData.dateCreated = newDateCreated;

    const newDateInstalled = this.dateFormatService.formatDate(this.installationFormGroup.get("dateInstalled")?.value);
    allFormData.dateInstalled = newDateInstalled;

    const res:any = await this.consumerService.addConsumers(allFormData).toPromise();
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
      console.log(status);
    }
  }

  backButton() {
    this.router.navigate(['./acounts/manage-accounts']);
  }

  stepperBack() {
    this.errorMessage = [];
  }
}
