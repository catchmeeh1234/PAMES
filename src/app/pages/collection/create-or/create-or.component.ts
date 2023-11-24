import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SearchConsumerComponent } from 'src/app/components/search-consumer/search-consumer.component';
import { Consumer } from 'src/app/services/consumer.service';

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
  headerData = {
    title: `Create OR`,
  };

  data: Data = {
    hideEditBtn: true,
  };

  account_no:string;

  constructor(
    private dialog:MatDialog
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

  }

  searchConsumer() {
    const dialogRef = this.dialog.open(SearchConsumerComponent);

    dialogRef.afterClosed().subscribe(async (result:Consumer) => {
      if (result) {
        console.log(result);
        this.account_no = result.AccountNo;
        this.data.consumerInfo = result;

      } else {
        console.log('The dialog was closed without a value.');
      }
    });
  }

}
