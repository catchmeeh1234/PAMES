import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditAccountComponent } from 'src/app/pages/accounts/edit-account/edit-account.component';
import { Data1 } from 'src/app/pages/collection/create-or/create-or.component';
import { Consumer, ConsumerService } from 'src/app/services/consumer.service';

@Component({
  selector: 'app-consumer-info-summary',
  templateUrl: './consumer-info-summary.component.html',
  styleUrls: ['./consumer-info-summary.component.scss']
})
export class ConsumerInfoSummaryComponent {
  @Input() data: Data1;

  constructor(
    private dialog:MatDialog,
    private consumerService:ConsumerService
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

  }

  editConsumerInfo() {
    const dialogRef = this.dialog.open(EditAccountComponent, {
      // panelClass: ['no-padding'],
      data: {
        consumer_info: this.consumerService.consumerInfo$
      }
    });

    dialogRef.afterClosed().subscribe((result:Consumer) => {
      if (result === undefined) {
        return;
      }
      this.data.consumerInfo = result;
    });
  }
}
