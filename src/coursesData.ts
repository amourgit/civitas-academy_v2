/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course } from './types';
import coursesDb from '../courses_db.json';

// Map database formations to Course objects with fallback properties for full backward compatibility
export const courses: Course[] = coursesDb.formations.map((f: any) => {
  // Map hours based on the course ID
  let hours = 80;
  if (f.id === 'marketing-digital-ia') hours = 60;
  if (f.id === 'analyse-donnees-business-intelligence') hours = 80;
  if (f.id === 'automatisation-agents-ia-avances') hours = 90;
  if (f.id === 'developpement-applications-ia') hours = 120;
  if (f.id === 'ingenierie-agents-ia-autonomes') hours = 150;

  // Map nextSession based on ID
  let nextSession = "15 Septembre 2026";
  if (f.id === 'marketing-digital-ia') nextSession = "15 Septembre 2026";
  if (f.id === 'analyse-donnees-business-intelligence') nextSession = "1 Octobre 2026";
  if (f.id === 'automatisation-agents-ia-avances') nextSession = "15 Octobre 2026";
  if (f.id === 'developpement-applications-ia') nextSession = "2 Novembre 2026";
  if (f.id === 'ingenierie-agents-ia-autonomes') nextSession = "15 Novembre 2026";

  return {
    ...f,
    duration: f.pricingFormats.standard.duration,
    price: f.pricingFormats.standard.price,
    hours,
    nextSession,
  } as Course;
});

export const organization = coursesDb.organization;
