import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  public usersQuery = gql`
  query Posts {
    users {
      data {
        id
        name
        username
        email
        phone
        posts {
          data {
            id
            title
            body
          }
        }
      }
    }
  }
  `
  public userList: any;
  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.getAllUsers();
  }

  public getAllUsers(): void {
    this.apollo.watchQuery({
      query: this.usersQuery
    }).valueChanges.subscribe((users: any) => {
      this.userList = users;
    })
  }

}
