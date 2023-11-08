import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-branding',
  template: `
    <div class="branding" style="text-align: center;">
      <a href="/">
        <img
          [src]="logo"
          class="align-middle m-2"
          alt="logo"
          height="150px"
          width="150px"
        />
      </a>
    </div>
  `,
})
export class BrandingComponent {
  constructor() {}

  logo = environment.logo;
}
