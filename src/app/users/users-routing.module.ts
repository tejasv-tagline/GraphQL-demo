import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostsComponent } from './posts/posts.component';
import { UserListComponent } from './user-list/user-list.component';

const routes: Routes = [
  
  {
    path: 'posts',
    component: PostsComponent
  }, 
  {
    path: 'users',
    component: UserListComponent
  },
  {
    path: '**',
    redirectTo: 'posts'
  }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
