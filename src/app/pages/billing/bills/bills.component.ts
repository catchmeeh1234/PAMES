import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { SearchConsumerComponent } from 'src/app/components/search-consumer/search-consumer.component';
import { BillInfo, BillService } from 'src/app/services/bill.service';
import { Consumer } from 'src/app/services/consumer.service';
import { DateFormatService } from 'src/app/services/date-format.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { ZoneService, Zone } from 'src/app/services/zone.service';

export const GRI_DATE_FORMATS: MatDateFormats = {
  ...MAT_NATIVE_DATE_FORMATS,
  display: {
    ...MAT_NATIVE_DATE_FORMATS.display,
    dateInput: {
      year: 'numeric',
      month: 'long',
    } as Intl.DateTimeFormatOptions,
  }
};

@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: GRI_DATE_FORMATS },
  ]
})
export class BillsComponent {
  @ViewChild('searchAccount') searchAccount!: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  headerData = {
    title: `Bills`,
  };

  billStatuses = ["Pending", "Posted", "Cancelled", "Paid"];
  zones:Zone[];
  displayedColumns: string[] = ['BillNo', 'Date', 'AccountName', 'Cons', 'Status'];

  currentDate = new Date();

  //ng models for data filtering
  account_no:string;
  billingMonth: Date =  new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 1));
  billStatus:string = "All";
  zone:string = "";

  createBillsForm:FormGroup;

  constructor(
    private readonly adapter: DateAdapter<Date>,
    private zoneService:ZoneService,
    public billService:BillService,
    private dialog:MatDialog,
    private router:Router,
    private dateFormatService:DateFormatService,
    private sessionStorageService:SessionStorageServiceService,
  ) {
    this.adapter.setLocale("en-EN");
  }

  ngOnInit(): void {
    this.loadZones();

    //console.log(this.billService.dataSource);

    // const refreshId = setInterval(() => {
    //   if (this.billService.dataSource) {
    //     //console.log("meron");

    //     this.billService.dataSource.filterPredicate = (data: any, filter: string) => {
    //       const filters = JSON.parse(filter);
    //       console.log(data.BillStatus, filters.billStatus);

    //       //if(data.Zone === null || data.search === null || data.AccountNo === null || data.Lastname === null) return true;

    //       return (
    //         (!filters.zone || data.Zone.toLowerCase() === filters.zone.toLowerCase()) &&
    //         (!filters.billStatus || data.BillStatus.toLowerCase() === filters.billStatus.toLowerCase()) &&
    //         (!filters.billingMonth || (data.BillingMonth.includes(filters.billingMonth)))
    //       );
    //     };

    //     clearInterval(refreshId);
    //   }
    // });
  }

  async loadZones() {
    try {
      const zones = await lastValueFrom(this.zoneService.fetchZones(), {defaultValue: [] as Zone[]});
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

  async searchConsumer() {
    const dialogRef = this.dialog.open(SearchConsumerComponent, {
      data: { type: 'search-bill'}
    });

    dialogRef.afterClosed().subscribe(async (result:Consumer) => {
      if (result) {
        this.account_no = result.AccountNo;

        const event = new KeyboardEvent('keyup', { key: 'Enter' });
        this.searchAccount.nativeElement.dispatchEvent(event);
      }
    });

  }

  async loadBillsByAccNo(accno:string) {
    try {
      const bills = await lastValueFrom(this.billService.fetchBills(accno), {defaultValue: [] as BillInfo[]});

      this.billService.dataSource = new MatTableDataSource<BillInfo>(bills);
      this.billService.dataSource.paginator = this.paginator;
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

  openBillInfo(bill_info:any, bill_no:string) {
    // const dialogRef = this.dialog.open(BillInfoComponent, {
    //   data: {
    //     billInfo: bill_info,
    //   }
    // });
    this.router.navigate(['./billing/bill-info', bill_no]);
  }

  onCreateBill() {
    const headerData = {
      title: "Create bill",
      url: './billing/bills'
    };

    const newHeaderData = { myObheaderDataject: JSON.stringify(headerData) };

    //his.router.navigate(['/auth/dashboard'], { queryParams: { id: this.sessionStorageService.getSession('userid') } });

    this.router.navigate(['./billing/create-bill']);

  }

  async loadData(billingMonth:Date, billStatus:string, zone:string) {
    const newBillingMonth = this.dateFormatService.convertToMonthYearString(billingMonth);

    if (zone === "") {
      return;
    }

    try {
      const searchedBills = await lastValueFrom(this.billService.searchBills(newBillingMonth, billStatus, zone), {defaultValue: [] as BillInfo[]});

      this.billService.dataSource = new MatTableDataSource<any>(searchedBills);
      this.billService.dataSource.paginator = this.paginator;
    } catch(error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          console.log('Forbidden:', error.error);
          this.sessionStorageService.removeSession();
          this.router.navigate(['./authentication/login']);
        }
      }
    }



    // if (!this.billService.dataSource) {
    //   return;
    // }

    // // if (this.isOpen === true) {
    // //   this.isOpen = true;
    // // } else {
    // //   this.isOpen = false;
    // // }

    // if (billStatus === "All") {
    //   billStatus = "";
    // }
    // if (zone === "All") {
    //   zone = "";
    // }

    // const newBillingMonth = this.dateFormatService.convertToMonthYearString(billingMonth);

    // console.log(this.billService.dataSource)
    // //this.pr.dataSourcePRTable.filter = filterZone.trim().toLowerCase();
    // this.billService.dataSource.filter = JSON.stringify({
    //   billingMonth: newBillingMonth,
    //   zone: zone,
    //   billStatus: billStatus
    // });
  }
}
