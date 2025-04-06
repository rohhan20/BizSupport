import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { Message } from '../../models/message.model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: false,
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  messages: Message[] = [];
  chatForm: FormGroup;
  policyContext: any = null;
  isLoadingResponse = false;
  private shouldScrollToBottom = true;
  
  constructor(
    private chatService: ChatService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.chatForm = this.formBuilder.group({
      message: ['', Validators.required]
    });
    
    // Reset scroll flag when navigating away to prevent scroll jumps when returning
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.shouldScrollToBottom = false;
      }
    });
  }

  ngOnInit(): void {
    // Get context data from route
    this.route.queryParams.subscribe(params => {
      if (params['contextData']) {
        try {
          this.policyContext = JSON.parse(params['contextData']);
          // No need to add initial context message - now displayed in the UI
        } catch (e) {
          console.error('Error parsing context data', e);
        }
      }
    });
    
    this.loadMessages();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
    }
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
      // Mark for scrolling after messages load
      this.shouldScrollToBottom = true;
    });
  }

  sendMessage(): void {
    if (this.chatForm.invalid || this.isLoadingResponse) {
      return;
    }

    const messageText = this.chatForm.get('message')?.value;
    this.chatForm.reset();
    this.isLoadingResponse = true;
    this.shouldScrollToBottom = true;
    
    this.chatService.sendMessage(messageText, this.policyContext).subscribe({
      next: () => {
        this.isLoadingResponse = false;
      },
      error: (error) => {
        console.error('Error sending message', error);
        this.isLoadingResponse = false;
      }
    });
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
  
  goBack(): void {
    this.location.back();
  }
}
