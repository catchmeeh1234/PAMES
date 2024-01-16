import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BillInfo, BillService } from 'src/app/services/bill.service';
import { Consumer, ConsumerService, ScheduleCharges } from 'src/app/services/consumer.service';
import { DateFormatService } from 'src/app/services/date-format.service';
import { DiscountsService } from 'src/app/services/discounts.service';
import { MeterReader, MeterReaderService } from 'src/app/services/meter-reader.service';
import { RateScheduleService } from 'src/app/services/rate-schedule.service';
import { ReadingSettingsService } from 'src/app/services/reading-settings.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { SearchConsumerComponent } from '../search-consumer/search-consumer.component';
import { Data1 } from 'src/app/pages/collection/create-or/create-or.component';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-bill-form',
  templateUrl: './bill-form.component.html',
  styleUrls: ['./bill-form.component.scss']
})
export class BillFormComponent {
  @ViewChild('searchAccount') searchAccount!: ElementRef;
  @ViewChild('currentReading') currentReading!: ElementRef;

  @Input() formData: any;
  billForm:FormGroup;

  meterreaders:MeterReader[] | undefined = [];
  consumerCharges:ScheduleCharges[] = [];
  billCharges:any = [];

  rateName:string;
  rateKwh:any;

  seniorPercentDiscount:number;

  dateTo:Date;
  dateFrom:Date;
  dueDate:Date;

  readingDay = 1;

  data:Data1 = {
    hideEditBtn: true,
  }

  months:string[];
  years:number[];

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

  async ngOnInit() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.billForm = this.formBuilder.group({
      CreatedBy: ['', Validators.required],
      AccountNumber: ['', Validators.required],
      CustomerName: ['', Validators.required],
      ServiceAddress: ['', Validators.required],
      RateSchedule: ['', Validators.required],
      Zone: ['', Validators.required],
      MeterNo: ['', Validators.required],
      IsSenior: [{value: '', disabled: true}, Validators.required],
      Charges: [''],
      CurrentReading: [0, [Validators.required]],
      LastMeterReading: [0, Validators.required],
      Consumption: [0, Validators.required],
      AverageCons: [0, Validators.required],
      MeterReader: ['', Validators.required],
      Amount: [0, Validators.required],
      SeniorDiscount: [0, Validators.required],
      Month: [{value: null, disabled: true}],
      Year: [{value: null, disabled: true}],
      BillingMonth: [''],
      DateFrom: [{value: null, disabled: true}, Validators.required],
      DateTo: [null, Validators.required],
      DueDate: [{value: null, disabled: true}, Validators.required],
      TotalAmountDue: [0, Validators.required],
      DateFromFormatted: [null],
      DateToFormatted: [null],
      DueDateFormatted: [null],
      BillNo: [null],
    });

    //disable senior checkbox
    //this.disableSomeInputs();

    //this.onAmountInputChange();
    this.onLoadDiscounts();
    this.onLoadMeterReaders();
    //populate months and years array
    this.months = this.dateFormatService.months;
    this.years = this.dateFormatService.years;

    if (this.formData.action === "Edit" && this.formData.bill_no) {
      const bill_no = this.formData.bill_no;
      const billInfo = await lastValueFrom(this.billService.fetchBillByBillNo(bill_no));

      this.rateName = billInfo[0].RateSchedule;
      const rate = await lastValueFrom(this.rateScheduleService.loadRateSchedule(this.rateName));
      this.rateKwh = rate[0].kwh;
      this.billCharges = await lastValueFrom(this.billService.fetchBillCharges(bill_no));
      this.populateBillFormOnEdit(billInfo[0], this.rateKwh, this.billCharges);

    }


