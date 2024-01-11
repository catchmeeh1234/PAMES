import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PasswordPromptComponent } from 'src/app/components/password-prompt/password-prompt.component';
import { SearchConsumerComponent } from 'src/app/components/search-consumer/search-consumer.component';
import { BillAdjustment, BillInfo, BillService } from 'src/app/services/bill.service';
import { Consumer } from 'src/app/services/consumer.service';
import { DateFormatService } from 'src/app/services/date-format.service';
import { DiscountsService } from 'src/app/services/discounts.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { PasswordStatus, UseraccountsService } from 'src/app/services/useraccounts.service';

type BillAdjustmentMode = "Query" | "Add" | "Edit";

@Component({
  selector: 'app-bill-adjustment',
  templateUrl: './bill-adjustment.component.html',
  styleUrls: ['./bill-adjustment.component.scss']
})
export class BillAdjustmentComponent {
  @ViewChild('searchAccount') searchAccount!: ElementRef;
  mode:BillAdjustmentMode = "Query";

  accountNumber:string;
  dataSource = new MatTableDataSource<BillAdjustment>();

  displayedColumns = ["ReferenceNo", "BillNo", "Remarks", "Adjustment", "Status"];
  showErrorMessage:boolean = false;

  billAdjustmentForm:FormGroup;
  originalBillAdjustmentFormValues:any;
  billNumberArray:string[] = [];

  categories = ["Billing", "Due To Leak"];

  billNumbers:string[] = [];
  oldBillTotal:number = 0.00;
  newBillTotal:number = 0.00;

  constructor(
    private dialog:MatDialog,
    private billService:BillService,
    private formBuilder:FormBuilder,
    private userAccountsService:UseraccountsService,
    private sessionStorageService:SessionStorageServiceService,
    private snackbarService:SnackbarService,
    private dateFormatService:DateFormatService,
    private discountService:DiscountsService,
  ) {}

  ngOnInit(): void {
    this.billAdjustmentForm = this.formBuilder.group({
      RefNo: ['', Validators.required],
      ApprovedBy: ['', Validators.required],
      Status: ['', Validators.required],
      Date: [new Date(), Validators.required],
      NewDate: [new Date()],
      Category: ['', Validators.required],
      BillNo: ['', Validators.required],
      BillInfo: ['', Validators.required],
      isSenior: [false, Validators.required],
      OldAmountDue: [0.00, Validators.required],
      OldDiscount: [0.00, Validators.required],
      OldAdvance: [0.00, Validators.required],
      OldBillTotal: [0.00, Validators.required],
      NewAmountDue: [0.00, Validators.required],
      NewDiscount: [0.00, Validators.required],
      NewAdvance: [0.00, Validators.required],
      NewBillTotal: [0.00, Validators.required],
      Remarks: ['', Validators.required],
    });

    this.originalBillAdjustmentFormValues = this.billAdjustmentForm.value;

    this.billAdjustmentForm.disable();

    //listen to changes in billNo
    this.billAdjustmentForm.get("BillNo")?.valueChanges
    .subscribe(async (billNo:string) => {
      if (!billNo) {
        return;
      }

      if (this.mode === "Add") {
        const billInfo = await this.billService.fetchBillByBillNo(billNo).toPromise();
        if (!billInfo) {
          return;
        }

        this.billAdjustmentForm.patchValue({
          isSenior: billInfo[0].isSenior === 'Yes' ? true : false,
          BillInfo: billInfo[0]
        });
        //populate old and new amount due, discount, advance payment
        const oldAmountDue = parseFloat(billInfo[0].AmountDue);
        const oldDiscount = parseFloat(billInfo[0].SeniorDiscount);
        const oldAdvance = parseFloat(billInfo[0].AdvancePayment);

        //compute bill total
        const oldBillTotal = oldAmountDue - (oldDiscount + oldAdvance);

        this.billAdjustmentForm.patchValue({
          OldAmountDue: oldAmountDue,
          OldDiscount: oldDiscount,
          OldAdvancePayment: oldAdvance,
          OldBillTotal: oldBillTotal,
        });
        this.oldBillTotal = oldBillTotal;
      }
    });

    //listen to changes in new amount due, discount and advance payment
    this.billAdjustmentForm.get("NewAmountDue")?.valueChanges
    .subscribe(async (newAmountDue:number) => {
      if (typeof newAmountDue === "string") {
        newAmountDue = parseFloat(newAmountDue);
      }

      this.newBillTotal = 0;
      this.newBillTotal = Number((newAmountDue - (this.newDiscount + this.newAdvance)).toFixed(2));
    });

    this.billAdjustmentForm.get("NewDiscount")?.valueChanges
    .subscribe(async (newDiscount:number) => {
      if (typeof newDiscount === "string") {
        newDiscount = parseFloat(newDiscount);
      }

      this.newBillTotal = 0;
      this.newBillTotal = Number((this.newAmountDue - (newDiscount + this.newAdvance)).toFixed(2));

    });

    this.billAdjustmentForm.get("NewAdvance")?.valueChanges
    .subscribe(async (newAdvance:number) => {
      if (typeof newAdvance === "string") {
        newAdvance = parseFloat(newAdvance);
      }

      this.newBillTotal = 0;
      this.newBillTotal = Number((this.newAmountDue - (this.newDiscount + newAdvance)).toFixed(2));
    });

    //listen to senior citizen checkbox check state
    // this.billAdjustmentForm.get("isSenior")?.valueChanges
    // .subscribe(async (isChecked:boolean) => {
    //   if (this.mode === "Add" || this.mode === "Edit") {
    //     //compute discount base on amount due
    //     let newDiscount = 0.00;

    //     //fetch senior discount on database
    //     const seniorDiscount = await this.discountService.loadDiscounts("Senior Citizen").toPromise();
    //     if (!seniorDiscount) {
    //       return;
    //     }
    //     //to do tom
    //     if (isChecked) {
    //       newDiscount = this.billAdjustmentForm.get("OldAmountDue")?.value * seniorDiscount[0].DiscountPercent;
    //     }
    //     this.billAdjustmentForm.patchValue({
    //       NewDiscount: newDiscount
    //     });
    //   }

    // });
  }

