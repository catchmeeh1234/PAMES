import { Component, ViewChild, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription, filter, map } from 'rxjs';
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
  activeConsumersSubcription:Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
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
    let consumers$ = this.consumerService.fetchConsumers(numbersOfSelection);

    if (this.data.type === 'create bill') {
      this.consumersSubcription = consumers$.pipe(
        map(consumers => consumers.filter(consumer => consumer.CustomerStatus === 'Active'))
      ).subscribe(consumer => {

        this.dataSource = new MatTableDataSource(consumer);
        this.dataSource.paginator = this.paginator;
      });
    } else {
      this.consumersSubcription = consumers$
      .subscribe(consumer => {

        this.dataSource = new MatTableDataSource(consumer);
        this.dataSource.paginator = this.paginator;
      });
    }


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

  loadData(search:string) {
    if (search === "") {
      this.onLoadConsumers();
    }

    if (search.length < 4) {
      return;
    }

    if (this.data.type === 'create bill') {
      this.activeConsumersSubcription = this.consumerService.searchConsumer(search)
      .pipe(
        map(consumers => consumers.filter(consumer => consumer.CustomerStatus === 'Active'))
      ).subscribe(data => {
        this.dataSource.data = data;
      });
    } else {
      this.activeConsumersSubcription = this.consumerService.searchConsumer(search)
      .subscribe(data => {
        this.dataSource.data = data;
      });
    }

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.consumersSubcription) {
      this.consumersSubcription.unsubscribe();

    }
    if (this.activeConsumersSubcription) {
      this.activeConsumersSubcription.unsubscribe();

    }
  }

}
