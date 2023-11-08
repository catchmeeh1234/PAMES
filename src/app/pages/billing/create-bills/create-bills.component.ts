import { Component, ViewChild } from '@angular/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { Zone, ZoneService } from 'src/app/services/zone.service';
import { GRI_DATE_FORMATS } from '../bills/bills.component';
import { MeterReader, MeterReaderService } from 'src/app/services/meter-reader.service';
import { DateFormatService } from 'src/app/services/date-format.service';
import { BillService } from 'src/app/services/bill.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatTableDataSource } from '@angular/material/table';
import { Announcement, AnnouncementService } from 'src/app/services/announcement.service';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';

@Component({
  selector: 'app-create-bills',
  templateUrl: './create-bills.component.html',
  styleUrls: ['./create-bills.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: GRI_DATE_FORMATS },
  ]
})
export class CreateBillsComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns = [
    'AccountNo', 'CustomerName', 'CustomerAddress',
    'PreviousReading', 'Reading', 'BillingMonth',
    'RateSchedule', 'Zone', 'MeterReader'
  ];
  dataSource:any;

  zones:Zone[] | undefined;
  selectedZones:string[] = [];

  currentDate = new Date();
  selectedBillingMonth: Date =  new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 1));

  meterReaders:MeterReader[] | undefined;
  selectedMeterReader:string = "";

  //announcement
  announcementMessage:string = "";
  announcementContactNo:string = "";

  constructor(
    private zoneService:ZoneService,
    private meterReaderService:MeterReaderService,
    private dateFormatService:DateFormatService,
    private billService:BillService,
    private snackbarService:SnackbarService,
    private announcementService:AnnouncementService,
    private sessionStorageService:SessionStorageServiceService,
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.onLoadZones();
    this.onLoadMeterReaders();
    this.onLoadAnnouncement();
  }

  async onLoadZones() {
    const checked = false;
    const zones:Zone[] | undefined = await this.zoneService.fetchZones().toPromise();
    if (zones) {
      const newZones = zones.map(zone => ({
        ...zone,
        checked
      }));

      this.zones = newZones;
    }
  }
  async onLoadMeterReaders() {
    this.meterReaders = await this.meterReaderService.fetchMeterReader("All").toPromise();
  }

  onCheckboxChange(zone:Zone) {
    console.log(zone);
    if (zone.checked) {
      // Perform actions when the checkbox is checked
      this.selectedZones.push(zone.ZoneName);
    } else {
      // Perform actions when the checkbox is unchecked
      const newZones = this.selectedZones.filter(obj => obj !== zone.ZoneName);
      this.selectedZones = newZones;
    }
    //console.log(this.selectedZones);
  }

  async prepareBills(zones:string[], billingMonth:Date, meterReader:string) {
    const username = this.sessionStorageService.getSession("username")!;
    //add validation later for meter reader and zone
    if (zones.length === 0) {
      this.snackbarService.showError("Please select a zone");
      return;
    }

    if (meterReader === "") {
      this.snackbarService.showError("Please select a meter reader");
      return;
    }

    const newBillingMonth = this.dateFormatService.convertToMonthYearString(billingMonth);
    //console.log(zones, newBillingMonth, meterReader);

    const preparedBills:any = await this.billService.prepareBills(zones, newBillingMonth, meterReader, username).toPromise();
    console.log(preparedBills);

    if (!preparedBills) {
      return;
    }

    if (preparedBills.status !== "Bills Prepared") {
      console.log(preparedBills.status);
      this.snackbarService.showError(preparedBills.status);
      return;
    }

    this.dataSource = new MatTableDataSource<any>(preparedBills.result);
    this.dataSource.paginator = this.paginator;
  }

  async createBills(preparedBills:MatTableDataSource<any>, billingMonth:Date, zones:string[]) {
    const newBillingMonth = this.dateFormatService.convertToMonthYearString(billingMonth);
    if (!preparedBills) {
      this.snackbarService.showError("Please prepare the bills first");
      return;
    }

    const res:any = await this.billService.createBills(preparedBills.data, newBillingMonth, zones).toPromise();
    console.log(res);


    //CLEAR PREPARED BILLS TABLE AFTER SUCCESSFUL CREATION OF BILL
  }

  async onLoadAnnouncement() {
    const announcements = await this.announcementService.loadAnnouncement().toPromise();
    if (announcements) {
      for (const announcement of announcements) {
        if (announcement.AnnounceID === "1") {
          this.announcementMessage = announcement.Announce;
        } else if(announcement.AnnounceID === "2") {
          this.announcementContactNo = announcement.Announce;
        } else {
          console.log("Something went wrong");
        }
      }
    }
  }

  async onUpdateAnnouncement(message:string, contactNo:string) {
    if (message === "" || contactNo === "") {
      this.snackbarService.showError("please input an announcement message/contact no");
      return;
    }
    //add validation later for message and contact no
    const response:any = await this.announcementService.updateAnnouncement(message, contactNo).toPromise();

    if (response.status === "Announcement updated") {
      this.snackbarService.showSuccess(response.status);
    } else {
      this.snackbarService.showError(response.status);
    }

  }
}
