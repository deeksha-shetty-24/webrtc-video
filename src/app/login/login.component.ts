import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserInfo } from '../models/user.model';
import { AppService } from '../services/app-service.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, private appService: AppService) { }

  userName: string;
  fullName: string;
  
  ngOnInit(): void {
      const user = this.appService.getCurrentUser();
      if (user)
        this.router.navigate(['/chats']);
  }

  onFullName(e) {
    this.fullName = e.target.value;
  }

  onUserName(e) {
    this.userName = e.target.value;
  }

  signIn(): void {
    this.appService.login({
      fullName: this.fullName,
      userName: this.userName
    });
    this.router.navigate(['/chats']);
  }
}
