// src/app/models/user.model.ts
export interface User {
  id?: string;
  email: string;
  businessName?: string;
  phoneNumber?: string;
  businessRegId?: string;
  linkedInProfile?: string;
  googleBusinessId?: string;
  salesTaxCertificate?: string;
  createdAt?: Date;
  businessType?: string;
  industry?: string;
  numberOfEmployees?: number;
  annualRevenue?: string;
}