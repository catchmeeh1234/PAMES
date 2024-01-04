import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subscription, map, of } from 'rxjs';
import { SearchConsumerComponent } from 'src/app/components/search-consumer/search-consumer.component';
import { BillInfo, BillMonthGroup, BillService } from 'src/app/services/bill.service';
import { ChargesService } from 'src/app/services/charges.service';
import { Consumer, ConsumerService } from 'src/app/services/consumer.service';
import { Discount, DiscountsService } from 'src/app/services/discounts.service';
import { ORFormGroup, OfficialReceiptService, ReceiptDetails } from 'src/app/services/official-receipt.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { environment } from 'src/environments/environment';

export interface Data1 {
  hideEditBtn:boolean,
  consumerInfo?:Consumer
}

@Component({
  selector: 'app-create-or',
  templateUrl: './create-or.component.html',
  styleUrls: ['./create-or.component.scss']
})
export class CreateOrComponent {
  @ViewChild('searchAccount') searchAccount!: ElementRef;
  @ViewChild('printReceipt1') printReceipt!: ElementRef;

  public companyName = environment.COMPANY_NAME;
  public companyAddress1 = environment.COMPANY_ADDRESS1;
  public companyAddress2 = environment.COMPANY_ADDRESS2;

  modeOfPayments = ['Cash', 'Check'];

  headerData = {
    title: `Create OR`,
  };

  data: Data1 = {
    hideEditBtn: true,
  };

  account_no:string;

  unpaidBills$:Observable<BillInfo[]>;
  billDetails:BillInfo;
  totalAmountDue:number;

  orFormGroup:FormGroup;
  orFormGroupValue:ORFormGroup;

  reconnectionFee:string;
  earlyPaymentRate:string;

  isCheck = false;

  orNumber:Observable<string | undefined>;
  earlyPaymentDiscount:Observable<Discount | undefined>;

  earlyPaymentDiscountSubscription:Subscription;
  reconnectionFeeSubscription:Subscription;
  loadBillSubscription:Subscription;
  unpaidBillsSubscription:Subscription;

  isPaid = false;

  receiptDetails:ReceiptDetails | undefined;

  constructor(
    private dialog:MatDialog,
    public billService:BillService,
    private formBuilder:FormBuilder,
    private chargesService:ChargesService,
    private officialReceiptService:OfficialReceiptService,
    private discountService:DiscountsService,
    private snackbarService:SnackbarService,
    private sessionStorageService:SessionStorageServiceService,
    private consumerService:ConsumerService,
  ) {}


