import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Consumer, ConsumerService, Product, ProductInfo } from 'src/app/services/consumer.service';
import { Observable, filter, lastValueFrom, map, pipe } from 'rxjs';
import { Router } from '@angular/router';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-manage-accounts',
  templateUrl: './manage-accounts.component.html',
  styleUrls: ['./manage-accounts.component.scss']
})
export class ManageAccountsComponent {
  displayedColumns: string[] = ['CustomerStatus', 'AccountNo', 'FullName', 'ServiceAddress', 'Zone', 'Action'];

  //dataSource:Consumer[] = [];
  products$:Observable<ProductInfo[]>;
  res$:Observable<Consumer[]>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public consumerService:ConsumerService,
    private dialog:MatDialog,
    private router:Router,
    private sessionStorageService:SessionStorageServiceService,
  ) {

  }

  ngOnInit(): void {
    console.log("test: " + this.sessionStorageService.getSession("fullname"));

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    //this.loadConsumerSummary();
    this.loadConsumers();
  }

  async loadConsumers() {
    const numbersOfSelection = "TOP 100";

    this.res$ = this.consumerService.fetchConsumers(numbersOfSelection);



    try {
      //load the actual table
      const resToPromise = await lastValueFrom(this.res$, {defaultValue: [] as Consumer[]});
      this.consumerService.dataSource = new MatTableDataSource(resToPromise)
      this.consumerService.dataSource.paginator = this.paginator;
      //get the consumer's summmary / statistics
      this.consumerService.loadConsumerSummary();
      //console.log(resToPromise);
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

  // async loadConsumerSummary() {
  //   const res = await this.consumerService.fetchConsumerSummary().toPromise() as ConsumerSummary;
  //   this.consumerSummary = res;
  //   console.log(res);
  // }

  selectAction(event: Event, consumerInfo:Consumer) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue === 'view') {
      this.viewConsumerInfo(consumerInfo.Consumer_id);
    } else if(selectedValue === 'update status') {
      this.router.navigate(['./accounts/update-account-status', consumerInfo.AccountNo]);
    } else {
      console.log('Selected value:', selectedValue);
    }
  }

  openCreateAccount() {
    this.router.navigate(['./accounts/create-account']);
    // const dialogRef = this.dialog.open(CreateAccountComponent, {
    //   // panelClass: ['no-padding'],
    //   // data: {
    //   //   containerWidth: '800px',
    //   // }
    // });
  }

  viewConsumerInfo(consumer_id:string) {
    this.router.navigate(['./accounts/view-account', consumer_id]);

    // const consumerInfo = this.res$.pipe(
    //   map(val => val
    //     .filter(
    //       data => data.Consumer_id === consumer_id
    //     )
    //   )
    // );

    // const dialogRef = this.dialog.open(CustomerInfoComponent, {
    //   // panelClass: ['no-padding'],
    //   data: {
    //     //containerWidth: '800px',
    //     consumerInfo: consumerInfo
    //   }
    // });

    // console.log(consumerInfo.subscribe(data => console.log(data)));

  }

  updateConsumerStatus(accountNo:string) {
    this.router.navigate(['./accounts/update-account-status', accountNo]);
  }

  test() {
    this.products$ = this.consumerService.fetchProducts()
    .pipe(
      map(value => {
        return value.products;
      }),
      map(products => products.filter(val => val.brand === "Apple"))
    )

    console.log(this.products$);
  }

}
