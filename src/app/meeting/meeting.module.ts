
import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MeetingComponent } from './meeting.component';
import { MeetingService } from '../services/meeting-service.service'
import { MeetingRoutingModule } from './meeting-routing.module'

@NgModule({
    declarations: [
        MeetingComponent
    ],
    imports: [
        CommonModule,
        MeetingRoutingModule
    ],
    providers: [],
    exports: []
})
export class MeetingModule { }
