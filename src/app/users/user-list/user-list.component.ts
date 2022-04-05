import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { debounceTime, fromEvent } from 'rxjs';
import * as $ from "jquery";
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
        company {
          name
          catchPhrase
          bs
        }
      }
    }
  }
  `
  public searchQuery = gql`
  query Posts($options: PageQueryOptions) {
    users(options: $options) {
      data {
        id
        name
        username
        email
      company {
        name
        catchPhrase
        bs
      }
    }
    }
  }
  `
  public userList: any;
  @ViewChild('searchKeyword') searchKeyword!: ElementRef;
  @ViewChild('companyHover') companyHover!: ElementRef;



  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.getAllUsers();
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchKeyword.nativeElement, 'keyup').pipe(debounceTime(200)).subscribe((res: any) => {
      if (res.target.value && res.target.value !== null) {
        this.apollo.watchQuery({
          query: this.searchQuery,
          variables: {
            options: {
              search: {
                q: res.target.value
              }
            }
          }

        }).valueChanges.subscribe((users: any) => {
          this.userList = users.data.users.data;
        })
      } else {
        this.getAllUsers();
      }
    })

    // setTimeout(() => {

    //   this.companyHoverd();
    // }, 1000);




  }

  public getAllUsers(): void {
    this.apollo.watchQuery({
      query: this.usersQuery
    }).valueChanges.subscribe((users: any) => {
      this.userList = users?.data?.users.data;
    })
  }

  public companyHoverd(company: any): void {
    (<any>$(".tool-tip")).attr('title-new', company.name + company.catchPhrase);
  }

}
