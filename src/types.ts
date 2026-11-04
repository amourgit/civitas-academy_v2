/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Instructor {
  name: string;
  role: string;
  avatar: string;
}

export interface Testimonial {
  name: string;
  company: string;
  review: string;
  rating: number;
  avatar: string;
}

export interface PricingFormat {
  duration: string;
  price: number;
  currency: string;
  unit?: string;
  hours?: number;
}

export interface PricingFormats {
  speed: PricingFormat;
  semiSpeed: PricingFormat;
  standard: PricingFormat;
}

export interface Course {
  id: string;
  numero?: string;
  title: string;
  category: string;
  duration: string;
  hours: number;
  price: number;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Tous niveaux';
  description: string;
  highlights: string[];
  nextSession: string;
  image: string;
  fullDescription: string;
  importance: string;
  keyConcepts: string[];
  careers: string[];
  globalMarket: string;
  africanMarket: string;
  instructors: Instructor[];
  testimonials: Testimonial[];
  pricingFormats: PricingFormats;
}

export type ProfileType = 'student' | 'employee' | 'entrepreneur' | 'freelance' | 'retraining' | 'jobseeker' | 'other' | '';

export type FundingType = 'cpf' | 'opco' | 'pole_emploi' | 'personal' | '';

export type FormulaType = 'speed' | 'semiSpeed' | 'standard';

export interface ParticipantForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileType: ProfileType;
  fundingType: FundingType;
  motivation: string;
  agreedToTerms: boolean;
  selectedFormula?: FormulaType;
  generatedPdfBase64?: string;
  pdfReferenceId?: string;
}

export interface Registration {
  id: string;
  courseId: string;
  participant: ParticipantForm;
  registeredAt: string;
  status: 'pending' | 'confirmed';
}

export type ActiveStep = 'choice' | 'detail' | 'form' | 'success';