    this.billForm.get("CurrentReading")?.valueChanges
    .subscribe((currentReading:string) => {
      const lastreading = this.billForm.get("LastMeterReading")?.value;

      if (parseInt(currentReading) < parseInt(lastreading)) {
        console.log("current reading is less than last reading");
        return;
      }
      if (!this.rateName || !this.consumerCharges || !this.rateKwh) {
        console.log("rate name or rate multipler or consumer charges is undefined");
        return;
      }
      const consumption = this.billService.computeConsumption(parseInt(currentReading), lastreading);
      this.billForm.patchValue({Consumption: consumption});

      const energyCharge = this.billService.computeAmountDue(consumption, this.rateKwh);
      let chargeArray:any;

      if (this.formData.action === "Create") {
        chargeArray = this.consumerCharges;
      } else {
        chargeArray = this.billCharges;
      }

      if (chargeArray && chargeArray.length >= 1) {
        const newChargeArray = chargeArray.map((charges:any) => {
          if (charges.ChargeType === "Fixed") {
              charges.Amount = parseFloat(charges.Amount).toFixed(2);
          }

          if (charges.ChargeType === "Amount Percentage") {
            const newCharge = parseFloat(charges.ChargeRate) * energyCharge;
            charges.Amount = newCharge.toFixed(2);
          }

          if (charges.ChargeType === "Cons. Rate") {
            const newCharge = parseFloat(charges.ChargeRate) * consumption;
            charges.Amount = newCharge.toFixed(2);
          }
        });

        if (this.formData.action === "Create") {
          this.consumerCharges = chargeArray;
        } else {
          this.billCharges = chargeArray;
        }
        this.billForm.patchValue({Charges: chargeArray});


      }

      const consumerChargesTotal = this.billService.computeScheduleCharge(chargeArray);

      let seniorDiscount = 0;
      if (this.billForm.get("IsSenior")?.value === true) {
        seniorDiscount = this.billService.computeSeniorDiscount(energyCharge, this.seniorPercentDiscount);
      } else {
        seniorDiscount = 0;
      }

      const totalAmountDue = this.billService.computeTotalAmountDue(energyCharge, consumerChargesTotal, seniorDiscount);

      this.billForm.patchValue({
        Amount: energyCharge,
        SeniorDiscount: seniorDiscount,
        TotalAmountDue: totalAmountDue,
      });
      //this.compute(this.billForm.getRawValue(), this.rateKwh, this.consumerCharges);

    });
    //this.onMonthAndYearInputChange();