  // setBillNoGroup(bills:BillInfo[]) {
  //   for (let [index, bill] of bills.entries()) {
  //     this.billingNoFormArray.push(this.createBillNoGroup(bill));
  //   }
  // }

  // createBillNoGroup(bill:BillInfo): FormGroup {
  //   const billNoGroup = this.formBuilder.group({
  //     billNumber: [bill ? bill.BillNo: null, Validators.required],
  //   });

  //   return billNoGroup;
  // }

  searchConsumer(mode:BillAdjustmentMode) {
    const dialogRef = this.dialog.open(SearchConsumerComponent, {
      data: {
        type: 'create bill'
      }
    });

    dialogRef.afterClosed().subscribe(async (result:Consumer) => {
      if (!result) {
        return;
      }
      if (mode === "Query") {
        this.mode = "Query";

        this.accountNumber = result.AccountNo;

        const event = new KeyboardEvent('keyup', { key: 'Enter' });
        this.searchAccount.nativeElement.dispatchEvent(event);

      } else if (mode === "Add") {
        this.addBillAdjustment(result.AccountNo);
      } else {
        console.log("Mode is neither Query nor Add");
        return;
      }
    });
  }

  async viewBillAdjustmentByAccNo(accountNumber:string) {
    this.billAdjustmentForm.reset(this.originalBillAdjustmentFormValues);
    this.billAdjustmentForm.disable();

    this.showErrorMessage = true;

    const billAdjustment = await this.billService.fetchBillAdjustmentByAccNo(accountNumber).toPromise();
    if (!billAdjustment) {
      return;
    }

    //populate bill adjustment records table
    this.dataSource.data = billAdjustment;

    if (billAdjustment.length === 0) {
      this.searchAccount.nativeElement.select();
    }
  }

