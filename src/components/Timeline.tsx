/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Check, BookOpen, UserCheck, ShieldAlert } from 'lucide-react';
import { ActiveStep } from '../types';

interface TimelineProps {
  activeStep: ActiveStep;
  onStepClick?: (step: ActiveStep) => void;
  hasSelectedCourse: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ 
  activeStep, 
  onStepClick,
  hasSelectedCourse 
}) => {
  const steps = [
    { 
      key: 'choice' as ActiveStep, 
      label: '1. Choix du Programme', 
      desc: 'Sélectionnez votre parcours de formation',
      icon: BookOpen 
    },
    { 
      key: 'form' as ActiveStep, 
      label: '2. Informations Participant', 
      desc: 'Formulaire & validation de financement',
      icon: UserCheck 
    },
    { 
      key: 'success' as ActiveStep, 
      label: '3. Admission Confirmée', 
      desc: 'Dossier validé et confirmation',
      icon: Check 
    }
  ];

  const getStepIndex = (step: ActiveStep) => {
    if (step === 'choice' || step === 'detail') return 0;
    if (step === 'form') return 1;
    return 2;
  };

  const currentIndex = getStepIndex(activeStep);

  return (
    <div className="w-full bg-zinc-50 border-b border-zinc-100 py-6" id="registration-timeline-container">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
          
          {/* Timeline Background Connective Bar for Desktop */}
          <div className="absolute top-[22px] left-[5%] right-[5%] hidden h-1.5 rounded-full bg-zinc-200 md:block z-0 overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-600"
              initial={{ width: "0%" }}
              animate={{ 
                width: currentIndex === 0 ? "0%" : currentIndex === 1 ? "50%" : "100%" 
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          {/* Timeline Steps */}
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;
            const isClickable = (idx === 0) || (idx === 1 && hasSelectedCourse);
            const Icon = step.icon;

            return (
              <div 
                key={step.key}
                onClick={() => {
                  if (isClickable && onStepClick) {
                    onStepClick(step.key);
                  }
                }}
                className={`relative z-10 flex flex-row md:flex-col items-center gap-4 md:text-center flex-1 transition-all ${
                  isClickable ? 'cursor-pointer group' : 'cursor-not-allowed opacity-55'
                }`}
                id={`timeline-step-${step.key}`}
              >
                {/* Step Circle Indicator */}
                <div className="relative flex items-center justify-center">
                  <motion.div 
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 font-semibold transition-all ${
                      isCompleted 
                        ? 'border-indigo-600 bg-indigo-600 text-white' 
                        : isActive 
                        ? 'border-indigo-600 bg-white text-indigo-600 ring-4 ring-indigo-50 shadow-sm' 
                        : 'border-zinc-200 bg-white text-zinc-400'
                    }`}
                    animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5 stroke-[2.5]" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </motion.div>

                  {/* Animated border for active step */}
                  {isActive && (
                    <span className="absolute -inset-1 rounded-2xl border border-indigo-400 opacity-60 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
                  )}
                </div>

                {/* Step Text Label & Description */}
                <div className="flex flex-col text-left md:text-center">
                  <span className={`font-sans text-xs font-bold tracking-tight uppercase transition-colors ${
                    isActive ? 'text-indigo-600' : isCompleted ? 'text-zinc-800' : 'text-zinc-500'
                  } ${isClickable ? 'group-hover:text-indigo-700' : ''}`}>
                    {step.label}
                  </span>
                  <span className="font-sans text-xs text-zinc-500 md:max-w-[190px] mt-0.5 line-clamp-1 md:line-clamp-none">
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};
