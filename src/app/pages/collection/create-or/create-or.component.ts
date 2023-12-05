import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subscription, map, of } from 'rxjs';
import { SearchConsumerComponent } from 'src/app/components/search-consumer/search-consumer.component';
import { BillInfo, BillService } from 'src/app/services/bill.service';
import { ChargesService } from 'src/app/services/charges.service';
import { Consumer } from 'src/app/services/consumer.service';
import { Discount, DiscountsService } from 'src/app/services/discounts.service';
import { ORFormGroup, OfficialReceiptService } from 'src/app/services/official-receipt.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { environment } from 'src/environments/environment';

export interface Data {
  hideEditBtn:boolean,
  consumerInfo?:Consumer
}

@Component({
  selector: 'app-create-or',
  templateUrl: './create-or.component.html',
  styleUrls: ['./create-or.component.scss']
})
export class CreateOrComponent {
  public companyName = environment.COMPANY_NAME;
  public companyAddress1 = environment.COMPANY_ADDRESS1;
  public companyAddress2 = environment.COMPANY_ADDRESS2;

  modeOfPayments = ['Cash', 'Check'];

  headerData = {
    title: `Create OR`,
  };

  data: Data = {
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

  constructor(
    private dialog:MatDialog,
    public billService:BillService,
    private formBuilder:FormBuilder,
    private chargesService:ChargesService,
    private officialReceiptService:OfficialReceiptService,
    private discountService:DiscountsService,
    private snackbarService:SnackbarService,
    private sessionStorageService:SessionStorageServiceService,
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
          totalAmount += billingMonth.amountDue; // Adjust this according to your data structure
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
          totalAmount += billingMonth.amountDue; // Adjust this according to your data structure
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
          totalAmount += billingMonth.amountDue; // Adjust this according to your data structure
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
      amountDue: [bill ? this.calculateTotalAmountDue(bill): null, Validators.required],
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

        //validate if the concessionaire has any unpaid bill
        const bills = await this.billService.fetchUnpaidBills(result.AccountNo).toPromise();
        if (!bills) {
          return;
        }
        const billLength = bills.length;
        if (billLength <= 0) {
          this.isPaid = false;
          this.snackbarService.showSuccess("All bills are paid");
          return;
        }

        this.isPaid = true;
        this.orFormGroup.patchValue({
          accountNumber: result.AccountNo,
        });

        //set or number value
        this.orNumber.subscribe((data) => {
          this.orFormGroup.patchValue({
            orNumber: data,
          });
        });

        //DISPLAY CONSUMER'S INFORMATION
        this.data.consumerInfo = result;

        //DISPLAY CONSUMER'S UNPAID BILLS
        this.unpaidBillsSubscription = this.billService.fetchUnpaidBills(result.AccountNo)
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

      } else {
        console.log('The dialog was closed without a value.');
      }
    });
  }

  saveOR(orDetails:FormGroup) {
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
      this.officialReceiptService.createOR(orDetails.value)
      .subscribe((response:any) => {
        if (response.status === "OR Created") {
          alert(response.status);
          //this.snackbarService.showSuccess(response.status);
          this.clearFields();
          this.calculateChange(amountPaid, totalAmountDue);
        } else {
          this.snackbarService.showError(response.status);
        }
      });
    }

  }

  clearFields() {
    console.log(this.orFormGroupValue);

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
