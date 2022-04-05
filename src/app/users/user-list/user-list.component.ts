import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { debounceTime, fromEvent } from 'rxjs';

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
  public searchQuery=gql`
  query Posts($options: PageQueryOptions) {
    users(options: $options) {
      data {
        id
        name
        username
        email
      }
    }
  }
  `
  public userList: any;
  @ViewChild('searchKeyword') searchKeyword!:ElementRef;



  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.getAllUsers();
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchKeyword.nativeElement,'keyup').pipe(debounceTime(200)).subscribe((res:any)=>{
      if(res.target.value && res.target.value!==null){
        this.apollo.watchQuery({
          query:this.searchQuery,
          variables:{
              options: {
                search: {
                  q: res.target.value
                }
              }
          }

        }).valueChanges.subscribe((users:any)=>{
          this.userList=users.data.users.data;
        })
      }else{
        this.getAllUsers();
      }
    })
  }

  public getAllUsers(): void {
    this.apollo.watchQuery({
      query: this.usersQuery
    }).valueChanges.subscribe((users: any) => {
      this.userList = users?.data?.users.data;
    })
  }

}
