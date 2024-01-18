import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SearchConsumerComponent } from 'src/app/components/search-consumer/search-consumer.component';
import { Consumer, ConsumerService } from 'src/app/services/consumer.service';
import { CollectionBilling, CollectionCharges, CollectionDetails, ORFormGroup, OfficialReceiptService, ReceiptDetails } from 'src/app/services/official-receipt.service';
import { Data1 } from '../create-or/create-or.component';
import { BillInfo, BillService, BillingMonth } from 'src/app/services/bill.service';
import { Subscription, lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { CancelOrComponent } from 'src/app/components/cancel-or/cancel-or.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-or',
  templateUrl: './view-or.component.html',
  styleUrls: ['./view-or.component.scss']
})
export class ViewOrComponent {
  @ViewChild('searchAccount') searchAccount!: ElementRef;

  panelOpenState = false;

  headerData = {
    title: `View OR`,
  };

  data: Data1 = {
    hideEditBtn: true,
  };

  billDetails:BillInfo | null;
  collectionDetails:CollectionDetails[] = [];
  collectionBillings:CollectionBilling[];
  collectionCharges:CollectionCharges[];

  private loadBillSubscription:Subscription;

  public receiptDetails:ReceiptDetails | undefined;

  public selectedOR:CollectionDetails | undefined;


  accountNumber:string = "";
  public consumersResult:Consumer;

  constructor(
    private dialog:MatDialog,
    private officialReceiptService:OfficialReceiptService,
    private billService:BillService,
    private sessionStorageService:SessionStorageServiceService,
    private consumerService:ConsumerService,
    private router:Router,
  ) {}

  searchConsumer() {
    const dialogRef = this.dialog.open(SearchConsumerComponent, {
      data: { type: 'view or' }
    });

    dialogRef.afterClosed().subscribe(async (result:Consumer) => {
      if (result) {
        this.accountNumber = result.AccountNo;

        const event = new KeyboardEvent('keyup', { key: 'Enter' });
        this.searchAccount.nativeElement.dispatchEvent(event);
      }

    });
  }

  async viewORDetailsByAccNo(accountNumber:string) {
    if (accountNumber === "") {
      return;
    }

    try {
      //fetch consumer info by acc no
      const consumerInfo = await lastValueFrom(this.consumerService.fetchConsumerInfoByAccNo(accountNumber));

      this.data.consumerInfo = undefined;
      this.clearFields();

      //check if account number exists in the database
      if (Array.isArray(consumerInfo)) {
        if (consumerInfo.length === 0) {
          alert("Account Number does not exist");
          this.searchAccount.nativeElement.select();
          return;
        }
      }

      //populate consumer summary section
      this.data.consumerInfo = consumerInfo;

      //search all or for this account number
      const collectionDetails = await lastValueFrom(this.officialReceiptService.fetchORDetailsByAccountNo(consumerInfo.AccountNo));
      this.collectionDetails = collectionDetails;
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

  async viewORDetails(orDetails:CollectionDetails) {
    console.log(orDetails);
    this.selectedOR = orDetails;

    //clear bill details and receiptDetails first
    this.billDetails = null;
    this.receiptDetails = undefined;

    try {
      //load collection billing
      const collectionBilling = await lastValueFrom(this.officialReceiptService.fetchORBillingByORNo(orDetails.CRNo));
      this.collectionBillings = collectionBilling;

      //load collection charges
      const collectionCharges = await lastValueFrom(this.officialReceiptService.fetchORChargesByORNo(orDetails.CRNo));
      this.collectionCharges = collectionCharges;

      //load printable content
      this.receiptDetails = this.createReceiptDetails(orDetails, this.collectionBillings, this.collectionCharges, this.data.consumerInfo);

      //update total amount due + adjustment

      //to do tom. add the total adjustment to collection details
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

  loadBill(billNumber:string) {
    try {
      this.loadBillSubscription = this.billService.fetchBillByBillNo(billNumber)
      .subscribe((data) => {
        this.billDetails = data[0];
      })
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

  get amountPaid() {
    //this.amountPaid = (parseFloat(orDetails.TotalAmountDue) + parseFloat(orDetails.AdvancePayment)).toFixed(2);
    //console.log(this.selectedOR);

    if (this.selectedOR) {
      return (parseFloat(this.selectedOR.TotalAmountDue) + parseFloat(this.selectedOR.AdvancePayment)).toFixed(2);
    } else {
      console.log("collection details is undefined");
      return "0";
    }
  }

  createReceiptDetails(orDetails:CollectionDetails, bills:CollectionBilling[], collectionCharges:CollectionCharges[], consumerInfo?:Consumer):ReceiptDetails {
    //let [, ...previousBills] = bills;

    let previousBills:BillingMonth[] = [];

    bills.forEach((bill, index) => {
      console.log(index);

      if (index > 0) {
        const prevBill = {
          billNumber: bill.BillNo,
          billingMonth: bill.BillingDate,
          amount: bill.AmountDue,
          adjustment: bill.Adjustment
        };
        previousBills.push(prevBill);
      }
    });

    const fullName = `${consumerInfo?.Firstname} ${consumerInfo?.Middlename} ${consumerInfo?.Lastname}`;
    const reconnectionFeeAmount = collectionCharges.find(collectionCharges => collectionCharges.Particulars.toLowerCase() === 'reconnection fee');
    let newReconnectionFeeAmount:string;
    if (!reconnectionFeeAmount) {
      newReconnectionFeeAmount = 0.00.toFixed(2);
    } else {
      newReconnectionFeeAmount = reconnectionFeeAmount.Amount;
    }
    //convert amount to words
    const amountToWords = this.officialReceiptService.floatToWords(parseFloat(orDetails.TotalAmountDue));

    return {
      town: environment.TOWN_NAME,
      orNumber: orDetails.CRNo,
      customerInfo: {
        accountName: fullName,
        accountNumber: consumerInfo?.AccountNo,
        accountAddress: consumerInfo?.ServiceAddress
      },
      currentBill: {
        billNumber: bills[0].BillNo,
        billingMonth: bills[0].BillingDate,
        amount: bills[0].AmountDue,
        adjustment: bills[0].Adjustment
      },
      earlyPaymentDiscount: parseFloat(bills[0].earlyPaymentDiscount),
      reconnectionFee: newReconnectionFeeAmount,
      previousBills: previousBills,
      amountInWords: amountToWords,
      totalAmountDue: orDetails.TotalAmountDue,
      username: this.sessionStorageService.getSession("fullname")!,
      actingMunTreasurer1: "Acting Mun-Treasurer",
      actingMunTreasurer2: "By: Ruby L. Patling"
    }

  }

  openCollectionCancel(orDetails:CollectionDetails | undefined) {
    if (!orDetails) {
      return;
    }
    const dialogRef = this.dialog.open(CancelOrComponent, {
      data: {
        headerData: {
          title: "Cancel OR",
        },
        orDetails: orDetails
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result === undefined) {
        return;
      }
      if (result === "OR Cancelled") {
        try {
          const collectionDetails = await lastValueFrom(this.officialReceiptService.fetchORDetailsByAccountNo(orDetails.AccountNo));
          this.clearFields();
          this.collectionDetails = collectionDetails;
          this.selectedOR = undefined;
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

    });
  }

  clearFields() {
    this.selectedOR = undefined;
    this.collectionDetails = [];
    this.collectionBillings = [];
    this.collectionCharges = [];
    this.billDetails = null;
    this.receiptDetails = undefined;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.loadBillSubscription) {
      this.loadBillSubscription.unsubscribe();
    }
  }
}
