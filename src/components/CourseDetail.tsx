import React, { useEffect } from 'react';
import { Course } from '../types';
import { courses } from '../coursesData';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Star, 
  ChevronRight, 
  TrendingUp, 
  Globe, 
  Map, 
  CheckCircle2, 
  Briefcase, 
  UserCheck, 
  BookOpen, 
  Sparkles,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface CourseDetailProps {
  courseId: string;
  onBack: () => void;
  onSelectCourse: (course: Course) => void;
  onViewCourse: (courseId: string) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({
  courseId,
  onBack,
  onSelectCourse,
  onViewCourse,
}) => {
  const currentCourse = courses.find((c) => c.id === courseId);

  // Scroll to top when courseId changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [courseId]);

  if (!currentCourse) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center" id="course-not-found-state">
        <h2 className="text-2xl font-bold text-zinc-900">Formation introuvable</h2>
        <p className="text-zinc-500 mt-2">La formation demandée n'existe pas ou a été déplacée.</p>
        <button
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour aux formations</span>
        </button>
      </div>
    );
  }

  // Get other courses in the same category (quick access)
  const relatedCourses = courses.filter(
    (c) => c.category === currentCourse.category && c.id !== currentCourse.id
  );

  // If no related courses in the same category, take other random courses
  const quickAccessCourses = relatedCourses.length > 0 
    ? relatedCourses 
    : courses.filter((c) => c.id !== currentCourse.id).slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id={`course-detail-${currentCourse.id}`}>
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl text-xs font-semibold transition-all mb-8 cursor-pointer"
        id="detail-back-button"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Retour au catalogue</span>
      </button>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-14">
        {/* Left column: Text Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wide">
              {currentCourse.category}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide text-white ${
              currentCourse.level === 'Débutant' ? 'bg-emerald-600' :
              currentCourse.level === 'Intermédiaire' ? 'bg-amber-600' :
              currentCourse.level === 'Avancé' ? 'bg-indigo-600' : 'bg-zinc-600'
            }`}>
              {currentCourse.level}
            </span>
          </div>

          <h1 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
            {currentCourse.title}
          </h1>

          <p className="font-sans text-base text-zinc-600 leading-relaxed">
            {currentCourse.fullDescription}
          </p>

          {/* Quick specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div>
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Durée</span>
              <span className="text-sm font-bold text-zinc-800 flex items-center gap-1.5 mt-1">
                <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>{currentCourse.duration}</span>
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Volume Horaire</span>
              <span className="text-sm font-bold text-zinc-800 flex items-center gap-1.5 mt-1">
                <BookOpen className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>{currentCourse.hours} heures</span>
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date de Session</span>
              <span className="text-sm font-bold text-zinc-800 flex items-center gap-1.5 mt-1">
                <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>{currentCourse.nextSession}</span>
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tarif Standard</span>
              <span className="text-sm font-black text-indigo-600 flex items-center gap-1.5 mt-1">
                <span>{currentCourse.price.toLocaleString('fr-FR')} FCFA / mois</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Image & Action card */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-md">
            <div className="relative aspect-video">
              <img
                src={currentCourse.image}
                alt={currentCourse.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-amber-400" />
                <span>Diplôme certifié</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-baseline justify-between border-b border-zinc-100 pb-4">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tarif de formation</span>
                  <span className="text-3xl font-black text-zinc-900">{currentCourse.price.toLocaleString('fr-FR')} FCFA / mois</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Aides disponibles</span>
                  <span className="text-xs font-semibold text-zinc-500">Prises en charge & Facilités</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => onSelectCourse(currentCourse)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-sm cursor-pointer active:scale-98"
                  id={`register-cta-${currentCourse.id}`}
                >
                  <span>S'inscrire à cette formation</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
                  Pas de paiement immédiat requis. Votre conseiller vous guidera dans vos démarches de prise en charge financière.
                </p>
              </div>

              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">Garantie d'admission 2026</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                    Votre pré-inscription en ligne réserve votre place gratuitement pour la session du {currentCourse.nextSession}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Detailed Content Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 border-t border-zinc-100 pt-12 mb-16">
        
        {/* Details core text columns */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Importance & Why this course */}
          <section className="space-y-4" id="section-importance">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <span>Pourquoi choisir cette formation ?</span>
            </h2>
            <div className="p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/30">
              <p className="text-sm text-zinc-700 leading-relaxed">
                {currentCourse.importance}
              </p>
            </div>
          </section>

          {/* Concepts section */}
          <section className="space-y-4" id="section-concepts">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              <span>Compétences et Concepts clés à maîtriser</span>
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Notre référentiel pédagogique est mis à jour chaque semestre pour correspondre précisément aux exigences de l'industrie technologique.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {currentCourse.keyConcepts.map((concept, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-white rounded-xl border border-zinc-150 shadow-2xs flex items-start gap-3"
                >
                  <span className="flex h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 items-center justify-center text-[11px] font-black shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium text-zinc-700 leading-relaxed">{concept}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Market & Outlook: Global vs African */}
          <section className="space-y-4" id="section-market-outlook">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <span>Analyse et Perspectives du Marché</span>
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Un aperçu complet de la demande pour cette expertise, à l'échelle internationale et sur le continent africain.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Global Market */}
              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                  <Globe className="h-4 w-4" />
                  <span>Marché Mondial</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {currentCourse.globalMarket}
                </p>
              </div>

              {/* African Market */}
              <div className="p-6 bg-zinc-950 text-white rounded-2xl border border-zinc-800 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <Map className="h-4 w-4" />
                  <span>Dynamique et Opportunités en Afrique</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {currentCourse.africanMarket}
                </p>
              </div>
            </div>
          </section>

          {/* Careers & Job Roles */}
          <section className="space-y-4" id="section-careers">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              <span>Débouchés Professionnels visés</span>
            </h2>
            <p className="text-xs text-zinc-500">
              À l'issue de votre certification, vous serez pleinement éligible pour postuler à ces différents types de rôles professionnels :
            </p>
            <div className="flex flex-wrap gap-2">
              {currentCourse.careers.map((career, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-xl border border-zinc-200 shadow-2xs flex items-center gap-2"
                >
                  <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{career}</span>
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Right side widgets: Instructors & Reviews */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Instructors */}
          <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4" id="instructors-widget">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
              Vos Enseignants experts
            </h3>
            <div className="space-y-4">
              {currentCourse.instructors.map((instructor, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <img
                    src={instructor.avatar}
                    alt={instructor.name}
                    className="w-10 h-10 rounded-full object-cover bg-zinc-200 border border-zinc-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">{instructor.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{instructor.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="space-y-4" id="testimonials-widget">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
              Avis et retours d'alumni
            </h3>
            <div className="space-y-4">
              {currentCourse.testimonials.map((testi, idx) => (
                <div key={idx} className="p-5 bg-white border border-zinc-150 rounded-2xl shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                      <img
                        src={testi.avatar}
                        alt={testi.name}
                        className="w-8 h-8 rounded-full object-cover bg-zinc-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-[11px] font-bold text-zinc-800">{testi.name}</h4>
                        <span className="text-[9px] text-zinc-400 font-medium block">{testi.company}</span>
                      </div>
                    </div>
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {[...Array(testi.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-600 italic leading-relaxed">
                    "{testi.review}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Category related courses / Quick access bottom bar */}
      <div className="border-t border-zinc-100 pt-12" id="quick-access-related-section">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
              Formations connexes de la catégorie : {currentCourse.category}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Explorez d'autres opportunités d'apprentissage complémentaires pour enrichir votre profil.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickAccessCourses.map((course) => {
            return (
              <div 
                key={course.id}
                className="bg-white border border-zinc-200/80 hover:border-indigo-200 hover:shadow-xs rounded-2xl transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[9px] font-bold text-zinc-700 shadow-xs uppercase tracking-wide">
                      {course.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-sans text-sm font-bold tracking-tight text-zinc-900 leading-snug line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-medium pt-1">
                      <span>{course.duration} ({course.hours}h)</span>
                      <span>&bull;</span>
                      <span>{course.level}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <span className="font-sans text-sm font-black text-zinc-900">
                    {course.price.toLocaleString('fr-FR')} FCFA / mois
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onViewCourse(course.id)}
                      className="px-3 py-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => onSelectCourse(course)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                    >
                      <span>S'inscrire</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
