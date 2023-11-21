import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription, map } from 'rxjs';
import { Consumer, ConsumerService } from 'src/app/services/consumer.service';

@Component({
  selector: 'app-search-consumer',
  templateUrl: './search-consumer.component.html',
  styleUrls: ['./search-consumer.component.scss']
})
export class SearchConsumerComponent {
  search:string;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ['AccountNo', 'FullName', 'Zone', 'ContactNo'];
  dataSource:MatTableDataSource<Consumer>;

  consumersSubcription:Subscription;

  constructor(
    private consumerService:ConsumerService,
    private dialogRef:MatDialogRef<SearchConsumerComponent>,
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.onLoadConsumers();
  }

  onLoadConsumers() {
    const numbersOfSelection = "TOP 100";
    this.consumersSubcription = this.consumerService.fetchConsumers(numbersOfSelection)
    .subscribe(consumer => {
      this.dataSource = new MatTableDataSource(consumer);
      this.dataSource.paginator = this.paginator;
    });


    //const consumers = await this.consumerService.fetchConsumers(numbersOfSelection).toPromise();
    // const filteredConsumers = consumers?.filter(consumers => consumers.CustomerStatus === "Active");
    // this.dataSource = new MatTableDataSource(filteredConsumers);
    // this.dataSource.paginator = this.paginator;
  }

  selectConsumer(consumerInfo:Consumer) {
    //console.log(consumerInfo);
    this.dialogRef.close(consumerInfo);
  }

  // applyFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.filter = filterValue.trim().toLowerCase();
  // }

  openCreateAccount(){

  }

  async loadData(search:string) {
    if (search === "") {
      this.onLoadConsumers();
    }

    if (search.length < 4) {
      return;
    }

    const searchedAccounts:any = await this.consumerService.searchConsumer(search).toPromise();

    if (!searchedAccounts) {
      return;
    }
    this.dataSource.data = searchedAccounts;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.consumersSubcription.unsubscribe();
  }

}
