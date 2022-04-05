import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})


export class UserListComponent implements OnInit {

  public allPosts: any;
  public singlePost: any;
  public newPost = gql`
    mutation ($input:newPostValue!){
      newPost(input:$input){
        id
        title
        body
      }
    }

  `

  public myForm!: FormGroup;
  public newPostQuery = gql`mutation (
    $input: CreatePostInput!
  ) {
    createPost(input: $input) {
      id
      title
      body
    }
  }`;

  public deleteMutation = gql`
  mutation (
    $id: ID!
  ) {
    deletePost(id: $id)
  }
  `
  title: any;
  body: any;
  public modalTitle: any;

  @ViewChild('openModal') openModal!:TemplateRef<any>;


  constructor(private apollo: Apollo, private fb: FormBuilder,private toster:ToastrService,public userService:UserService) {

    this.myForm = this.fb.group({
      title: ['', [Validators.required]],
      body: ['', Validators.required]
    })
  }
  ngOnInit(): void {
    this.getAllPosts();

  }

  // -----------------------------------------------
  // Show all posts 
  public getAllPosts(): void {
    const getPosts = gql`
    query{
      posts{
        data {
          id
          title
          body
        }
        meta {
          totalCount
        }
      }
    }
  `
    this.apollo.watchQuery({

      query: getPosts
    }).valueChanges.subscribe((res: any) => {
      this.allPosts = res?.data?.posts?.data;
    })
  }

  // -----------------------------------------------

  // Show single post
  public viewSinglePost(id: number,update?:boolean): void {
    this.singlePost = null;
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
      this.singlePost = res?.data?.post;
      if(update){
        this.modalTitle='Update Post';
        this.updatePost(id);
      }
      console.log('this.singlePost :>> ', this.singlePost);
      return this.singlePost;
    })

  }

  public show(){
    this.modalTitle=null;
  }

  // -----------------------------------------------

  //Create new post 
  public onSubmit() {
    return new Promise((resolve, reject) => {
      this.apollo.mutate({
        mutation: this.newPostQuery,
        variables: {
          input: {
            title: this.myForm.value.title,
            body: this.myForm.value.body
          }
        }
        // variables: { name: name }
      }).subscribe((result: any) => {
        if (result) {
          console.log('New Category: ', result?.data?.createPost);
          this.toster.success("Check console for more details","New post created successfully");
        }else{
            this.toster.error("Please try after sometimes","Error creating new post");
        }
      })
    })

  }

  //-----------------------------------------------------------

  // Delete post 
  public deletePost(postId: number): void {
    this.apollo.mutate({
      mutation: this.deleteMutation,
      variables: {
        id:postId
      }
    }).subscribe((res:any)=>{
      console.log('res :>> ', res);
      if(res && res?.data?.deletePost===true){
        console.log("Post deleted ");
        this.toster.success("Check console for more details","Post deleted");
      }else{
        console.log("Please try after sometimes ..");
        this.toster.error("Please try after sometimes...","Error deleting post")
      }
    })
  }

  //-----------------------------------------------------------

  //Update Post 
  async updatePost(postId:number){
    // this.viewSinglePost(postId);
    this.title=this.singlePost?.title;
    this.body=this.singlePost?.body;
    console.log('this.title , this.body :>> ', this.title , this.body);  

  }
}
