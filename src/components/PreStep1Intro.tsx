import React from 'react';
import { RoundNarrative } from './RoundNarrative';
import { Area, LogicData, LanguageData, Language } from '../types';
import { TextsData } from '../hooks/useTexts';

interface ChoiceLogEntry {
  round: number;
  zone: number;
}

interface PreStep1IntroProps {
  areas: Area[];
  logic: LogicData;
  labels: LanguageData['ui']['areaLabels'];
  getColorName: (hexColor: string) => string;
  onZoneSelect: (areaId: string) => void;
  onComplete: () => void;
  texts: TextsData;
  round: number;
  choicesLog?: ChoiceLogEntry[];
  currentLanguage?: Language;
}

export const PreStep1Intro: React.FC<PreStep1IntroProps> = ({
  areas,
  logic,
  labels,
  getColorName,
  onZoneSelect,
  onComplete,
  texts,
  round,
  choicesLog = [],
  currentLanguage = 'en'
}) => {
  // Use RoundNarrative component for round 1
  return (
    <RoundNarrative
      round={round}
      areas={areas}
      logic={logic}
      labels={labels}
      getColorName={getColorName}
      onZoneSelect={onZoneSelect}
      onComplete={onComplete}
      texts={texts}
      choicesLog={choicesLog}
      currentLanguage={currentLanguage}
    />
  );
};