  ngOnInit(): void {
    //get latest or number from the database
    this.orNumber = this.loadLastORNumber();

    //get early payment discount
    this.earlyPaymentDiscount = this.loadEarlyPaymentDiscount();
    this.earlyPaymentDiscountSubscription = this.earlyPaymentDiscount.subscribe((discount) => {
      this.earlyPaymentRate = discount?.DiscountPercent.toString()!;
    });

    this.reconnectionFeeSubscription = this.loadReconnectionFee().subscribe((amount => {
      this.reconnectionFee = amount!;
    }));

    this.orFormGroup = this.formBuilder.group({
      orNumber: ['', Validators.required],
      accountNumber: ['', Validators.required],
      billingMonth: this.formBuilder.array([]),
      reconnectionFee: [true, Validators.required],
      earlyPaymentDiscount: [true, Validators.required],
      earlyPaymentDiscountAmount: [0.00, Validators.required],
      modeOfPayment: ['Cash', Validators.required],
      referenceNumber: [''],
      checkDate: [''],
      amountPaid: ['', Validators.required],
      totalAmountDue: ["0.00", Validators.required],
      username: this.sessionStorageService.getSession("fullname"),
    });

    //save default form value
    this.orFormGroupValue = this.orFormGroup.value;

    //LISTEN TO FORMS ARRAY BILLING MONTH CHECKSTATE
    const formArray = this.orFormGroup.get('billingMonth') as FormArray;
    formArray.valueChanges.subscribe((billingMonth) => {
      //let totalAmount = this.calculateTotalAmountDue(billingMonth);
      let totalAmount= 0;

      billingMonth.forEach((billingMonth:any) => {
        if (billingMonth.Checked) {
          // Perform calculations or update totalAmount based on the checked status
          // Example: assuming each item has an 'amount' field
          totalAmount += parseFloat(billingMonth.totalAmountDue) ; // Adjust this according to your data structure
        }
      });

      //add reconnection fee
      if (this.orFormGroup.get('reconnectionFee')?.value) {
        totalAmount += parseFloat(this.reconnectionFee); // Add the reconnection fee amount
      }

      //add early payment discount
      if (this.orFormGroup.get('earlyPaymentDiscount')?.value) {
        const earlyPaymentDisc = this.calculateEarlyPaymentDiscount(parseFloat(this.earlyPaymentRate), this.latestBillAmountDue);
        const newEarlyPaymentDisc = Number(earlyPaymentDisc).toFixed(2);
        totalAmount -= parseFloat(newEarlyPaymentDisc);
      }

      const newTotalAmount = totalAmount.toFixed(2);

      this.orFormGroup.patchValue({
        totalAmountDue: newTotalAmount,
        amountPaid: newTotalAmount,
      }, { emitEvent: false });
    });

    // Subscribe to changes in the reconnection fee checkbox
    this.orFormGroup.get('reconnectionFee')?.valueChanges.subscribe((isChecked) => {
      // Trigger recalculation of totalamountdue when reconnection fee checkbox changes
      const billingMonth = (this.orFormGroup.get('billingMonth') as FormArray).value;
      let totalAmount = 0;

      billingMonth.forEach((billingMonth:any) => {
        if (billingMonth.Checked) {
          // Perform calculations or update totalAmount based on the checked status
          // Example: assuming each item has an 'amount' field
          totalAmount += parseFloat(billingMonth.totalAmountDue); // Adjust this according to your data structure
        }
      });

      // Add reconnection fee if the checkbox is checked
      if (isChecked) {
        totalAmount += parseFloat(this.reconnectionFee); // Add the reconnection fee amount
      }

      //add early payment discount
      if (this.orFormGroup.get('earlyPaymentDiscount')?.value) {
        const earlyPaymentDisc = this.calculateEarlyPaymentDiscount(parseFloat(this.earlyPaymentRate), this.latestBillAmountDue);
        const newEarlyPaymentDisc = Number(earlyPaymentDisc).toFixed(2);
        totalAmount -= parseFloat(newEarlyPaymentDisc);
      }

      const newTotalAmount = totalAmount.toFixed(2);
      // Update the 'totalamountdue' FormControl in the main FormGroup
      this.orFormGroup.patchValue({
        totalAmountDue: newTotalAmount,
        amountPaid: newTotalAmount,
      }, { emitEvent: false }); // Avoid triggering infinite loop due to value changes
    });

    //LISTEN TO PAYMENT METHOD
    this.orFormGroup.get('modeOfPayment')?.valueChanges.subscribe((selectedValue) => {
      if (selectedValue === 'Cash') {
        //show check container
        // Remove validators
        this.isCheck = false;
        this.orFormGroup.get('referenceNumber')?.clearValidators();
        this.orFormGroup.get('referenceNumber')?.updateValueAndValidity();
        this.orFormGroup.get('checkDate')?.clearValidators();
        this.orFormGroup.get('checkDate')?.updateValueAndValidity();
      } else {
        this.isCheck = true;
        this.orFormGroup.get('referenceNumber')?.setValidators(Validators.required);
        this.orFormGroup.get('referenceNumber')?.updateValueAndValidity();
        this.orFormGroup.get('checkDate')?.setValidators(Validators.required);
        this.orFormGroup.get('checkDate')?.updateValueAndValidity();
      }
    });

    //LISTEN TO EARLY PAYMENT DISCOUNT CHECK STATE
    this.orFormGroup.get('earlyPaymentDiscount')?.valueChanges.subscribe((isChecked) => {
      // Trigger recalculation of totalamountdue when reconnection fee checkbox changes
      const billingMonth = (this.orFormGroup.get('billingMonth') as FormArray).value;
      let totalAmount = 0;

      billingMonth.forEach((billingMonth:any) => {
        if (billingMonth.Checked) {
          // Perform calculations or update totalAmount based on the checked status
          // Example: assuming each item has an 'amount' field
          totalAmount += parseFloat(billingMonth.totalAmountDue); // Adjust this according to your data structure
        }
      });

      // Add reconnection fee if the checkbox is checked
      if (this.orFormGroup.get('reconnectionFee')?.value) {
        totalAmount += parseFloat(this.reconnectionFee); // Add the reconnection fee amount
      }

      //add early payment discount
      if (isChecked) {
        const earlyPaymentDisc = this.calculateEarlyPaymentDiscount(parseFloat(this.earlyPaymentRate), this.latestBillAmountDue);
        const newEarlyPaymentDisc = Number(earlyPaymentDisc).toFixed(2);
        totalAmount -= parseFloat(newEarlyPaymentDisc);
      }

      const newTotalAmount = totalAmount.toFixed(2);
      // Update the 'totalamountdue' FormControl in the main FormGroup
      this.orFormGroup.patchValue({
        totalAmountDue: newTotalAmount,
        amountPaid: newTotalAmount,
      }, { emitEvent: false }); // Avoid triggering infinite loop due to value changes
    });
  }

