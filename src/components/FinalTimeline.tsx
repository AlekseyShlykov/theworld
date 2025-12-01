import React, { useMemo } from 'react';
import { Area } from '../types';
import { TimelineData } from '../hooks/useTexts';
import './FinalTimeline.css';

interface ChoiceLogEntry {
  round: number;
  zone: number; // 1-5
}

interface FinalTimelineProps {
  areas: Area[];
  choicesLog: ChoiceLogEntry[];
  areaLabels: Record<string, string>;
  timelineTexts: TimelineData;
}

interface Milestone {
  round: number;
  civilizationId: string;
  year: number;
  achievement: string;
}

export const FinalTimeline: React.FC<FinalTimelineProps> = ({
  areas,
  choicesLog,
  areaLabels,
  timelineTexts
}) => {
  // Get achievement names from translations
  const achievements = useMemo(() => [
    timelineTexts.milestones.sedentary,
    timelineTexts.milestones.crops,
    timelineTexts.milestones.domestication,
    timelineTexts.milestones.writing,
    timelineTexts.milestones.trade,
    timelineTexts.milestones.epidemics,
    timelineTexts.milestones.technology,
    timelineTexts.milestones.governance
  ], [timelineTexts]);
  // Calculate milestones for all civilizations across all rounds
  const milestones = useMemo(() => {
    const result: Milestone[] = [];
    const YEARS_PER_ROUND = 1000;
    
    // Create a map of round -> chosen zone for quick lookup
    const chosenByRound = new Map<number, number>();
    choicesLog.forEach(entry => {
      chosenByRound.set(entry.round, entry.zone);
    });
    
    // For each round (1-8)
    for (let round = 1; round <= 8; round++) {
      const roundStart = (round - 1) * YEARS_PER_ROUND;
      const intervalLength = YEARS_PER_ROUND;
      
      // Get the chosen civilization for this round
      const chosenZone = chosenByRound.get(round);
      
      // Process all 5 civilizations
      const allZones = [1, 2, 3, 4, 5];
      const otherZones = chosenZone 
        ? allZones.filter(z => z !== chosenZone)
        : allZones;
      
      // If there's a chosen civilization, place it first
      if (chosenZone) {
        const chosenAreaId = `A${chosenZone}`;
        const chosenYear = roundStart + 0.1 * intervalLength;
        result.push({
          round,
          civilizationId: chosenAreaId,
          year: chosenYear,
          achievement: achievements[round - 1]
        });
      }
      
      // Place other civilizations later in the interval
      // Use positions at 40%, 60%, 80% of the interval
      const otherPositions = [0.4, 0.6, 0.8];
      otherZones.forEach((zone, index) => {
        const areaId = `A${zone}`;
        // If there's a chosen civilization, use the predefined positions
        // Otherwise, distribute evenly
        const position = chosenZone 
          ? otherPositions[index % otherPositions.length]
          : (index + 1) / (otherZones.length + 1);
        const year = roundStart + position * intervalLength;
        result.push({
          round,
          civilizationId: areaId,
          year,
          achievement: achievements[round - 1]
        });
      });
    }
    
    return result.sort((a, b) => a.year - b.year);
  }, [choicesLog, achievements]);
  
  // Timeline dimensions
  const TIMELINE_WIDTH = 1000;
  const TIMELINE_HEIGHT = 500;
  const MARGIN_LEFT = 80;
  const MARGIN_RIGHT = 80;
  const MARGIN_TOP = 60;
  const MARGIN_BOTTOM = 120;
  const CHART_WIDTH = TIMELINE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  const CHART_HEIGHT = TIMELINE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;
  const CIVILIZATION_ROW_HEIGHT = CHART_HEIGHT / 5; // 5 civilizations, each gets a row
  
  // Convert year to X coordinate
  const yearToX = (year: number): number => {
    return MARGIN_LEFT + (year / 8000) * CHART_WIDTH;
  };
  
  // Get short name for a civilization
  const getCivilizationName = (areaId: string): string => {
    const label = areaLabels[areaId] || areaId;
    // Extract region number or short name
    const match = label.match(/Region (\d+)/);
    if (match) {
      return `R${match[1]}`;
    }
    return label.split(':')[0] || areaId;
  };
  
  // Group milestones by civilization for rendering
  const milestonesByCivilization = useMemo(() => {
    const groups: Record<string, Milestone[]> = {};
    areas.forEach(area => {
      groups[area.id] = milestones.filter(m => m.civilizationId === area.id);
    });
    return groups;
  }, [milestones, areas]);
  
  // Generate tick marks for every 1000 years
  const ticks = useMemo(() => {
    const result = [];
    for (let year = 0; year <= 8000; year += 1000) {
      result.push(year);
    }
    return result;
  }, []);
  
  return (
    <div className="final-timeline-container">
      <h3 className="final-timeline-title">{timelineTexts.title}</h3>
      <div className="final-timeline-wrapper">
        <svg
          className="final-timeline-svg"
          viewBox={`0 0 ${TIMELINE_WIDTH} ${TIMELINE_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background */}
          <rect
            x={MARGIN_LEFT}
            y={MARGIN_TOP}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            fill="#fafafa"
            stroke="#e0e0e0"
            strokeWidth="1"
          />
          
          {/* X-axis ticks and labels at the bottom */}
          {ticks.map(year => {
            const x = yearToX(year);
            const bottomY = MARGIN_TOP + CHART_HEIGHT;
            return (
              <g key={year}>
                <line
                  x1={x}
                  y1={bottomY}
                  x2={x}
                  y2={bottomY + 8}
                  stroke="#333"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={bottomY + 25}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#666"
                  fontWeight="500"
                >
                  {year === 0 ? '0' : `${year / 1000}k`}
                </text>
              </g>
            );
          })}
          
          {/* Vertical grid lines for each millennium */}
          {ticks.map(year => {
            const x = yearToX(year);
            return (
              <line
                key={`grid-${year}`}
                x1={x}
                y1={MARGIN_TOP}
                x2={x}
                y2={MARGIN_TOP + CHART_HEIGHT}
                stroke="#e0e0e0"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.5"
              />
            );
          })}
          
          {/* Render milestones for each civilization - one row per civilization */}
          {areas.map((area, areaIndex) => {
            const areaMilestones = milestonesByCivilization[area.id] || [];
            // Each civilization gets its own horizontal row
            const rowCenterY = MARGIN_TOP + (areaIndex + 0.5) * CIVILIZATION_ROW_HEIGHT;
            
            return (
              <g key={area.id} className="civilization-group">
                {/* Horizontal line for this civilization's row */}
                <line
                  x1={MARGIN_LEFT}
                  y1={rowCenterY}
                  x2={MARGIN_LEFT + CHART_WIDTH}
                  y2={rowCenterY}
                  stroke={area.color}
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  opacity="0.3"
                />
                
                {/* Milestone markers */}
                {areaMilestones.map(milestone => {
                  const x = yearToX(milestone.year);
                  
                  return (
                    <g key={`marker-${milestone.round}-${area.id}`}>
                      <circle
                        cx={x}
                        cy={rowCenterY}
                        r="7"
                        fill={area.color}
                        stroke="#fff"
                        strokeWidth="2.5"
                        className="milestone-marker"
                      />
                      {/* Tooltip on hover */}
                      <title>
                        {getCivilizationName(area.id)} - {timelineTexts.roundLabel} {milestone.round}
                        {'\n'}
                        {milestone.achievement}
                        {'\n'}
                        {timelineTexts.yearLabel}: {Math.round(milestone.year)}
                      </title>
                    </g>
                  );
                })}
                
                {/* Civilization label on the left */}
                <text
                  x={MARGIN_LEFT - 10}
                  y={rowCenterY + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill={area.color}
                  fontWeight="600"
                >
                  {getCivilizationName(area.id)}
                </text>
              </g>
            );
          })}
          
          {/* Round labels at the top */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map(round => {
            const roundStart = (round - 1) * 1000;
            const roundEnd = round * 1000;
            const x = yearToX((roundStart + roundEnd) / 2);
            
            return (
              <text
                key={`round-label-${round}`}
                x={x}
                y={MARGIN_TOP - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#999"
                fontWeight="500"
              >
                R{round}
              </text>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="final-timeline-legend">
        {areas.map(area => (
          <div key={area.id} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: area.color }}
            />
            <span className="legend-label">{getCivilizationName(area.id)}</span>
          </div>
        ))}
      </div>
      
      {/* Achievement list */}
      <div className="final-timeline-achievements">
        <h4>{timelineTexts.achievementsTitle}</h4>
        <ul>
          {achievements.map((achievement, index) => (
            <li key={index}>
              <strong>{timelineTexts.roundLabel} {index + 1}:</strong> {achievement}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

