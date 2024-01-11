import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SearchConsumerComponent } from 'src/app/components/search-consumer/search-consumer.component';
import { Consumer } from 'src/app/services/consumer.service';

@Component({
  selector: 'app-billing-addjustment',
  templateUrl: './billing-addjustment.component.html',
  styleUrls: ['./billing-addjustment.component.scss']
})
export class BillingAddjustmentComponent {
  @ViewChild('searchAccount') searchAccount!: ElementRef;

  accountNumber:string;

  constructor(
    private dialog:MatDialog,
  ) {}

  ngOnInit(): void {

  }

  searchConsumer() {
    const dialogRef = this.dialog.open(SearchConsumerComponent, {
      data: {
        type: 'create bill'
      }
    });

    dialogRef.afterClosed().subscribe(async (result:Consumer) => {
      if (!result) {
        return;
      }
      this.accountNumber = result.AccountNo;

      const event = new KeyboardEvent('keyup', { key: 'Enter' });
      this.searchAccount.nativeElement.dispatchEvent(event);

    });
  }

  viewBillAdjustmentByAccNo(accountNumber:string) {
    console.log(accountNumber);

  }
}