  loadLastORNumber() {
    const orNumber = this.officialReceiptService.fetchLastORNumber("CR Number")
    .pipe(map((response) => {
      return response.length > 0 ? response[0].number : undefined;
    })
    );

    return orNumber;
  }

  loadEarlyPaymentDiscount() {
    const earlyPayment = this.discountService.loadDiscounts("Early Payment Discount")
    .pipe(map((response) => {
      return response.length > 0 ? response[0] : undefined;
    })
    );

    return earlyPayment;
  }

  loadReconnectionFee() {
    const reconnectionFee = this.chargesService.loadCharges()
    .pipe(
      map((charge) => {
        const newCharge = charge.filter(charge => charge.Particular === 'Reconnection Fee');
        return newCharge.length > 0 ? newCharge[0].Amount : undefined;
      })
    );

    return reconnectionFee;

    // const charges = await this.chargesService.loadCharges().toPromise();
    // if (charges) {
    //   const reconnectionFee = charges.filter(charge => charge.Particular === 'Reconnection Fee');
    //   this.reconnectionFee = reconnectionFee[0].Amount;
    // }
  }

  loadBill(billNumber:string) {
    //this.billDetails = billInfo;
    this.loadBillSubscription = this.billService.fetchBillByBillNo(billNumber)
    .subscribe((data) => {
      this.billDetails = data[0];
    })

  }

  get accountNumber() {
    return this.orFormGroup.get('accountNumber')?.value;
  }

  get billingMonthFormArray(): FormArray {
    return this.orFormGroup.get('billingMonth') as FormArray;
  }

  get totalAmountDueAllUnPaidBills() {
    const totalAmountDue:string = this.orFormGroup.get("totalAmountDue")?.value
    return totalAmountDue;
  }

  get billAmountDue() {
    const amountDue = parseFloat(this.billDetails.AmountDue) - parseFloat(this.billDetails.SeniorDiscount);
    return amountDue.toFixed(2);
  }

