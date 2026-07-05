/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { CourseSelector } from './components/CourseSelector';
import { CourseDetail } from './components/CourseDetail';
import { RegistrationForm } from './components/RegistrationForm';
import { SuccessView } from './components/SuccessView';
import { courses } from './coursesData';
import { Course, ParticipantForm, ActiveStep } from './types';
import { ShieldCheck, Mail, Info } from 'lucide-react';

export default function App() {
  // Core states
  const [activeStep, setActiveStep] = useState<ActiveStep>('choice');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [detailCourseId, setDetailCourseId] = useState<string | null>(null);
  const [participantDetails, setParticipantDetails] = useState<ParticipantForm | null>(null);

  // Sync state from localStorage on first mount
  useEffect(() => {
    const savedCourseId = localStorage.getItem('forma_selected_course_id');
    const savedParticipant = localStorage.getItem('forma_participant_details');
    const savedStep = localStorage.getItem('forma_active_step') as ActiveStep;

    if (savedCourseId) {
      setSelectedCourseId(savedCourseId);
    }
    if (savedParticipant) {
      try {
        setParticipantDetails(JSON.parse(savedParticipant));
      } catch (e) {
        console.error('Failed to parse participant details from localStorage');
      }
    }
    if (savedStep && ['choice', 'detail', 'form', 'success'].includes(savedStep)) {
      // Set initial step if valid
      setActiveStep(savedStep);
    }
  }, []);

  // Handle direct PDF download routing via query parameter (?download_pdf=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pdfId = params.get('download_pdf');
    if (pdfId) {
      const storedPdf = localStorage.getItem(`civitas_pdf_${pdfId}`);
      if (storedPdf) {
        try {
          const cleanBase64 = storedPdf.includes(',') ? storedPdf.split(',')[1] : storedPdf;
          const byteCharacters = atob(cleanBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `Attestation_CIVITAS_${pdfId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);

          // Clear query param from URL bar for clean URL
          const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (err) {
          console.error("Erreur lors du décodage ou du téléchargement du PDF :", err);
        }
      }
    }
  }, []);

  // Set up Hash-based routing to satisfy "chaque interfaces doit avoir sa propre route dédiée"
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/formations/')) {
        const courseId = hash.replace('#/formations/', '');
        const exists = courses.some(c => c.id === courseId);
        if (exists) {
          setDetailCourseId(courseId);
          setActiveStep('detail');
        } else {
          window.location.hash = '#/formations';
          setActiveStep('choice');
        }
      } else if (hash === '#/inscription') {
        const storedCourseId = localStorage.getItem('forma_selected_course_id') || selectedCourseId;
        if (storedCourseId) {
          setActiveStep('form');
        } else {
          // Fallback to choice if no course selected
          window.location.hash = '#/formations';
          setActiveStep('choice');
        }
      } else if (hash === '#/succes') {
        const storedParticipant = localStorage.getItem('forma_participant_details') || participantDetails;
        if (storedParticipant) {
          setActiveStep('success');
        } else {
          window.location.hash = '#/formations';
          setActiveStep('choice');
        }
      } else if (hash === '#/formations' || hash === '#/' || !hash) {
        setActiveStep('choice');
      } else {
        // Fallback to default
        window.location.hash = '#/formations';
        setActiveStep('choice');
      }
    };

    // Listen for hash modifications
    window.addEventListener('hashchange', handleHashChange);
    // Initialize once on mount (after state restore is complete)
    const timeoutId = setTimeout(() => {
      handleHashChange();
    }, 100);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      clearTimeout(timeoutId);
    };
  }, [selectedCourseId, participantDetails]);

  // Save states to LocalStorage and update router
  const navigateToStep = (step: ActiveStep, courseIdForDetail?: string) => {
    setActiveStep(step);
    localStorage.setItem('forma_active_step', step);
    
    if (step === 'choice') {
      window.location.hash = '#/formations';
    } else if (step === 'detail') {
      const targetId = courseIdForDetail || detailCourseId || selectedCourseId || 'web-fullstack';
      setDetailCourseId(targetId);
      window.location.hash = `#/formations/${targetId}`;
    } else if (step === 'form') {
      window.location.hash = '#/inscription';
    } else if (step === 'success') {
      window.location.hash = '#/succes';
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourseId(course.id);
    localStorage.setItem('forma_selected_course_id', course.id);
    navigateToStep('form');
  };

  const handleViewCourse = (courseId: string) => {
    navigateToStep('detail', courseId);
  };

  const handleFormSubmitSuccess = (formData: ParticipantForm) => {
    setParticipantDetails(formData);
    localStorage.setItem('forma_participant_details', JSON.stringify(formData));
    navigateToStep('success');
  };

  const handleResetRegistration = () => {
    setSelectedCourseId(null);
    setParticipantDetails(null);
    setDetailCourseId(null);
    // Keep user's form details cache for convenience but delete current registration
    localStorage.removeItem('forma_selected_course_id');
    localStorage.removeItem('forma_participant_details');
    localStorage.removeItem('forma_active_step');
    navigateToStep('choice');
  };

  // Find currently selected course object
  const selectedCourse = courses.find(c => c.id === selectedCourseId) || null;

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Top Banner Message */}
      <div className="bg-zinc-950 text-white py-2 px-4 text-center text-[11px] font-semibold tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Rentrée Académique 2026 : Profitez de nos bourses d'études et de réductions exceptionnelles sur les formules IA & Automatisation</span>
      </div>

      {/* Header and navigation */}
      <Header activeStep={activeStep} onNavigate={navigateToStep} />

      {/* 3-Step Progress Timeline bar */}
      <Timeline 
        activeStep={activeStep} 
        onStepClick={navigateToStep}
        hasSelectedCourse={!!selectedCourseId}
      />

      {/* Main Content Area with fluid slide/fade view transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {activeStep === 'choice' && (
            <motion.div
              key="choice-step"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.3 }}
            >
              <CourseSelector 
                onSelectCourse={handleSelectCourse} 
                onViewCourse={handleViewCourse}
                selectedCourseId={selectedCourseId}
              />
            </motion.div>
          )}

          {activeStep === 'detail' && detailCourseId && (
            <motion.div
              key="detail-step"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.3 }}
            >
              <CourseDetail 
                courseId={detailCourseId}
                onBack={() => navigateToStep('choice')}
                onSelectCourse={handleSelectCourse}
                onViewCourse={handleViewCourse}
              />
            </motion.div>
          )}

          {activeStep === 'form' && selectedCourse && (
            <motion.div
              key="form-step"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.3 }}
            >
              <RegistrationForm 
                selectedCourse={selectedCourse}
                onSubmitSuccess={handleFormSubmitSuccess}
                onGoBack={() => navigateToStep('choice')}
              />
            </motion.div>
          )}

          {activeStep === 'success' && selectedCourse && participantDetails && (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4 }}
            >
              <SuccessView 
                selectedCourse={selectedCourse}
                participantDetails={participantDetails}
                onReset={handleResetRegistration}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern Trust Footer */}
      <footer className="bg-zinc-50 border-t border-zinc-100 py-10 print:hidden" id="app-footer">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-zinc-200 pb-8 mb-8">
            {/* Mission info */}
            <div>
              <span className="font-sans text-sm font-black tracking-wider text-zinc-900 uppercase">
                CIVITAS Academy
              </span>
              <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                Pôle d'excellence pour l'intégration de solutions d'intelligence artificielle, l'automatisation de processus d'affaires et industriels, la data science, et la cybersécurité avancée.
              </p>
            </div>
            
            {/* Quick trust metrics */}
            <div className="flex gap-6 justify-start md:justify-center">
              <div>
                <span className="block text-lg font-black text-zinc-900">98.4%</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Taux de réussite</span>
              </div>
              <div>
                <span className="block text-lg font-black text-zinc-900">14 200+</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Membres formés</span>
              </div>
              <div>
                <span className="block text-lg font-black text-indigo-600">A+</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Note d'Impact IA</span>
              </div>
            </div>

            {/* Quality badges */}
            <div className="flex flex-col items-start md:items-end gap-1.5 text-right">
              <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 border border-zinc-200 shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Certification Qualiopi N° 849F-23</span>
              </div>
              <span className="text-[10px] text-zinc-400 block">La certification qualité a été délivrée au titre de la catégorie d'action : Actions de Formation</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400 font-medium">
            <span>&copy; {new Date().getFullYear()} CIVITAS Academy. Tous droits réservés.</span>
            <div className="flex gap-4">
              <span className="hover:text-zinc-600 cursor-pointer">Mentions Légales</span>
              <span>&bull;</span>
              <span className="hover:text-zinc-600 cursor-pointer">Confidentialité RGPD</span>
              <span>&bull;</span>
              <span className="hover:text-zinc-600 cursor-pointer">Accessibilité (95%)</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
