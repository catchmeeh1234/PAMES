import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchConsumerComponent } from 'src/app/components/search-consumer/search-consumer.component';
import { BillService } from 'src/app/services/bill.service';
import { Consumer, ConsumerService, ScheduleCharges } from 'src/app/services/consumer.service';
import { DateFormatService } from 'src/app/services/date-format.service';
import { DiscountsService } from 'src/app/services/discounts.service';
import { MeterReader, MeterReaderService } from 'src/app/services/meter-reader.service';
import { RateScheduleService } from 'src/app/services/rate-schedule.service';
import { ReadingSettingsService } from 'src/app/services/reading-settings.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-create-single-bill',
  templateUrl: './create-single-bill.component.html',
  styleUrls: ['./create-single-bill.component.scss'],
})
export class CreateSingleBillComponent {
  createBillForm:FormGroup;
  headerData = {
    title: "Create bill",
    url: './billing/bills'
  };

  formData = {
    action: 'Create'
  }

  meterreaders:MeterReader[] | undefined = [];
  consumerCharges:ScheduleCharges[] | undefined = [];

  rateName:string;
  rateKwh:number;

  seniorPercentDiscount:number;

  dateTo:Date;
  dateFrom:Date;
  dueDate:Date;

  readingDay = 1;

  months:string[];
  years:number[];

  //headerData:any;

  constructor(
    private formBuilder:FormBuilder,
    private dialog: MatDialog,
    private meterReaderService:MeterReaderService,
    private consumerService:ConsumerService,
    private rateScheduleService:RateScheduleService,
    private discountsService:DiscountsService,
    private readingSettingsService:ReadingSettingsService,
    private sessionStorageservice:SessionStorageServiceService,
    private billService:BillService,
    private snackbarService:SnackbarService,
    private router:Router,
    private dateFormatService:DateFormatService,
  ) {}

  ngOnInit(): void {
    //const queryParams = this.route.snapshot.queryParamMap;

    // if (queryParams.has('headerData')) {
    //   const objectString = queryParams.get('headerData')!;
    //   const test = JSON.parse(objectString);
    //   console.log(test);

    // }


    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.createBillForm = this.formBuilder.group({
      CreatedBy: ['', Validators.required],
      AccountNumber: ['', Validators.required],
      CustomerName: ['', Validators.required],
      ServiceAddress: ['', Validators.required],
      RateSchedule: ['', Validators.required],
      Zone: ['', Validators.required],
      MeterNo: ['', Validators.required],
      IsSenior: ['', Validators.required],
      Charges: [''],
      CurrentReading: [0, [Validators.required]],
      LastMeterReading: [0, Validators.required],
      Consumption: [0, Validators.required],
      AverageCons: [0, Validators.required],
      MeterReader: ['', Validators.required],
      Amount: [0, Validators.required],
      SeniorDiscount: [0, Validators.required],
      Month: [null],
      Year: [null],
      BillingMonth: [''],
      DateFrom: [null, Validators.required],
      DateTo: [null, Validators.required],
      DueDate: [null, Validators.required],
      TotalAmountDue: [0, Validators.required],
      DateFromFormatted: [null],
      DateToFormatted: [null],
      DueDateFormatted: [null],
    });

    //disable senior checkbox
    this.createBillForm.get('IsSenior')?.disable();
    this.createBillForm.get('DateFrom')?.disable();
    this.createBillForm.get('DateTo')?.disable();
    this.createBillForm.get('DueDate')?.disable();

    // this.onAmountInputChange();
    // this.onMonthAndYearInputChange();

    //populate months and years array
    this.months = this.dateFormatService.months;
    this.years = this.dateFormatService.years;
  }

  // resetFormValues() {
  //   this.createBillForm.patchValue({CurrentReading: 0});

  // }

  // async searchConsumer() {
  //   const dialogRef = this.dialog.open(SearchConsumerComponent);

  //   dialogRef.afterClosed().subscribe(async (result:Consumer) => {
  //     if (result) {
  //       //get previous month
  //       const currentDate = new Date();
  //       const billingMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
  //       const newBillingMonth = this.dateFormatService.convertToMonthYearString(billingMonth);
  //       const billMonthArray = this.dateFormatService.separateMonthYear(newBillingMonth);
  //       if (billMonthArray.length !== 2) {
  //         this.snackbarService.showError("bill month length is not 2");
  //         return;
  //       }
  //       const month = billMonthArray[0];
  //       const year = parseInt(billMonthArray[1]);
  //       this.resetFormValues();
  //       await this.onLoadReadingDay(result.Zone);

  //       this.calculateBillingDates(currentDate, this.readingDay);

  //       this.onLoadConsumerCharges(result.AccountNo, month, year);