  get latestBillAmountDue(): number {
    if (this.billingMonthFormArray.length != 0) {
      let billAmountDue = 0;
      for (let index = 0; index < this.billingMonthFormArray.length; index++) {
        const isChecked = this.billingMonthFormArray.at(index).value.Checked;
        const amountDue = this.billingMonthFormArray.at(index).value.amountDue;

        if (isChecked) {
          billAmountDue = amountDue;
          break;
        }
      }
      return billAmountDue;
    } else {
      return 0.00;
    }
  }

  setUnpaidBills(bills:BillInfo[]) {
    for (let [index, bill] of bills.entries()) {
      this.billingMonthFormArray.push(this.createBillGroup(bill));
    }
  }

  createBillGroup(bill:BillInfo): FormGroup {
    const billMonthGroup = this.formBuilder.group({
      billNumber: [bill ? bill.BillNo: null, Validators.required],
      monthYear: [bill ? bill.BillingMonth: null, Validators.required],
      Checked: [bill ? bill.checked: null, Validators.required],
      amountDue: [bill ? bill.AmountDue: null, Validators.required],
      totalAmountDue: [bill ? this.calculateTotalAmountDue(bill): null, Validators.required],
      billDetails: [bill ? bill: null, Validators.required],
    });

    return billMonthGroup;
  }


  get billingMonthYear() {
    return this.billingMonthFormArray.get("monthYear")?.value;
  }

  get billNumber() {
    return this.billingMonthFormArray.get("billNumber")?.value;
  }


  //calculate total amount due of all unpaid bills
  calculateTotalAmountDue(billInfo:BillInfo) {
    let total = 0;
    if (billInfo.checked === true) {
      total = (parseFloat(billInfo.AmountDue) - parseFloat(billInfo.SeniorDiscount));
    }
    return Number(total.toFixed(2));
  }

  calculateEarlyPaymentDiscount(rate:number | undefined, amountDue:number) {
    if (rate) {
      const earlyPayment = amountDue * rate!;
      return Number(earlyPayment.toFixed(2));
    } else {
      return 0.00;
    }

  }

  searchConsumer() {
    const dialogRef = this.dialog.open(SearchConsumerComponent, {
      data: { type: 'create or' }
    });

    dialogRef.afterClosed().subscribe(async (result:Consumer) => {
      if (result) {
        //clear fields
        this.clearFields();

        this.orFormGroup.get("accountNumber")?.patchValue(result.AccountNo);

        const event = new KeyboardEvent('keyup', { key: 'Enter' });
        this.searchAccount.nativeElement.dispatchEvent(event);
      } else {
        console.log('The dialog was closed without a value.');
      }
    });
  }

