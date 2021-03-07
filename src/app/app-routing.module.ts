import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';

const routes: Routes = [{
  path: '',
  component: LoginComponent
},
{
  path: 'chats',
  loadChildren: () =>
    import('./chats/chats.module').then((m) => m.ChatModule)
},
{
  path: 'meeting',
  loadChildren: () =>
    import('./meeting/meeting.module').then((m) => m.MeetingModule)
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
