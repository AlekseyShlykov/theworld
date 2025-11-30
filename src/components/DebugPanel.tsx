import React from 'react';
import { Area } from '../types';
import './DebugPanel.css';

interface ChoiceLogEntry {
  round: number;
  zone: number; // 1-5
}

interface DebugPanelProps {
  areas: Area[];
  choicesLog: ChoiceLogEntry[];
}

// Debug flag - set to false to disable the panel
const DEBUG_PANEL_ENABLED = false;

export const DebugPanel: React.FC<DebugPanelProps> = ({ areas, choicesLog }) => {
  if (!DEBUG_PANEL_ENABLED) {
    return null;
  }

  return (
    <div id="debug-panel" className="debug-panel">
      <div className="debug-title">Debug</div>
      
      <div className="debug-zones">
        {areas.map((area, index) => {
          const zoneIndex = index + 1;
          const power = area.power.toFixed(2);
          const acc = area.acc.toFixed(2);
          return (
            <div key={area.id} className="debug-zone-line">
              Zone {zoneIndex} — Power: {power}, Acc: {acc}
            </div>
          );
        })}
      </div>

      <div className="debug-choices-title">Choices log:</div>
      <div className="debug-choices-list">
        {choicesLog.length === 0 ? (
          <div className="debug-choice-line">No choices yet</div>
        ) : (
          choicesLog.map((entry, index) => (
            <div key={index} className="debug-choice-line">
              Round {entry.round}: Zone {entry.zone}
            </div>
          ))
        )}
      </div>
    </div>
  );
};



