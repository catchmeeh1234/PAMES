import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
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
  createAccountForm:FormGroup;
  createAccountOriginalValues:ConsumerInput;

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
    this.createAccountForm = this.formBuilder.group({
      AccountNo: ['', Validators.required],
      Lastname: ['', Validators.required],
      Firstname: ['', Validators.required],
      Middlename: [''],
      ServiceAddress: ['', Validators.required],
      LandMark: ['', Validators.required],
      ContactNo: ['', Validators.required],
      MeterNo: ['', Validators.required],
      ReadingSeqNo: ['', Validators.required],
      ZoneName: ['', Validators.required],
      RateSchedule: ['', Validators.required],
      dateCreated: [new Date(), Validators.required],
      dateInstalled: [new Date(), Validators.required],
      CustomerStatus: ['', Validators.required],
      IsSenior: [false, Validators.required],
      Username: [this.sessionStorageService.getSession("username"), Validators.required],
    });
    this.createAccountOriginalValues = this.createAccountForm.value;
    this.createAccountForm.get("dateCreated")?.disable();

    this.loadCustomerStatuses();
    this.loadZones();
    this.loadRates();

    this.onZoneAndClassChange();
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
    this.createAccountForm.get("ZoneName")?.valueChanges
    .subscribe(zone => {
      let rateName = this.createAccountForm.get("RateSchedule")?.value;
      if (rateName === "") {
        return;
      }
      const newZone = this.zones.filter((zones:any) => zones.ZoneName === zone);
      const newRate = this.rates.filter((rates:any) => rates.CustomerType === rateName);

      if (newZone.length === 1 && newRate.length === 1) {
        //console.log(newZone, newRate);
        const accno = this.generateAccountNumber(newZone[0].ZoneID, newZone[0].LastNumber, newRate[0].RateSchedulesID);
        this.createAccountForm.patchValue({AccountNo: accno});
      }
    });

    this.createAccountForm.get("RateSchedule")?.valueChanges
    .subscribe(rateName => {
      let zone = this.createAccountForm.get("ZoneName")?.value;
      if (zone === "") {
        return;
      }
      const newZone = this.zones.filter((zones:any) => zones.ZoneName === zone);
      const newRate = this.rates.filter((rates:any) => rates.CustomerType === rateName);

      if (newZone.length === 1 && newRate.length === 1) {
        //console.log(newZone, newRate);
        const accno = this.generateAccountNumber(newZone[0].ZoneID, newZone[0].LastNumber, newRate[0].RateSchedulesID);
        this.createAccountForm.patchValue({AccountNo: accno});
      }
    });
  }

  generateAccountNumber(zoneID:string, lastNumber:string, type:string) {
    const newZoneID = zoneID.padStart(2, '0');
    const newLastNumber = lastNumber.padStart(5, '0');
    return `${newZoneID}-${newLastNumber}-${type}`;
  }

  async onCreateAccount(consumerInfo:ConsumerInput) {
    if (this.createAccountForm.valid) {
      //console.log(consumerInfo);
      const newDateCreated = this.dateFormatService.formatDate(this.createAccountForm.get("dateCreated")?.value);
      consumerInfo.dateCreated = newDateCreated;

      const newDateInstalled = this.dateFormatService.formatDate(this.createAccountForm.get("dateInstalled")?.value);
      consumerInfo.dateInstalled = newDateInstalled;

      const res:any = await this.consumerService.addConsumers(consumerInfo).toPromise();
      let status: Status = res.status;
      if (status === "Consumer Added") {
        this.snackbarService.showSuccess(status);

        this.loadZones();
        this.createAccountForm.reset(this.createAccountOriginalValues);
        // const newDataSource:any = this.createAccountForm.value;
        // newDataSource.push(this.createAccountForm.value);
        // this.consumerService.fetchConsumers().subscribe(data => {
        //   this.consumerService.dataSource.data = data;
        // });

        // this.consumerService.loadConsumerSummary();

      } else {
        console.log(status);
      }

    } else {
      this.snackbarService.showError("Please Fill up all needed information");
    }
  }

  backButton() {
    this.router.navigate(['./acounts/manage-accounts']);
  }
}