  async viewBillInfo(accountNumber:string) {
    //fetch consumer information
    const consumerInfo = await this.consumerService.fetchConsumerInfoByAccNo(accountNumber).toPromise();
    if (!consumerInfo) {
      return;
    }

    const data = {
      AccountNumber: consumerInfo.AccountNo,
      IsPaid: "No",
      BillStatus: "Posted",
      IsCollectionCreated: "Yes",
    };
    const newData = JSON.stringify(data);
    //validate if the concessionaire has any unpaid bill
    const bills = await this.billService.fetchUnpaidBills(newData).toPromise();

    if (!bills) {
      return;
    }
    const billLength = bills.length;

    if (billLength <= 0) {
      this.isPaid = false;


      //get last customer payment
      const lastPaidOR = await this.officialReceiptService.fetchLastPaidORByAccountNo(consumerInfo.AccountNo).toPromise();

      if (lastPaidOR?.length === 1) {
        const message = `All bills are paid. \nLast Payment Details: \nCRNo: ${lastPaidOR[0].CRNo} \nAmount: ${lastPaidOR[0].TotalAmountDue} \nDate: ${lastPaidOR[0].PaymentDate}`;
        alert(message);
        //this.snackbarService.showSuccess(message, 0);
      } else {
        alert("No Bills for this account yet");
      }

      return;
    }

    this.isPaid = true;
    this.orFormGroup.patchValue({
      accountNumber: consumerInfo.AccountNo,
    });

    //set or number value
    this.orNumber.subscribe((data) => {
      this.orFormGroup.patchValue({
        orNumber: data,
      });
    });

    //DISPLAY CONSUMER'S INFORMATION
    this.data.consumerInfo = consumerInfo;

    //DISPLAY CONSUMER'S UNPAID BILLS
    this.unpaidBillsSubscription = this.billService.fetchUnpaidBills(newData)
    .pipe(
      map(bills => bills.map(bill => ({ ...bill, checked: true })))
    )
    .subscribe(data => {
      this.setUnpaidBills(data);

      //asign default display for Bill section
      this.billDetails = data[0];

      //GET TOTAL AMOUNT DUE OF ALL UNPAID BILLS
      let totalAmountDue = 0;

      for (const bill of data) {
        totalAmountDue += this.calculateTotalAmountDue(bill);
      }

      //add recon fee
      if (this.orFormGroup.get('reconnectionFee')?.value) {
        totalAmountDue += parseFloat(this.reconnectionFee); // Add the reconnection fee amount
      }

      //loop through all unpaid bills
      let billAmountDue = 0;
      for (let index = 0; index < this.billingMonthFormArray.length; index++) {
        console.log(this.billingMonthFormArray.at(index).value);
        const isChecked = this.billingMonthFormArray.at(index).value.Checked;
        const amountDue = this.billingMonthFormArray.at(index).value.amountDue;

        if (isChecked) {
          billAmountDue = amountDue;
          break;
        }
      }

      //add early payment discount
      if (this.orFormGroup.get('earlyPaymentDiscount')?.value) {
        const earlyPaymentDisc = this.calculateEarlyPaymentDiscount(parseFloat(this.earlyPaymentRate), this.latestBillAmountDue);
        const newEarlyPaymentDisc = Number(earlyPaymentDisc).toFixed(2);
        totalAmountDue -= parseFloat(newEarlyPaymentDisc);
      }


      //this.totalAmountDue = totalAmountDue;

      //set amountPaid
      this.orFormGroup.patchValue({
        amountPaid: totalAmountDue.toFixed(2)
      })
    });

  }

  async saveOR(orDetails:FormGroup) {

    //there should atleast be one bill selected
    const newORDetails:ORFormGroup = orDetails.value;
    const billingMonth = newORDetails.billingMonth;

    const atLeastOneHasTrue = billingMonth.some(bill =>
      Object.values(bill).some(value => value === true)
    );

    if (!atLeastOneHasTrue) {
      this.snackbarService.showError("please select atleast one bill");
      return;
    }

    const amountPaid:number = orDetails.value.amountPaid;
    const totalAmountDue:number = orDetails.value.totalAmountDue;

    if (amountPaid < totalAmountDue) {
      this.snackbarService.showError("Insufficient Payment");
      return;
    }

    if (orDetails.valid) {
      console.log(orDetails.value);

      const createOR:any = await this.officialReceiptService.createOR(orDetails.value).toPromise();
      if (createOR.status === "OR Created") {
        alert(createOR.status);
          this.calculateChange(amountPaid, totalAmountDue);
          //this.snackbarService.showSuccess(response.status);
          //print OR
          this.receiptDetails = this.createReceiptDetails(newORDetails, this.billingMonthFormArray.value, this.data.consumerInfo);

          if (this.printReceipt && this.printReceipt.nativeElement) {
            setTimeout(() => {
              this.printReceipt.nativeElement.click();
              this.clearFields();
            }, 1000);
          } else {
            console.log('Button element not found.');
          }

      } else {
        this.snackbarService.showError(createOR.status);
      }
    }

  }

  clearFields() {
    this.data.consumerInfo = undefined;
    this.billingMonthFormArray.clear();
    this.orFormGroup.reset(this.orFormGroupValue);
    this.isPaid = false;
  }