  async viewBilladjustmentDetails(billAdjustmentDetails:BillAdjustment) {
    this.billAdjustmentForm.disable();

    //populate other bill adjustment details
    //this.billInfo = billInfo[0];

    this.billAdjustmentForm.patchValue(billAdjustmentDetails);

    this.billNumberArray = [];
    this.billNumberArray.push(billAdjustmentDetails.BillNo);

    //load bill info
    const billInfo = await this.billService.fetchBillByBillNo(billAdjustmentDetails.BillNo).toPromise();
    if (!billInfo) {
      return;
    }
    this.billAdjustmentForm.patchValue({
      BillInfo: billInfo[0],
      isSenior: billInfo[0].isSenior === 'Yes' ? true : false,
    })

    //load bills
    const data = {
      AccountNumber: billAdjustmentDetails.AccountNo,
      IsPaid: "No",
      BillStatus: "Posted",
      IsCollectionCreated: "Yes",
    };
    const newData = JSON.stringify(data);
    const bills = await this.billService.fetchUnpaidBills(newData).toPromise();
    if (!bills) {
      console.log("error fetching unpaid bills");
      return;
    }
    //this.bills = bills;

    const oldAmountDue = parseFloat(billAdjustmentDetails.OldAmountDue);
    const oldDiscount = parseFloat(billAdjustmentDetails.OldDiscount);
    const oldAdvance = parseFloat(billAdjustmentDetails.OldAdvance);

    const newAmountDue = parseFloat(billAdjustmentDetails.NewAmountDue);
    const newDiscount = parseFloat(billAdjustmentDetails.NewDiscount);
    const newAdvance = parseFloat(billAdjustmentDetails.NewAdvance);
    const remarks = billAdjustmentDetails.Remarks;
    //compute bill total
    const oldBillTotal = Number((oldAmountDue - (oldDiscount + oldAdvance)).toFixed(2));

    //compute new bill total
    const newBillTotal = Number((newAmountDue - (newDiscount + newAdvance)).toFixed(2));

    // this.billAdjustmentForm.patchValue({

    //   OldAmountDue: oldAmountDue,
    //   OldDiscount: oldDiscount,
    //   OldAdvancePayment: oldAdvance,
    //   NewAmountDue: newAmountDue,
    //   NewDiscount: newDiscount,
    //   NewAdvancePayment: newAdvance,
    //   OldBillTotal: oldBillTotal,
    //   NewBillTotal: newBillTotal,
    //   remarks: remarks
    // });
    this.oldBillTotal = oldBillTotal;
    this.newBillTotal = newBillTotal;
    console.log(this.billAdjustmentForm.getRawValue());

  }

  // get billingNoFormArray(): FormArray {
  //   return this.billAdjustmentForm.get('BillNumberArray') as FormArray;
  // }

  async addBillAdjustment(accountNumber:string) {
    //load bills
    const data = {
      AccountNumber: accountNumber,
      IsPaid: "No",
      BillStatus: "Posted",
      IsCollectionCreated: "Yes",
    };

    const newData = JSON.stringify(data);
    const bills = await this.billService.fetchUnpaidBills(newData).toPromise();

    if (!bills) {
      console.log("error fetching unpaid bills");
      return;
    }
    //check if there are any posted bills
    if (bills.length <= 0) {
      this.snackbarService.showError("No Bills to be adjusted");
      return;
    }

    //check if there are any pending bill adjustments
    const billAdjustmentByAccNo = await this.billService.fetchBillAdjustmentByAccNo(accountNumber).toPromise();
    if (!billAdjustmentByAccNo) {
      return;
    }
    const hasPendingBillAdjustment = billAdjustmentByAccNo.some(obj =>
      obj.Status === 'Pending'
    );
    if (hasPendingBillAdjustment) {
      this.snackbarService.showError(`There are Pending Bill Adjustment for account no. ${accountNumber}`);
      console.log('Array contains an object with status "Pending".');
      return;
    }

    this.dataSource.data = [];
    this.showErrorMessage = false;
    this.accountNumber = "";
    this.mode = "Add";
    this.billAdjustmentForm.reset(this.originalBillAdjustmentFormValues);

    this.billAdjustmentForm.enable();

    //fetch reference number of bill adjustment
    const refNo = await this.userAccountsService.fetchLogicNumbers("Bill Adjustment").toPromise();
    if (!refNo) {
      console.log("error fetching reference number");
      return;
    }

    //populate form
    this.billAdjustmentForm.patchValue({
      RefNo: refNo[0].number,
      Status: 'Pending',
      ApprovedBy: this.sessionStorageService.getSession("fullname"),
    });

    this.billNumberArray = [];
    for (const bill of bills) {
      this.billNumberArray.push(bill.BillNo);
    }

  }

