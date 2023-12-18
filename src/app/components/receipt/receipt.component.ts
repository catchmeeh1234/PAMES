import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { DateFormatService } from 'src/app/services/date-format.service';
import { OfficialReceiptService, ReceiptDetails } from 'src/app/services/official-receipt.service';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss']
})
export class ReceiptComponent {
  @ViewChild('printableArea') printableArea!: ElementRef;
  @Input() receipt: ReceiptDetails;

  currentDate:string;

  constructor(
    private officialReceiptService:OfficialReceiptService,
    private dateFormatService:DateFormatService,
  ) {}

  ngAfterViewInit(): void {
    //this.receipt = this.officialReceiptService.receipt;
    //console.log(this.receipt);

    //this.currentDate = this.dateFormatService.generateCurrentDateAndTime();

    //Called after ngOnInit when the component's or directive's content has been initialized.
    //Add 'implements AfterContentInit' to the class.
    this.officialReceiptService.printableContent = this.getPrintableContent();

  }

  getPrintableContent(): string {
    return this.printableArea.nativeElement.innerHTML;
  }

}
