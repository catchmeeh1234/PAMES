import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Consumer, ConsumerLedgerData, ConsumerService, ScheduleCharges } from 'src/app/services/consumer.service';
import { Subscription, first, from, map, switchMap, take, pipe, lastValueFrom } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { EditAccountComponent } from '../edit-account/edit-account.component';
import { Data1 } from '../../collection/create-or/create-or.component';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';



@Component({
  selector: 'app-consumer-info',
  templateUrl: './consumer-info.component.html',
  styleUrls: ['./consumer-info.component.scss']
})
export class ConsumerInfoComponent {

  dataSource = new MatTableDataSource<ConsumerLedgerData>();
  private ConsumerLedgerDataSubscribe:Subscription;
  private consumerInfoSubscribe:Subscription;

  consumerCharges:ScheduleCharges[];
  headerData = {
    title: `Consumer`,
    url: "./acounts/manage-accounts",
  };

  displayedColumns = [
    "LedgerRefNo", "LedgerDate",
    "LedgerParticulars", "MeterReading", "Consumption",
    "Billing", "Discount", "Balance"
  ];

  data:Data1 = {
    hideEditBtn: false,
  }

  constructor(
    public consumerService:ConsumerService,
    private dialog: MatDialog,
    private route:ActivatedRoute,
    private router:Router,
    private sessionStorageService:SessionStorageServiceService,
  ) {}

  ngOnInit(): void {
    const consumer_id = this.route.snapshot.params['consumer_id'];
    this.loadCustomerInfo(consumer_id);
    //this.consumerService.consumerInfo$ = this.data.consumerInfo;

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // console.log("test1", this.sample);
    // this.sample.subscribe((data:any) => {
    //   console.log("test2", data);
    // })
  }

  loadCustomerInfo(consumer_id:string) {
    //this.consumerService.consumerInfo$

    try {
      this.consumerService.consumerInfo$ = this.consumerService.fetchConsumerInfo(consumer_id);

      this.consumerInfoSubscribe = this.consumerService.consumerInfo$.subscribe(data => {
        this.data.consumerInfo = data[0];
      });

      this.consumerService.consumerLedger$ = this.consumerService.consumerInfo$
      .pipe(
        switchMap(consumerInfo => {
          if (Array.isArray(consumerInfo) && consumerInfo.length === 1) {
            const obj = consumerInfo[0]; // Accessing the single object from the array
            this.onLoadConsumerCharges(obj.AccountNo);
            return this.consumerService.fetchConsumerLedger(obj.AccountNo)
          } else {
            return of([]);
          }
        })
      )

      this.ConsumerLedgerDataSubscribe = this.consumerService.consumerLedger$.subscribe(data => {
        this.dataSource.data = data;
      });
    } catch(error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          console.log('Forbidden:', error.error);
          this.sessionStorageService.removeSession();
          this.router.navigate(['./authentication/login']);
        }
      }
    }




    // const consumers= await this.consumerService.fetchConsumerInfo(consumer_id).toPromise();

    // const consumerInfo = consumers?.filter(consumers => consumers.Consumer_id === consumer_id);
    // //console.log(consumerInfo);

    // if (consumerInfo?.length === 1) {
    //   this.consumerService.consumerInfo$ = of(consumerInfo);
    //   this.consumerService.consumerLedger$ = this.consumerService.consumerInfo$
    //   .pipe(
    //     switchMap(consumerInfo => {
    //       return from(consumerInfo)
    //     }),
    //     switchMap(consumerLedgerData => {
    //       return this.consumerService.fetchConsumerLedger(consumerLedgerData.AccountNo)
    //     })
    //   );


    //   this.ConsumerLedgerDataSubscribe = this.consumerService.consumerLedger$.subscribe(data => {
    //     this.dataSource.data = data;
    //   });

    // } else {
    //   //this.consumerService.consumerInfo$ = of([]);
    // }

  }

  // editConsumerInfo() {
  //   const dialogRef = this.dialog.open(EditAccountComponent, {
  //     // panelClass: ['no-padding'],
  //     data: {
  //       consumer_info: this.consumerService.consumerInfo$
  //     }
  //   });

  // }

  manageCharges(consumer_id:string) {
    this.router.navigate(['./admin-settings/manage-consumer-charges', consumer_id])
  }

  async onLoadConsumerCharges(account_no:string) {

    try {
      const consumerCharges = await lastValueFrom(this.consumerService.fetchConsumerCharges(account_no));
      this.consumerCharges = consumerCharges;
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

  updateConsumerStatus(accountNo:string) {
    this.router.navigate(['./accounts/update-account-status', accountNo]);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.ConsumerLedgerDataSubscribe) {
      this.ConsumerLedgerDataSubscribe.unsubscribe();
    }

    if (this.consumerInfoSubscribe) {
      this.consumerInfoSubscribe.unsubscribe();
    }
  }

}