  openAddBillAdjustment() {
    const dialogRef = this.dialog.open(PasswordPromptComponent, {
      data: {
        headerData: {
          title: "Authorization",
        },
      }
    });

    dialogRef.afterClosed().subscribe((result:PasswordStatus) => {
      if (result === undefined) {
        return;
      }
      if (result.status === "access granted") {
        this.searchConsumer("Add");

      }

    });
  }

  async onPostBillAdjustment() {
    const newDate = this.dateFormatService.formatDate(new Date());
    const billAdjustmentDetails = this.billAdjustmentForm.getRawValue();

    billAdjustmentDetails.Status = "Posted";
    billAdjustmentDetails.DatePosted = newDate;
    billAdjustmentDetails.ApprovedBy = this.sessionStorageService.getSession("fullname");
    billAdjustmentDetails.NewBillTotal = this.newBillTotal;
    billAdjustmentDetails.OldBilltotal = this.oldBillTotal;

    const response:any = await this.billService.postBillAdjustment(billAdjustmentDetails).toPromise();
    if (response.status === "Bill Adjustment Posted") {
      //fetch bill adjustment to database
      const billAdjustment = await this.billService.fetchBillAdjustmentByRefNo(billAdjustmentDetails.RefNo).toPromise();
      if (!billAdjustment) {
        return;
      }
      this.viewBilladjustmentDetails(billAdjustment[0]);

      //refresh bill adjustment table
      const data =  await this.billService.fetchBillAdjustmentByAccNo(billAdjustment[0].AccountNo).toPromise();
      if (!data) {
        return;
      }

      this.dataSource.data = data;
    } else {
      this.snackbarService.showError(response.status);
      console.log(response.status);
      return;
    }
  }

  async onCancelBillAdjustment() {
    const newDate = this.dateFormatService.formatDate(new Date());
    const billAdjustmentDetails = this.billAdjustmentForm.getRawValue();

    billAdjustmentDetails.NewStatus = "Cancelled";
    billAdjustmentDetails.LedgerDate = newDate;

    billAdjustmentDetails.NewBillAdjustment = 0.00;

    billAdjustmentDetails.NewBillTotal = this.newBillTotal;
    billAdjustmentDetails.OldBilltotal = this.oldBillTotal;

    const result:any = await this.billService.cancelBillAdjustment(billAdjustmentDetails).toPromise();

    if (result.status === "Bill Adjustment Cancelled") {
      this.snackbarService.showSuccess(result.status);

      //fetch bill adjustment to database
      const billAdjustment = await this.billService.fetchBillAdjustmentByRefNo(billAdjustmentDetails.RefNo).toPromise();
      if (!billAdjustment) {
        return;
      }
      this.viewBilladjustmentDetails(billAdjustment[0]);

      //refresh bill adjustment table
      const data =  await this.billService.fetchBillAdjustmentByAccNo(billAdjustment[0].AccountNo).toPromise();
      if (!data) {
        return;
      }

      this.dataSource.data = data;
    } else{
      this.snackbarService.showError(result.status);
      console.log(result.status);
    }

  }

  onEditBillAdjustment() {
    this.mode = "Edit";
    this.billAdjustmentForm.enable();
  }

  async saveEditBillAdjustment() {
    const billAdjustmentDetails = this.billAdjustmentForm.getRawValue();

    const result:any = await this.billService.editBillAdjustment(billAdjustmentDetails).toPromise();
    if (!result) {
      return;
    }
    if (result.status === "Bill Adjustment Edited") {
      this.snackbarService.showSuccess(result.status);
      this.mode = "Query";
      this.billAdjustmentForm.disable();
      //refresh bill adjustment table
      const data =  await this.billService.fetchBillAdjustmentByAccNo(billAdjustmentDetails.BillInfo.AccountNumber).toPromise();
      if (!data) {
        return;
      }

      this.dataSource.data = data;
    } else {
      this.snackbarService.showError(result.status);
      console.log(result.status);

    }
  }

