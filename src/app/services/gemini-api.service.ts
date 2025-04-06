// src/app/services/gemini-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

export interface GeminiRequest {
  contents: {
    role: string;
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
}

export interface GeminiResponse {
  candidates: {
    content: {
      role: string;
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
    index: number;
  }[];
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: any[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class GeminiApiService {
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private apiKey: string;
  private currentUser: User | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.apiKey = environment.geminiApiKey;
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  generateResponse(message: string, context?: any): Observable<GeminiResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const businessContext = this.buildBusinessContext();
    const policyContext = this.buildPolicyContext(context);
    
    const requestBody: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [
            { 
              text: `${businessContext}
              
              ${policyContext}
              
              USER QUERY: ${message}
              
              Please respond concisely but thoroughly to the user's question above, specifically focusing on how the policy changes affect their business. Use a professional tone suitable for business advice. Format your response using Markdown where appropriate, including:
              
              1. Use **bold** for important points 
              2. Use bullet points for lists
              3. Include links to relevant resources where possible
              4. When citing sources, place them at the end of your response in a separate "Sources" section
              `
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topK: 40,
        topP: 0.95
      }
    };

    return this.http.post<GeminiResponse>(
      `${this.apiUrl}?key=${this.apiKey}`, 
      requestBody, 
      { headers }
    );
  }

  private buildBusinessContext(): string {
    if (!this.currentUser) {
      return 'You are assisting a business with understanding government policy changes.';
    }

    let context = `You are assisting a business with the following profile:
    - Business Name: ${this.currentUser.businessName || 'Unknown'}
    - Business Type: ${this.currentUser.businessType || 'Small business'}`;

    if (this.currentUser.industry) {
      context += `\n    - Industry: ${this.currentUser.industry}`;
    }

    if (this.currentUser.numberOfEmployees) {
      context += `\n    - Number of Employees: ${this.currentUser.numberOfEmployees}`;
    }

    if (this.currentUser.annualRevenue) {
      context += `\n    - Annual Revenue: ${this.currentUser.annualRevenue}`;
    }

    return context;
  }

  private buildPolicyContext(context?: any): string {
    if (!context) {
      return 'The user has a question about government policy changes that may affect their business.';
    }

    let policyContext = '';

    if (context.type === 'alert') {
      policyContext = `The user is inquiring about a policy alert with the following details:
      - Title: ${context.title}
      - Description: ${context.description}
      - Severity: ${context.severity}
      - Date: ${new Date(context.date).toLocaleDateString()}`;
    } 
    else if (context.type === 'recommendation') {
      policyContext = `The user is asking about a policy recommendation with the following details:
      - Title: ${context.title}
      - Description: ${context.description}
      - Impact: ${context.impact}`;
      
      if (context.deadline) {
        policyContext += `\n      - Deadline: ${new Date(context.deadline).toLocaleDateString()}`;
      }
    }

    return policyContext;
  }
}