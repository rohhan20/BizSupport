import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) { 
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Check if we're in the browser and user is stored in localStorage
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    // Mock a more complete user object for better context
    const mockUser: User = {
      id: '1',
      email: email,
      businessName: 'Demo Business',
      businessType: 'Small LLC',
      industry: 'Technology',
      numberOfEmployees: 15,
      annualRevenue: '$500,000 - $1,000,000',
      phoneNumber: '555-123-4567',
      businessRegId: 'BUS12345'
    };
    
    // Store user in localStorage if in browser
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
    }
    
    // Update the currentUserSubject to notify all subscribers
    this.currentUserSubject.next(mockUser);
    
    return of(mockUser);
  }

  register(userData: User): Observable<User> {
    // Mock implementation for MVP
    const mockUser: User = {
      id: '1',
      ...userData,
      createdAt: new Date()
    };
    
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
    }
    
    this.currentUserSubject.next(mockUser);
    return of(mockUser);
  }

  logout(): void {
    // Remove user from localStorage if in browser
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    
    // Update the currentUserSubject to null
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }
}