  //       this.createBillForm.patchValue(result);
  //       this.createBillForm.patchValue({
  //         AccountNumber: result.AccountNo,
  //         CustomerName: `${result.Firstname} ${result.Middlename} ${result.Lastname}`,
  //         Consumption: 0 - result.LastMeterReading,
  //         AverageCons: parseInt(result.Averagee),
  //         IsSenior: result.IsSenior === 'Yes' ? true : false,
  //         Month: month,
  //         Year: year,
  //         BillingMonth: newBillingMonth,
  //         DateFrom: this.dateFrom,
  //         DateTo: this.dateTo,
  //         DueDate: this.dueDate,
  //         CreatedBy: this.sessionStorageservice.getSession("username"),
  //       });

  //       this.rateName = result.RateSchedule;

  //       this.onLoadMeterReaders();
  //       this.onLoadRateSchedule(result.RateSchedule);
  //       this.onLoadDiscounts();


  //       // You can now use the 'result' value as needed in your component.
  //     } else {
  //       console.log('The dialog was closed without a value.');
  //     }
  //   });
  // }

  // async onLoadMeterReaders() {
  //   this.meterreaders = await this.meterReaderService.fetchMeterReader("All").toPromise();
  // }

  // async onLoadConsumerCharges(account_no:string, month:string, year:number) {
  //   if (!month || !year) {
  //     return;
  //   }
  //   const months = this.dateFormatService.months;
  //   const newMonth = months.indexOf(month) + 1;
  //   console.log(newMonth, year);

  //   const consumerCharges = await this.consumerService.fetchConsumerCharges(account_no).toPromise();
  //   this.consumerCharges = consumerCharges?.filter(data => data.Recurring === 'Yes' || (data.BillingMonth === newMonth.toString() && data.BillingYear === year.toString()))
  //                           // .map(charges => {return { ...charges, TotalAmount: 0.00}});
  //   console.log(this.consumerCharges);

  //   this.createBillForm.patchValue({
  //     Charges: this.consumerCharges,
  //   });
  // }

  // async onLoadRateSchedule(classification:string) {
  //   const type = await this.rateScheduleService.loadRateSchedule(classification).toPromise();
  //   if (type && type.length !== 0) {
  //     this.rateKwh = type[0].kwh;
  //   }
  // }

  // async onLoadDiscounts() {
  //   this.seniorPercentDiscount = 0;
  //   const seniorDiscount = await this.discountsService.loadDiscounts("Senior Citizen").toPromise();
  //   if (seniorDiscount && seniorDiscount.length !== 0) {
  //     this.seniorPercentDiscount = seniorDiscount[0].DiscountPercent;
  //   }
  // }

  // async onLoadReadingDay(zone:string) {
  //   const reading_day = await this.readingSettingsService.loadReadingSettings("reading_day", zone).toPromise();
  //   if (reading_day) {
  //     this.readingDay = parseInt(reading_day[0].value);

  //   }
  // }

  // async onCreateBill() {
  //   if (this.createBillForm.get("AccountNumber")?.value === "") {
  //     console.log("please input account number");
  //     this.snackbarService.showError("please input account number");
  //     return;
  //   }

  //   if (this.createBillForm.get("CurrentReading")?.value < parseInt(this.createBillForm.get("LastMeterReading")?.value)) {
  //     console.log("current reading should be greater than last reading/ invalid reaidng");
  //     this.snackbarService.showError("current reading should be greater than last reading / invalid reading");
  //     return;
  //   }


  //   this.createBillForm.get('IsSenior')?.enable();
  //   this.createBillForm.get('DateFrom')?.enable();
  //   this.createBillForm.get('DateTo')?.enable();
  //   this.createBillForm.get('DueDate')?.enable();

  //   if (this.createBillForm.valid) {
  //     this.createBillForm.patchValue({
  //       DateFromFormatted: this.dateFormatService.formatDate(this.createBillForm.get("DateFrom")?.value),
  //       DateToFormatted: this.dateFormatService.formatDate(this.createBillForm.get("DateTo")?.value),
  //       DueDateFormatted: this.dateFormatService.formatDate(this.createBillForm.get("DueDate")?.value),
  //     });
  //     console.log(this.createBillForm.value);
  //     const res:any = await this.billService.createBill(this.createBillForm.value).toPromise();
  //     console.log(res);

  //     if (res.status === "Bill Created") {
  //       this.snackbarService.showSuccess(res.status);
  //       this.openBillInfo(res.billno);
  //     } else {
  //       this.snackbarService.showError(res.status);
  //     }

  //   } else {
  //     this.snackbarService.showError("please fill up all necessary information");
  //   }

  //   this.createBillForm.get('IsSenior')?.disable();
  //   this.createBillForm.get('DateFrom')?.disable();
  //   this.createBillForm.get('DateTo')?.disable();
  //   this.createBillForm.get('DueDate')?.disable();
  //   //this.createBillForm.reset();
  // }


