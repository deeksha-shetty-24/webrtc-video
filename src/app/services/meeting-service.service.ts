import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class MeetingService {

    constructor(private httpClient: HttpClient) { }

    isHost = false;

}
