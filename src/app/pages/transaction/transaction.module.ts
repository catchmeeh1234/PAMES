import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionRoutingModule } from './transaction-routing.module';
import { SampleComponent } from './sample/sample.component';
import { RouterModule } from '@angular/router';
import { ExtraRoutes } from '../extra/extra.routing';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';


@NgModule({
  declarations: [
    SampleComponent
  ],
  imports: [
    CommonModule,
    TransactionRoutingModule,
    RouterModule.forChild(ExtraRoutes),
    MaterialModule,
    TablerIconsModule
  ]
})
export class TransactionModule { }
