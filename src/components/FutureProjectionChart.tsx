import React, { useMemo } from 'react';
import { Area, RoundSnapshot } from '../types';
import { FutureProjectionChartData } from '../hooks/useTexts';
import './FutureProjectionChart.css';

interface FutureProjectionChartProps {
  areas: Area[];
  areaHistory: RoundSnapshot[];
  areaLabels: Record<string, string>;
  futureProjectionChartTexts: FutureProjectionChartData;
}

/**
 * FutureProjectionChart Component
 * 
 * Displays a line chart showing development strength (Acc × Power) of the five civilization centers
 * across 12 rounds (12000 years): 8 real rounds (0-8000 years) + 4 predicted rounds (8000-12000 years).
 * 
 * Projection Logic:
 * - Step 1: Calculate growth trend from last real round (between round 7 and round 8)
 *   - deltaAcc = Acc_round8 - Acc_round7
 *   - deltaPower = Power_round8 - Power_round7
 * 
 * - Step 2: Project future rounds (9-12) using these deltas
 *   - Acc_round9 = Acc_round8 + deltaAcc
 *   - Power_round9 = Power_round8 + deltaPower
 *   - (and so on for rounds 10, 11, 12)
 * 
 * - Step 3: Calculate development strength as Acc × Power for all rounds
 * 
 * Visualization:
 * - Rounds 1-8: Solid lines (real data)
 * - Rounds 9-12: Dashed lines (predicted data)
 * - Clear visual separation between real and projected values
 * 
 * Colors:
 * - Each line uses the color defined for that civilization center in logic.json
 */
