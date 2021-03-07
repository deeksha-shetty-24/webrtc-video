
import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ChatsComponent } from './chats.component';

import { ChatRoutingModule } from './chats.routing.module'

@NgModule({
  declarations: [
      ChatsComponent
  ],
  imports: [
    CommonModule,
    ChatRoutingModule
  ],
  providers: [
  ],
  exports: []
})
export class ChatModule { }
