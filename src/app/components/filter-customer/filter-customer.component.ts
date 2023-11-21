import { Component, ElementRef, HostListener } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConsumerService } from 'src/app/services/consumer.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { ZoneService } from 'src/app/services/zone.service';

@Component({
  selector: 'app-filter-customer',
  templateUrl: './filter-customer.component.html',
  styleUrls: ['./filter-customer.component.scss']
})
export class FilterCustomerComponent {
  public isOpen:boolean = false;

  public zones:any;
  selectedZone: string = 'All';
  selectedStatus: string = 'All';
  selectedRequestor: string = 'All';
  search:string = "";

  public customer_statuses:string[] = [];
  public pr_requestors:any;

  selectedOptions:string[] = [
    this.selectedZone,
    this.selectedStatus,
    this.selectedRequestor,
  ];

  @HostListener('document:click', ['$event', '$event.target'])
  onClick(event: MouseEvent, targetElement: HTMLElement) {
    if (!targetElement) {
       return;
    }


    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    console.log(clickedInside);

    if (!clickedInside) {
        this.isOpen = false;
    }
  }
  constructor(
    private elementRef: ElementRef,
    private zoneService:ZoneService,
    private consumerService:ConsumerService,
    private sessionStorageService:SessionStorageServiceService
  ) {}

  ngOnInit(): void {
    this.onLoadFilterOptions();
      //this.pr.dataSourcePRTable.filterPredicate = null;
    // const refreshId = setInterval(() => {
    //   console.log("wala");

    //   if (this.consumerService.dataSource) {
    //     console.log("meron");

    //     this.consumerService.dataSource.filterPredicate = (data: any, filter: string) => {
    //       const filters = JSON.parse(filter);
    //       //console.log(data, filters);

    //       //if(data.Zone === null || data.search === null || data.AccountNo === null || data.Lastname === null) return true;

    //       return (
    //         (!filters.zone || data.Zone.toLowerCase() === filters.zone.toLowerCase()) &&
    //         (!filters.status || data.CustomerStatus.toLowerCase() === filters.status.toLowerCase()) &&
    //         (!filters.search || (data.AccountNo.includes(filters.search) || data.Lastname.toLowerCase().includes(filters.search)))
    //       );
    //     };

    //     clearInterval(refreshId);
    //   }
    // }, 1000);


  }

  onLoadFilterOptions() {
    this.zones = this.zoneService.fetchZones();
    this.customer_statuses = ["Active", "Disconnected"];
  }

  closeFilterLabel(filterlabel:string) {
    if (filterlabel === "Division") {
      this.selectedZone = "All";
    } else if (filterlabel === "Status") {
      this.selectedStatus = "All";
    } else if (filterlabel === "Requestor") {
      this.selectedRequestor = "All";
    } else if (filterlabel === "Reset") {
      this.selectedZone = "All";
      this.selectedStatus = "All";
      this.selectedRequestor = "All";
    } else {
      return;
    }
    this.loadData(this.search, this.selectedZone, this.selectedStatus);
    //this.filterTable(this.search, this.selectedZone, this.selectedStatus, this.selectedRequestor);

  }

  resetFilterTable() {
    this.selectedZone = 'All';
    this.selectedStatus = 'All';
    this.selectedRequestor = 'All';
    this.search = "";

    this.consumerService.dataSource.data = [];
    //this.filterTable(this.search, this.selectedZone, this.selectedStatus, this.selectedRequestor);
  }

  filterTable(search:string, filterZone:string, filterStatus:string ,filterRequestor:string) {

    if (this.isOpen === true) {
      this.isOpen = true;
    } else {
      this.isOpen = false;
    }
    if (filterZone === "All") {
      filterZone = "";
    }
    if (filterStatus === "All") {
      filterStatus = "";
    }
    console.log(this.consumerService.dataSource)
    //this.pr.dataSourcePRTable.filter = filterZone.trim().toLowerCase();
    this.consumerService.dataSource.filter = JSON.stringify({
      zone: filterZone,
      status: filterStatus,
      search: search,
    });
  }

  async loadData(search:string, selectedZone:string, selectedStatus:string) {
    let zone:string;
    let status:string;

    if (search.length < 4) {
      return;
    }

    if (selectedZone === "All") {
      zone = "";
    } else {
      zone = selectedZone;
    }

    if (selectedStatus === "All") {
      status = "";
    } else {
      status = selectedStatus;
    }

    console.log(search, status, zone);

    const searchedAccounts:any = await this.consumerService.searchConsumer(search, zone, status).toPromise();

    if (!searchedAccounts) {
      return;
    }
    this.consumerService.dataSource.data = searchedAccounts;
  }
}
