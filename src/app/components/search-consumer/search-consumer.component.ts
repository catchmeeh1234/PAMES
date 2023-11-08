import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
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

  constructor(
    private consumerService:ConsumerService,
    private dialogRef:MatDialogRef<SearchConsumerComponent>,
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.onLoadConsumers();
  }

  async onLoadConsumers() {
    const consumers = await this.consumerService.fetchConsumers().toPromise();
    //console.log(consumers);
    const filteredConsumers = consumers?.filter(consumers => consumers.CustomerStatus === "Active");
    this.dataSource = new MatTableDataSource(filteredConsumers);
    this.dataSource.paginator = this.paginator;
  }

  selectConsumer(consumerInfo:Consumer) {
    //console.log(consumerInfo);
    this.dialogRef.close(consumerInfo);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openCreateAccount(){

  }

}
