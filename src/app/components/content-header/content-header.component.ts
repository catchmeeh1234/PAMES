import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

interface data {
  title: string,
  url?: string,
}

@Component({
  selector: 'app-content-header',
  templateUrl: './content-header.component.html',
  styleUrls: ['./content-header.component.scss']
})
export class ContentHeaderComponent {
  @Input() data: data;
  //title:string;

  constructor(
    private router:Router,
    private location:Location) {}

  backButton() {
    this.location.back();
    //console.log(this.data.url);

    //this.router.navigate([this.data.url]);
  }

}
