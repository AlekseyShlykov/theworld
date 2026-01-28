import React, { useMemo } from 'react';
import { Area, RoundSnapshot } from '../types';
import { DominanceChartData } from '../hooks/useTexts';
import './DominancePeriodsChart.css';

interface DominancePeriodsChartProps {
  areas: Area[];
  areaHistory: RoundSnapshot[];
  areaLabels: Record<string, string>;
  dominanceChartTexts: DominanceChartData;
}

/**
 * DominancePeriodsChart Component
 * 
 * Displays a line chart showing which civilization center dominated each 1000-year period
 * across 8 rounds (8000 years).
 * 
 * Dominance Calculation:
 * - For each round: dominance = (Acc * Power) / sum(Acc * Power of all centers)
 * - This gives a value between 0 and 1 (0% to 100%)
 * - The center with the highest dominance in each round is highlighted
 * 
 * Visualization:
 * - 5 lines, one per civilization center
 * - Each line shows dominance value (0-1) across all 8 rounds
 * - Dominant center per round is highlighted (opacity 1.0, thicker line)
 * - Non-dominant centers are dimmed (opacity 0.25) during that round
 * - Background shading for each period using dominant center's color
 * 
 * Colors:
 * - Each line uses the color defined for that civilization center in logic.json
 */
