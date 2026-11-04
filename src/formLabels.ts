/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import formLabels from '../form_labels.json';

interface LabelSet {
  label: string;
  shortLabel: string;
  longLabel?: string;
}

/**
 * Returns the profile label for a given profile type
 */
export const getProfileLabel = (type: string, useShort: boolean = false): string => {
  const profile = formLabels.profiles[type as keyof typeof formLabels.profiles] || formLabels.profiles.default;
  return useShort ? profile.shortLabel : profile.label;
};

/**
 * Returns the funding type label for a given funding type
 */
export const getFundingLabel = (type: string, useShort: boolean = false, useLong: boolean = false): string => {
  const funding = formLabels.fundingTypes[type as keyof typeof formLabels.fundingTypes] || formLabels.fundingTypes.default;
  if (useLong && funding.longLabel) return funding.longLabel;
  return useShort ? funding.shortLabel : funding.label;
};

/**
 * Returns the formula label for a given formula key
 */
export const getFormulaLabel = (key: string, useShort: boolean = false): string => {
  const formula = formLabels.formulas[key as keyof typeof formLabels.formulas] || formLabels.formulas.default;
  return useShort ? formula.shortLabel : formula.label;
};

/**
 * Returns all available profile options for select inputs
 */
export const getProfileOptions = () => {
  return Object.entries(formLabels.profiles)
    .filter(([key]) => key !== 'default')
    .map(([key, value]) => ({
      value: key,
      label: value.label
    }));
};

/**
 * Returns all available funding type options for select inputs
 */
export const getFundingOptions = () => {
  return Object.entries(formLabels.fundingTypes)
    .filter(([key]) => key !== 'default')
    .map(([key, value]) => ({
      value: key,
      label: value.label
    }));
};

/**
 * Returns all available formula options for select inputs
 */
export const getFormulaOptions = () => {
  return Object.entries(formLabels.formulas)
    .filter(([key]) => key !== 'default')
    .map(([key, value]) => ({
      value: key,
      label: value.label
    }));
};
