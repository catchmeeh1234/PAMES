import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ScheduleCharges } from './consumer.service';
import { Zone } from './zone.service';
import { BehaviorSubject } from 'rxjs';

export type BillInfo = {
  billid: string;
  BillNo: string;
  AccountNumber: string;
  CustomerName: string;
  CustomerAddress: string;
  DateFrom: string;
  ReadingDate: string;
  DiscDate: string;
  DueDate: string;
  PreviousReading: string;
  Reading: string;
  BillingMonth: string;
  BillStatus: "Pending" | "Posted" | "Cancelled";
  RateSchedule: string;
  MeterSize: string;
  isSenior: string;
  Consumption: string;
  AmountDue: string;
  AdvancePayment: string;
  Adjustment: string;
  isPaid: string;
  MeterReader: string;
  SeniorDiscount: string;
  MeterNo: string;
  CRNo: any;
  isCollectionCreated: any;
  createdBy: string;
  postedBy: any;
  dateCreated: string;
  datePaid: any;
  AverageCons: string;
  checked?: boolean;
}

export interface BillingMonth {
  billNumber: string,
  billingMonth: string,
  amount: string,
  adjustment: string,
}

export interface BillMonthGroup {
  billNumber: string,
  monthYear: string,
  Checked: boolean,
  amountDue: string,
  billDetails: BillInfo,
  adjustment: string,
}

export interface BillAdjustment {
  billadjustID: string
  RefNo: string
  AccountNo: string
  AccountName: string
  Remarks: string
  BillNo: string
  BillNumberArray: []
  Date: string
  DatePosted: string
  Status: string
  CreatedBy: string
  ApprovedBy: string
  BillCovered: string
  OldAmountDue: string
  OldDiscount: string
  OldPenalty: string
  OldAdvance: string
  NewAmountDue: string
  NewDiscount: string
  NewPenalty: string
  NewAdvance: string
  Category: string
  AssocID?: string
}

@Injectable({
  providedIn: 'root'
})
export class BillService {
  //selectedBill = new BehaviorSubject<any>(null);

  dataSource:any;

  constructor(private http:HttpClient) { }

  // fetchBillByBillNo(billno:string) {
  //   return this.http.get(`${environment.API_URL}/Bills/loadBillByBillNo.php?billno=${billno}`, {responseType: 'json'})
  // }

  fetchBills(accno:string) {
    return this.http.get(`${environment.API_URL}/Bills/loadBills.php?accno=${accno}`, {responseType: 'json'})
  }

  fetchBillByBillNo(billno:string) {
    return this.http.get<BillInfo[]>(`${environment.API_URL}/Bills/loadBillByBillNo.php?billno=${billno}`, {responseType: 'json'})
  }

  fetchBillCharges(billno:string) {
    return this.http.get(`${environment.API_URL}/Bills/loadBillCharges.php?billno=${billno}`, {responseType: 'json'})
  }

  createBill(billInfo:any) {
    let params = new FormData();
    let json = JSON.stringify(billInfo);
    params.append('billInfo', json);
    return this.http.post(`${environment.API_URL}/Bills/createBill.php`, params, { responseType: 'json' });
  }

  updateBill(billInfo:any) {
    let params = new FormData();
    let json = JSON.stringify(billInfo);
    params.append('billInfo', json);
    return this.http.post(`${environment.API_URL}/Bills/updateBill.php`, params, { responseType: 'json' });
  }

  createBills(preparedBills:any, billingMonth:string, zones:string[]) {

    let params = new FormData();
    let json = JSON.stringify(preparedBills);
    params.append('preparedBills', json);
    params.append('billingMonth', billingMonth);
    for (let zone of zones) {
      params.append('zones[]', zone);
    }
    return this.http.post(`${environment.API_URL}/Bills/createBills.php`, params, { responseType: 'json' });
  }


  prepareBills(zones:string[], billingMonth:string, meterReader:string, username:string) {
    let params = new FormData();
    params.append('billingMonth', billingMonth);
    params.append('meterReader', meterReader);
    for (let zone of zones) {
      params.append('zones[]', zone);
    }
    params.append('createdBy', username);

    return this.http.post(`${environment.API_URL}/Bills/prepareBills.php`, params, { responseType: 'json' });
  }