    this.billForm.get("DateTo")?.valueChanges.subscribe(dateTo => {
      console.log(dateTo);
      const dueDate = new Date(dateTo);
      dueDate.setDate(dueDate.getDate() + 10);
      this.billForm.patchValue({DueDate: dueDate});
    });
  }

  populateBillFormOnEdit(billData:BillInfo, rateKWH:number, consumerCharges:any) {

    const billingMonth = this.dateFormatService.formatStringToDate(billData.BillingMonth);
      const monthYear = this.dateFormatService.separateMonthYear(billData.BillingMonth);
      if (monthYear.length !== 2) {
        return;
      }
      const month = monthYear[0];
      const year = parseInt(monthYear[1]);

      const consumerChargesTotal = this.billService.computeScheduleCharge(consumerCharges);

      const seniorDiscount = parseFloat(billData.SeniorDiscount);

      const amountDue = parseFloat(billData.AmountDue);
      const totalAmountDue = this.billService.computeTotalAmountDue(amountDue, consumerChargesTotal, seniorDiscount);

      let newReadingDate:string;
      let newDueDate:string;

      if (billData.ReadingDate === "" || billData.ReadingDate === null || billData.ReadingDate === undefined) {
        newReadingDate = this.dateFormatService.formatDate(new Date());
        const dueDate = new Date(newReadingDate);
        dueDate.setDate(dueDate.getDate() + 10);
        newDueDate = this.dateFormatService.formatDate(dueDate);
      } else {
        newReadingDate = billData.ReadingDate;
        newDueDate = billData.DueDate;
      }

      this.billForm.patchValue(billData);
      this.billForm.patchValue({
        ServiceAddress: billData.CustomerAddress,
        IsSenior: billData.isSenior === 'Yes' ? true : false,
        Month: month,
        Year: year,
        BillingMonth: billingMonth,
        DateFrom: billData.DateFrom,
        DateTo:  newReadingDate,
        DueDate: newDueDate,
        CurrentReading: billData.Reading,
        LastMeterReading: billData.PreviousReading,
        Consumption: parseInt(billData.Consumption),
        AverageCons: billData.AverageCons,
        Amount: parseFloat(billData.AmountDue),
        SeniorDiscount: billData.SeniorDiscount,
        TotalAmountDue: totalAmountDue,
        CreatedBy: this.sessionStorageservice.getSession("username"),
        Charges: consumerCharges,
      });
  }

  resetFormValues() {
    this.billForm.patchValue({CurrentReading: 0});

  }

  async searchConsumer() {
    const dialogRef = this.dialog.open(SearchConsumerComponent, {
      data: {
        type: 'create bill'
      }
    });

    dialogRef.afterClosed().subscribe(async (result:Consumer) => {
      if (result) {

        this.billForm.get("AccountNumber")?.setValue(result.AccountNo);

        const event = new KeyboardEvent('keyup', { key: 'Enter' });
        this.searchAccount.nativeElement.dispatchEvent(event);

        // You can now use the 'result' value as needed in your component.
      } else {
        console.log('The dialog was closed without a value.');
      }
    });
  }

  async onLoadRateSchedule(classification:string) {
    const type = await lastValueFrom(this.rateScheduleService.loadRateSchedule(classification));
    this.rateKwh = type[0].kwh;
  }

  async onLoadDiscounts() {
    this.seniorPercentDiscount = 0;
    const seniorDiscount = await lastValueFrom(this.discountsService.loadDiscounts("Senior Citizen"));
    this.seniorPercentDiscount = seniorDiscount[0].DiscountPercent;
  }

  async onLoadReadingDay(zone:string) {
    const reading_day = await lastValueFrom(this.readingSettingsService.loadReadingSettings("reading_day", zone));
    this.readingDay = parseInt(reading_day[0].value);
  }

  async onLoadMeterReaders() {
    this.meterreaders = await lastValueFrom(this.meterReaderService.fetchMeterReader("All"));
  }

  async loadBillCharges(billno:string) {
    const billCharges = await lastValueFrom(this.billService.fetchBillCharges(billno));
    return billCharges;
  }

  async onLoadConsumerCharges(account_no:string, month:string, year:number, ) {
    if (!month || !year) {
      return;
    }
    const months = this.dateFormatService.months;
    const newMonth = months.indexOf(month) + 1;
    console.log(newMonth, year);

    const consumerCharges = await lastValueFrom(this.consumerService.fetchConsumerCharges(account_no));
    this.consumerCharges = consumerCharges.filter(data => data.Recurring === 'Yes' || (data.BillingMonth === newMonth.toString() && data.BillingYear === year.toString()))
                            // .map(charges => {
                            //   if (charges.ChargeType === "Fixed") {
                            //     charges.Amount = parseFloat(charges.Amount).toFixed(2);
                            //   }

                            //   if (charges.ChargeType === "Amount Percentage") {
                            //     const newCharge = parseFloat(charges.ChargeRate) * energyCharge;
                            //     charges.Amount = newCharge.toFixed(2);
                            //   }

                            //   if (charges.ChargeType === "Cons. Rate") {
                            //     const newCharge = parseFloat(charges.ChargeRate) * consumption;
                            //     charges.Amount = newCharge.toFixed(2);
                            //   }
                            // });

    //console.log(this.consumerCharges);

    this.billForm.patchValue({
      Charges: this.consumerCharges,
    });
  }

  private compute(billForm:any, rateKwh:number, consumer_charges:any) {
    const currentReading = billForm.CurrentReading;
    const lastReading = billForm.LastMeterReading;

    const consumption = currentReading - lastReading;
    this.billForm.patchValue({Consumption: consumption});

    //compute amount due
    const energyCharge = this.billService.computeAmountDue(consumption, rateKwh);
    //update computation of charges

    if (consumer_charges && consumer_charges.length >= 1) {
      const newScheduleCharges = consumer_charges.map((charges:any) => {
        if (charges.ChargeType === "Fixed") {
            charges.Amount = parseFloat(charges.Amount).toFixed(2);
        }

        if (charges.ChargeType === "Amount Percentage") {
          const newCharge = parseFloat(charges.ChargeRate) * energyCharge;
          charges.Amount = newCharge.toFixed(2);
        }

        if (charges.ChargeType === "Cons. Rate") {
          const newCharge = parseFloat(charges.ChargeRate) * consumption;
          charges.Amount = newCharge.toFixed(2);
        }
      });

      this.consumerCharges = newScheduleCharges;

    }

    console.log(this.consumerCharges);

    const consumerChargesTotal = this.billService.computeScheduleCharge(consumer_charges);

    let seniorDiscount = 0;
    if (billForm.IsSenior === true) {
      seniorDiscount = this.billService.computeSeniorDiscount(energyCharge, this.seniorPercentDiscount);
    } else {
      seniorDiscount = 0;
    }

    const totalAmountDue = this.billService.computeTotalAmountDue(energyCharge, consumerChargesTotal, seniorDiscount)
    //update amount, senior discount, total amount due

    this.billForm.patchValue({
      Amount: energyCharge,
      SeniorDiscount: seniorDiscount,
      TotalAmountDue: totalAmountDue,
    });

  }

  onAmountInputChange() {
    //listen to any value changes in current reading input
    this.billForm.get("CurrentReading")?.valueChanges
    .subscribe((currentReading:number) => {
      //console.log(typeof currentReading);
      // if (currentReading.toString() === "") {
      //   return;
      // }


    });
  }

  onMonthAndYearInputChange() {
    this.billForm.get("Month")?.valueChanges
    .subscribe(month => {
      let year = this.billForm.get("Year")?.value;

      // const newDate = this.dateFormatService.formatStringToDate(`${month} ${year}`);
      // if (newDate) {
      //   //this.calculateBillingDates(newDate, this.readingDay);
      //   this.billForm.patchValue({DateFrom: this.dateFrom});
      //   this.billForm.patchValue({DateTo: this.dateTo});
      //   this.billForm.patchValue({DueDate: this.dueDate});
      // }

      //update bill charges list
      const accno = this.billForm.get("AccountNumber")?.value;
      this.onLoadConsumerCharges(accno, month, year);

      this.billForm.patchValue({
        CurrentReading: 0,
        BillingMonth: `${month} ${year}`
      });
    });

    this.billForm.get("Year")?.valueChanges
    .subscribe(year => {
      let month = this.billForm.get("Month")?.value;
      // const newDate = this.dateFormatService.formatStringToDate(`${month} ${year}`);
      // if (newDate) {
      //   //this.calculateBillingDates(newDate, this.readingDay);
      //   this.billForm.patchValue({DateFrom: this.dateFrom});
      //   this.billForm.patchValue({DateTo: this.dateTo});
      //   this.billForm.patchValue({DueDate: this.dueDate});
      // }

      //update bill charges list
      const accno = this.billForm.get("AccountNumber")?.value;
      this.onLoadConsumerCharges(accno, month, year);

      this.billForm.patchValue({
        CurrentReading: 0,
        BillingMonth: `${month} ${year}`
      });

    });
  }

  get accountNumber() {
    return this.billForm.get("AccountNumber")?.value;
  }

  private calculateDueAndDisconnectionDate(readingDate:Date) {
    const dueDate = new Date(readingDate);
    dueDate.setDate(readingDate.getDate() + 10);
    const disconnectionDate = new Date(readingDate);
    disconnectionDate.setDate(readingDate.getDate() + 11);

    //add surcharge date if needed
    const dates = {
      dueDate: dueDate,
      disconnectionDate: disconnectionDate,
    }
    return dates;
  }

  async viewBillInfo(accountNumber:string) {
    if (accountNumber === "") {
      return;
    }

    //fetch consumer info by acc no
    const consumerInfo = await lastValueFrom(this.consumerService.fetchConsumerInfoByAccNo(accountNumber));

    this.data.consumerInfo = undefined;
    this.billForm.reset();

    //check if account number exists in the database
    if (Array.isArray(consumerInfo)) {
      if (consumerInfo.length === 0) {
        alert("Account Number does not exist");
        this.searchAccount.nativeElement.select();
        return;
      }
    }

    //get previous month
    const currentDate = new Date();
    const billingMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
    const newBillingMonth = this.dateFormatService.convertToMonthYearString(billingMonth);
    const billMonthArray = this.dateFormatService.separateMonthYear(newBillingMonth);
    if (billMonthArray.length !== 2) {
      this.snackbarService.showError("bill month length is not 2");
      return;
    }
    const month = billMonthArray[0];
    const year = parseInt(billMonthArray[1]);
    this.resetFormValues();
    //await this.onLoadReadingDay(result.Zone);
    //this.calculateBillingDates(currentDate, this.readingDay);

    //check if there is a last reading date for the chosen consumer
    let newDateTo:Date = new Date();
    let newDateFrom:Date;

    if (consumerInfo.LasReadingDate === "" || consumerInfo.LasReadingDate === null) {
      newDateFrom = this.dateFormatService.convertStringToDate(consumerInfo.DateInstalled)!;
    } else {
      newDateFrom = this.dateFormatService.convertStringToDate(consumerInfo.LasReadingDate)!;
    }

    //calculate due date using current date/reading date
    const datesForBilling = this.calculateDueAndDisconnectionDate(newDateTo);

    this.onLoadConsumerCharges(consumerInfo.AccountNo, month, year);

    this.data.consumerInfo = consumerInfo;

    this.billForm.patchValue(consumerInfo);
    this.billForm.patchValue({
      AccountNumber: consumerInfo.AccountNo,
      CustomerName: `${consumerInfo.Firstname} ${consumerInfo.Middlename} ${consumerInfo.Lastname}`,
      Consumption: 0 - consumerInfo.LastMeterReading,
      AverageCons: parseInt(consumerInfo.Averagee),
      IsSenior: consumerInfo.IsSenior === 'Yes' ? true : false,
      Month: month,
      Year: year,
      BillingMonth: newBillingMonth,
      DateFrom: newDateFrom,
      DateTo: newDateTo,
      DueDate: datesForBilling.dueDate,
      CreatedBy: this.sessionStorageservice.getSession("username"),
    });

    this.rateName = consumerInfo.RateSchedule;
    this.onLoadRateSchedule(consumerInfo.RateSchedule);

    this.currentReading.nativeElement.select();

  }

  // calculateBillingDates(selectedDate:Date, reading_day:number) {
  //   //TODO
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

  validateCreationOfBill() {
    if (this.billForm.get("DateFrom")?.value > this.billForm.get("DateTo")?.value) {
      this.snackbarService.showError('Date From is greater than Date To');
      return false;
    }

    if (this.billForm.get("AccountNumber")?.value === "") {
      console.log("please input account number");
      this.snackbarService.showError("please input account number");
      return false;
    }

    if (this.billForm.get("CurrentReading")?.value < parseInt(this.billForm.get("LastMeterReading")?.value)) {
      console.log(this.billForm.get("CurrentReading")?.value, this.billForm.get("LastMeterReading")?.value);

      this.snackbarService.showError("current reading should be greater than last reading / invalid reading");
      return false;
    }

    if (!this.billForm.valid) {
      this.snackbarService.showError("please fill up all necessary information");
      return false;
    }

    return true;

  }

  async onCreateBill() {
    const validate = this.validateCreationOfBill();

    if (validate === true) {
      console.log(this.billForm.getRawValue());

      this.billForm.patchValue({
        DateFromFormatted: this.dateFormatService.formatDate(this.billForm.get("DateFrom")?.value),
        DateToFormatted: this.dateFormatService.formatDate(this.billForm.get("DateTo")?.value),
        DueDateFormatted: this.dateFormatService.formatDate(this.billForm.get("DueDate")?.value),
      });
      //console.log(this.billForm.value);
      const res:any = await lastValueFrom(this.billService.createBill(this.billForm.getRawValue()));
      //console.log(res);

      if (res.status === "Bill Created") {
        this.snackbarService.showSuccess(res.status);
        this.openBillInfo(res.billno);
      } else {
        this.snackbarService.showError(res.status);
      }
    }
  }

  async onEditBill() {
    //this.enableSomeInputs();

    const billData = this.billForm.getRawValue();

    let newDueDate:string;
    if (typeof billData.DueDate === "string") {
      console.log(billData.DueDate);
      newDueDate = billData.DueDate;
    } else {
      newDueDate = this.dateFormatService.formatDate(billData.DueDate);
      console.log(newDueDate, billData.DueDate);
    }

    let newDateto:string;
    if (typeof billData.DateTo === "string") {
      newDateto = billData.DateTo;
    } else {
      newDateto = this.dateFormatService.formatDate(billData.DateTo);
      console.log(newDateto, billData.DateTo);
    }

    const validate = this.validateCreationOfBill();

    if (validate === true) {
      console.log(billData.DateTo, newDueDate);

      this.billForm.patchValue({
        DateFromFormatted: billData.DateFrom,
        DateToFormatted: newDateto,
        DueDateFormatted: newDueDate,
      });

      console.log(this.billForm.getRawValue());

      const res:any = await lastValueFrom(this.billService.updateBill(this.billForm.getRawValue()));
      console.log(res);

      if (res.status === "Bill Updated") {
        this.snackbarService.showSuccess(res.status);
        this.openBillInfo(res.billno);
      } else {
        this.snackbarService.showError(res.status);
      }

    }

  }

  openBillInfo(bill_no:any) {
    this.router.navigate(['./billing/bill-info', bill_no]);
  }

}
