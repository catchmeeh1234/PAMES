import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BillInfo, BillingMonth } from './bill.service';

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

export interface ReceiptDetails {
  town: string,
  orNumber: string,
  customerInfo: {
    accountName?: string,
    accountNumber?: string,
    accountAddress?: string,
  },
  currentBill: BillingMonth
  earlyPaymentDiscount: number,
  reconnectionFee: string,
  previousBills: BillingMonth[],
  amountInWords: string,
  username: string,
  actingMunTreasurer1: string,
  actingMunTreasurer2: string,

}

@Injectable({
  providedIn: 'root'
})
export class OfficialReceiptService {
  public printableContent: string = '';

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

  printOR() {
    console.log("print");

  }

  // setPrintableContent(content: string) {
  //   this.printableContent = content;
  // }

  // getPrintableContent(): string {
  //   return this.printableContent;
  // }

  printContent() {
    const printWindow = window.open('', '_blank');
    console.log(this.printableContent);

    if (printWindow) {
      printWindow.document.write('<html><head><title>Print</title></head><body>');
      printWindow.document.write(this.printableContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  }
}
