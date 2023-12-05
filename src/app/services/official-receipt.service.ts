import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BillInfo } from './bill.service';

export interface billMonthFormGroup {
  Checked: boolean
  billNumber: string
  monthYear: string
  amountDue: number
  billDetails: BillInfo
}

export interface ORFormGroup {
  orNumber:string
  accountNumber:string
  billingMonth: billMonthFormGroup[]
  reconnectionFee:boolean
  earlyPaymentDiscount:boolean
  modeOfPayment:string
  referenceNumber:string
  checkDate:string
  amountPaid: string
  totalAmountDue:string
  username:string
}

export interface LogicNumber {
  id: string,
  number: string,
  remarks: string,
}

@Injectable({
  providedIn: 'root'
})
export class OfficialReceiptService {

  constructor(
    private http:HttpClient,
  ) { }

  fetchLastORNumber(remarks:string) {
    return this.http.get<LogicNumber[]>(`${environment.API_URL}/OfficialReceipt/fetchLastORNumber.php?remarks=${remarks}`, {responseType: 'json'})
  }

  createOR(orDetails:ORFormGroup) {
    let params = new FormData();
    let json = JSON.stringify(orDetails);
    params.append('orDetails', json);
    return this.http.post(`${environment.API_URL}/OfficialReceipt/createOR.php`, params, { responseType: 'json' });
  }
}