  async cancelEditBillAdjustment() {
    this.mode = "Query";
    this.billAdjustmentForm.disable();

    //fetch bill adjustment to database
    const billAdjustment = await this.billService.fetchBillAdjustmentByRefNo(this.billAdjustmentForm.getRawValue().RefNo).toPromise();
    if (!billAdjustment) {
      return;
    }
    this.viewBilladjustmentDetails(billAdjustment[0]);
  }

  async onSaveBillAdjustment() {
    if (this.newBillTotal <= 0) {
      this.snackbarService.showError("Old Total can not be less than or equal to 0");
      return;
    }

    //update newbill total of form group
    this.billAdjustmentForm.patchValue({
      NewBillTotal: this.newBillTotal
    });

    const newDate = this.dateFormatService.formatDate(this.billAdjustmentForm.get("Date")?.value);
    this.billAdjustmentForm.patchValue({
      NewDate: newDate
    });

    const billAdjustment:any = await this.billService.createBillAdjustment(this.billAdjustmentForm.value).toPromise();
    if (!billAdjustment) {
      return;
    }

    if (billAdjustment.status === "Bill Adjusted") {
      this.snackbarService.showSuccess(billAdjustment.status);
      this.mode = "Query";

      //fetch bill adjustment by ref no
      const billAdjustmentDetails = await this.billService.fetchBillAdjustmentByRefNo(this.billAdjustmentForm.value.RefNo).toPromise();
      if (!billAdjustmentDetails) {
        return;
      }
      this.viewBilladjustmentDetails(billAdjustmentDetails[0]);
    } else {
      console.log(billAdjustment.status);
      this.snackbarService.showError(billAdjustment.status);
      return;
    }

  }

  computeAdjustment(adjustmentDetails:BillAdjustment) {
    const totalold = parseFloat(adjustmentDetails.OldAmountDue) - (parseFloat(adjustmentDetails.OldDiscount) + parseFloat(adjustmentDetails.OldAdvance));
    const totalnew = parseFloat(adjustmentDetails.NewAmountDue) - (parseFloat(adjustmentDetails.NewDiscount) + parseFloat(adjustmentDetails.NewAdvance));
    const combinedTotal = totalnew - totalold;
    return Number(combinedTotal.toFixed(2));
  }

  onInputChange(e:any) {
    const value = e.value;
    if (value === "" || value === null) {
      this.showErrorMessage = false;
    }
  }

  setInputValueToZero(event: Event, formControlName:string) {
    const inputValue = (event.target as HTMLInputElement).value;

    //if first character in a string is zero remove it from the string
    if (inputValue[0] === '0') {
      let newStr = inputValue.substring(1); // Removes the first character
      this.billAdjustmentForm.patchValue({
        [formControlName]: parseFloat(newStr)
      }, { emitEvent: false });
    }

    if (inputValue.trim() === '') {
      this.billAdjustmentForm.patchValue({
        [formControlName]: 0
      }, { emitEvent: false });
    }
  }


  get billAdjustmentStatus():string {
    return this.billAdjustmentForm.get("Status")?.value;
  }

  get referenceNumber():string {
    return this.billAdjustmentForm.get("RefNo")?.value;
  }

  get approvedBy():string {
    return this.billAdjustmentForm.get("ApprovedBy")?.value;
  }

  get billInfo():BillInfo {
    return this.billAdjustmentForm.get("BillInfo")?.value;
  }

  get newAmountDue():number {
    return parseFloat(this.billAdjustmentForm.get("NewAmountDue")?.value);
  }

  get newDiscount():number {
    return parseFloat(this.billAdjustmentForm.get("NewDiscount")?.value);
  }

  get newAdvance():number {
    return parseFloat(this.billAdjustmentForm.get("NewAdvance")?.value);
  }

}
