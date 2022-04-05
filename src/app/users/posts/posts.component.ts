import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, fromEvent } from 'rxjs';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})


export class PostsComponent implements OnInit {

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
  public updateMutation = gql`
    mutation (
      $id: ID!,
      $input: UpdatePostInput!
    ) {
      updatePost(id: $id, input: $input) {
        id
        body
      }
    }
  `

  public searchQuery = gql`
    query Posts($options: PageQueryOptions) {
      posts(options: $options) {
        data {
          id
          title
          body
        }
      }
    }
  `

  @ViewChild('updatePostBody') updatePostBody!: ElementRef;
  public title!: string;
  body: any;
  public modalTitle: any;

  @ViewChild('searchKeyword') searchKeyword!: ElementRef;

  postId: any;


  constructor(private apollo: Apollo, private fb: FormBuilder, private toster: ToastrService, public userService: UserService) {

    this.myForm = this.fb.group({
      title: ['', [Validators.required]],
      body: ['', Validators.required]
    })
  }
  ngOnInit(): void {
    this.getAllPosts();

  }

  ngAfterViewInit(): void {
    // Search posts 
    fromEvent(this.searchKeyword.nativeElement, 'keyup').pipe(debounceTime(200))
      .subscribe((searchKey: any) => {
        if (searchKey.target.value && searchKey.target.value !== "" && searchKey.target.value !== null) {

          this.apollo.watchQuery({
            query: this.searchQuery,
            variables: {
              options: {
                search: {
                  q: searchKey.target.value
                }
              }
            }
          }).valueChanges.subscribe((res: any) => {
            this.allPosts = res.data.posts.data;
          })
        } else {
          this.getAllPosts();
        }

      })

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
  public viewSinglePost(id: number): void {
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
      console.log('this.singlePost :>> ', this.singlePost);
    })
  }


  public show() {
    this.modalTitle = null;
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
          this.toster.success("Check console for more details", "New post created successfully");
        } else {
          this.toster.error("Please try after sometimes", "Error creating new post");
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
        id: postId
      }
    }).subscribe((res: any) => {
      console.log('res :>> ', res);
      if (res && res?.data?.deletePost === true) {
        console.log("Post deleted ");
        this.toster.success("Check console for more details", "Post deleted");
      } else {
        console.log("Please try after sometimes ..");
        this.toster.error("Please try after sometimes...", "Error deleting post")
      }
    })
  }

  //-----------------------------------------------------------

  //Update Post 

  public showUpdateModal(postId: any, update?: boolean): void {
    const showPost = this.allPosts.find((post: any) => post.id == postId);
    console.log('showPost :>> ', showPost);
    this.title = showPost?.title;
    this.body = showPost?.body;
    this.postId = showPost?.id
    if (update) {
      this.updatePost(this.postId);
    }
  }

  public updatePost(postId: number): void {
    console.log('this.title , this.body :>> ', this.title, this.body);
    this.apollo.mutate({
      mutation: this.updateMutation,
      variables: {
        id: postId,
        input: {
          body: this.updatePostBody.nativeElement.value
        }
      }
    }).subscribe((res: any) => {
      console.log('Update post res :>> ', res);
      this.toster.success("Post updated");
    })
    return;
  }
}
