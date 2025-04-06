import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: false,
})
export class ChatComponent implements OnInit {
  messages: Message[] = [];
  chatForm: FormGroup;
  policyContext: any = null;
  isLoadingResponse = false;

  constructor(
    private chatService: ChatService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.chatForm = this.formBuilder.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Get context data from route
    this.route.queryParams.subscribe(params => {
      if (params['contextData']) {
        try {
          this.policyContext = JSON.parse(params['contextData']);
          // Add initial context message based on the alert/recommendation
          this.addContextMessage();
        } catch (e) {
          console.error('Error parsing context data', e);
        }
      }
    });
    
    this.loadMessages();
  }

  addContextMessage(): void {
    if (!this.policyContext) return;
    
    let contextMessage = '';
    
    if (this.policyContext.type === 'alert') {
      contextMessage = `Policy Alert: ${this.policyContext.title}\n\n${this.policyContext.description}`;
      if (this.policyContext.severity === 'high') {
        contextMessage += '\n\nThis is a high priority alert that requires immediate attention.';
      }
    } else if (this.policyContext.type === 'recommendation') {
      contextMessage = `Policy Recommendation: ${this.policyContext.title}\n\n${this.policyContext.description}\n\nImpact: ${this.policyContext.impact}`;
      if (this.policyContext.deadline) {
        const deadline = new Date(this.policyContext.deadline);
        contextMessage += `\n\nDeadline: ${deadline.toLocaleDateString()}`;
      }
    }
    
    // Add system message explaining the policy context
    if (contextMessage) {
      this.chatService.addSystemMessage(contextMessage);
    }
  }

  loadMessages(): void {
    this.chatService.getMessages().subscribe(messages => {
      this.messages = messages;
      // Scroll to bottom of messages
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  sendMessage(): void {
    if (this.chatForm.invalid || this.isLoadingResponse) {
      return;
    }

    const messageText = this.chatForm.get('message')?.value;
    this.isLoadingResponse = true;
    
    this.chatService.sendMessage(messageText, this.policyContext).subscribe({
      next: () => {
        this.chatForm.reset();
        this.isLoadingResponse = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error sending message', error);
        this.isLoadingResponse = false;
      }
    });
  }
  
  scrollToBottom(): void {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}
