// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messages: Message[] = [];
  
  constructor() {
    // Initialize with a welcome message
    this.messages.push({
      text: 'Welcome to the Policy Navigator! I can help you understand policy changes and their implications for your business.',
      sender: 'bot',
      timestamp: new Date()
    });
  }

  getMessages(): Observable<Message[]> {
    return of(this.messages);
  }
  
  addSystemMessage(text: string): void {
    this.messages.push({
      text: text,
      sender: 'bot',
      timestamp: new Date(),
      isContextMessage: true
    });
  }

  sendMessage(text: string, context?: any): Observable<Message> {
    // Add user message
    const userMessage: Message = {
      text,
      sender: 'user',
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    
    // Generate bot response with context awareness
    setTimeout(() => {
      const botMessage: Message = {
        text: this.generateContextAwareResponse(text, context),
        sender: 'bot',
        timestamp: new Date()
      };
      this.messages.push(botMessage);
    }, 1000);
    
    return of(userMessage);
  }

  private generateContextAwareResponse(query: string, context?: any): string {
    // Enhanced response generator that considers the policy context
    if (!context) {
      return this.generateGenericResponse(query);
    }
    
    const lowerQuery = query.toLowerCase();
    
    // Responses for alerts
    if (context.type === 'alert') {
      if (context.title.includes('Tax Filing')) {
        if (lowerQuery.includes('deadline') || lowerQuery.includes('when')) {
          return 'The new quarterly tax filing deadline has been moved up by 2 weeks. The exact date is now the 15th instead of the 30th. This change was implemented to improve processing times.';
        } else if (lowerQuery.includes('why') || lowerQuery.includes('reason')) {
          return 'The tax filing deadline was changed due to new efficiency requirements from the tax authority. They are trying to process returns more quickly and avoid end-of-month congestion.';
        } else if (lowerQuery.includes('penalties') || lowerQuery.includes('late')) {
          return 'Late filing penalties remain at 5% of unpaid taxes for each month the return is late, up to 25%. With the earlier deadline, it\'s important to adjust your accounting processes accordingly.';
        }
      } 
      else if (context.title.includes('Employee Classification')) {
        if (lowerQuery.includes('guidelines') || lowerQuery.includes('what changed')) {
          return 'The new guidelines clarify that workers who set their own hours but use company equipment are now more likely to be classified as employees rather than contractors. This particularly affects remote workers in technical roles.';
        } else if (lowerQuery.includes('contractor') || lowerQuery.includes('employee')) {
          return 'Under the updated guidelines, contractors must now meet at least 3 of the 5 independence criteria: setting their own hours, using their own equipment, ability to work for multiple clients, control over how work is performed, and bearing financial risk.';
        }
      }
      else if (context.title.includes('Business License')) {
        if (lowerQuery.includes('documentation') || lowerQuery.includes('required')) {
          return 'The additional documentation now required includes: proof of tax compliance for the past 2 years, updated zoning compliance certificate, and verification of professional certifications for regulated industries.';
        } else if (lowerQuery.includes('process') || lowerQuery.includes('how to')) {
          return 'The new renewal process requires submitting all documentation at least 30 days before expiration. You\'ll need to use the new online portal rather than paper forms, and pay the processing fee electronically.';
        }
      }
      else if (context.title.includes('Data Privacy')) {
        if (lowerQuery.includes('regulation') || lowerQuery.includes('requirements')) {
          return 'The new data privacy regulations require explicit consent for each use of customer data, mandatory data breach reporting within 48 hours, and appointment of a data protection officer for companies with more than 50 customers.';
        } else if (lowerQuery.includes('comply') || lowerQuery.includes('how to')) {
          return 'To comply with the new regulations, you should: update your privacy policy, implement cookie consent mechanisms on your website, create a data breach response plan, and review your data storage security.';
        }
      }
    }
    
    // Responses for recommendations
    else if (context.type === 'recommendation') {
      if (context.title.includes('Privacy Policy')) {
        if (lowerQuery.includes('update') || lowerQuery.includes('change')) {
          return 'Your privacy policy needs to be updated to include: specific details about data collection methods, purpose of data collection for each type of data, third-party sharing protocols, and customer rights regarding their data.';
        } else if (lowerQuery.includes('template') || lowerQuery.includes('example')) {
          return 'I can help you with a template for your updated privacy policy. Would you like me to generate a draft based on your business type that complies with the new regulations?';
        }
      }
      else if (context.title.includes('Employee Classifications')) {
        if (lowerQuery.includes('review') || lowerQuery.includes('check')) {
          return 'To review your contractor classifications, you should assess: whether they use company equipment, set their own hours, work exclusively for your company, receive task-specific instructions, and bear financial risk for their work.';
        } else if (lowerQuery.includes('implications') || lowerQuery.includes('consequences')) {
          return 'Incorrect classification can result in back taxes, including the employer portion of FICA taxes, unemployment insurance contributions, and potential penalties of up to $1,000 per misclassified worker.';
        }
      }
      else if (context.title.includes('Tax Filing Changes')) {
        if (lowerQuery.includes('prepare') || lowerQuery.includes('changes')) {
          return 'To prepare for the tax filing changes, update your accounting procedures to gather required information earlier, schedule time with your accountant 3 weeks before the deadline instead of 2, and review the new form fields that require additional business expense categorization.';
        } else if (lowerQuery.includes('accounting') || lowerQuery.includes('software')) {
          return 'Most accounting software providers have released updates to accommodate the new requirements. Check if your software has been updated, specifically looking for the new "Categorized Business Expenses" section and "Digital Service Tax" fields.';
        }
      }
    }
    
    // If no specific response matched, provide a generic contextual response
    return `I understand you're asking about ${context.title}. ${context.description} Could you please be more specific about what aspect you'd like to know?`;
  }
  
  private generateGenericResponse(query: string): string {
    // This is a simplified mock response generator for queries without context
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('tax')) {
      return 'Recent tax policies for small businesses include new deduction options. Would you like me to explain the specific changes?';
    } else if (lowerQuery.includes('covid') || lowerQuery.includes('pandemic')) {
      return 'There are several relief programs still available for businesses affected by COVID-19. Would you like information about the current programs?';
    } else if (lowerQuery.includes('employee') || lowerQuery.includes('hire')) {
      return 'Recent changes to employment regulations include updates to minimum wage and contractor classification. What specific aspect would you like to know about?';
    } else {
      return "I understand you're asking about policy information. Could you provide more specific details about what you're looking for?";
    }
  }
}