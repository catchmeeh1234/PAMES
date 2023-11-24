import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollectionRoutingModule } from './collection-routing.module';
import { CreateOrComponent } from './create-or/create-or.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BillingRoutingModule } from '../billing/billing-routing.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  declarations: [
    CreateOrComponent
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
    ComponentsModule
  ]
})
export class CollectionModule { }
