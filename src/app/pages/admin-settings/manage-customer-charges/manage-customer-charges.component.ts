import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AddCustomerChargesComponent } from 'src/app/components/add-customer-charges/add-customer-charges.component';
import { EditCustomerChargesComponent } from 'src/app/components/edit-customer-charges/edit-customer-charges.component';
import { Consumer, ConsumerService, ScheduleCharges } from 'src/app/services/consumer.service';
import { DateFormatService } from 'src/app/services/date-format.service';

@Component({
  selector: 'app-manage-customer-charges',
  templateUrl: './manage-customer-charges.component.html',
  styleUrls: ['./manage-customer-charges.component.scss']
})
export class ManageCustomerChargesComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  consumerInfo:Consumer;
  displayedColumns = [
    "DateCreated",
    "ChargeType",
    "Category",
    "Particular",
    "Amount",
    "Recurring",
    "BillingMonth",
    "BillingYear",
    "Remarks",
    "ActiveInactive",
  ];

  consumer_id = this.route.snapshot.params['consumer_id'];
  headerData:any = [];
  constructor(
    private route:ActivatedRoute,
    public consumerService:ConsumerService,
    public dateFormat:DateFormatService,
    private dialog:MatDialog,
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadCustomerInfo(this.consumer_id);
    //console.log(this.headerData);

  }

  async loadCustomerInfo(consumer_id:string) {
    const consumerInfo = await this.consumerService.fetchConsumerInfo(consumer_id).toPromise();
    //console.log(consumerInfo?.length);

    if (consumerInfo && consumerInfo.length === 1) {
      this.loadConsumerCharges(consumerInfo[0].AccountNo);
      this.consumerInfo = consumerInfo[0];
      this.headerData = {
        title: `Customer Charges of ${consumerInfo[0].Firstname} ${consumerInfo[0].Middlename} ${consumerInfo[0].Lastname}`,
        url: `./accounts/view-account/${consumer_id}`,
      }
    }
  }

  addCustomerCharge(account_no:string) {
      const dialogRef = this.dialog.open(AddCustomerChargesComponent, {
        // panelClass: ['no-padding'],
        data: {
          account_no: account_no
        }
      });
  }

  async loadConsumerCharges(account_no:string) {
    const consumerCharges = await this.consumerService.fetchConsumerCharges(account_no).toPromise();
    this.consumerService.consumerChargesDataSource = new MatTableDataSource(consumerCharges);
    this.consumerService.consumerChargesDataSource.paginator = this.paginator;
  }

  openEditConsumerCharges(scheduleCharge:ScheduleCharges) {
    const dialogRef = this.dialog.open(EditCustomerChargesComponent, {
      // panelClass: ['no-padding'],
      data: {
        scheduleCharge: scheduleCharge
      }
    });
  }
}
