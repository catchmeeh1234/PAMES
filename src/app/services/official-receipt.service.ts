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
  totalAmountDue: string,
  username: string,
  actingMunTreasurer1: string,
  actingMunTreasurer2: string,

}

export interface CollectionDetails {
  position?: number,
  CollectionID: string
  CRNo: string
  AccountNo: string
  AccountName: string
  Address: string
  CheckNo: string
  CheckDate: string
  TotalAmountDue: string
  AdvancePayment: string
  PaymentDate: string
  Collector: string
  Office: string
  PaymentType: string
  CollectionStatus: string
  Cancelled: string
  OnlineRefNo: string
}

export interface CollectionBilling {
  CollectionBillingID: string
  CRNo: string
  AccountNo: string
  AccountName: string
  Address: string
  Zone: string
  BillingDate: string
  PaymentDate: string
  BIllType: string
  BillNo: string
  AmountDue: string
  Discount: string
  earlyPaymentDiscount: string
  Penalty: string
  AdvancePayment: string
  CollectionBillingStatus: string
  Cancelled: string
  Adjustment: string
  OnlineRefNo: string
}

export interface CollectionCharges {
  CollectionChargesID: string
  CRNo: string
  BillNo: string
  ChargeID: string
  ChargeType: string
  ChargeRate: string
  Category: string
  Entry: string
  Particulars: string
  Amount: string
  CollectionChargesStatus: string
  Cancelled: string
  OnlineRefNo: string
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

  fetchORDetailsByAccountNo(accountNumber:string) {
    return this.http.get<CollectionDetails[]>(`${environment.API_URL}/OfficialReceipt/fetchORDetailsByAccountNo.php?accountNumber=${accountNumber}`, {responseType: 'json'})
  }

  fetchORBillingByORNo(orNumber:string) {
    return this.http.get<CollectionBilling[]>(`${environment.API_URL}/OfficialReceipt/fetchORBillingByORNo.php?orNumber=${orNumber}`, {responseType: 'json'})
  }

  fetchORChargesByORNo(orNumber:string) {
    return this.http.get<CollectionCharges[]>(`${environment.API_URL}/OfficialReceipt/fetchORChargesByORNo.php?orNumber=${orNumber}`, {responseType: 'json'})
  }

  fetchPendingOR() {
    return this.http.get<CollectionDetails[]>(`${environment.API_URL}/OfficialReceipt/loadPendingOR.php`, {responseType: 'json'})

  }

  createOR(orDetails:ORFormGroup) {
    let params = new FormData();
    let json = JSON.stringify(orDetails);
    params.append('orDetails', json);
    return this.http.post(`${environment.API_URL}/OfficialReceipt/createOR.php`, params, { responseType: 'json' });
  }

  postOR(orDetails:CollectionDetails) {
    let params = new FormData();
    let json = JSON.stringify(orDetails);
    params.append('orDetails', json);

    return this.http.post(`${environment.API_URL}/OfficialReceipt/postOR.php`, params, { responseType: 'json' });
  }

  cancelOR(orDetails:any) {
    let params = new FormData();
    let json = JSON.stringify(orDetails);
    params.append('orDetails', json);

    return this.http.post(`${environment.API_URL}/OfficialReceipt/cancelOR.php`, params, { responseType: 'json' });
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

  floatToWords(num: number): string {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = [
        'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
        'seventeen', 'eighteen', 'nineteen'
    ];
    const tens = [
        '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
    ];

    const toWords = (n: number): string => {
        if (n < 10) {
            return ones[n];
        } else if (n < 20) {
            return teens[n - 10];
        } else if (n < 100) {
            const digit1 = Math.floor(n / 10);
            const digit2 = n % 10;
            return `${tens[digit1]} ${ones[digit2]}`;
        } else if (n < 1000) {
            const digit1 = Math.floor(n / 100);
            const remainingDigits = n % 100;
            return `${ones[digit1]} hundred ${toWords(remainingDigits)}`;
        } else if (n < 10000) {
            const digit1 = Math.floor(n / 1000);
            const remainingDigits = n % 1000;
            return `${toWords(digit1)} thousand ${toWords(remainingDigits)}`;
        } else if (n < 100000) {
            const digit1 = Math.floor(n / 1000);
            const remainingDigits = n % 1000;
            return `${toWords(digit1)} thousand ${toWords(remainingDigits)}`;
        } else {
            return 'number out of range';
        }
    };

    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100); // Get the two decimal digits

    const integerWords = integerPart === 0 ? 'zero' : toWords(integerPart);
    const centsWords = decimalPart === 0 ? 'zero cents' : toWords(decimalPart) + ' cents';

    return `${integerWords} pesos and ${centsWords}`;

  }

  fetchLastPaidORByAccountNo(accountNumber:string) {
    return this.http.get<CollectionDetails[]>(`${environment.API_URL}/OfficialReceipt/fetchLastPaidORByAccountNo.php?accountNumber=${accountNumber}`, {responseType: 'json'})
  }
}
