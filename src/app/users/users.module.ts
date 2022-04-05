import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { PostsComponent } from './posts/posts.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserListComponent } from './user-list/user-list.component';


@NgModule({
  declarations: [
    PostsComponent,
    UserListComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class UsersModule { }