  // //listeners
  // onAmountInputChange() {
  //   //listen to any value changes in current reading input
  //   this.createBillForm.get("CurrentReading")?.valueChanges
  //   .subscribe((currentReading:number) => {
  //     //console.log(typeof currentReading);
  //     // if (currentReading.toString() === "") {
  //     //   return;
  //     // }

  //     const lastreading = this.createBillForm.get("LastMeterReading")?.value;
  //     const consumption = currentReading - lastreading;
  //     this.createBillForm.patchValue({Consumption: consumption});
  //     //compute amount due
  //     if (this.rateName && this.consumerCharges) {

  //       const energyCharge = this.billService.computeAmountDue(consumption, this.rateKwh);

  //       //update computation of charges
  //       if (this.consumerCharges && this.consumerCharges.length >= 1) {
  //         const newScheduleCharges = this.consumerCharges.map(charges => {
  //           if (charges.ChargeType === "Fixed") {
  //               charges.Amount = parseFloat(charges.Amount).toFixed(2);
  //           }

  //           if (charges.ChargeType === "Amount Percentage") {
  //             const newCharge = parseFloat(charges.ChargeRate) * energyCharge;
  //             charges.Amount = newCharge.toFixed(2);
  //           }

  //           if (charges.ChargeType === "Cons. Rate") {
  //             const newCharge = parseFloat(charges.ChargeRate) * consumption;
  //             charges.Amount = newCharge.toFixed(2);
  //           }
  //         });

  //       }

  //       const consumerCharges = this.billService.computeScheduleCharge(this.consumerCharges);

  //       let seniorDiscount = 0;
  //       if (this.createBillForm.get("IsSenior")?.value === true) {
  //         seniorDiscount = this.billService.computeSeniorDiscount(energyCharge, this.seniorPercentDiscount);
  //       } else {
  //         seniorDiscount = 0;
  //       }

  //       const totalAmountDue = this.billService.computeTotalAmountDue(energyCharge, consumerCharges, seniorDiscount)
  //       //update amount, senior discount, total amount due
  //       this.createBillForm.patchValue({
  //         Amount: energyCharge,
  //         SeniorDiscount: seniorDiscount,
  //         TotalAmountDue: totalAmountDue,
  //       });

  //       //console.log(this.createBillForm.value);
  //     }
  //   });
  // }

  // calculateBillingDates(selectedDate:Date, reading_day:number) {

  //   // Calculate the 5th of the current month
  //   const today = new Date(selectedDate);
  //   today.setDate(reading_day);
  //   this.dateTo = today;


  //   // Calculate the 5th of the previous month
  //   const lastMonth = new Date(selectedDate);
  //   lastMonth.setMonth(lastMonth.getMonth() - 1);
  //   lastMonth.setDate(reading_day);

  //   this.dateFrom = lastMonth;

  //   //calculate due date
  //   this.dueDate = new Date(selectedDate);
  //   this.dueDate.setDate(this.dueDate.getDate() + 10);

  //   //console.log(this.dateTo, this.dateFrom, this.dueDate);

  // }

  // onMonthAndYearInputChange() {
  //   this.createBillForm.get("Month")?.valueChanges
  //   .subscribe(month => {
  //     let year = this.createBillForm.get("Year")?.value;

  //     const newDate = this.dateFormatService.formatStringToDate(`${month} ${year}`);
  //     if (newDate) {
  //       this.calculateBillingDates(newDate, this.readingDay);
  //       this.createBillForm.patchValue({DateFrom: this.dateFrom});
  //       this.createBillForm.patchValue({DateTo: this.dateTo});
  //       this.createBillForm.patchValue({DueDate: this.dueDate});
  //     }

  //     //update bill charges list
  //     const accno = this.createBillForm.get("AccountNumber")?.value;
  //     this.onLoadConsumerCharges(accno, month, year);

  //     this.createBillForm.patchValue({CurrentReading: 0});
  //   });

  //   this.createBillForm.get("Year")?.valueChanges
  //   .subscribe(year => {
  //     let month = this.createBillForm.get("Month")?.value;
  //     const newDate = this.dateFormatService.formatStringToDate(`${month} ${year}`);
  //     if (newDate) {
  //       this.calculateBillingDates(newDate, this.readingDay);
  //       this.createBillForm.patchValue({DateFrom: this.dateFrom});
  //       this.createBillForm.patchValue({DateTo: this.dateTo});
  //       this.createBillForm.patchValue({DueDate: this.dueDate});
  //     }

  //     //update bill charges list
  //     const accno = this.createBillForm.get("AccountNumber")?.value;
  //     this.onLoadConsumerCharges(accno, month, year);

  //     this.createBillForm.patchValue({CurrentReading: 0});

  //   });
  // }

  // openBillInfo(bill_no:any) {
  //   this.router.navigate(['./billing/bill-info', bill_no]);
  // }

  handleChildEvent(event:any) {
    console.log(event);

  }

}
