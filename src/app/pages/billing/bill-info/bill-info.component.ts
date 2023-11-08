import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CancelBillComponent } from 'src/app/components/cancel-bill/cancel-bill.component';
import { ConfirmationPromptComponent } from 'src/app/components/confirmation-prompt/confirmation-prompt.component';
import { PasswordPromptComponent } from 'src/app/components/password-prompt/password-prompt.component';
import { BillInfo, BillService } from 'src/app/services/bill.service';
import { MeterReaderService } from 'src/app/services/meter-reader.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { PasswordStatus } from 'src/app/services/useraccounts.service';

@Component({
  selector: 'app-bill-info',
  templateUrl: './bill-info.component.html',
  styleUrls: ['./bill-info.component.scss']
})
export class BillInfoComponent {
  headerData = {
    title: "Bill Info",
    url: "./billing/bills",
  };

  user = this.sessionStorageService.getSession("username");
  isReadOnly = true;

  BillDiscount: any = [];
  displayedColumns: string[] = ['Charges', 'Amount'];
  billStatus:string;

  meterReaders:any;
  billcharges:any;

  billInfoForm: FormGroup;

  billno:string;
  billInfo:BillInfo;

  constructor(
    private fb: FormBuilder,
    private meterReaderService:MeterReaderService,
    private billService:BillService,
    private sessionStorageService:SessionStorageServiceService,
    private snackbarService:SnackbarService,
    private route:ActivatedRoute,
    private dialog:MatDialog,
  ) {
    this.billInfoForm = this.fb.group({
      BillNo: ['', Validators.required],
      AccountNumber: ['', Validators.required],
      CustomerName: ['', [Validators.required]],
      CustomerAddress: ['', [Validators.required]],

      MeterNo: ['', [Validators.required]],
      Reading: ['', [Validators.required]],
      PreviousReading: ['', [Validators.required]],
      Consumption: ['', [Validators.required]],
      AverageCons: ['', [Validators.required]],
      MeterReader: ['', [Validators.required]],

      BillingMonth: ['', [Validators.required]],
      DateFrom: ['', [Validators.required]],
      ReadingDate: ['', [Validators.required]],
      DueDate: ['', [Validators.required]],

      AmountDue: ['', [Validators.required]],
      SeniorDiscount: ['', [Validators.required]],

      totalAmountDue: ['', [Validators.required]],
    });

  }

  ngOnInit() {
    const bill_no = this.route.snapshot.params['bill_no'];
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadBillInfo(bill_no);
  }

  async loadBillInfo(billno:string) {
    const billInfo = await this.billService.fetchBillByBillNo(billno).toPromise();

    if (billInfo && billInfo.length === 1) {
      this.billInfo = billInfo[0];

      await this.loadMeterReader();
      await this.loadBillCharges(billInfo[0].BillNo);
      //console.log(billInfo);
      this.billInfoForm.patchValue(billInfo[0]);

      const scheduleCharges = this.billService.computeScheduleCharge(this.billcharges)
      const totalAmountDue = this.billService.computeTotalAmountDue(parseFloat(billInfo[0].AmountDue), scheduleCharges, parseFloat(billInfo[0].SeniorDiscount));

      this.billInfoForm.patchValue({ totalAmountDue: totalAmountDue });

      this.billStatus = billInfo[0].BillStatus;
      //console.log(this.billInfoForm.value);

      this.BillDiscount = [];
      this.BillDiscount.push({
        Name: "Senior",
        isSenior: billInfo[0].isSenior
      });
    }
  }

  async loadMeterReader() {
   this.meterReaders = await this.meterReaderService.fetchMeterReader("All").toPromise();
  }

  async loadBillCharges(billno:string) {
    this.billcharges = await this.billService.fetchBillCharges(billno).toPromise();
    //console.log(this.billcharges);
  }

  async onPostBill(billno:string, accno:string) {
    if (this.user) {
      const res:any = await this.billService.postbill(billno, accno, this.user).toPromise();
      //console.log(res);
      if (res.status === "Bill Posted") {
        this.snackbarService.showSuccess(res.status);

        const bill:any = await this.billService.fetchBillByBillNo(billno).toPromise();
        if (bill) {
          this.billInfo = bill[0];
          this.loadBillInfo(bill[0]);
        }
      } else {
        this.snackbarService.showError(res.status);
      }
    }
  }

  cancelBill(billInfo:BillInfo) {
    const dialogRef = this.dialog.open(PasswordPromptComponent, {
      data: {
        headerData: {
          title: "Authorization",
        },
        message: `Are you sure you want to cancel Bill Number: ${billInfo.BillNo} ?`,
      }
    });

    dialogRef.afterClosed().subscribe((result:PasswordStatus) => {
      if (result === undefined) {
        return;
      }

      // Handle the result if needed
      if (result.status === "access granted") {
        const dialogRef = this.dialog.open(CancelBillComponent, {
          data: {
            headerData: {
              title: "Cancel Bill",
            },
            billInfo: billInfo
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result === undefined) {
            return;
          }
          if (result.status === "Bill Cancelled") {
            this.loadBillInfo(billInfo.BillNo);
          }

        });
      }
    });
  }
}
