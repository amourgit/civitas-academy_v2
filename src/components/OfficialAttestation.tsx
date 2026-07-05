/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Course, ParticipantForm } from '../types';
import civitasLogo from '../assets/images/civitas_logo_1783238878219.png';

interface OfficialAttestationProps {
  selectedCourse: Course;
  participantDetails: ParticipantForm;
  referenceId: string;
  todayStr: string;
}

export const OfficialAttestation: React.FC<OfficialAttestationProps> = ({
  selectedCourse,
  participantDetails,
  referenceId,
  todayStr
}) => {
  const selectedFormulaKey = participantDetails.selectedFormula || 'standard';
  const activePricing = selectedCourse.pricingFormats?.[selectedFormulaKey] || {
    price: selectedCourse.price,
    duration: selectedCourse.duration,
    currency: 'FCFA',
    unit: selectedFormulaKey === 'standard' ? 'F/mois' : ''
  };

  const formulaLabel = (key: string) => {
    switch (key) {
      case 'speed': return 'Formule Intensif (Speed - 2 semaines)';
      case 'semiSpeed': return 'Formule Accéléré (Semi Speed - 1 mois)';
      case 'standard': return 'Formule Standard (2 mois)';
      default: return 'Formule Standard (2 mois)';
    }
  };

  const fundingLabel = (type: string) => {
    switch (type) {
      case 'cpf': return 'Financement Professionnel Certifié (CIVITAS)';
      case 'opco': return 'Financement Employeur (Facture Proforma / OPCO)';
      case 'pole_emploi': return 'Financement Public Partner / Aide Nationale';
      case 'personal': return 'Financement Personnel (Facilités d\'étalement)';
      default: return 'Financement Personnel';
    }
  };

  const profileLabel = (type: string) => {
    switch (type) {
      case 'student': return 'Étudiant(e)';
      case 'employee': return 'Salarié(e) / Professionnel';
      case 'jobseeker': return 'Demandeur d\'emploi';
      case 'freelance': return 'Indépendant / Chef d\'entreprise';
      case 'retraining': return 'En reconversion professionnelle';
      default: return 'Candidat';
    }
  };

  const formattedPrice = `${activePricing.price.toLocaleString('fr-FR')} ${activePricing.currency}${activePricing.unit ? ' / ' + activePricing.unit : ''}`;

  return (
    <div 
      className="font-sans p-8 w-[210mm] min-h-[297mm] mx-auto relative overflow-hidden"
      style={{
        backgroundColor: '#ffffff',
        color: '#18181b', // text-zinc-900
        border: '8px double #d4d4d8', // border-zinc-300
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        boxSizing: 'border-box'
      }}
      id="official-attestation-document"
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.02 }}>
        <img 
          src={civitasLogo} 
          alt="Watermark" 
          className="w-[110mm] h-[110mm] object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Header section */}
      <div 
        className="flex flex-row justify-between items-start gap-4 pb-4 mb-4 relative z-10"
        style={{ borderBottom: '2px solid #18181b' }}
      >
        <div>
          {/* Logo with specific "ampleur dimensionnelle" requested by the user */}
          <img 
            src={civitasLogo} 
            alt="CIVITAS ACADEMY" 
            className="h-16 w-auto object-contain mb-2 rounded-xl shadow-xs"
            referrerPolicy="no-referrer"
          />
          {/* Red status box identical to "Reconnue par l'Etat" pattern requested */}
          <div 
            className="text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm inline-block"
            style={{ backgroundColor: '#dc2626', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
          >
            PÔLE D'EXCELLENCE IA & AUTOMATISATION
          </div>
        </div>
        
        <div 
          className="text-right text-[11px] space-y-0.5 self-stretch flex flex-col justify-end"
          style={{ color: '#71717a' }} // text-zinc-500
        >
          <h3 className="font-extrabold text-xs uppercase tracking-wider" style={{ color: '#18181b' }}>CIVITAS ACADEMY AFRICA</h3>
          <p className="font-medium text-[10px]">Hub d'Innovation Technologique & Digitale</p>
          <p className="text-[10px]">Libreville, Gabon — BP 20384</p>
          <p className="text-[10px]">Tél : +241 74 34 37 76 / +241 65 45 76 63</p>
          <p className="font-bold text-[10px]" style={{ color: '#4f46e5' }}>civitas-africa.vercel.app</p>
          <p className="text-[9px]">Agrément N° 2026/GAB/CIV-09</p>
        </div>
      </div>

      {/* Title block */}
      <div className="text-center my-4 relative z-10">
        <span className="text-[9px] font-bold uppercase tracking-widest block mb-0.5" style={{ color: '#a1a1aa' }}>
          RÉPUBLIQUE GABONAISE — ACADÉMIE CIVITAS
        </span>
        <h1 
          className="text-2xl font-black uppercase tracking-tight py-2 inline-block px-8"
          style={{
            color: '#09090b', // text-zinc-950
            borderTop: '2px solid #18181b',
            borderBottom: '2px solid #18181b'
          }}
        >
          ATTESTATION DE PRÉ-INSCRIPTION
        </h1>
        <div className="mt-1 text-xs font-mono" style={{ color: '#71717a' }}>
          RÉFÉRENCE UNIQUE : <span className="font-bold" style={{ color: '#27272a' }}>{referenceId}</span>
        </div>
      </div>

      {/* Date and Location */}
      <div className="text-right text-xs font-medium mb-3 relative z-10" style={{ color: '#3f3f46' }}>
        Fait à Libreville, le <span className="font-bold" style={{ color: '#18181b' }}>{todayStr.split(' à')[0]}</span>
      </div>

      {/* Main Content Body */}
      <div className="space-y-4 text-xs leading-relaxed relative z-10" style={{ color: '#27272a' }}>
        <p>
          Le Conseil Académique d'Admission de <strong>CIVITAS Academy</strong> certifie l'examen favorable du dossier du candidat ci-dessous et lui délivre cette attestation de pré-inscription officielle, sous réserve de validation financière.
        </p>

        {/* Participant Info Block */}
        <div 
          className="rounded-xl p-4"
          style={{
            backgroundColor: '#f4f4f5', // bg-zinc-50
            border: '1px solid #e4e4e7' // border-zinc-200
          }}
        >
          <h4 
            className="text-[9px] font-black uppercase tracking-widest pb-1 mb-2"
            style={{
              color: '#a1a1aa', // text-zinc-400
              borderBottom: '1px solid #e4e4e7'
            }}
          >
            INFORMATIONS DU CANDIDAT ADMIS
          </h4>
          <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-[11px]">
            <div className="flex justify-start gap-4">
              <span className="w-24 shrink-0" style={{ color: '#71717a' }}>Nom & Prénom :</span>
              <span className="font-bold uppercase" style={{ color: '#18181b' }}>{participantDetails.lastName} {participantDetails.firstName}</span>
            </div>
            <div className="flex justify-start gap-4">
              <span className="w-24 shrink-0" style={{ color: '#71717a' }}>Profil Actuel :</span>
              <span className="font-semibold" style={{ color: '#27272a' }}>{profileLabel(participantDetails.profileType)}</span>
            </div>
            <div className="flex justify-start gap-4">
              <span className="w-24 shrink-0" style={{ color: '#71717a' }}>Adresse E-mail :</span>
              <span className="font-semibold break-all" style={{ color: '#27272a' }}>{participantDetails.email}</span>
            </div>
            <div className="flex justify-start gap-4">
              <span className="w-24 shrink-0" style={{ color: '#71717a' }}>Téléphone :</span>
              <span className="font-bold" style={{ color: '#27272a' }}>{participantDetails.phone}</span>
            </div>
          </div>
        </div>

        <p>
          Le candidat est déclaré admissible et pré-inscrit pour suivre le cursus de formation de haut niveau ci-dessous décrit, orienté vers l'acquisition de compétences pratiques et opérationnelles :
        </p>

        {/* Selected Program Details Table */}
        <table 
          className="w-full text-left text-[11px] border-collapse rounded-xl overflow-hidden"
          style={{ border: '1px solid #d4d4d8' }}
        >
          <thead>
            <tr className="uppercase tracking-wider font-bold text-[10px]" style={{ backgroundColor: '#18181b', color: '#ffffff' }}>
              <th className="p-2 font-semibold" style={{ border: '1px solid #d4d4d8' }}>Intitulé de la formation</th>
              <th className="p-2 font-semibold" style={{ border: '1px solid #d4d4d8' }}>Formule & Rythme</th>
              <th className="p-2 font-semibold" style={{ border: '1px solid #d4d4d8' }}>Volume Horaire</th>
              <th className="p-2 font-semibold" style={{ border: '1px solid #d4d4d8' }}>Frais d'Enseignement</th>
            </tr>
          </thead>
          <tbody>
            <tr className="font-medium" style={{ backgroundColor: '#ffffff', color: '#27272a' }}>
              <td className="p-2 font-bold" style={{ border: '1px solid #d4d4d8', color: '#09090b' }}>
                {selectedCourse.title}
              </td>
              <td className="p-2 font-bold" style={{ border: '1px solid #d4d4d8', color: '#4338ca' }}>
                {formulaLabel(selectedFormulaKey)}
              </td>
              <td className="p-2" style={{ border: '1px solid #d4d4d8' }}>
                {selectedCourse.hours} heures (Théorie & Ateliers)
              </td>
              <td className="p-2 font-extrabold" style={{ border: '1px solid #d4d4d8', color: '#09090b' }}>
                {formattedPrice}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Additional course terms & requirements */}
        <div 
          className="space-y-1 text-xs p-3 rounded-xl"
          style={{
            backgroundColor: 'rgba(244, 244, 245, 0.5)', // bg-zinc-50/50
            border: '1px dashed #e4e4e7',
            color: '#52525b' // text-zinc-600
          }}
        >
          <p>
            <strong>Session de Rentrée prévue : </strong> <span className="font-bold" style={{ color: '#4f46e5' }}>{selectedCourse.nextSession}</span>
          </p>
          <p>
            <strong>Lieu des cours : </strong> 100% en ligne via notre classe virtuelle synchrone et notre plateforme e-learning interactive.
          </p>
          <p>
            <strong>Mode de Prise en charge : </strong> {fundingLabel(participantDetails.fundingType)}
          </p>
        </div>

        <p className="text-[11px] leading-relaxed" style={{ color: '#71717a' }}>
          Pour valider définitivement votre inscription administrative et obtenir votre certificat d'inscription, vous devez procéder au paiement du premier acompte ou présenter un justificatif de prise en charge par un organisme tiers.
        </p>
      </div>

      {/* Signature and Stamp Blocks */}
      <div className="mt-8 flex flex-row justify-between items-start gap-6 relative z-10 pb-6">
        
        {/* Authentic Circular Ink Stamp (CSS Simulated) */}
        <div className="relative flex items-center justify-center">
          <div 
            className="w-24 h-24 rounded-full flex flex-col items-center justify-center text-center p-1.5 select-none rotate-6 font-mono font-bold text-[7px] uppercase tracking-wider relative"
            style={{
              border: '4px dashed rgba(67, 56, 202, 0.6)',
              color: 'rgba(67, 56, 202, 0.6)'
            }}
          >
            <span className="absolute animate-pulse">STAMP OF ENTRY</span>
            <div 
              className="rounded-full w-full h-full flex flex-col items-center justify-center"
              style={{ border: '1px solid rgba(67, 56, 202, 0.4)' }}
            >
              <span>CIVITAS ACADEMY</span>
              <span 
                className="text-[9px] font-extrabold mt-0.5 px-1 py-0.2 rounded-sm"
                style={{
                  color: '#dc2626',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  backgroundColor: 'rgba(254, 242, 242, 0.2)'
                }}
              >
                ADMIS 2026
              </span>
              <span className="mt-0.5">AFRICA HUB</span>
            </div>
          </div>
          {/* Faint blue overlay for ink look */}
          <div 
            className="absolute inset-0 blur-[1px] rounded-full pointer-events-none"
            style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
          />
        </div>

        {/* Director Signature section */}
        <div className="text-right space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#71717a' }}>POUR LE CONSEIL ACADÉMIQUE</p>
          <p className="text-xs font-semibold" style={{ color: '#18181b' }}>M. NZILA NGALA Amour Samuel</p>
          <p className="text-[9px] italic" style={{ color: '#71717a' }}>Fondateur & CEO</p>
          
          {/* Simulated Hand Signature */}
          <div className="pt-2 flex justify-end">
            <svg 
              className="w-36 h-16 fill-none" 
              viewBox="0 0 240 110"
              style={{ stroke: '#1d4ed8', opacity: 0.95 }}
            >
              {/* Left loop and initial curls */}
              <path 
                d="M 45,28 C 45,28 35,22 41,20 C 47,18 55,23 58,25 C 61,27 68,20 68,22 C 68,24 64,35 62,45 C 60,55 58,65 52,75" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Big initial loop crossing and horizontal scratch line */}
              <path 
                d="M 70,22 L 95,60 C 95,60 90,58 75,58 L 5,41 M 5,41 L 110,43" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Script waves / zig-zag script in middle */}
              <path 
                d="M 95,60 L 108,28 L 112,65 M 112,65 L 118,29 L 121,65 M 121,65 L 127,29 L 130,65 M 130,65 L 136,29 L 139,65 M 139,65 L 145,29 L 148,65 M 148,65 L 154,29 L 157,65 M 157,65 L 163,29 L 166,65" 
                strokeWidth="2.0" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Right side loops, top bar and end loop */}
              <path 
                d="M 165,16 C 180,21 210,24 214,18 C 218,12 195,30 190,32" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M 172,40 C 172,40 185,34 190,39 C 195,44 185,48 180,44 C 175,40 185,38 191,38" 
                strokeWidth="1.8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Big vertical stroke and underline sweep back */}
              <path 
                d="M 190,20 L 202,78 L 195,65 M 195,65 L 20,67" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Page border footer decoration */}
      <div 
        className="absolute bottom-3 left-6 right-6 pt-2 text-[8px] font-medium text-center relative z-10 leading-normal"
        style={{
          borderTop: '1px solid #e4e4e7',
          color: '#a1a1aa'
        }}
      >
        <p>
          CIVITAS Academy Africa — SAS au capital de 10 000 000 FCFA — Enregistrement N° GAB-2026-B — Libreville, Gabon
        </p>
        <p>
          Document certifié conforme et protégé par signature électronique sécurisée. ID: {referenceId.split('-')[2]}
        </p>
      </div>
    </div>
  );
};
