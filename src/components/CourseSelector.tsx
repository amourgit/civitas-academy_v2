/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar, Clock, DollarSign, Award, ArrowRight, Star, ChevronRight, BookOpen } from 'lucide-react';
import { Course } from '../types';
import { courses } from '../coursesData';

interface CourseSelectorProps {
  onSelectCourse: (course: Course) => void;
  onViewCourse: (courseId: string) => void;
  selectedCourseId: string | null;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({ 
  onSelectCourse, 
  onViewCourse,
  selectedCourseId 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Tous');

  // Categories extraction
  const categories = useMemo(() => {
    const list = new Set(courses.map(c => c.category));
    return ['Tous', ...Array.from(list)];
  }, []);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            course.highlights.some(h => h.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = activeCategory === 'Tous' || course.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl" id="course-selector-view">
      
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Étape 1 : Choisissez votre Avenir
        </span>
        <h1 className="font-sans text-3.5xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 mt-2">
          Formations d'Excellence CIVITAS
        </h1>
        <p className="font-sans text-base text-zinc-500 mt-4 max-w-2xl mx-auto leading-relaxed">
          Développez des compétences d'élite en intégration de solutions d'intelligence artificielle, automatisation avancée, robotique logicielle et science des données.
        </p>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10 bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm" id="catalog-controls">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="h-4.5 w-4.5 text-zinc-400" />
          </span>
          <input
            type="text"
            placeholder="Rechercher une formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-800 bg-zinc-50/50"
            id="search-courses-input"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end overflow-x-auto pb-1 md:pb-0 scrollbar-none" id="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-900'
                  : 'bg-zinc-100/75 hover:bg-zinc-200/50 text-zinc-600'
              }`}
              id={`filter-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* No results state */}
      {filteredCourses.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200 max-w-xl mx-auto"
          id="no-courses-found"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 mb-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">Aucune formation trouvée</h3>
          <p className="text-xs text-zinc-400 mt-1">Essayez d'ajuster votre recherche ou filtrez par une autre catégorie.</p>
          <button
            onClick={() => { setSearchTerm(''); setActiveCategory('Tous'); }}
            className="mt-4 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </motion.div>
      )}

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="courses-grid">
        {filteredCourses.map((course, idx) => {
          const isSelected = selectedCourseId === course.id;
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
              className={`group flex flex-col justify-between bg-white rounded-2xl border transition-all duration-300 hover:shadow-md ${
                isSelected 
                  ? 'border-indigo-600 ring-2 ring-indigo-500/10' 
                  : 'border-zinc-100 hover:border-zinc-200'
              }`}
              id={`course-card-${course.id}`}
            >
              <div>
                {/* Course Cover Image & Level Tag */}
                <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-zinc-100">
                  <img
                    src={course.image}
                    alt={course.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider text-zinc-800 shadow-xs border border-zinc-100">
                    {course.category}
                  </div>
                  
                  {/* Level Badge */}
                  <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs ${
                    course.level === 'Débutant' ? 'bg-emerald-600' :
                    course.level === 'Intermédiaire' ? 'bg-amber-600' :
                    course.level === 'Avancé' ? 'bg-indigo-600' : 'bg-zinc-600'
                  }`}>
                    {course.level}
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="font-sans text-lg font-bold tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>

                  {/* Core Metrics */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{course.duration} ({course.hours}h)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Prochaine : {course.nextSession}</span>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="font-sans text-xs text-zinc-500 leading-relaxed mt-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Highlithed Features */}
                  <div className="mt-5 border-t border-zinc-100 pt-4">
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
                      Points clés de la formation
                    </span>
                    <ul className="space-y-2">
                      {course.highlights.slice(0, 3).map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 leading-tight">
                          <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card Footer: Pricing and Selection CTA */}
              <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 rounded-b-2xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-auto">
                <div>
                  <span className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                    Tarif standard
                  </span>
                  <span className="font-sans text-xl font-black text-zinc-900">
                    {course.price.toLocaleString('fr-FR')} FCFA / mois
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewCourse(course.id)}
                    className="flex items-center justify-center gap-1 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all border border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 hover:text-zinc-900 shadow-xs cursor-pointer"
                    id={`details-btn-${course.id}`}
                  >
                    <span>Voir les détails</span>
                  </button>

                  <button
                    onClick={() => onSelectCourse(course)}
                    className={`flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700' 
                        : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-xs shadow-sm active:scale-98'
                    }`}
                    id={`select-btn-${course.id}`}
                  >
                    <span>{isSelected ? 'Sélectionné' : 'S\'inscrire'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Notice Banner */}
      <div className="mt-14 p-6 bg-amber-50/60 rounded-2xl border border-amber-100/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between" id="financing-tip-banner">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
            <Star className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-900">Information Importante Financement</h4>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Toutes nos formations sont habilitées à un co-financement via le Compte Personnel de Formation (CPF), l'Aide Individuelle à la Formation (AIF Pôle Emploi) ou les OPCO de votre employeur.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <a 
            href="https://www.moncompteformation.gouv.fr" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors"
          >
            <span>Consulter mon CPF</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

    </div>
  );
};
