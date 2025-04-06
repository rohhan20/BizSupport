import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: false,
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  success = false;
  user: User | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {
    this.profileForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      businessName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      businessRegId: ['', Validators.required],
      linkedInProfile: [''],
      googleBusinessId: [''],
      salesTaxCertificate: [''],
      businessType: [''],
      industry: [''],
      numberOfEmployees: [''],
      annualRevenue: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe(user => {
      if (user) {
        this.user = user;
        this.profileForm.patchValue(user);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.userService.updateUserProfile(this.profileForm.value).subscribe({
      next: (user) => {
        this.success = true;
        this.loading = false;
        this.user = user;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