export const DominancePeriodsChart: React.FC<DominancePeriodsChartProps> = ({
  areas,
  areaHistory,
  areaLabels,
  dominanceChartTexts
}) => {
  // Chart dimensions - matching FinalPopulationChart for consistency
  const CHART_WIDTH = 1000;
  const CHART_HEIGHT = 500;
  const MARGIN_LEFT = 80;
  const MARGIN_RIGHT = 80;
  const MARGIN_TOP = 60;
  const MARGIN_BOTTOM = 120;
  const PLOT_WIDTH = CHART_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  const PLOT_HEIGHT = CHART_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;
  
  // Time mapping: 8 rounds = 8000 years (1000 years per round)
  const TOTAL_YEARS = 8000;
  const YEARS_PER_ROUND = 1000;
  
  // Get color for a civilization center from logic.json
  const getCivilizationColor = (areaId: string): string => {
    const area = areas.find(a => a.id === areaId);
    return area?.color || '#999999';
  };
  
  // Display name for a civilization center (from i18n areaButtons on final charts screen)
  const getCivilizationName = (areaId: string): string => {
    return areaLabels[areaId] || areaId;
  };
  
  // Convert round number to year (round 1 = 1000, round 2 = 2000, ..., round 8 = 8000)
  const roundToYear = (round: number): number => {
    return round * YEARS_PER_ROUND;
  };
  
  // Convert year to X coordinate
  const yearToX = (year: number): number => {
    return MARGIN_LEFT + (year / TOTAL_YEARS) * PLOT_WIDTH;
  };
  
  // Calculate dominance data for each round
  const dominanceData = useMemo(() => {
    const dataByCenter: Record<string, Array<{
      round: number;
      year: number;
      dominance: number;
      acc: number;
      power: number;
      rawValue: number; // Acc * Power
    }>> = {};
    
    // Initialize all centers
    areas.forEach(area => {
      dataByCenter[area.id] = [];
    });
    
    // Process history snapshots (sorted by round)
    const sortedHistory = [...areaHistory].sort((a, b) => a.round - b.round);
    
    // For each round, calculate dominance
    sortedHistory.forEach(snapshot => {
      // Calculate raw values (Acc * Power) for all centers in this round
      const rawValues: Record<string, number> = {};
      let totalRaw = 0;
      
      snapshot.areas.forEach(areaSnapshot => {
        const raw = areaSnapshot.acc * areaSnapshot.power;
        rawValues[areaSnapshot.areaId] = raw;
        totalRaw += raw;
      });
      
      // Calculate dominance for each center
      snapshot.areas.forEach(areaSnapshot => {
        if (dataByCenter[areaSnapshot.areaId]) {
          const raw = rawValues[areaSnapshot.areaId];
          const dominance = totalRaw > 0 ? raw / totalRaw : 0;
          
          dataByCenter[areaSnapshot.areaId].push({
            round: snapshot.round,
            year: roundToYear(snapshot.round),
            dominance,
            acc: areaSnapshot.acc,
            power: areaSnapshot.power,
            rawValue: raw
          });
        }
      });
    });
    
    return dataByCenter;
  }, [areaHistory, areas]);
  
  // Determine dominant center for each round
  const dominantByRound = useMemo(() => {
    const dominant: Record<number, string> = {};
    
    // For each round, find the center with highest dominance
    const rounds = new Set<number>();
    Object.values(dominanceData).forEach(points => {
      points.forEach(point => rounds.add(point.round));
    });
    
    rounds.forEach(round => {
      let maxDominance = -1;
      let dominantCenter = '';
      
      Object.entries(dominanceData).forEach(([centerId, points]) => {
        const point = points.find(p => p.round === round);
        if (point && point.dominance > maxDominance) {
          maxDominance = point.dominance;
          dominantCenter = centerId;
        }
      });
      
      if (dominantCenter) {
        dominant[round] = dominantCenter;
      }
    });
    
    return dominant;
  }, [dominanceData]);
  
  // Convert dominance value to Y coordinate (inverted because SVG Y increases downward)
  // Dominance is always 0-1, so domain is fixed
  const dominanceToY = (value: number): number => {
    const normalized = value; // value is already 0-1
    return MARGIN_TOP + PLOT_HEIGHT - (normalized * PLOT_HEIGHT);
  };
  
  // Generate Y-axis ticks (0, 0.25, 0.5, 0.75, 1.0 or as percentages)
  const yTicks = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1.0];
  }, []);
  
  // Generate X-axis ticks (every 1000 years)
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let year = 0; year <= TOTAL_YEARS; year += YEARS_PER_ROUND) {
      ticks.push(year);
    }
    return ticks;
  }, []);
  
  // Generate path data for a line (SVG path string)
  const generatePath = (points: Array<{ year: number; dominance: number }>): string => {
    if (points.length === 0) return '';
    
    const pathParts = points.map((point, index) => {
      const x = yearToX(point.year);
      const y = dominanceToY(point.dominance);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });
    
    return pathParts.join(' ');
  };
  
  // Generate path segments for highlighting (one segment per round)
  // Each segment represents the dominance during that 1000-year period
  const generateSegmentPath = (
    points: Array<{ round: number; year: number; dominance: number }>,
    round: number
  ): string | null => {
    const point = points.find(p => p.round === round);
    if (!point) return null;
    
    const x = yearToX(point.year);
    const y = dominanceToY(point.dominance);
    
    // For round 1, draw from year 0 to year 1000
    // For other rounds, draw from previous round's year to current round's year
    if (round === 1) {
      const x0 = yearToX(0);
      // Use the same dominance value for the start (since we only have data at round end)
      // This creates a horizontal segment representing the period
      return `M ${x0} ${y} L ${x} ${y}`;
    } else {
      const prevRound = round - 1;
      const prevPoint = points.find(p => p.round === prevRound);
      if (!prevPoint) return null;
      
      const x0 = yearToX(roundToYear(prevRound));
      const y0 = dominanceToY(prevPoint.dominance);
      // Draw from previous round's point to current round's point
      return `M ${x0} ${y0} L ${x} ${y}`;
    }
  };
  
  return (
    <div className="dominance-periods-chart-container">
      <h3 className="dominance-periods-chart-title">{dominanceChartTexts.title}</h3>
      <div className="dominance-periods-chart-wrapper">
        <svg
          className="dominance-periods-chart-svg"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background */}
          <rect
            x={MARGIN_LEFT}
            y={MARGIN_TOP}
            width={PLOT_WIDTH}
            height={PLOT_HEIGHT}
            fill="#fafafa"
            stroke="#e0e0e0"
            strokeWidth="1"
          />
          
          {/* Background shading for each period using dominant center's color */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map(round => {
            const dominantCenterId = dominantByRound[round];
            if (!dominantCenterId) return null;
            
            const color = getCivilizationColor(dominantCenterId);
            const xStart = round === 1 ? yearToX(0) : yearToX(roundToYear(round - 1));
            const xEnd = yearToX(roundToYear(round));
            const width = xEnd - xStart;
            
            return (
              <rect
                key={`period-bg-${round}`}
                x={xStart}
                y={MARGIN_TOP}
                width={width}
                height={PLOT_HEIGHT}
                fill={color}
                opacity="0.08"
              />
            );
          })}
          
          {/* Y-axis grid lines and labels */}
          {yTicks.map((value, index) => {
            const y = dominanceToY(value);
            return (
              <g key={`y-grid-${index}`}>
                {/* Grid line */}
                <line
                  x1={MARGIN_LEFT}
                  y1={y}
                  x2={MARGIN_LEFT + PLOT_WIDTH}
                  y2={y}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
                {/* Y-axis tick */}
                <line
                  x1={MARGIN_LEFT - 5}
                  y1={y}
                  x2={MARGIN_LEFT}
                  y2={y}
                  stroke="#333"
                  strokeWidth="2"
                />
                {/* Y-axis label */}
                <text
                  x={MARGIN_LEFT - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#666"
                >
                  {(value * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
          
          {/* X-axis grid lines and labels */}
          {xTicks.map(year => {
            const x = yearToX(year);
            const bottomY = MARGIN_TOP + PLOT_HEIGHT;
            return (
              <g key={`x-tick-${year}`}>
                {/* Grid line */}
                <line
                  x1={x}
                  y1={MARGIN_TOP}
                  x2={x}
                  y2={MARGIN_TOP + PLOT_HEIGHT}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
                {/* X-axis tick */}
                <line
                  x1={x}
                  y1={bottomY}
                  x2={x}
                  y2={bottomY + 8}
                  stroke="#333"
                  strokeWidth="2"
                />
                {/* X-axis label */}
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
          
          {/* Round labels at the top */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map(round => {
            const year = roundToYear(round);
            const x = yearToX(year);
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
          
          {/* Y-axis label */}
          <text
            x={MARGIN_LEFT / 2}
            y={MARGIN_TOP + PLOT_HEIGHT / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
            fontWeight="500"
            transform={`rotate(-90 ${MARGIN_LEFT / 2} ${MARGIN_TOP + PLOT_HEIGHT / 2})`}
          >
            {dominanceChartTexts.axis.dominance}
          </text>
          
          {/* X-axis label */}
          <text
            x={MARGIN_LEFT + PLOT_WIDTH / 2}
            y={CHART_HEIGHT - 20}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
            fontWeight="500"
          >
            {dominanceChartTexts.axis.time}
          </text>
          
          {/* Draw lines for each civilization center */}
          {areas.map(area => {
            const points = dominanceData[area.id] || [];
            if (points.length === 0) return null;
            
            const color = getCivilizationColor(area.id);
            const pathData = generatePath(points);
            
            return (
              <g key={`line-${area.id}`}>
                {/* Base line (dimmed) */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="dominance-line-base"
                  opacity="0.3"
                />
                
                {/* Highlighted segments for dominant periods */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map(round => {
                  const isDominant = dominantByRound[round] === area.id;
                  if (!isDominant) return null;
                  
                  const segmentPath = generateSegmentPath(points, round);
                  if (!segmentPath) return null;
                  
                  return (
                    <path
                      key={`highlight-${area.id}-${round}`}
                      d={segmentPath}
                      fill="none"
                      stroke={color}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="dominance-line-highlight"
                      opacity="1.0"
                    />
                  );
                })}
                
                {/* Data points with hover tooltips */}
                {points.map((point, _index) => {
                  const x = yearToX(point.year);
                  const y = dominanceToY(point.dominance);
                  const isDominant = dominantByRound[point.round] === area.id;
                  
                  return (
                    <g key={`point-${area.id}-${point.round}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isDominant ? "6" : "4"}
                        fill={color}
                        stroke="#fff"
                        strokeWidth={isDominant ? "3" : "2"}
                        className="dominance-point"
                        opacity={isDominant ? "1.0" : "0.4"}
                      />
                      {/* Tooltip on hover */}
                      <title>
                        {getCivilizationName(area.id)} - {dominanceChartTexts.tooltip.round} {point.round}
                        {'\n'}{dominanceChartTexts.tooltip.year}: {point.year}
                        {'\n'}{dominanceChartTexts.tooltip.dominance}: {(point.dominance * 100).toFixed(1)}%
                        {'\n'}{dominanceChartTexts.tooltip.acc}: {point.acc.toFixed(2)}
                        {'\n'}{dominanceChartTexts.tooltip.power}: {point.power.toFixed(2)}
                        {'\n'}{dominanceChartTexts.tooltip.rawValue}: {point.rawValue.toFixed(2)}
                      </title>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="dominance-periods-chart-legend">
        {areas.map(area => (
          <div key={area.id} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: getCivilizationColor(area.id) }}
            />
            <span className="legend-label">{getCivilizationName(area.id)}</span>
          </div>
        ))}
      </div>
      
      {dominanceChartTexts.explanation && (
        <div className="dominance-periods-chart-explanation">
          <p>{dominanceChartTexts.explanation}</p>
        </div>
      )}
    </div>
  );
};

