import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CollectionDetails, OfficialReceiptService } from 'src/app/services/official-receipt.service';

@Component({
  selector: 'app-post-or',
  templateUrl: './post-or.component.html',
  styleUrls: ['./post-or.component.scss']
})

export class PostOrComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator;


  headerData = {
    title: `Post OR`,
  };

  dataSource:MatTableDataSource<CollectionDetails>;

  progressCounter = 0;

  displayedColumns: string[] = ['select', 'position', 'name', 'weight', 'symbol'];
  //dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<CollectionDetails>(true, []);

  constructor(
    private officialReceiptService:OfficialReceiptService,
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadPendingOR();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    if (this.selection.selected.length) {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    } else {
      return false;
    }

  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: CollectionDetails): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position! + 1}`;
  }

  loadPendingOR() {
    this.officialReceiptService.fetchPendingOR().subscribe(collectionDetails => {
      collectionDetails.forEach((collectionDetails, index) => {
        collectionDetails.position = index + 1;
      });

      this.dataSource = new MatTableDataSource(collectionDetails);
      this.dataSource.paginator = this.paginator;
    })
  }

  async onPostOR() {
    // console.log(this.selection.selected);
    // let delay = 1;
    // await this.loop(delay);
    // this.progressCounter = 0;
    // console.log(this.progressCounter);
    let count = 0;
    for (const [index, orDetails] of this.selection.selected.entries()) {
      const reponse:any = await this.officialReceiptService.postOR(orDetails).toPromise();
      if (reponse.status === "OR Posted") {
        this.progressCounter = ((index + 1) / this.selection.selected.length) * 100;
        this.loadPendingOR();
        count++;
      } else {
        console.log(reponse.status);
      }
    }
    alert(`Posted ${count} OR`);

  }

  viewOR(CRNo:string) {

  }

  // function for progress bar
  loop(delay:number) {
    return new Promise<void>((resolve) => {
      const executeTimeout = async (index: number) => {
          if (index < 100) {
              const newDelay = index * delay;
              await new Promise<void>((innerResolve) => {
                  setTimeout(() => {
                      this.progressCounter = index + 1;
                      innerResolve();
                  }, newDelay);
              });
              await executeTimeout(index + 1);
          } else {
              resolve();
          }
      };

      executeTimeout(0);
  });
  }

}
