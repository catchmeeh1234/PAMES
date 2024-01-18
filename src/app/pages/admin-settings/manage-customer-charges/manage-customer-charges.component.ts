import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AddCustomerChargesComponent } from 'src/app/components/add-customer-charges/add-customer-charges.component';
import { EditCustomerChargesComponent } from 'src/app/components/edit-customer-charges/edit-customer-charges.component';
import { Consumer, ConsumerService, ScheduleCharges } from 'src/app/services/consumer.service';
import { DateFormatService } from 'src/app/services/date-format.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';

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
    private router:Router,
    private sessionStorageService:SessionStorageServiceService,
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadCustomerInfo(this.consumer_id);
    //console.log(this.headerData);

  }

  async loadCustomerInfo(consumer_id:string) {
    try {
      const consumerInfo = await lastValueFrom(this.consumerService.fetchConsumerInfo(consumer_id));
      //console.log(consumerInfo?.length);
      if (consumerInfo && consumerInfo.length === 1) {
        this.loadConsumerCharges(consumerInfo[0].AccountNo);
        this.consumerInfo = consumerInfo[0];
        this.headerData = {
          title: `Customer Charges of ${consumerInfo[0].Firstname} ${consumerInfo[0].Middlename} ${consumerInfo[0].Lastname}`,
          url: `./accounts/view-account/${consumer_id}`,
        }
      }
    } catch(error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          console.log('Forbidden:', error.error);
          this.sessionStorageService.removeSession();
          this.router.navigate(['./authentication/login']);
        }
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
    try {
      const consumerCharges = await lastValueFrom(this.consumerService.fetchConsumerCharges(account_no));
      this.consumerService.consumerChargesDataSource = new MatTableDataSource(consumerCharges);
      this.consumerService.consumerChargesDataSource.paginator = this.paginator;
    } catch(error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          console.log('Forbidden:', error.error);
          this.sessionStorageService.removeSession();
          this.router.navigate(['./authentication/login']);
        }
      }
    }

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
