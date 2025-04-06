// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Message } from '../models/message.model';
import { GeminiApiService } from './gemini-api.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messages: Message[] = [];
  
  constructor(private geminiApiService: GeminiApiService) {
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
    
    // Generate response using Gemini API
    return this.geminiApiService.generateResponse(text, context).pipe(
      map(response => {
        if (response.candidates && response.candidates.length > 0) {
          const botResponse = response.candidates[0].content.parts[0].text;
          
          const botMessage: Message = {
            text: botResponse,
            sender: 'bot',
            timestamp: new Date()
          };
          
          this.messages.push(botMessage);
          return userMessage;
        } else {
          throw new Error('No response from AI');
        }
      }),
      catchError(error => {
        console.error('Error getting response from Gemini API', error);
        
        // Add a fallback message
        const errorMessage: Message = {
          text: 'I\'m sorry, I encountered an issue processing your request. Please try again later.',
          sender: 'bot',
          timestamp: new Date()
        };
        
        this.messages.push(errorMessage);
        return of(userMessage);
      })
    );
  }

  private generateFallbackResponse(query: string, context?: any): string {
    // This is a fallback response generator for when the API fails
    const lowerQuery = query.toLowerCase();
    
    if (context && context.type === 'alert' && context.title) {
      return `I apologize, but I'm having trouble connecting to get the latest information about "${context.title}". Please try again in a moment, or contact customer support if the issue persists.`;
    }
    
    if (lowerQuery.includes('tax')) {
      return 'I apologize for the connection issues. Tax policies often change, and I recommend checking with your accountant for the most current information.';
    } else if (lowerQuery.includes('employee') || lowerQuery.includes('hire')) {
      return 'While I\'m having trouble accessing the specific details, employment regulations are important to stay compliant with. Consider reaching out to an HR consultant for guidance on this matter.';
    } else {
      return "I apologize, but I'm having trouble connecting to get you an answer. Please try again in a few moments.";
    }
  }
}