  postbill(billno:string, accno:string, postedBy:string) {
    let params = new FormData();
    params.append('billno', billno);
    params.append('accno', accno);
    params.append('postedBy', postedBy);

    return this.http.post(`${environment.API_URL}/Bills/postBill.php`, params, { responseType: 'json' });
  }

  cancelBill(billInfo:any) {
    let params = new FormData();
    let json = JSON.stringify(billInfo);
    params.append('billInfo', json);
    return this.http.post(`${environment.API_URL}/Bills/cancelBill.php`, params, { responseType: 'json' });
  }

  createBillAdjustment(billAdjustment:any) {
    let params = new FormData();
    let json = JSON.stringify(billAdjustment);
    params.append('billAdjustmentDetails', json);
    return this.http.post(`${environment.API_URL}/Bills/createBillAdjustment.php`, params, { responseType: 'json' });
  }

  editBillAdjustment(billAdjustment:any) {
    let params = new FormData();
    let json = JSON.stringify(billAdjustment);
    params.append('billAdjustmentDetails', json);
    return this.http.post(`${environment.API_URL}/Bills/editBillAdjustment.php`, params, { responseType: 'json' });
  }

  cancelBillAdjustment(billAdjustment:any) {
    let params = new FormData();
    let json = JSON.stringify(billAdjustment);
    params.append('billAdjustmentDetails', json);
    return this.http.post(`${environment.API_URL}/Bills/cancelBillAdjustment.php`, params, { responseType: 'json' });
  }

  postBillAdjustment(billAdjustment:any) {
    let params = new FormData();
    let json = JSON.stringify(billAdjustment);
    params.append('billAdjustmentDetails', json);
    return this.http.post(`${environment.API_URL}/Bills/postBillAdjustment.php`, params, { responseType: 'json' });
  }

  searchBills(billingMonth:string, billStatus:string, zone:string) {
    return this.http.get(`${environment.API_URL}/Bills/searchBill.php?billingMonth=${billingMonth}&billStatus=${billStatus}&zone=${zone}`, { responseType: 'json' });
  }

  printBill(receipt:any) {
    let params = new FormData();
    let json = JSON.stringify(receipt);
    params.append('receipt', json);
    return this.http.post(`${environment.API_URL}/Bills/printBill.php`, params, { responseType: 'json' });

  }

  //non http methods
  computeTotalAmountDue(energyCharge:number, consumerCharges:number, seniorDiscount:number) {
    const total = (energyCharge + consumerCharges) - seniorDiscount;
    return parseFloat(total.toFixed(2));
  }

  computeScheduleCharge(scheduleCharges:ScheduleCharges[]) {
    const total = scheduleCharges.reduce((total, charges) => { return total + parseFloat(charges.Amount)}, 0);
    return parseFloat(total.toFixed(2));
  }

  computeAmountDue(consumption:number, rate:number) {
    const energyCharge = consumption * rate;
    return parseFloat(energyCharge.toFixed(2));
  }

  computeSeniorDiscount(energyCharge:number, discountPercentage:number) {
    const scDiscount = energyCharge * discountPercentage;
    return parseFloat(scDiscount.toFixed(2));
  }

  computeConsumption(currentReading:number, lastReading:number) {
    const consumption = currentReading - lastReading;
    return consumption;
  }

  fetchUnpaidBills(data:string) {
    return this.http.get<BillInfo[]>(`${environment.API_URL}/Bills/loadUnpaidBills.php?data=${data}`, { responseType: 'json' });
  }

  fetchBillAdjustmentByAccNo(accountNumber:string) {
    return this.http.get<BillAdjustment[]>(`${environment.API_URL}/Bills/viewBillAdjustmentByAccNo.php?accountNumber=${accountNumber}`, { responseType: 'json' });
  }

  fetchBillAdjustmentByBillNo(billNumber:string) {
    return this.http.get<BillAdjustment[]>(`${environment.API_URL}/Bills/viewBillAdjustmentByBillNo.php?billNumber=${billNumber}`, { responseType: 'json' });
  }

  fetchBillAdjustmentByRefNo(refNo:string) {
    return this.http.get<BillAdjustment[]>(`${environment.API_URL}/Bills/viewBillAdjustmentByRefNo.php?refNo=${refNo}`, { responseType: 'json' });
  }

}
