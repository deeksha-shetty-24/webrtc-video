import { Injectable } from '@angular/core';
import { UserInfo } from '../models/user.model';
import { keys, urls } from '../constants/constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private httpClient: HttpClient) { }

  webSocket: WebSocket;

  onMessageCallBacks = [];

  public selectedRecipient: BehaviorSubject<UserInfo> = new BehaviorSubject(null);

  public webSocketEvent: BehaviorSubject<any> = new BehaviorSubject({});

  login(userInfo: UserInfo) {
    if (userInfo.fullName && userInfo.userName) {
      sessionStorage.setItem(keys.userInfoKey, JSON.stringify(userInfo));
      this.webSocket = new WebSocket(urls.webSocketUrl);
      this.webSocket.onmessage = (event) => {
        console.log("Event triggered", event.type)
        this.handleSignalingData(event);
      };

      this.webSocket.onopen = (evt) => {
        this.sendWSData({
          type: 'store_user',
          userName: userInfo.userName,
          fullName: userInfo.fullName
        })
      }
    }
  }

  getCurrentUser(): UserInfo {
    const user = sessionStorage.getItem(keys.userInfoKey);
    if (user) {
      return JSON.parse(user);
    }
  }

  logout() {
    if (this.webSocket?.readyState === WebSocket.OPEN)
      this.webSocket.close();
    sessionStorage.removeItem(keys.userInfoKey);
  }

  getAllUsers(): Observable<UserInfo[]> {
    return this.httpClient.get<UserInfo[]>(`${urls.apiBaseUrl}users`); // exclude current user
  }

  validateMeetingId(): Observable<boolean> {
    const currentUser = this.getCurrentUser();
    return this.httpClient.get<boolean>(`${urls.apiBaseUrl}validate-meeting`, {
      params: {
        'username': currentUser.userName
      }
    });
  }

  setRecipient(userInfo: UserInfo) {
    this.selectedRecipient.next(userInfo);
  }

  handleSignalingData(data) {
    this.webSocketEvent.next(data);
  }

  sendToActiveRecepient(payload) {
    const currentUser = this.getCurrentUser();
    const userInfo = { userName: currentUser.userName, calleeName: this.selectedRecipient.value.userName }
    this.sendWSData({
      ...payload,
      ...userInfo
    });
  }

  sendWSData(data) {
    this.webSocket.send(JSON.stringify(data));
  }



}
