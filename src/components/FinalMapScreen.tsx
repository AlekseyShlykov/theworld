import React, { useMemo } from 'react';
import { MapCanvas } from './MapCanvas';
import { UnifiedTextBlock } from './UnifiedTextBlock';
import { FinalTimeline } from './FinalTimeline';
import { FinalPopulationChart } from './FinalPopulationChart';
import { DominancePeriodsChart } from './DominancePeriodsChart';
import { FutureProjectionChart } from './FutureProjectionChart';
import { Area, LogicData, LanguageData, RoundSnapshot } from '../types';
import { TextsData } from '../hooks/useTexts';
import './FinalMapScreen.css';

interface ChoiceLogEntry {
  round: number;
  zone: number; // 1-5
}

interface FinalMapScreenProps {
  areas: Area[];
  logic: LogicData;
  labels: LanguageData['ui']['areaLabels'];
  texts: TextsData;
  choicesLog: ChoiceLogEntry[];
  areaHistory: RoundSnapshot[];
  onNext: () => void;
}

export const FinalMapScreen: React.FC<FinalMapScreenProps> = ({
  areas,
  logic,
  labels,
  texts,
  choicesLog,
  areaHistory,
  onNext
}) => {
  // Use areaButtons from i18n texts for chart and Final Values labels (real area names)
  const chartAreaLabels = useMemo((): Record<string, string> => {
    if (!texts?.areaButtons) return labels as unknown as Record<string, string>;
    const ids = ['A1', 'A2', 'A3', 'A4', 'A5'] as const;
    const keys = ['area1', 'area2', 'area3', 'area4', 'area5'] as const;
    const out: Record<string, string> = {};
    ids.forEach((id, i) => {
      out[id] = texts.areaButtons[keys[i]];
    });
    return out;
  }, [texts, labels]);

  return (
    <div className="final-map-screen" role="dialog" aria-label="Final map results">
      <MapCanvas
        areas={areas}
        logic={logic}
        highlightedArea={null}
        animationProgress={1}
        currentTurn={8}
      />
      
      <div className="final-map-text-container">
        <UnifiedTextBlock text={texts.final.mapText} />
      </div>

      <div className="final-values-container">
        <h3 className="final-values-title">Final Values</h3>
        {areas.map((area) => (
          <div key={area.id} className="final-value-row">
            <span className="final-zone-label">{chartAreaLabels[area.id] ?? area.id}</span>
            <span className="final-value-separator">—</span>
            <span className="final-value">Power: {area.power.toFixed(1)}, Acc: {area.acc.toFixed(1)}</span>
          </div>
        ))}
      </div>

      <DominancePeriodsChart
        areas={areas}
        areaHistory={areaHistory}
        areaLabels={chartAreaLabels}
        dominanceChartTexts={texts.dominanceChart}
      />

      <FinalPopulationChart
        areas={areas}
        areaHistory={areaHistory}
        areaLabels={chartAreaLabels}
        populationChartTexts={texts.populationChart}
      />

      <FinalTimeline
        areas={areas}
        choicesLog={choicesLog}
        areaLabels={chartAreaLabels}
        timelineTexts={texts.timeline}
      />

      <FutureProjectionChart
        areas={areas}
        areaHistory={areaHistory}
        areaLabels={chartAreaLabels}
        futureProjectionChartTexts={texts.futureProjectionChart}
      />

      <div className="action-section action-section-single">
        <button
          className="nav-button final-map-button"
          onClick={() => {
            if ((window as any).playClickSound) {
              (window as any).playClickSound();
            }
            onNext();
          }}
          aria-label="Continue to ending screen"
        >
          {texts.ui.next}
        </button>
      </div>
    </div>
  );
};



