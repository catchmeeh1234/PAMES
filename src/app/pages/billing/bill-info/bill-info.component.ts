/// <reference types="w3c-web-usb" />

import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterEvent } from '@angular/router';
import { CancelBillComponent } from 'src/app/components/cancel-bill/cancel-bill.component';
import { ConfirmationPromptComponent } from 'src/app/components/confirmation-prompt/confirmation-prompt.component';
import { PasswordPromptComponent } from 'src/app/components/password-prompt/password-prompt.component';
import { BillInfo, BillService } from 'src/app/services/bill.service';
import { MeterReaderService } from 'src/app/services/meter-reader.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { PasswordStatus } from 'src/app/services/useraccounts.service';
import EscPosEncoder from 'esc-pos-encoder';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bill-info',
  templateUrl: './bill-info.component.html',
  styleUrls: ['./bill-info.component.scss']
})
export class BillInfoComponent {
  //@ViewChild("canvas") canvas: ElementRef<HTMLCanvasElement>;
  encodedImage:any;

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
    private router:Router,
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

  editBill(billno:string) {
    this.router.navigate(['./billing/edit-bill', billno]);
  }

  async onPostBill(billno:string, accno:string) {
    if (this.user) {
      const res:any = await this.billService.postbill(billno, accno, this.user).toPromise();
      //console.log(res);
      if (res.status === "Bill Posted") {
        this.snackbarService.showSuccess(res.status);

        const bill:any = await this.billService.fetchBillByBillNo(billno).toPromise();
        if (bill) {
          this.billInfo = bill[0].BillNo;
          this.loadBillInfo(bill[0].BillNo);
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

  printBill(billInfo:BillInfo) {
    const receipt = {
      companyName: environment.COMPANY_NAME,
      companyAddress1: environment.COMPANY_ADDRESS1,
      companyAddress2: environment.COMPANY_ADDRESS2,
      billInfo: billInfo,
    }

    this.billService.printBill(receipt).subscribe(data => {
      console.log(data);
    });

  }

  //INSTALL ZADIG KAPAG NAG SESECURITY ERROR OLD
  // async printBill() {
  //   let devices = await navigator.usb.getDevices();

  //   if (!devices || devices.length === 0) {
  //     await this.connectToPrinter();
  //     devices = await navigator.usb.getDevices();
  //   }

  //   devices.forEach(device => {
  //     console.log("DEVICE: ", device);
  //   });

  //   let encoder = new EscPosEncoder();

  //   let result = encoder
  //   .initialize()
  //   .text('The quick brown fox jumps over the lazy dog')
  //   .newline()
  //   .qrcode('https://nielsleenheer.com')
  //   .encode();

  //   console.log(JSON.stringify(result));

  //   const newDevices = devices.filter(device =>
  //     device.manufacturerName === 'EPSON' &&
  //     device.productName === 'TM-T88IV'
  //   );

  //   const device = newDevices[0];

  //   await device.open();
  //   await device.selectConfiguration(1);

  //   if (!device.configuration) {
  //     return;
  //   } else {
  //     await device.claimInterface(
  //       device.configuration.interfaces[0].interfaceNumber
  //     );
  //   }


  //   //device.transferOut(1, result);

  //   await device.close();
  // }

  async connectToPrinter() {
    try {
      const filters = [
        { vendorId: 1208, productId: 514 } // Replace these values with the specific vendorId and productId of your printer
      ];
      await navigator.usb.requestDevice({filters});

    } catch (error) {
      console.log("Error on connecting to printer: " , error);

    }
  }

  //DO NOT DELETE REFERENCE FOR FUTURE
  // loadCanvas() {
  //   const imageData = [];
  //   var ctx = this.canvas.nativeElement.getContext("2d");
  //   const img = new Image();
  //   // img.onload = () =>
  //   //  this.onImageLoad(img, ctx, this.canvas.nativeElement, imageData);

  //   const canvas = this.canvas.nativeElement;
  //   img.onload = () => {
  //     const posEncoder = new EscPosEncoder();
  //     this.encodedImage = posEncoder
  //       .initialize()
  //       .image(img, 320, 320, "threshold")
  //       .encode();
  //   };
  //   img.crossOrigin = "Anonymous";
  //   img.src =
  //     "https://c.staticblitz.com/assets/media/client/homepage/images/logo-b1a300e55fb8d38e1cccab1b7754a10b.png";
  // }

  // printText(text:any) {
  //   return new Uint8Array(text.split("").map((char:any) => char.charCodeAt(0)));
  // }
}
