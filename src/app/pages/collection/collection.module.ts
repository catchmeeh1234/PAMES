import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollectionRoutingModule } from './collection-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BillingRoutingModule } from '../billing/billing-routing.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ComponentsModule } from 'src/app/components/components.module';
import { NgxPrintModule } from 'ngx-print';
import { CreateOrComponent } from './create-or/create-or.component';
import { ViewOrComponent } from './view-or/view-or.component';
import { PostOrComponent } from './post-or/post-or.component';


@NgModule({
  declarations: [
    CreateOrComponent,
    ViewOrComponent,
    PostOrComponent,
  ],
  imports: [
    CommonModule,
    CollectionRoutingModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    BillingRoutingModule,
    TablerIconsModule,
    ComponentsModule,
    NgxPrintModule
  ]
})
export class CollectionModule { }
