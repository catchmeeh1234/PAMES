import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild } from '@angular/core';
import { MAT_DATE_FORMATS, MatDateFormats, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { BillInfo, BillService } from 'src/app/services/bill.service';
import { ConsumerService } from 'src/app/services/consumer.service';
import { DateFormatService } from 'src/app/services/date-format.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { Zone, ZoneService } from 'src/app/services/zone.service';

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
  selector: 'app-post-bills',
  templateUrl: './post-bills.component.html',
  styleUrls: ['./post-bills.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: GRI_DATE_FORMATS },
  ]
})
export class PostBillsComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  selection = new SelectionModel<BillInfo>(true, []);

  dataSource:MatTableDataSource<BillInfo>;

  displayedColumns = ["Post", "Position", "BillNo", "Date", "AccountNo", "AccountName", "Reading", "Cons", "Credit", "Amount", "Remarks"];
  progressCounter = 0;

  private username:string = this.sessionStorageService.getSession("fullname")!;

  zones:Zone[];

  selectedZone:string = "";
  private currentDate = new Date();
  billingMonth = new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 1));

  zeroCons = false;
  highCons = false;

  constructor(
    private billService:BillService,
    private zoneService:ZoneService,
    private sessionStorageService:SessionStorageServiceService,
    private router:Router,
    private dateFormatService:DateFormatService,
    private consumerService:ConsumerService,
  ) {}

  async ngOnInit() {
    //load zones
    this.zones = await lastValueFrom(this.zoneService.fetchZones());
    //this.loadPendingBills();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    if (this.selection.selected.length) {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    } else {
      return false;
    }

  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: BillInfo): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position! + 1}`;
  }

  async loadPendingBills() {
    const pendingBills = await lastValueFrom(this.billService.fetchPendingBills());
    pendingBills.forEach((pendingBills, index) => {
      pendingBills.position = index + 1;
    });
    this.dataSource = new MatTableDataSource(pendingBills);
    this.dataSource.paginator = this.paginator;
  }

  computeCredit(seniorDiscount:string, advancePayment:string) {
    return parseFloat(seniorDiscount) + parseFloat(advancePayment);
  }

  viewBillInfo(billNumber:string) {
    this.router.navigate([`./billing/bill-info/${billNumber}`]);
  }

  async filterBill(selectedBillingMonth:Date, selectedZone:string, selectedZeroCons:boolean, selectedHighCons:boolean) {
    const newSelectedBillingMonth = this.dateFormatService.convertToMonthYearString(selectedBillingMonth);

    if (selectedZone === "") {
      return;
    }

    let removeZeroCons:string = "";
    //check if zero cons it ticked
    // if (selectedZeroCons === true) {
    //   removeZeroCons = '&& bill.Consumption !== "0"';
    // }

    const bills = await lastValueFrom(this.billService.fetchPendingBills());
    const filterBill = bills.filter(async (bill) => {
      //fetch customer by account number
      //const consumerInfo = await lastValueFrom(this.consumerService.fetchConsumerInfoByAccNo(bill.AccountNumber));

      // let removeHighCons:string = "";
      // //check if zero cons it ticked
      // if (selectedHighCons === true) {
      //   removeHighCons = `&& bill.Consumption > ${consumerInfo.Averagee}`;
      // }
      console.log(removeZeroCons);

      return bill.Zone === selectedZone && bill.BillingMonth === newSelectedBillingMonth + removeZeroCons
    });

    this.dataSource = new MatTableDataSource<BillInfo>(filterBill);
    this.dataSource.paginator = this.paginator;
  }

  async onPostBills() {
    let count = 0;

    for (const [index, billInfo] of this.selection.selected.entries()) {
      const reponse:any = await lastValueFrom(this.billService.postbill(billInfo.BillNo, billInfo.AccountNumber, this.username));
      if (reponse.status === "Bill Posted") {
        this.progressCounter = ((index + 1) / this.selection.selected.length) * 100;
        //this.loadPendingBills();
        count++;
      } else {
        console.log(reponse.status);
      }
    }

    alert(`Posted ${count} Bill`);
    this.selection.clear();
  }

}
