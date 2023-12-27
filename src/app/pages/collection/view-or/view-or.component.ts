import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SearchConsumerComponent } from 'src/app/components/search-consumer/search-consumer.component';
import { Consumer } from 'src/app/services/consumer.service';
import { CollectionBilling, CollectionCharges, CollectionDetails, ORFormGroup, OfficialReceiptService, ReceiptDetails } from 'src/app/services/official-receipt.service';
import { Data1 } from '../create-or/create-or.component';
import { BillInfo, BillService, BillingMonth } from 'src/app/services/bill.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';

@Component({
  selector: 'app-view-or',
  templateUrl: './view-or.component.html',
  styleUrls: ['./view-or.component.scss']
})
export class ViewOrComponent {
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

  constructor(
    private dialog:MatDialog,
    private officialReceiptService:OfficialReceiptService,
    private billService:BillService,
    private sessionStorageService:SessionStorageServiceService,
  ) {}

  searchConsumer() {
    const dialogRef = this.dialog.open(SearchConsumerComponent, {
      data: { type: 'view or' }
    });

    dialogRef.afterClosed().subscribe(async (result:Consumer) => {
      this.clearFields();
      if (result) {
        //populate consumer summary section
        this.data.consumerInfo = result;

        //search all or for this account number
        const collectionDetails = await this.officialReceiptService.fetchORDetailsByAccountNo(result.AccountNo).toPromise();
        if (collectionDetails) {
          this.collectionDetails = collectionDetails;
        }
      }
    });
  }

  async viewORDetails(orDetails:CollectionDetails) {
    //clear bill details and receiptDetails first
    this.billDetails = null;
    this.receiptDetails = undefined;

    //load collection billing
    const collectionBilling = await this.officialReceiptService.fetchORBillingByORNo(orDetails.CRNo).toPromise();
    if (collectionBilling) {
      this.collectionBillings = collectionBilling;
    }
    //load collection charges
    const collectionCharges = await this.officialReceiptService.fetchORChargesByORNo(orDetails.CRNo).toPromise();
    if (collectionCharges) {
      this.collectionCharges = collectionCharges;
    }

    //load printable content
    this.receiptDetails = this.createReceiptDetails(orDetails, this.collectionBillings, this.collectionCharges, this.data.consumerInfo);

  }

  loadBill(billNumber:string) {
    this.loadBillSubscription = this.billService.fetchBillByBillNo(billNumber)
    .subscribe((data) => {
      this.billDetails = data[0];
    })
  }

  get amountPaid() {
    //this.amountPaid = (parseFloat(orDetails.TotalAmountDue) + parseFloat(orDetails.AdvancePayment)).toFixed(2);

    if (this.collectionDetails && this.collectionDetails.length === 1) {
      return (parseFloat(this.collectionDetails[0].TotalAmountDue) + parseFloat(this.collectionDetails[0].AdvancePayment)).toFixed(2);
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
        };
        previousBills.push(prevBill);
      }
    });

    const fullName = `${consumerInfo?.Firstname} ${consumerInfo?.Middlename} ${consumerInfo?.Lastname}`;
    const reconnectionFeeAmount = collectionCharges.find(collectionCharges => collectionCharges.Particulars.toLowerCase() === 'reconnection fee')!;

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
      },
      earlyPaymentDiscount: parseFloat(bills[0].earlyPaymentDiscount),
      reconnectionFee: reconnectionFeeAmount?.Amount,
      previousBills: previousBills,
      amountInWords: amountToWords,
      totalAmountDue: orDetails.TotalAmountDue,
      username: this.sessionStorageService.getSession("fullname")!,
      actingMunTreasurer1: "Acting Mun-Treasurer",
      actingMunTreasurer2: "By: Ruby L. Patling"
    }
  }

  openCollectionCancel() {
    
  }

  clearFields() {
    this.data.consumerInfo = undefined;
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
