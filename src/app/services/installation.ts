import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Installation {

  constructor(public http: HttpClient) {
  }

  save(id: string, data: any = {}): Promise<any> {

    const appId = environment.appId;
    const serverUrl = environment.serverUrl;

    const headers = new HttpHeaders().set('X-Parse-Application-Id', appId);
    const bodyString = JSON.stringify(data);
    const url = `${serverUrl}/installations/${id}`;

    return this.http.put(url, bodyString, { headers }).toPromise();
  }

}
