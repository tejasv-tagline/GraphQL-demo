import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { debounceTime, fromEvent } from 'rxjs';
import * as $ from "jquery";
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  public singleUserQuery = gql`
  query Query($userId: ID!) {
    user(id: $userId) {
      id
      name
      username
      email
    }
  }
  `

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

  public createUserMutation = gql`
  mutation(
    $input: CreateUserInput!
  ) {
    createUser(input: $input) {
      id
      name
      username
      email
    }
  }
  `
  public updateUserMutation = gql`
  mutation Mutation($updateUserId: ID!, $input: UpdateUserInput!) {
    updateUser(id: $updateUserId, input: $input) {
      name
      username
      email
    }
  }
  `
  public deleteMutation = gql`
  mutation Mutation($deleteUserId: ID!) {
    deleteUser(id: $deleteUserId)
  }
  `
  public updatableUser: any;
  public myForm!: FormGroup;
  public updateForm!: FormGroup;
  public userId: any;


  public userList: any;
  @ViewChild('searchKeyword') searchKeyword!: ElementRef;
  @ViewChild('companyHover') companyHover!: ElementRef;
  @ViewChild('updateUserName') updateUserName!: ElementRef;
  @ViewChild('updateName') updateName!: ElementRef;
  @ViewChild('updateEmail') updateEmail!: ElementRef;
  singleUserData: any;



  constructor(private apollo: Apollo, private fb: FormBuilder, private toaster: ToastrService) {

    this.myForm = this.fb.group({
      name: [''],
      username: [''],
      email: ['']
    })

    this.updateForm = this.fb.group({
      name: [''],
      username: [''],
      email: ['']
    })

  }

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
  }

  public viewUser(userId:string):void{
    this.apollo.watchQuery({
      query:this.singleUserQuery,
      variables:{
          userId: userId
      }
    }).valueChanges.subscribe((res:any)=>{
      this.singleUserData=res.data.user
      console.log('res :>> ', res);
    })
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


  public onSubmit(): void {
    console.log('this.myForm.value :>> ', this.myForm.value);
    this.apollo.mutate({
      mutation: this.createUserMutation,
      variables: {
        input: {
          name: this.myForm.value.name,
          username: this.myForm.value.username,
          email: this.myForm.value.email
        }
      }
    }).subscribe((res: any) => {
      if (res) {
        this.toaster.success("Please check console for more details", "New User Created Successfully");
      } else {
        this.toaster.error("Please try after sometimes...")
      }
    })
  }

  public updateUser(id: any, update?: boolean): void {
    this.updatableUser = this.userList.find((user: any) => user.id == id);

    this.userId=this.updatableUser.id;
    this.updateForm = this.fb.group({
      name: this.updatableUser?.name,
      username: this.updatableUser?.username,
      email: this.updatableUser?.email
    })
    console.log('this.updateForm.value :>> ', this.updateForm.value);

  }

  public updateData(id: any): void {

    this.apollo.mutate({
      mutation: this.updateUserMutation,
      variables: {
        input: {
          name: this.updateForm.value.name,
          username: this.updateForm.value.username,
          email: this.updateForm.value.email
        },
        updateUserId: id
      }
    }).subscribe((res: any) => {
      if (res) {
        console.log('res :>> ', res.data.updateUser);
        this.toaster.success("Please check console for more details", "User Updated Successfully");
      } else {
        this.toaster.error("Please try after sometimes...");
      }
    })
  }

  public deleteUser(userId: any): void {
    this.apollo.mutate({
      mutation: this.deleteMutation,
      variables: {
        deleteUserId: userId
      }
    }).subscribe((res) => {
      if (res) {
        this.toaster.success("Please check console for more details", "User deleted Successfully");
      } else {
        this.toaster.error("Please try after sometimes...");
      }
    })
  }
}
