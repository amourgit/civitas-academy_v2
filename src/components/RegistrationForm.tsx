/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, 
  User, Mail, Phone, GraduationCap, Coins, FileText, 
  HelpCircle, Wifi, WifiOff, Loader2, Sparkles, Check
} from 'lucide-react';
import { Course, ParticipantForm } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { OfficialAttestation } from './OfficialAttestation';
import { getFundingLabel, getProfileOptions, getFundingOptions, getFormulaLabel, getFormulaOptions } from '../formLabels';

interface RegistrationFormProps {
  selectedCourse: Course;
  onSubmitSuccess: (formData: ParticipantForm) => void;
  onGoBack: () => void;
}

const DEFAULT_FORM: ParticipantForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  profileType: '',
  fundingType: '',
  motivation: '',
  agreedToTerms: false,
  selectedFormula: 'standard'
};

// Helper to temporarily sanitize stylesheets with oklch colors before calling html2canvas to avoid parsing crashes
async function withSanitizedStyles<T>(callback: () => Promise<T>): Promise<T> {
  const originalStyleContents = new Map<HTMLStyleElement, string>();
  const disabledLinks: HTMLLinkElement[] = [];
  const tempStyleElements: HTMLStyleElement[] = [];

  try {
    // 1. Sanitize inline <style> tags (common in development)
    const styleElements = Array.from(document.querySelectorAll('style'));
    for (const styleEl of styleElements) {
      const originalText = styleEl.textContent || '';
      if (originalText.includes('oklch')) {
        originalStyleContents.set(styleEl, originalText);
        // Replace oklch(...) with a neutral gray standard color
        const sanitizedText = originalText.replace(/oklch\([^)]+\)/g, 'rgb(120, 120, 120)');
        styleEl.textContent = sanitizedText;
      }
    }

    // 2. Sanitize <link> stylesheet tags (common in production/build environments)
    const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
    for (const linkEl of linkElements) {
      try {
        const response = await fetch(linkEl.href);
        if (response.ok) {
          const cssText = await response.text();
          if (cssText.includes('oklch')) {
            linkEl.disabled = true;
            disabledLinks.push(linkEl);

            const sanitizedCss = cssText.replace(/oklch\([^)]+\)/g, 'rgb(120, 120, 120)');
            const tempStyle = document.createElement('style');
            tempStyle.textContent = sanitizedCss;
            document.head.appendChild(tempStyle);
            tempStyleElements.push(tempStyle);
          }
        }
      } catch (err) {
        console.warn("Failed to sanitize stylesheet link:", linkEl.href, err);
      }
    }

    // Small delay to ensure browser styles have processed the update
    await new Promise(resolve => setTimeout(resolve, 80));

    return await callback();
  } finally {
    // Restore original <style> elements content
    for (const [styleEl, originalText] of originalStyleContents.entries()) {
      styleEl.textContent = originalText;
    }

    // Re-enable disabled <link> stylesheets
    for (const linkEl of disabledLinks) {
      linkEl.disabled = false;
    }

    // Clean up any temporary style elements created
    for (const tempStyle of tempStyleElements) {
      tempStyle.remove();
    }
  }
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  selectedCourse,
  onSubmitSuccess,
  onGoBack
}) => {
  // State for form and touch status (for validation display)
  const [formData, setFormData] = useState<ParticipantForm>(DEFAULT_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // App-level simulated states
  const [simulateNetworkError, setSimulateNetworkError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [restoredNotification, setRestoredNotification] = useState(false);
  const [pdfGenerationStatus, setPdfGenerationStatus] = useState<string | null>(null);

  // Generate a mock unique reference number
  const referenceId = useMemo(() => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REG-2026-${randomHex}`;
  }, []);

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`forma_register_draft_${selectedCourse.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({ ...DEFAULT_FORM, ...parsed });
        setRestoredNotification(true);
        // Hide restoration banner after 5s
        const timer = setTimeout(() => setRestoredNotification(false), 5000);
        return () => clearTimeout(timer);
      } catch (err) {
        console.error('Failed to restore draft', err);
      }
    }
  }, [selectedCourse.id]);

  // Save to LocalStorage on form change
  const handleFieldChange = (field: keyof ParticipantForm, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    localStorage.setItem(`forma_register_draft_${selectedCourse.id}`, JSON.stringify(updated));
    
    // Auto-clear submission errors on fix
    if (submissionError) setSubmissionError(null);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation Logic
  const errors = {
    firstName: !formData.firstName.trim() ? 'Le prénom est requis.' : formData.firstName.trim().length < 2 ? 'Minimum 2 caractères.' : null,
    lastName: !formData.lastName.trim() ? 'Le nom est requis.' : formData.lastName.trim().length < 2 ? 'Minimum 2 caractères.' : null,
    email: !formData.email ? 'L\'adresse e-mail est requise.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'Format d\'adresse e-mail invalide (ex: nom@domaine.fr).' : null,
    phone: !formData.phone ? 'Le numéro de téléphone est requis.' : (formData.phone.replace(/\D/g, '').length < 8 || formData.phone.replace(/\D/g, '').length > 15) ? 'Le numéro doit comporter entre 8 et 15 chiffres.' : null,
    profileType: !formData.profileType ? 'Veuillez sélectionner votre profil actuel.' : null,
    fundingType: !formData.fundingType ? 'Veuillez spécifier le mode de financement envisagé.' : null,
    agreedToTerms: !formData.agreedToTerms ? 'Vous devez accepter les conditions générales de vente et d\'utilisation.' : null
  };

  const isValid = !Object.values(errors).some(err => err !== null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(k => {
      allTouched[k] = true;
    });
    setTouched(allTouched);

    if (!isValid) {
      setSubmissionError('Veuillez corriger les erreurs dans le formulaire avant de soumettre.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    setPdfGenerationStatus("Génération de l'attestation de pré-inscription en cours...");

    // If simulating network error
    if (simulateNetworkError) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitting(false);
      setPdfGenerationStatus(null);
      setSubmissionError(
        'Échec de la connexion au serveur (Simulé). Code d\'erreur : NET_TIMEOUT_RETRY. Pas de panique ! Vos saisies sont enregistrées localement dans votre navigateur. Vous pouvez recharger la page et soumettre à nouveau en désactivant le bouton de simulation.'
      );
      return;
    }

    let pdfBase64 = '';
    let pdfBlob: Blob | null = null;

    try {
      // Small pause to guarantee DOM is updated with values
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const element = document.getElementById('registration-preview-attestation');
      if (!element) {
        throw new Error("L'élément de prévisualisation de l'attestation n'a pas été trouvé dans le DOM.");
      }

      // Generate the canvas using the style sanitization wrapper to prevent oklch parser crashes
      const canvas = await withSanitizedStyles(async () => {
        return await html2canvas(element, {
          scale: 2, // high DPI for clean text rendering
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdfBase64 = pdf.output('datauristring');
      pdfBlob = pdf.output('blob');
      
      if (!pdfBase64 || !pdfBlob) {
        throw new Error("Le PDF généré est vide.");
      }
      
      setPdfGenerationStatus("Envoi des données d'inscription au serveur...");
    } catch (pdfErr: any) {
      console.error("Échec critique de génération du PDF :", pdfErr);
      setIsSubmitting(false);
      setPdfGenerationStatus(null);
      setSubmissionError(
        `Échec de la génération du document PDF de pré-inscription : ${pdfErr.message || pdfErr}. Veuillez réessayer. Si le problème persiste, veuillez nous contacter directement.`
      );
      return;
    }

    // Real Submission to Webhook (Using multipart/form-data for full compatibility)
    try {
      // Store the PDF base64 securely in localStorage under the unique reference ID
      try {
        localStorage.setItem(`civitas_pdf_${referenceId}`, pdfBase64);
      } catch (lsErr) {
        console.warn("localStorage quota limit exceeded, couldn't store PDF:", lsErr);
      }

      // Save PDF on the backend server for global/domain-independent sharing and download
      try {
        const saveResponse = await fetch('/api/save-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ referenceId, pdfBase64 })
        });
        if (!saveResponse.ok) {
          console.warn("Failed to save PDF to Express server:", await saveResponse.text());
        } else {
          console.log("PDF saved successfully to Express server.");
        }
      } catch (serverErr) {
        console.warn("Network error saving PDF to Express server:", serverErr);
      }

      const webhookUrl = import.meta.env.VITE_REGISTRATION_WEBHOOK_URL || 'https://cloud.activepieces.com/api/v1/webhooks/IF1fK8EoZXPAP5HzhmJIS';
      
      const selectedFormulaKey = formData.selectedFormula || 'standard';
      const activePricing = selectedCourse.pricingFormats?.[selectedFormulaKey] || {
        price: selectedCourse.price,
        duration: selectedCourse.duration,
        currency: 'FCFA',
        unit: selectedFormulaKey === 'standard' ? 'F/mois' : '',
        hours: selectedCourse.hours
      };

      const fileName = `Attestation_CIVITAS_${formData.lastName.toUpperCase()}_${formData.firstName}.pdf`;

      // Construct a fully working absolute download URL using the real application domain
      const fullDownloadUrl = window.location.origin + window.location.pathname + `?download_pdf=${referenceId}`;

      // Construct standard lightweight JSON payload for Activepieces webhook
      const jsonPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        profileType: formData.profileType,
        fundingType: formData.fundingType,
        motivation: formData.motivation || '',
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        coursePrice: String(activePricing.price),
        courseDuration: activePricing.duration,
        courseHours: String(activePricing.hours || selectedCourse.hours),
        selectedFormula: selectedFormulaKey,
        submittedAt: new Date().toISOString(),
        pdfReferenceId: referenceId,
        pdfFileName: fileName,
        pdfMimeType: 'application/pdf',
        pdfUrl: fullDownloadUrl
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': formData.email,
          'X-Participant-Email': formData.email
        },
        body: JSON.stringify(jsonPayload)
      });

      if (!response.ok) {
        throw new Error(`Le serveur a retourné une erreur: ${response.status} ${response.statusText}`);
      }

      setIsSubmitting(false);
      setPdfGenerationStatus(null);
      // Clear draft since submission succeeded
      localStorage.removeItem(`forma_register_draft_${selectedCourse.id}`);
      
      // Pass the generated PDF information down to the success page
      const submittedData: ParticipantForm = {
        ...formData,
        generatedPdfBase64: pdfBase64,
        pdfReferenceId: referenceId
      };
      onSubmitSuccess(submittedData);
    } catch (err: any) {
      setIsSubmitting(false);
      setPdfGenerationStatus(null);
      setSubmissionError(
        `Une erreur est survenue lors de l'envoi de votre inscription : ${err.message || 'Erreur réseau.'}. Veuillez vérifier votre connexion ou réessayer plus tard. Vos informations restent enregistrées de manière sécurisée localement.`
      );
    }
  };

  // Calculate dynamic financing breakdown based on selection
  const getFinancingMessage = () => {
    const selectedFormulaKey = formData.selectedFormula || 'standard';
    const activePricing = selectedCourse.pricingFormats?.[selectedFormulaKey] || {
      price: selectedCourse.price,
      duration: selectedCourse.duration,
      currency: 'FCFA',
      unit: selectedFormulaKey === 'standard' ? 'F/mois' : '',
      hours: selectedCourse.hours
    };

    const priceText = `${activePricing.price.toLocaleString('fr-FR')} ${activePricing.currency}${activePricing.unit ? '/' + activePricing.unit : ''}`;

    switch (formData.fundingType) {
      case 'cpf':
        return {
          title: getFundingLabel('cpf', false, true),
          desc: 'Votre dossier sera traité par notre commission. Prise en charge estimée à 100% (reste à charge : 0 FCFA sous réserve d\'éligibilité).',
          costLabel: 'Prise en charge prévisionnelle',
          costValue: `-${priceText}`,
          finalPrice: '0 FCFA'
        };
      case 'opco':
        return {
          title: getFundingLabel('opco', false, true),
          desc: 'Une facture proforma et une convention de formation professionnelle CIVITAS seront envoyées à votre employeur pour prise en charge.',
          costLabel: 'Quote-part Entreprise',
          costValue: `-${priceText}`,
          finalPrice: '0 FCFA (Dossier entreprise)'
        };
      case 'pole_emploi':
        return {
          title: getFundingLabel('pole_emploi', false, true),
          desc: 'Demande de subvention de formation envoyée à l\'organisme partenaire pour validation de prise en charge.',
          costLabel: 'Aide accordée estimée',
          costValue: `-${priceText}`,
          finalPrice: '0 FCFA (Sous réserve d\'accord)'
        };
      case 'personal':
        return {
          title: getFundingLabel('personal', false, true),
          desc: 'Règlement à votre charge directe. Possibilité d\'étalonner en plusieurs versements mensuels ou forfait unique.',
          costLabel: 'Facilités de paiement',
          costValue: selectedFormulaKey === 'standard' ? 'Étalonné mensuellement' : 'Règlement unique',
          finalPrice: priceText
        };
      default:
        return null;
    }
  };

  const financeDetails = getFinancingMessage();

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl" id="registration-form-view">
      
      {/* Draft Restoration Toast Banner */}
      <AnimatePresence>
        {restoredNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-indigo-900 shadow-xs"
            id="restored-draft-notification"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse shrink-0" />
              <div className="text-xs font-semibold">
                Saisie récupérée : Votre progression a été restaurée à partir de la sauvegarde automatique locale !
              </div>
            </div>
            <button 
              onClick={() => setRestoredNotification(false)}
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-900 cursor-pointer px-2 py-1 rounded"
            >
              Fermer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Title and Nav-Back */}
      <div className="mb-8">
        <button
          onClick={onGoBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group cursor-pointer"
          id="btn-back-to-courses"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Retour au catalogue des formations</span>
        </button>

        <div className="mt-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Étape 2 : Dossier d'Admission
          </span>
          <h1 className="font-sans text-2.5xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 mt-2">
            Finalisez votre demande d'inscription
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-100 p-6 sm:p-8 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-zinc-100 pb-3">
            <User className="h-4 w-4 text-indigo-600" />
            <span>Coordonnées du participant</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6" id="registration-form">
            
            {/* Formule de Formation Selection */}
            <div className="flex flex-col border-b border-zinc-100 pb-5">
              <label className="text-xs font-bold text-zinc-700 mb-3 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>Formule de formation choisie <span className="text-red-500">*</span></span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {getFormulaOptions().map((formulaOption) => {
                  const pricing = selectedCourse.pricingFormats?.[formulaOption.value as keyof typeof selectedCourse.pricingFormats];
                  const formula = {
                    key: formulaOption.value,
                    label: formulaOption.label.replace('Formule ', '').replace(/ \(.+\)/, ''),
                    duration: pricing?.duration || '2 mois',
                    desc: formulaOption.value === 'speed' ? 'Apprentissage intensif' : formulaOption.value === 'semiSpeed' ? 'Rythme modéré' : 'Rythme continu',
                    price: pricing?.price,
                    currency: pricing?.currency,
                    unit: pricing?.unit || '',
                    hours: pricing?.hours
                  };
                  const isSelected = (formData.selectedFormula || 'standard') === formula.key;
                  return (
                    <div
                      key={formula.key}
                      onClick={() => handleFieldChange('selectedFormula', formula.key)}
                      className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/25 shadow-xs' 
                          : 'border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-zinc-900 uppercase tracking-wide">{formula.label}</span>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-300'}`}>
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-bold mb-1">{formula.duration}</span>
                      <span className="text-[10px] text-zinc-500 leading-tight mb-2">{formula.desc}</span>
                      <span className="text-[9px] text-zinc-400 font-medium">{formula.hours || selectedCourse.hours}h de formation</span>
                      <div className="mt-auto pt-2 border-t border-zinc-150 flex items-baseline gap-1">
                        <span className="text-sm font-extrabold text-zinc-950">
                          {formula.price?.toLocaleString('fr-FR')}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400">
                          {formula.currency} {formula.unit && ` / ${formula.unit}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* First and Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Prénom */}
              <div className="flex flex-col">
                <label htmlFor="firstName" className="text-xs font-bold text-zinc-700 mb-1.5">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onBlur={() => handleBlur('firstName')}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-zinc-800 transition-all ${
                      touched.firstName && errors.firstName 
                        ? 'border-red-300 focus:ring-red-500/15 focus:border-red-500 bg-red-50/5' 
                        : touched.firstName && !errors.firstName
                        ? 'border-emerald-300 focus:ring-emerald-500/15 focus:border-emerald-500 bg-emerald-50/5'
                        : 'border-zinc-200 focus:ring-indigo-500/15 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2`}
                    placeholder="Jean"
                  />
                  {touched.firstName && !errors.firstName && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600">
                      <Check className="h-4.5 w-4.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                {touched.firstName && errors.firstName && (
                  <span className="text-[11px] font-medium text-red-600 mt-1 flex items-center gap-1 animate-pulse">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.firstName}
                  </span>
                )}
              </div>

              {/* Nom */}
              <div className="flex flex-col">
                <label htmlFor="lastName" className="text-xs font-bold text-zinc-700 mb-1.5">
                  Nom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onBlur={() => handleBlur('lastName')}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-zinc-800 transition-all ${
                      touched.lastName && errors.lastName 
                        ? 'border-red-300 focus:ring-red-500/15 focus:border-red-500 bg-red-50/5' 
                        : touched.lastName && !errors.lastName
                        ? 'border-emerald-300 focus:ring-emerald-500/15 focus:border-emerald-500 bg-emerald-50/5'
                        : 'border-zinc-200 focus:ring-indigo-500/15 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2`}
                    placeholder="Dupont"
                  />
                  {touched.lastName && !errors.lastName && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600">
                      <Check className="h-4.5 w-4.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                {touched.lastName && errors.lastName && (
                  <span className="text-[11px] font-medium text-red-600 mt-1 flex items-center gap-1 animate-pulse">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* E-mail */}
              <div className="flex flex-col">
                <label htmlFor="email" className="text-xs font-bold text-zinc-700 mb-1.5">
                  Adresse e-mail <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onBlur={() => handleBlur('email')}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-zinc-800 transition-all ${
                      touched.email && errors.email 
                        ? 'border-red-300 focus:ring-red-500/15 focus:border-red-500 bg-red-50/5' 
                        : touched.email && !errors.email
                        ? 'border-emerald-300 focus:ring-emerald-500/15 focus:border-emerald-500 bg-emerald-50/5'
                        : 'border-zinc-200 focus:ring-indigo-500/15 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2`}
                    placeholder="jean.dupont@exemple.com"
                  />
                  {touched.email && !errors.email && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600">
                      <Check className="h-4.5 w-4.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                {touched.email && errors.email && (
                  <span className="text-[11px] font-medium text-red-600 mt-1 flex items-center gap-1 animate-pulse">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Téléphone */}
              <div className="flex flex-col">
                <label htmlFor="phone" className="text-xs font-bold text-zinc-700 mb-1.5">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    id="phone"
                    value={formData.phone}
                    onBlur={() => handleBlur('phone')}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-zinc-800 transition-all ${
                      touched.phone && errors.phone 
                        ? 'border-red-300 focus:ring-red-500/15 focus:border-red-500 bg-red-50/5' 
                        : touched.phone && !errors.phone
                        ? 'border-emerald-300 focus:ring-emerald-500/15 focus:border-emerald-500 bg-emerald-50/5'
                        : 'border-zinc-200 focus:ring-indigo-500/15 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2`}
                    placeholder="Ex: +241 74 34 37 76"
                  />
                  {touched.phone && !errors.phone && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600">
                      <Check className="h-4.5 w-4.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                {touched.phone && errors.phone && (
                  <span className="text-[11px] font-medium text-red-600 mt-1 flex items-center gap-1 animate-pulse">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Type Select */}
            <div className="flex flex-col">
              <label htmlFor="profileType" className="text-xs font-bold text-zinc-700 mb-1.5">
                Profil Actuel <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <GraduationCap className="h-4.5 w-4.5" />
                </span>
                <select
                  id="profileType"
                  value={formData.profileType}
                  onBlur={() => handleBlur('profileType')}
                  onChange={(e) => handleFieldChange('profileType', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-zinc-800 bg-white transition-all appearance-none cursor-pointer ${
                    touched.profileType && errors.profileType 
                      ? 'border-red-300 focus:ring-red-500/15 focus:border-red-500' 
                      : touched.profileType && !errors.profileType
                      ? 'border-emerald-300 focus:ring-emerald-500/15 focus:border-emerald-500'
                      : 'border-zinc-200 focus:ring-indigo-500/15 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2`}
                >
                  <option value="">Sélectionnez votre situation actuelle</option>
                  {getProfileOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-400 h-0 w-0" />
              </div>
              {touched.profileType && errors.profileType && (
                <span className="text-[11px] font-medium text-red-600 mt-1 flex items-center gap-1 animate-pulse">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {errors.profileType}
                </span>
              )}
            </div>

            {/* Funding Type Select */}
            <div className="flex flex-col">
              <label htmlFor="fundingType" className="text-xs font-bold text-zinc-700 mb-1.5">
                Mode de Financement Souhaité <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Coins className="h-4.5 w-4.5" />
                </span>
                <select
                  id="fundingType"
                  value={formData.fundingType}
                  onBlur={() => handleBlur('fundingType')}
                  onChange={(e) => handleFieldChange('fundingType', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-zinc-800 bg-white transition-all appearance-none cursor-pointer ${
                    touched.fundingType && errors.fundingType 
                      ? 'border-red-300 focus:ring-red-500/15 focus:border-red-500' 
                      : touched.fundingType && !errors.fundingType
                      ? 'border-emerald-300 focus:ring-emerald-500/15 focus:border-emerald-500'
                      : 'border-zinc-200 focus:ring-indigo-500/15 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2`}
                >
                  <option value="">Sélectionnez une option d'aide au financement</option>
                  {getFundingOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-400 h-0 w-0" />
              </div>
              {touched.fundingType && errors.fundingType && (
                <span className="text-[11px] font-medium text-red-600 mt-1 flex items-center gap-1 animate-pulse">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {errors.fundingType}
                </span>
              )}
            </div>

            {/* Motivation Text Area */}
            <div className="flex flex-col">
              <label htmlFor="motivation" className="text-xs font-bold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-zinc-400" />
                <span>Lettre de motivation ou remarques complémentaires (Facultatif)</span>
              </label>
              <textarea
                id="motivation"
                rows={3}
                value={formData.motivation}
                onChange={(e) => handleFieldChange('motivation', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all resize-y"
                placeholder="Indiquez brièvement votre projet professionnel ou d'éventuelles exigences spécifiques (ex: situation de handicap, aménagement d'horaires)..."
              />
            </div>

            {/* Interactive Terms check */}
            <div className="flex flex-col">
              <label className="relative flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onBlur={() => handleBlur('agreedToTerms')}
                  onChange={(e) => handleFieldChange('agreedToTerms', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 shrink-0 rounded-md border border-zinc-200 bg-white transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600 flex items-center justify-center text-white">
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs text-zinc-600 leading-normal">
                  J'atteste de l'exactitude des informations saisies et j'accepte expressément que mes coordonnées soient traitées pour la constitution de mon dossier d'admission conformément à la <span className="text-indigo-600 underline">Politique de Confidentialité</span> de l'Académie. <span className="text-red-500">*</span>
                </span>
              </label>
              {touched.agreedToTerms && errors.agreedToTerms && (
                <span className="text-[11px] font-medium text-red-600 mt-2 flex items-center gap-1 animate-pulse">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {errors.agreedToTerms}
                </span>
              )}
            </div>

            {/* Error Message Box */}
            {submissionError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900"
                id="form-submission-error-box"
              >
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs font-semibold leading-relaxed">
                    {submissionError}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Form Actions: Back and Submit */}
            <div className="flex flex-col sm:flex-row gap-4 items-center border-t border-zinc-100 pt-6">
              <button
                type="button"
                onClick={onGoBack}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Précédent
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-98 disabled:opacity-80 cursor-pointer"
                id="submit-form-button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                    <span className="animate-pulse">{pdfGenerationStatus || "Traitement et validation du dossier..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    <span>Soumettre mon dossier d'inscription</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Selected Course Summary & Cost Calculator Sticky Panel */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          {/* Selected Course Card */}
          <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-md border border-zinc-800" id="selected-course-sticky-summary">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
              Votre Parcours Sélectionné
            </span>
            <h3 className="font-sans text-xl font-bold tracking-tight text-white">
              {selectedCourse.title}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mt-5 border-t border-b border-zinc-800 py-4 text-xs font-medium text-zinc-400">
              <div>
                <span className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Catégorie</span>
                <span className="text-white font-semibold">{selectedCourse.category}</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Niveau prérequis</span>
                <span className="text-white font-semibold">{selectedCourse.level}</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Durée certifiante</span>
                <span className="text-white font-semibold">
                  {selectedCourse.pricingFormats?.[formData.selectedFormula || 'standard']?.duration || selectedCourse.duration} ({selectedCourse.pricingFormats?.[formData.selectedFormula || 'standard']?.hours || selectedCourse.hours}h)
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Prochaine Rentrée</span>
                <span className="text-indigo-400 font-bold">{selectedCourse.nextSession}</span>
              </div>
            </div>

            {/* Highlights bullet points */}
            <div className="mt-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Inclus dans la formation</span>
              <ul className="space-y-1.5">
                {selectedCourse.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dynamic Budget breakdowns */}
          <div className="bg-zinc-50 border border-zinc-200/60 rounded-2xl p-6" id="cost-breakdown-calculator">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-4">
              Plan financier prévisionnel
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-zinc-600 font-medium">
                <span>Frais de formation :</span>
                <span className="font-bold text-zinc-900">
                  {((selectedCourse.pricingFormats?.[formData.selectedFormula || 'standard']?.price) || selectedCourse.price).toLocaleString('fr-FR')} {selectedCourse.pricingFormats?.[formData.selectedFormula || 'standard']?.currency || 'FCFA'}
                  {selectedCourse.pricingFormats?.[formData.selectedFormula || 'standard']?.unit ? ` / ${selectedCourse.pricingFormats?.[formData.selectedFormula || 'standard']?.unit}` : ''}
                </span>
              </div>
              
              {financeDetails ? (
                <>
                  <div className="flex justify-between items-center text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/30">
                    <span>{financeDetails.costLabel} :</span>
                    <span>{financeDetails.costValue}</span>
                  </div>
                  <div className="border-t border-zinc-200 pt-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-800">Reste à charge estimé :</span>
                    <span className="text-lg font-black text-indigo-600">{financeDetails.finalPrice}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-3">
                    <strong>Note : </strong>{financeDetails.desc}
                  </p>
                </>
              ) : (
                <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100/50 text-amber-900 mt-2">
                  <div className="flex gap-2">
                    <HelpCircle className="h-4.5 w-4.5 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                      Veuillez choisir un <strong>Mode de Financement</strong> dans le formulaire pour afficher la simulation détaillée du reste à charge.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Network Failure Demonstration Switch */}
          <div className="bg-zinc-100/80 rounded-2xl p-5 border border-zinc-200" id="network-simulator-panel">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  simulateNetworkError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {simulateNetworkError ? <WifiOff className="h-4.5 w-4.5" /> : <Wifi className="h-4.5 w-4.5 animate-pulse" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-950">Démonstrateur de robustesse (Hors-ligne/Réseau)</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-normal">
                    Activez pour simuler une panne réseau lors de la soumission. Constatez la préservation des données de l'utilisateur grâce au <code className="bg-zinc-200 px-1 py-0.5 rounded text-[10px] font-mono">localStorage</code>.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={simulateNetworkError}
                  onChange={(e) => setSimulateNetworkError(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500" />
              </label>
            </div>
          </div>

        </div>

      </div>

      {/* Hidden container specifically for rendering PDF prior to submission */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '210mm',
          height: '0px',
          overflow: 'hidden',
          zIndex: -9999,
          pointerEvents: 'none'
        }}
      >
        <div
          id="registration-preview-attestation"
          style={{
            width: '210mm',
            minHeight: '297mm',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box'
          }}
        >
          <OfficialAttestation 
            selectedCourse={selectedCourse}
            participantDetails={formData}
            referenceId={referenceId}
            todayStr={todayStr}
          />
        </div>
      </div>

    </div>
  );
};
