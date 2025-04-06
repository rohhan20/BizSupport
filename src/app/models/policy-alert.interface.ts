
export interface PolicyAlert {
    id: string;
    title: string;
    description: string;
    date: Date;
    severity: 'high' | 'medium' | 'low';
    read: boolean;
  }
  