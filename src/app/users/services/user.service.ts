import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  postDetails: any;

  constructor(public apollo: Apollo) { }

  public viewSinglePost(id: number): any {
    const query = gql`
      query{
        post(id:${id}){
            id
            title
            body
          }
        }
    `
    this.apollo.watchQuery({
      query: query
    }).valueChanges.subscribe((res: any) => {
      console.log('res :>> ', res);
      this.postDetails=res?.data?.post
      // return res?.data?.post;
    })
  return this.postDetails;
  }
}
