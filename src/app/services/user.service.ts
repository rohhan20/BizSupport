import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(private authService: AuthService) { }

  getUserProfile(): Observable<User | null> {
    return of(this.authService.currentUserValue);
  }

  updateUserProfile(userData: Partial<User>): Observable<User> {
    // Mock implementation - in real app, this would call an API
    const currentUser = this.authService.currentUserValue;
    const updatedUser: User = {
      ...currentUser!,
      ...userData
    };
    
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return of(updatedUser);
  }
}
