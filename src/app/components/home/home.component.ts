import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PolicyAlert } from '../../models/policy-alert.interface';
import { PolicyRecommendation } from '../../models/policy-recommendation.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: false,
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  policyAlerts: PolicyAlert[] = [];
  policyRecommendations: PolicyRecommendation[] = [];
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      if (this.isLoggedIn) {
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData(): void {
    // Mock data for the dashboard
    this.policyAlerts = [
      {
        id: '1',
        title: 'New Tax Filing Deadline',
        description: 'The deadline for quarterly tax filing has been moved up by 2 weeks.',
        date: new Date(Date.now() - 86400000), // yesterday
        severity: 'high',
        read: false
      },
      {
        id: '2',
        title: 'Updated Employee Classification Guidelines',
        description: 'New guidelines for classifying contractors vs. employees have been released.',
        date: new Date(Date.now() - 172800000), // 2 days ago
        severity: 'medium',
        read: false
      },
      {
        id: '3',
        title: 'Changes to Business License Renewal Process',
        description: 'The renewal process now requires additional documentation for verification.',
        date: new Date(Date.now() - 345600000), // 4 days ago
        severity: 'medium',
        read: true
      },
      {
        id: '4',
        title: 'Data Privacy Regulation Update',
        description: 'New data handling regulations will come into effect next month.',
        date: new Date(Date.now() - 604800000), // 1 week ago
        severity: 'low',
        read: false
      }
    ];

    this.policyRecommendations = [
      {
        id: '1',
        title: 'Update Privacy Policy',
        description: 'Your privacy policy needs to be updated to comply with new data regulations.',
        impact: 'Required for continued operation',
        deadline: new Date(Date.now() + 2592000000) // 30 days from now
      },
      {
        id: '2',
        title: 'Review Employee Classifications',
        description: 'Based on new guidelines, you should review your contractor classifications.',
        impact: 'Potential tax implications',
        deadline: new Date(Date.now() + 1209600000) // 14 days from now
      },
      {
        id: '3',
        title: 'Prepare for Tax Filing Changes',
        description: 'New tax requirements will affect your quarterly filing. Update your accounting procedures.',
        impact: 'Financial compliance',
        deadline: new Date(Date.now() + 864000000) // 10 days from now
      }
    ];
  }

  navigateToChat(alertId: string): void {
    // Find the alert or recommendation to get its details
    const alert = this.policyAlerts.find(a => a.id === alertId);
    const recommendation = this.policyRecommendations.find(r => r.id === alertId);
    
    let contextData: any = {};
    
    if (alert) {
      // Mark the alert as read
      alert.read = true;
      contextData = {
        type: 'alert',
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        date: alert.date
      };
    } else if (recommendation) {
      contextData = {
        type: 'recommendation',
        title: recommendation.title,
        description: recommendation.description,
        impact: recommendation.impact,
        deadline: recommendation.deadline
      };
    }
    
    // Navigate to chat with enhanced context
    this.router.navigate(['/chat'], { 
      queryParams: { 
        context: alertId,
        contextData: JSON.stringify(contextData)
      }
    });
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return '';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }
}
