import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Consumer, ConsumerLedgerData, ConsumerService, ScheduleCharges } from 'src/app/services/consumer.service';
import { Subscription, first, from, map, switchMap, take, pipe } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { EditAccountComponent } from '../edit-account/edit-account.component';



@Component({
  selector: 'app-consumer-info',
  templateUrl: './consumer-info.component.html',
  styleUrls: ['./consumer-info.component.scss']
})
export class ConsumerInfoComponent {
  dataSource = new MatTableDataSource<ConsumerLedgerData>();
  private ConsumerLedgerDataSubscribe:Subscription;
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


  constructor(
    public consumerService:ConsumerService,
    private dialog: MatDialog,
    private route:ActivatedRoute,
    private router:Router
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
     this.consumerService.consumerInfo$ = this.consumerService.fetchConsumerInfo(consumer_id);

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

  editConsumerInfo() {
    const dialogRef = this.dialog.open(EditAccountComponent, {
      // panelClass: ['no-padding'],
      data: {
        consumer_info: this.consumerService.consumerInfo$
      }
    });
  }

  manageCharges(consumer_id:string) {
    this.router.navigate(['./admin-settings/manage-consumer-charges', consumer_id])
  }

  async onLoadConsumerCharges(account_no:string) {
    const consumerCharges = await this.consumerService.fetchConsumerCharges(account_no).toPromise();
    if (consumerCharges) {
      this.consumerCharges = consumerCharges;
    }

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.ConsumerLedgerDataSubscribe) {
      this.ConsumerLedgerDataSubscribe.unsubscribe();
    }
  }

}