  calculateChange(amountPaid:number, totalAmountDue:number) {
    const change = amountPaid - totalAmountDue;
    if (change < 0) {
      alert("Insufficient Payment");
      //this.snackbarService.showError("Insufficient Payment");
      return;
    } else {
      alert(`Customer Change is ${change.toFixed(2)} pesos`);
    }
  }

  createReceiptDetails(orDetails:ORFormGroup, bills:BillMonthGroup[], consumerInfo?:Consumer):ReceiptDetails | undefined {
    const billingMonth = orDetails.billingMonth;
    const atLeastOneHasTrue = billingMonth.some(bill =>
      Object.values(bill).some(value => value === true)
    );

    if (!atLeastOneHasTrue) {
      this.snackbarService.showError("please select atleast one bill");
      return undefined;
    }

    //remove bills that are not marked as checked
    // Filtering objects with checked === true
    const newBills = bills.filter((bill) => bill.Checked === true);
    let previousBills:any = [];

    newBills.forEach((bill, index) => {
      if (index > 0) {
        const prevBill = {
          billNumber: bill.billNumber,
          billingMonth: bill.monthYear,
          amount: bill.amountDue,
        };

        previousBills.push(prevBill);
      }
    });

    const fullName = `${consumerInfo?.Firstname} ${consumerInfo?.Middlename} ${consumerInfo?.Lastname}`;

    //convert amount to words
    const amountToWords = this.officialReceiptService.floatToWords(parseFloat(orDetails.totalAmountDue));

    //variables
    let reconnectionFeeAmount = "0";
    let earlyPaymentDiscountTotal = 0;

    //check if reconnection fee is ticked
    if (orDetails.reconnectionFee === true) {
      reconnectionFeeAmount = this.reconnectionFee;
    }

    //check if early payment discount is ticked
    if (orDetails.earlyPaymentDiscount === true) {
      earlyPaymentDiscountTotal = this.calculateEarlyPaymentDiscount(parseFloat(this.earlyPaymentRate), this.latestBillAmountDue)
    }

    return {
      town: environment.TOWN_NAME,
      orNumber: orDetails.orNumber,
      customerInfo: {
        accountName: fullName,
        accountNumber: consumerInfo?.AccountNo,
        accountAddress: consumerInfo?.ServiceAddress
      },
      currentBill: {
        billNumber: newBills[0].billNumber,
        billingMonth: newBills[0].monthYear,
        amount: newBills[0].amountDue,
      },
      earlyPaymentDiscount: earlyPaymentDiscountTotal,
      reconnectionFee: reconnectionFeeAmount,
      previousBills: previousBills,
      amountInWords: amountToWords,
      totalAmountDue: orDetails.totalAmountDue,
      username: this.sessionStorageService.getSession("fullname")!,
      actingMunTreasurer1: "Acting Mun-Treasurer",
      actingMunTreasurer2: "By: Ruby L. Patling"
    }
  }

  async test() {
    this.receiptDetails = this.createReceiptDetails(this.orFormGroup.value, this.billingMonthFormArray.value, this.data.consumerInfo);

    // Access the buttonToClick element here
    if (this.printReceipt && this.printReceipt.nativeElement) {
      setTimeout(() => {
        this.printReceipt.nativeElement.click();
      }, 500);
    } else {
      console.log('Button element not found.');
    }
  }

  ngOnDestroy(): void {
    if (this.earlyPaymentDiscountSubscription) {
      this.earlyPaymentDiscountSubscription.unsubscribe();
    }
    if (this.reconnectionFeeSubscription) {
      this.reconnectionFeeSubscription.unsubscribe();
    }
    if (this.loadBillSubscription) {
      this.loadBillSubscription.unsubscribe();

    }
    if (this.unpaidBillsSubscription) {
      this.unpaidBillsSubscription.unsubscribe();
    }
  }

}