export const FutureProjectionChart: React.FC<FutureProjectionChartProps> = ({
  areas,
  areaHistory,
  areaLabels,
  futureProjectionChartTexts
}) => {
  // Chart dimensions - matching other charts for consistency
  const CHART_WIDTH = 1000;
  const CHART_HEIGHT = 500;
  const MARGIN_LEFT = 80;
  const MARGIN_RIGHT = 80;
  const MARGIN_TOP = 60;
  const MARGIN_BOTTOM = 120;
  const PLOT_WIDTH = CHART_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  const PLOT_HEIGHT = CHART_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;
  
  // Time mapping: 12 rounds = 12000 years (1000 years per round)
  const TOTAL_YEARS = 12000;
  const YEARS_PER_ROUND = 1000;
  const REAL_ROUNDS = 8; // Rounds 1-8 are real data
  // const PREDICTED_ROUNDS = 4; // Rounds 9-12 are predicted (unused but kept for documentation)
  
  // Get color for a civilization center from logic.json
  const getCivilizationColor = (areaId: string): string => {
    const area = areas.find(a => a.id === areaId);
    return area?.color || '#999999';
  };
  
  // Display name for a civilization center (from i18n areaButtons on final charts screen)
  const getCivilizationName = (areaId: string): string => {
    return areaLabels[areaId] || areaId;
  };
  
  // Convert round number to year (round 1 = 1000, round 2 = 2000, ..., round 12 = 12000)
  const roundToYear = (round: number): number => {
    return round * YEARS_PER_ROUND;
  };
  
  // Convert year to X coordinate
  const yearToX = (year: number): number => {
    return MARGIN_LEFT + (year / TOTAL_YEARS) * PLOT_WIDTH;
  };
  
  /**
   * Calculate projected data for rounds 9-12 based on growth trend from rounds 7-8
   * 
   * For each civilization center:
   * 1. Extract Acc and Power values for rounds 7 and 8 from areaHistory
   * 2. Calculate deltaAcc = Acc_round8 - Acc_round7
   * 3. Calculate deltaPower = Power_round8 - Power_round7
   * 4. Project rounds 9-12 by adding these deltas iteratively
   * 5. Calculate development strength as Acc × Power for all rounds
   */
  const centerData = useMemo(() => {
    const dataByCenter: Record<string, Array<{
      round: number;
      year: number;
      acc: number;
      power: number;
      value: number; // Acc × Power
      isPredicted: boolean;
    }>> = {};
    
    // Initialize all centers
    areas.forEach(area => {
      dataByCenter[area.id] = [];
    });
    
    // Process real history snapshots (sorted by round)
    const sortedHistory = [...areaHistory].sort((a, b) => a.round - b.round);
    
    // First, collect real data (rounds 1-8)
    sortedHistory.forEach(snapshot => {
      snapshot.areas.forEach(areaSnapshot => {
        if (dataByCenter[areaSnapshot.areaId]) {
          dataByCenter[areaSnapshot.areaId].push({
            round: snapshot.round,
            year: roundToYear(snapshot.round),
            acc: areaSnapshot.acc,
            power: areaSnapshot.power,
            value: areaSnapshot.acc * areaSnapshot.power,
            isPredicted: false
          });
        }
      });
    });
    
    // Now calculate projections for rounds 9-12
    // For each center, we need Acc and Power from rounds 7 and 8
    areas.forEach(area => {
      const centerPoints = dataByCenter[area.id];
      
      // Find rounds 7 and 8 data
      const round7Data = centerPoints.find(p => p.round === 7);
      const round8Data = centerPoints.find(p => p.round === 8);
      
      // Only project if we have both round 7 and round 8 data
      if (round7Data && round8Data) {
        // Calculate growth trend (delta) from round 7 to round 8
        const deltaAcc = round8Data.acc - round7Data.acc;
        const deltaPower = round8Data.power - round7Data.power;
        
        // Project rounds 9-12 using the deltas
        let currentAcc = round8Data.acc;
        let currentPower = round8Data.power;
        
        for (let round = 9; round <= 12; round++) {
          // Add the delta to get next round's values
          currentAcc = currentAcc + deltaAcc;
          currentPower = currentPower + deltaPower;
          
          // Ensure values don't go negative (minimum 0.1)
          currentAcc = Math.max(0.1, currentAcc);
          currentPower = Math.max(0.1, currentPower);
          
          // Calculate development strength
          const value = currentAcc * currentPower;
          
          centerPoints.push({
            round,
            year: roundToYear(round),
            acc: currentAcc,
            power: currentPower,
            value,
            isPredicted: true
          });
        }
      }
    });
    
    // Sort all points by round
    Object.keys(dataByCenter).forEach(areaId => {
      dataByCenter[areaId].sort((a, b) => a.round - b.round);
    });
    
    return dataByCenter;
  }, [areaHistory, areas]);
  
  // Calculate Y-axis domain (min and max development strength values)
  const yDomain = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    
    Object.values(centerData).forEach(points => {
      points.forEach(point => {
        min = Math.min(min, point.value);
        max = Math.max(max, point.value);
      });
    });
    
    // Add some padding (10% on each side)
    const padding = (max - min) * 0.1 || 1;
    return {
      min: Math.max(0, min - padding), // Ensure min is at least 0
      max: max + padding
    };
  }, [centerData]);
  
  // Convert development strength value to Y coordinate (inverted because SVG Y increases downward)
  const valueToY = (value: number): number => {
    const range = yDomain.max - yDomain.min;
    if (range === 0) return MARGIN_TOP + PLOT_HEIGHT / 2;
    const normalized = (value - yDomain.min) / range;
    return MARGIN_TOP + PLOT_HEIGHT - (normalized * PLOT_HEIGHT);
  };
  
  // Generate Y-axis ticks
  const yTicks = useMemo(() => {
    const tickCount = 5;
    const ticks: number[] = [];
    const step = (yDomain.max - yDomain.min) / (tickCount - 1);
    for (let i = 0; i < tickCount; i++) {
      ticks.push(yDomain.min + i * step);
    }
    return ticks;
  }, [yDomain]);
  
  // Generate X-axis ticks (every 1000 years)
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let year = 0; year <= TOTAL_YEARS; year += YEARS_PER_ROUND) {
      ticks.push(year);
    }
    return ticks;
  }, []);
  
  /**
   * Generate path data for a line (SVG path string)
   * Separates real and predicted segments for different styling
   */
  const generatePath = (
    points: Array<{ year: number; value: number; isPredicted: boolean }>
  ): { realPath: string; predictedPath: string } => {
    if (points.length === 0) return { realPath: '', predictedPath: '' };
    
    const realPoints = points.filter(p => !p.isPredicted);
    const predictedPoints = points.filter(p => p.isPredicted);
    
    const realPathParts = realPoints.map((point, index) => {
      const x = yearToX(point.year);
      const y = valueToY(point.value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });
    
    const predictedPathParts = predictedPoints.map((point, index) => {
      const x = yearToX(point.year);
      const y = valueToY(point.value);
      // If this is the first predicted point, connect from last real point
      if (index === 0 && realPoints.length > 0) {
        const lastReal = realPoints[realPoints.length - 1];
        const lastX = yearToX(lastReal.year);
        const lastY = valueToY(lastReal.value);
        return `M ${lastX} ${lastY} L ${x} ${y}`;
      }
      return `L ${x} ${y}`;
    });
    
    return {
      realPath: realPathParts.join(' '),
      predictedPath: predictedPathParts.join(' ')
    };
  };
  
  return (
    <div className="future-projection-chart-container">
      <h3 className="future-projection-chart-title">{futureProjectionChartTexts.title}</h3>
      <div className="future-projection-chart-wrapper">
        <svg
          className="future-projection-chart-svg"
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
          
          {/* Vertical line separating real and predicted data */}
          <line
            x1={yearToX(roundToYear(REAL_ROUNDS))}
            y1={MARGIN_TOP}
            x2={yearToX(roundToYear(REAL_ROUNDS))}
            y2={MARGIN_TOP + PLOT_HEIGHT}
            stroke="#999"
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity="0.6"
          />
          
          {/* Y-axis grid lines and labels */}
          {yTicks.map((value, index) => {
            const y = valueToY(value);
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
                  {value.toFixed(1)}
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
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(round => {
            const year = roundToYear(round);
            const x = yearToX(year);
            const isPredicted = round > REAL_ROUNDS;
            return (
              <text
                key={`round-label-${round}`}
                x={x}
                y={MARGIN_TOP - 10}
                textAnchor="middle"
                fontSize="10"
                fill={isPredicted ? "#999" : "#333"}
                fontWeight="500"
                fontStyle={isPredicted ? "italic" : "normal"}
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
            {futureProjectionChartTexts.axis.development}
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
            {futureProjectionChartTexts.axis.time}
          </text>
          
          {/* Draw lines for each civilization center */}
          {areas.map(area => {
            const points = centerData[area.id] || [];
            if (points.length === 0) return null;
            
            const color = getCivilizationColor(area.id);
            const { realPath, predictedPath } = generatePath(points);
            
            return (
              <g key={`line-${area.id}`}>
                {/* Real data line (solid) */}
                {realPath && (
                  <path
                    d={realPath}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="projection-line projection-line-real"
                  />
                )}
                
                {/* Predicted data line (dashed) */}
                {predictedPath && (
                  <path
                    d={predictedPath}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="8,4"
                    opacity="0.7"
                    className="projection-line projection-line-predicted"
                  />
                )}
                
                {/* Data points with hover tooltips */}
                {points.map((point, _index) => {
                  const x = yearToX(point.year);
                  const y = valueToY(point.value);
                  
                  return (
                    <g key={`point-${area.id}-${point.round}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r={point.isPredicted ? "4" : "5"}
                        fill={color}
                        stroke="#fff"
                        strokeWidth="2"
                        opacity={point.isPredicted ? 0.7 : 1}
                        className="projection-point"
                      />
                      {/* Tooltip on hover */}
                      <title>
                        {getCivilizationName(area.id)} - {futureProjectionChartTexts.tooltip.round} {point.round}
                        {'\n'}{futureProjectionChartTexts.tooltip.acc}: {point.acc.toFixed(2)}
                        {'\n'}{futureProjectionChartTexts.tooltip.power}: {point.power.toFixed(2)}
                        {'\n'}{futureProjectionChartTexts.tooltip.value}: {point.value.toFixed(2)}
                        {point.isPredicted ? `\n${futureProjectionChartTexts.tooltip.predicted}` : ''}
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
      <div className="future-projection-chart-legend">
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
      
      {futureProjectionChartTexts.explanation && (
        <div className="future-projection-chart-explanation">
          <p>{futureProjectionChartTexts.explanation}</p>
        </div>
      )}
    </div>
  );
};

