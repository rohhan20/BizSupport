// src/app/pipes/markdown.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: false,
})
export class MarkdownPipe implements PipeTransform {
  
  constructor(private sanitizer: DomSanitizer) {
    // Initialize marked once
    marked.setOptions({
      breaks: true, // Enable line breaks
      gfm: true     // Enable GitHub Flavored Markdown
      // Remove headerIds as it's not supported in this version
    });
  }
  
  transform(value: string): SafeHtml {
    if (!value) return '';
    
    try {
      // Parse markdown to HTML - ensure it returns a string
      const html = marked.parse(value) as string;
      
      // Sanitize the HTML to prevent XSS attacks while allowing hyperlinks
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (error) {
      console.error('Error processing markdown:', error);
      return this.sanitizer.bypassSecurityTrustHtml(value);
    }
  }
}