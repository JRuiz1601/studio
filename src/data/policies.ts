import type { LucideIcon } from 'lucide-react';
import { HeartPulse, ShieldCheck, TrendingUp, Home, GraduationCap, Info } from 'lucide-react';

export type PolicyType = 'health' | 'accident' | 'pension' | 'renta' | 'education';
export type PolicyStatus = 'active' | 'manual' | 'auto-pending' | 'inactive';

export interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  status: PolicyStatus;
  isAutoActive: boolean;
  isAdaptivePremium: boolean;
  creditCost: number;
  coverageAmount: number;
  goalAmount?: number;
  nextPaymentDate?: string;
  activationHistory: { reason: string; date: string }[];
  description?: string;
}

export const policyIcons: { [key in PolicyType]: LucideIcon } = {
    health: HeartPulse,
    accident: ShieldCheck,
    pension: TrendingUp,
    renta: Home,
    education: GraduationCap,
};

export const mockPolicies: Policy[] = [
  { id: 'health1', name: 'Salud Esencial', type: 'health', status: 'active', isAutoActive: true, isAdaptivePremium: true, creditCost: 50, coverageAmount: 10000, nextPaymentDate: '2025-06-01', activationHistory: [{ reason: 'Initial activation', date: '2023-10-01' }], description: 'Comprehensive health coverage for peace of mind.' },
  { id: 'accident1', name: 'Accidentes Personales Plus', type: 'accident', status: 'auto-pending', isAutoActive: true, isAdaptivePremium: false, creditCost: 25, coverageAmount: 5000, nextPaymentDate: '2025-06-15', activationHistory: [], description: 'Protection against unexpected accidents and injuries.' },
  { id: 'pension1', name: 'Pensión Voluntaria Futuro', type: 'pension', status: 'manual', isAutoActive: false, isAdaptivePremium: true, creditCost: 100, coverageAmount: 0, goalAmount: 50000, activationHistory: [{ reason: 'Manual contribution', date: '2023-11-15' }], description: 'Build your retirement savings flexibly.' },
  { id: 'edu1', name: 'Seguro Educativo Crecer', type: 'education', status: 'active', isAutoActive: true, isAdaptivePremium: true, creditCost: 70, coverageAmount: 0, goalAmount: 20000, nextPaymentDate: '2025-07-01', activationHistory: [{ reason: 'Initial activation', date: '2024-01-10' }], description: 'Secure the future education of your loved ones.' },
];

export const potentialPolicies: Pick<Policy, 'id' | 'name' | 'type' | 'description' | 'creditCost'>[] = [
    { id: 'potential-renta', name: 'Rentas Voluntarias Tranquilidad', type: 'renta', description: 'Flexible long-term savings for retirement or other goals.', creditCost: 60 },
];