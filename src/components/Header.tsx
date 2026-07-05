/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PhoneCall, ShieldCheck, Mail } from 'lucide-react';
import { ActiveStep } from '../types';
import civitasLogo from '../assets/images/civitas_logo_1783238878219.png';

interface HeaderProps {
  activeStep: ActiveStep;
  onNavigate: (step: ActiveStep) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeStep, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('choice')}
          className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
          id="brand-logo"
        >
          <img 
            src={civitasLogo} 
            alt="CIVITAS Logo" 
            className="h-10 w-10 object-contain rounded-xl shadow-xs" 
            referrerPolicy="no-referrer"
          />
          <div>
            <span className="font-sans text-lg font-black tracking-wider text-zinc-900 uppercase">
              CIVITAS
            </span>
            <span className="block text-[8px] font-bold tracking-widest uppercase text-zinc-400">
              INTELLIGENCE. TECHNOLOGIE. IMPACT.
            </span>
          </div>
        </div>

        {/* Minimalist Dedicated Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center gap-8" id="main-navigation">
          <button
            onClick={() => onNavigate('choice')}
            className={`font-sans text-sm font-medium transition-colors hover:text-indigo-600 ${
              activeStep === 'choice' || activeStep === 'detail' ? 'text-indigo-600 font-semibold' : 'text-zinc-600'
            }`}
            id="nav-catalog"
          >
            Catalogue Formations
          </button>
          <button
            onClick={() => onNavigate('form')}
            className={`font-sans text-sm font-medium transition-colors hover:text-indigo-600 ${
              activeStep === 'form' ? 'text-indigo-600 font-semibold' : 'text-zinc-600'
            }`}
            id="nav-register"
          >
            Formulaire d'Inscription
          </button>
          {activeStep === 'success' && (
            <button
              onClick={() => onNavigate('success')}
              className="font-sans text-sm font-semibold text-emerald-600 transition-colors"
              id="nav-success"
            >
              Confirmation d'Admission
            </button>
          )}
        </nav>

        {/* Support & Security Certification Badge */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-500" id="support-phone">
            <PhoneCall className="h-4 w-4 text-zinc-400" />
            <span>Support : +241 74 34 37 76 / +241 65 45 76 63</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100" id="qualit-badge">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Certifié Qualiopi</span>
            <span className="sm:hidden">Qualiopi</span>
          </div>
        </div>
      </div>
    </header>
  );
};
