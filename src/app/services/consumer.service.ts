import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, catchError, filter, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Charges } from './charges.service';

export type Consumer = {
  Consumer_id: string
  AccountNo: string
  Lastname: string
  Firstname: string
  Middlename: string
  ServiceAddress: string
  ContactNo: string
  Averagee: string
  ReadingSeqNo: string
  CustomerStatus: string
  IsSenior: string
  Zone: string
  RateSchedule: string
  DateCreated: string
  DateInstalled: string
  InstalledBy: string
  MeterNo: string
  CompanyName?: any
  CreatedBy: any
  LastMeterReading: number
  LandMark: string
  MeterSize?: any
  LastBill?: any
  LasReadingDate?: any
  AdvancePayment?: any
  PicturePath?: any
  ConsImage?: any
}

export interface ConsumerInput {
  AccountNo: string;
  Lastname: string;
  Firstname: string;
  Middlename?: string;
  ServiceAddress: string;
  LandMark: string;
  ContactNo: string;
  MeterNo: string;
  ReadingSeqNo: string;
  ZoneName: string;
  RateSchedule: string;
  dateCreated: Date | string;
  dateInstalled: Date | string;
  CustomerStatus: string;
  IsSenior: string;
}

type CustomerStatus = {
  id: number,
  status_name: string,
};

type ConsumerSummary = {
  Name : string,
  Count: number
}


//sample only delete after
export interface Product {
  products: ProductInfo[]
  total: number
  skip: number
  limit: number
}

export interface ProductInfo {
  id: number
  title: string
  description: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand: string
  category: string
  thumbnail: string
  images: string[]
}

export interface ConsumerLedgerData {
  id: number
  title: string
  description: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand: string
  category: string
  thumbnail: string
  images: string[]
}

export interface RequestStatus {
  status: string
}

export type ScheduleCharges = {
  ScheduleChargesID: string;
  ChargeID: string;
  ChargeType: string;
  ChargeRate: string;
  Category: string;
  Entry: string;
  Particular: string;
  AccountNumber: string;
  Amount: string;
  Remarks: string;
  Recurring: string;
  Monthh: string;
  BillingMonth: string;
  BillingYear: string;
  DateCreated: string;
  ActiveInactive: string;
  CreatedBy: string;
  TotalAmount: number;
}

export interface ScheduleChargesAdding {
  ScheduleChargesID?: string
  Charge: Charges
  IsActive: boolean
  IsRecurring: boolean
  BillingMonth: number
  BillingYear: number
  Remarks: string
  AccountNumber?: string
  CreatedBy?: string
}


@Injectable({
  providedIn: 'root'
})
export class ConsumerService {
  consumerChargesDataSource:MatTableDataSource<ScheduleCharges>;

  consumerLedger$:Observable<ConsumerLedgerData[]>;
  consumerInfo$:Observable<Consumer[]>

  //dataSource = new MatTableDataSource<Consumer>();
  dataSource:MatTableDataSource<Consumer>;
  consumerSummary:ConsumerSummary[] = [];

  constructor(private http:HttpClient) { }

  fetchConsumers(top=""): Observable<Consumer[]> {
    return this.http.get<Consumer[]>(`${environment.API_URL}/Consumers/viewConsumers.php?top=${top}`, {responseType: 'json'})
    .pipe(
      catchError(() => of([]))
    );
  }

  searchConsumer(search:string, zone:string="", status:string="") {
    return this.http.get(`${environment.API_URL}/Consumers/searchConsumer.php?search=${search}&status=${status}&zone=${zone}`, { responseType: 'json' });
  }

  fetchConsumerInfo(consumer_id:string) {
    return this.http.get<Consumer[]>(`${environment.API_URL}/Consumers/viewConsumerInfo.php?consumer_id=${consumer_id}`, {responseType: 'json'})
  }

  fetchConsumerInfoByAccNo(accountNo:string) {
    return this.http.get<Consumer>(`${environment.API_URL}/Consumers/viewConsumerInfoByAccNo.php?accountNo=${accountNo}`, {responseType: 'json'})
  }

  fetchConsumerLedger(accno:string) {
    return this.http.get<ConsumerLedgerData[]>(`${environment.API_URL}/Consumers/viewConsumerLedgerData.php?account_no=${accno}`, {responseType: 'json'});

  }

  fetchConsumerCharges(account_no:string) {
    return this.http.get<ScheduleCharges[]>(`${environment.API_URL}/Consumers/viewConsumerCharges.php?account_no=${account_no}`, {responseType: 'json'});
  }

  fetchProducts() {
    return this.http.get<Product>(`https://dummyjson.com/products`, {responseType: 'json'})
  }

  fetchConsumerStatus() {
    return this.http.get<CustomerStatus[]>(`${environment.API_URL}/Consumers/viewConsumerStatus.php`, {responseType: 'json'});
  }

  addConsumers(consumerInfo:ConsumerInput) {
    let params = new FormData();
    let json = JSON.stringify(consumerInfo);
    params.append('consumerInfo', json);
    return this.http.post(`${environment.API_URL}/Consumers/addConsumer.php`, params, { responseType: 'json' });
  }

  addScheduleCharge(scheduleChargeInfo:ScheduleChargesAdding) {
    let params = new FormData();
    let json = JSON.stringify(scheduleChargeInfo);
    params.append('scheduleChargeInfo', json);
    return this.http.post(`${environment.API_URL}/Consumers/addScheduleCharge.php`, params, { responseType: 'json' });
  }

  editScheduleCharge(scheduleChargeInfo:ScheduleChargesAdding) {
    let params = new FormData();
    let json = JSON.stringify(scheduleChargeInfo);
    params.append('scheduleChargeInfo', json);
    return this.http.post(`${environment.API_URL}/Consumers/editScheduleCharge.php`, params, { responseType: 'json' });
  }

  loadConsumerSummary() {
    let consumerSummary:ConsumerSummary[] = [];

    this.fetchConsumers().subscribe(data => {

      //get all customers
      let obj = {
        Name: 'Total Consumer',
        Count: data.length
      };
      consumerSummary.push(obj);

      //get active customers
      const active = data.filter(toFilter => toFilter.CustomerStatus === "Active");
      obj = {
        Name: 'Total Active',
        Count: active.length
      }
      consumerSummary.push(obj);

      //get disconnected customers
      const disconnected = data.filter(toFilter => toFilter.CustomerStatus === "Disconnected");
      obj = {
        Name: 'Total Disconnected',
        Count: disconnected.length
      }
      consumerSummary.push(obj);

      this.consumerSummary = consumerSummary;

    });
  }
  updateConsumerInfo(consumerInfo:Consumer) {
    let params = new FormData();
    let json = JSON.stringify(consumerInfo);
    params.append('consumerInfo', json);

    return this.http.post<RequestStatus>(`${environment.API_URL}/Consumers/updateConsumerInfo.php`, params, {responseType: "json"});
  }
}
