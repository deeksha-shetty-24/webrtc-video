import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserInfo } from '../models/user.model';
import { AppService } from '../services/app-service.service';
import { MeetingService } from '../services/meeting-service.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent implements OnInit {

  constructor(private router: Router, private appService: AppService, private meetingService: MeetingService) { }

  currentUser: UserInfo = null;
  users: UserInfo[] = [];
  activeRecipient: UserInfo;
  message: string = '';
  messages: any[] = [];
  meetingId: string;
  isScheduled: boolean;

  ngOnInit(): void {
    const user = this.appService.getCurrentUser();
    if (user)
      this.currentUser = user;
    else
      this.router.navigate(['/']);

    this.initialize();
  }

  logOut() {
    this.appService.logout();
    this.router.navigate(['/']);
  }

  initialize() {
    this.loadAllUsers();
    this.appService.selectedRecipient.subscribe(x => this.activeRecipient = x);
    this.appService.webSocketEvent.subscribe(x => {
      if (x.data) {
        const data = JSON.parse(x.data);
        if (data.type === 'user_join') {
          this.users.push({ userName: data.userName, fullName: data.fullName });
        }
        else if (data.type === 'message') {
          this.messages.push({ message: data.message, local: false });
        }
      }
    });
  }

  loadAllUsers() {
    this.appService.getAllUsers().subscribe(x => {
      this.users = x.filter(m => m.userName !== this.currentUser.userName);
    })
  }

  onRecipientSelect(user) {
    this.appService.setRecipient(user);
    this.messages = [];
    this.meetingId = '';
  }

  onTypeMessage(event) {
    this.message = event.target.value;
  }

  onSendMessage() {
    this.messages.push({ message: this.message, local: true });
    this.appService.sendToActiveRecepient({
      type: 'new_message',
      message: this.message
    });
    this.message = '';
  }

  onHostClick(e) {
    e.preventDefault();
    this.meetingId = Math.floor((Math.random() * 100000) + 4).toString();
    this.meetingService.isHost = true;
    this.appService.sendToActiveRecepient({
      type: 'meeting_id',
      meetingId: this.meetingId
    });
  }

  startCall() {
    this.router.navigate(['/meeting']);
  }

  onJoinClick(e) {
    e.preventDefault();
    this.appService.validateMeetingId().subscribe(isScheduled => {
      if (isScheduled) {
        this.meetingService.isHost = false;
        this.isScheduled = isScheduled;
        this.router.navigate(['/meeting']);
      } else {
        alert('No meetings scheduled!!!');
      }
    })
  }

}
