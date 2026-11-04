/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Printer, ArrowRight, Share2, 
  Calendar, FileCheck2, ShieldCheck, Mail, Info, PlusCircle,
  Download, Eye, X, Check, FileDown, Sparkles, Loader2
} from 'lucide-react';
import { Course, ParticipantForm } from '../types';
import { OfficialAttestation } from './OfficialAttestation';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getFormulaLabel, getFundingLabel, getProfileLabel } from '../formLabels';

interface SuccessViewProps {
  selectedCourse: Course;
  participantDetails: ParticipantForm;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  selectedCourse,
  participantDetails,
  onReset
}) => {
  // Modal State for the official document - default open to automatically propose it
  const [isAttestationOpen, setIsAttestationOpen] = useState(true);
  const [isEmailSentAlert, setIsEmailSentAlert] = useState(true);

  // Generate or reuse unique reference number
  const referenceId = useMemo(() => {
    if (participantDetails.pdfReferenceId) {
      return participantDetails.pdfReferenceId;
    }
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REG-2026-${randomHex}`;
  }, [participantDetails.pdfReferenceId]);

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);



  const [isIframe, setIsIframe] = useState(false);
  const [showPrintIframeModal, setShowPrintIframeModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // If we already have the pre-generated PDF from the registration form submission, download it instantly!
      if (participantDetails.generatedPdfBase64) {
        const link = document.createElement('a');
        link.href = participantDetails.generatedPdfBase64;
        link.download = `Attestation_CIVITAS_${participantDetails.lastName.toUpperCase()}_${participantDetails.firstName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsDownloading(false);
        return;
      }

      // Safe fallback: generate on-the-fly from the DOM element in case the pre-generated PDF is missing
      const element = document.getElementById('official-attestation-document');
      if (!element) {
        throw new Error("L'élément d'attestation est introuvable.");
      }

      const canvas = await html2canvas(element, {
        scale: 2, // high quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
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

      const filename = `Attestation_CIVITAS_${participantDetails.lastName.toUpperCase()}_${participantDetails.firstName}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("Erreur de téléchargement du PDF :", err);
      alert("Une erreur est survenue lors du téléchargement de l'attestation.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') === 'true' || window.location.hash.includes('print=true')) {
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.error("L'impression a échoué:", e);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const newTabPrintUrl = useMemo(() => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?print=true#/succes`;
  }, []);

  const handlePrint = () => {
    if (isIframe) {
      setShowPrintIframeModal(true);
    } else {
      window.print();
    }
  };

  // Determine active pricing based on selected formula
  const selectedFormulaKey = participantDetails.selectedFormula || 'standard';
  const activePricing = selectedCourse.pricingFormats?.[selectedFormulaKey] || {
    price: selectedCourse.price,
    duration: selectedCourse.duration,
    currency: 'FCFA',
    unit: selectedFormulaKey === 'standard' ? 'F/mois' : '',
    hours: selectedCourse.hours
  };



  const formattedPrice = `${activePricing.price.toLocaleString('fr-FR')} ${activePricing.currency}${activePricing.unit ? ' / ' + activePricing.unit : ''}`;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl" id="success-view-container">
      {/* Self-contained Print styles to guarantee pixel-perfect vector A4 printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
            background: none !important;
          }
          #print-area-wrapper, #print-area-wrapper * {
            visibility: visible !important;
          }
          #print-area-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #official-attestation-document {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 10mm !important;
            width: 210mm !important;
            min-height: 297mm !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      {/* Hidden container specifically for printing */}
      <div id="print-area-wrapper" className="hidden print:block">
        <OfficialAttestation 
          selectedCourse={selectedCourse}
          participantDetails={participantDetails}
          referenceId={referenceId}
          todayStr={todayStr}
        />
      </div>

      {/* Celebration Header Animation */}
      <div className="text-center mb-8 print:hidden">
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.1 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"
          >
            <CheckCircle2 className="h-12 w-12 stroke-[2]" />
          </motion.div>
        </div>
        
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-full inline-block mb-2"
        >
          Dossier validé avec succès
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 mt-2"
        >
          Félicitations, {participantDetails.firstName} !
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-sans text-sm text-zinc-500 mt-3 max-w-xl mx-auto leading-relaxed"
        >
          Votre demande d'inscription a été enregistrée. Votre attestation officielle de pré-inscription est prête et disponible ci-dessous.
        </motion.p>
      </div>

      {/* Email confirmation alert banner requested by the user */}
      {isEmailSentAlert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 shadow-xs flex items-start gap-3.5 relative z-10 print:hidden"
        >
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-indigo-950 mb-0.5">Envoi automatique effectué</h4>
            <p className="leading-relaxed text-indigo-800">
              Un e-mail de confirmation officielle contenant votre <strong>Attestation de Pré-inscription CIVITAS (PDF)</strong> ainsi que vos identifiants temporaires de rentrée vient d'être envoyé à l'adresse : <strong className="underline">{participantDetails.email}</strong>.
            </p>
          </div>
          <button 
            onClick={() => setIsEmailSentAlert(false)}
            className="text-indigo-400 hover:text-indigo-900 shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Main Grid: Slip Ticket and Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch print:hidden">
        
        {/* Printable Official Receipt Slip Ticket Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="md:col-span-7 bg-white rounded-2xl border border-zinc-100 p-6 sm:p-8 shadow-sm flex flex-col justify-between"
          id="admission-ticket-card"
        >
          <div>
            <div className="flex justify-between items-start border-b border-dashed border-zinc-200 pb-5 mb-5">
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Fiche de Pré-Inscription
                </span>
                <span className="font-mono text-sm font-bold text-zinc-800">
                  Ref : {referenceId}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Statut Dossier
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  Admis d'office
                </span>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="space-y-4 text-xs">
              
              {/* Program Section */}
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">FORMATION SÉLECTIONNÉE</span>
                <span className="font-sans text-base font-extrabold text-zinc-950 block leading-tight">
                  {selectedCourse.title}
                </span>
                <span className="text-zinc-500 block mt-1 font-semibold text-indigo-600">
                  {getFormulaLabel(selectedFormulaKey, true)} — {activePricing.hours || selectedCourse.hours}h de cours
                </span>
              </div>

              {/* Participant details */}
              <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">PARTICIPANT</span>
                  <span className="font-semibold text-zinc-800 block">
                    {participantDetails.lastName.toUpperCase()} {participantDetails.firstName}
                  </span>
                  <span className="text-zinc-500 font-medium">{getProfileLabel(participantDetails.profileType, true)}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">DATE DE SOUMISSION</span>
                  <span className="text-zinc-800 font-medium block">{todayStr}</span>
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">ADRESSE E-MAIL</span>
                  <span className="text-zinc-800 font-medium break-all block">{participantDetails.email}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">TÉLÉPHONE</span>
                  <span className="text-zinc-800 font-medium block">{participantDetails.phone}</span>
                </div>
              </div>

              {/* Financial method */}
              <div className="border-t border-zinc-100 pt-4">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">MODE DE FINANCEMENT</span>
                <span className="text-zinc-800 font-semibold block">{getFundingLabel(participantDetails.fundingType, false, true)}</span>
              </div>

              {/* Financial Balance Breakdown */}
              <div className="border-t border-dashed border-zinc-200 pt-4 mt-6 bg-zinc-50/50 -mx-6 px-6 py-4 rounded-b-2xl">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Frais de scolarité ({getFormulaLabel(selectedFormulaKey, true)}) :</span>
                    <span className="font-semibold text-zinc-800">{formattedPrice}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Aide prévisionnelle ({participantDetails.fundingType.toUpperCase()}) :</span>
                    <span>
                      {participantDetails.fundingType === 'personal' ? 'Option étalement activée' : `-${formattedPrice}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-950 font-bold border-t border-zinc-200 pt-2 text-sm mt-1">
                    <span>Reste à charge direct :</span>
                    <span className="text-indigo-600 font-extrabold">
                      {participantDetails.fundingType === 'personal' ? formattedPrice : '0 FCFA *'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="text-[10px] text-zinc-400 mt-4 leading-normal">
            * Validation définitive sous réserve de conformité réglementaire de votre dossier de prise en charge d'études.
          </div>
        </motion.div>

        {/* Next Chronological Action Steps Column */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="md:col-span-5 flex flex-col justify-between gap-6"
          id="next-steps-timeline-card"
        >
          <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-6 flex-1">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-800 mb-5 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-indigo-600" />
              <span>Vos prochaines étapes</span>
            </h3>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="relative pl-7 flex items-start gap-1">
                <div className="absolute left-0 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Entretien d'Orientation</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                    Un conseiller pédagogique CIVITAS va vous recontacter par téléphone ou e-mail sous 24 heures pour valider votre planning.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative pl-7 flex items-start gap-1">
                <div className="absolute left-0 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Accès Plateforme E-Learning</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                    Dès finalisation administrative, vos accès définitifs au portail E-Learning CIVITAS Academy vous seront transmis.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative pl-7 flex items-start gap-1">
                <div className="absolute left-0 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Rentrée Officielle</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                    La session démarrera le <strong>{selectedCourse.nextSession}</strong> par une classe virtuelle de bienvenue.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Utility Actions Row */}
          <div className="space-y-3 print:hidden">
            <button
              onClick={() => setIsAttestationOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 shadow-xs transition-colors cursor-pointer"
              id="btn-view-attestation"
            >
              <Eye className="h-4.5 w-4.5" />
              <span>Voir mon Attestation Officielle (A4)</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              id="btn-download-pdf"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
                  <span>Génération du PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 text-indigo-600" />
                  <span>Télécharger mon attestation officielle (PDF)</span>
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              id="btn-register-again"
            >
              <PlusCircle className="h-4 w-4" />
              <span>S'inscrire à une autre formation</span>
            </button>
          </div>

        </motion.div>

      </div>

      {/* MODAL / OVERLAY FOR AUTOMATIC ATTESTATION PROPOSAL - Requested: "et que ca soit automatiquement proposé a l'utilisateur de recuperer son document de pre-inscription" */}
      <AnimatePresence>
        {isAttestationOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-zinc-100 rounded-3xl w-full max-w-[225mm] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Control Bar */}
              <div className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">Votre Attestation Officielle CIVITAS</h3>
                    <p className="text-[10px] text-zinc-400">Générée automatiquement au format A4 réglementaire</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Download Trigger Button */}
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                    id="modal-btn-download"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Téléchargement...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 text-white" />
                        <span>Télécharger mon Attestation (PDF)</span>
                      </>
                    )}
                  </button>
                  
                  {/* Close button */}
                  <button
                    onClick={() => setIsAttestationOpen(false)}
                    className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Fermer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Document Preview Area - Styled like a document on a desk */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-700/20 flex justify-center items-start">
                <div className="shadow-2xl hover:shadow-3xl transition-shadow">
                  <OfficialAttestation 
                    selectedCourse={selectedCourse}
                    participantDetails={participantDetails}
                    referenceId={referenceId}
                    todayStr={todayStr}
                  />
                </div>
              </div>

              {/* Modal Bottom Alert Bar */}
              <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-indigo-600" />
                  <span>Un exemplaire PDF a également été envoyé à : <strong className="text-zinc-800">{participantDetails.email}</strong></span>
                </span>
                <button
                  onClick={() => setIsAttestationOpen(false)}
                  className="px-4 py-1.5 rounded-lg border border-zinc-350 bg-white hover:bg-zinc-100 text-zinc-700 font-semibold cursor-pointer"
                >
                  Fermer la liseuse
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL POUR GÉRER L'IMPRESSION DANS L'IFRAME */}
      <AnimatePresence>
        {showPrintIframeModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-zinc-950/85 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-zinc-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                  <Printer className="h-6 w-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-950 uppercase tracking-tight">Impression bloquée par l'aperçu</h3>
                  <p className="text-xs text-zinc-500 mt-1">Sécurité du navigateur (Iframe)</p>
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-zinc-600">
                <p>
                  L'application s'exécute actuellement dans un <strong>cadre d'aperçu sécurisé (iframe)</strong>. Par mesure de sécurité, les navigateurs bloquent le lancement de la boîte de dialogue d'impression système (<code className="bg-zinc-100 px-1 py-0.5 rounded font-mono font-bold">window.print()</code>) depuis ces cadres.
                </p>
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-indigo-950">
                  <h4 className="font-bold text-xs text-indigo-950 mb-1 flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>Solution en 1 clic :</span>
                  </h4>
                  <p className="text-[11px] text-indigo-900 leading-relaxed">
                    Cliquez sur le bouton ci-dessous pour ouvrir votre attestation dans un nouvel onglet autonome. <strong>La boîte de dialogue d'impression ou de sauvegarde PDF se lancera alors automatiquement !</strong>
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <a
                  href={newTabPrintUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowPrintIframeModal(false)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer text-center"
                >
                  <Printer className="h-4.5 w-4.5" />
                  <span>Ouvrir & Imprimer l'attestation</span>
                </a>

                <button
                  onClick={() => setShowPrintIframeModal(false)}
                  className="w-full px-5 py-2.5 rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
