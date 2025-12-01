import React, { useMemo } from 'react';
import { Area, RoundSnapshot } from '../types';
import { PopulationChartData } from '../hooks/useTexts';
import './FinalPopulationChart.css';

interface FinalPopulationChartProps {
  areas: Area[];
  areaHistory: RoundSnapshot[];
  areaLabels: Record<string, string>;
  populationChartTexts: PopulationChartData;
}

/**
 * FinalPopulationChart Component
 * 
 * Displays a line chart showing population dynamics of the five civilization centers
 * across 8 rounds (8000 years).
 * 
 * Population Calculation:
 * - Rounds 1-6: Population = Acc * Power for each center
 * - Round 7: Population = Acc * Power * multiplierRound7 (from logic.json)
 * - Round 8: Population = Acc * Power * multiplierRound8 (from logic.json)
 * - Multipliers are applied during snapshot creation in useGameState, not here
 * - Data is collected per round from areaHistory (stored after each round completes)
 * 
 * Colors:
 * - Each line uses the color defined for that civilization center in logic.json
 * - Colors are extracted from the areas prop which loads colors from logic.json
 */
export const FinalPopulationChart: React.FC<FinalPopulationChartProps> = ({
  areas,
  areaHistory,
  areaLabels,
  populationChartTexts
}) => {
  // Chart dimensions - matching FinalTimeline for consistency
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
  // Colors are defined in logic.json and loaded into the areas prop
  const getCivilizationColor = (areaId: string): string => {
    const area = areas.find(a => a.id === areaId);
    return area?.color || '#999999';
  };
  
  // Get short name for a civilization center
  const getCivilizationName = (areaId: string): string => {
    const label = areaLabels[areaId] || areaId;
    // Extract region number or short name
    const match = label.match(/Region (\d+)/);
    if (match) {
      return `R${match[1]}`;
    }
    return label.split(':')[0] || areaId;
  };
  
  // Convert round number to year (round 1 = 1000, round 2 = 2000, ..., round 8 = 8000)
  // Round 0 represents initial state (0 years)
  const roundToYear = (round: number): number => {
    return round * YEARS_PER_ROUND;
  };
  
  // Convert year to X coordinate
  const yearToX = (year: number): number => {
    return MARGIN_LEFT + (year / TOTAL_YEARS) * PLOT_WIDTH;
  };
  
  // Prepare data for each civilization center
  // Each center gets a series of points: (round, populationValue)
  const centerData = useMemo(() => {
    const dataByCenter: Record<string, Array<{ round: number; year: number; populationValue: number; acc: number; power: number }>> = {};
    
    // Initialize all centers
    areas.forEach(area => {
      dataByCenter[area.id] = [];
    });
    
    // Process history snapshots (sorted by round)
    const sortedHistory = [...areaHistory].sort((a, b) => a.round - b.round);
    
    sortedHistory.forEach(snapshot => {
      snapshot.areas.forEach(areaSnapshot => {
        if (dataByCenter[areaSnapshot.areaId]) {
          dataByCenter[areaSnapshot.areaId].push({
            round: snapshot.round,
            year: roundToYear(snapshot.round),
            populationValue: areaSnapshot.populationValue,
            acc: areaSnapshot.acc,
            power: areaSnapshot.power
          });
        }
      });
    });
    
    return dataByCenter;
  }, [areaHistory, areas]);
  
  // Calculate Y-axis domain (min and max population values)
  const yDomain = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    
    Object.values(centerData).forEach(points => {
      points.forEach(point => {
        min = Math.min(min, point.populationValue);
        max = Math.max(max, point.populationValue);
      });
    });
    
    // Add some padding (10% on each side)
    const padding = (max - min) * 0.1 || 1;
    return {
      min: Math.max(0, min - padding), // Ensure min is at least 0
      max: max + padding
    };
  }, [centerData]);
  
  // Convert population value to Y coordinate (inverted because SVG Y increases downward)
  const populationToY = (value: number): number => {
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
  
  // Generate path data for a line (SVG path string)
  const generatePath = (points: Array<{ year: number; populationValue: number }>): string => {
    if (points.length === 0) return '';
    
    const pathParts = points.map((point, index) => {
      const x = yearToX(point.year);
      const y = populationToY(point.populationValue);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });
    
    return pathParts.join(' ');
  };
  
  return (
    <div className="final-population-chart-container">
      <h3 className="final-population-chart-title">{populationChartTexts.title}</h3>
      <div className="final-population-chart-wrapper">
        <svg
          className="final-population-chart-svg"
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
          
          {/* Y-axis grid lines and labels */}
          {yTicks.map((value, index) => {
            const y = populationToY(value);
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
            {populationChartTexts.axis.population}
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
            {populationChartTexts.axis.time}
          </text>
          
          {/* Draw lines for each civilization center */}
          {areas.map(area => {
            const points = centerData[area.id] || [];
            if (points.length === 0) return null;
            
            const color = getCivilizationColor(area.id);
            const pathData = generatePath(points);
            
            return (
              <g key={`line-${area.id}`}>
                {/* Line path */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="population-line"
                />
                
                {/* Data points with hover tooltips */}
                {points.map((point, _index) => {
                  const x = yearToX(point.year);
                  const y = populationToY(point.populationValue);
                  
                  return (
                    <g key={`point-${area.id}-${point.round}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill={color}
                        stroke="#fff"
                        strokeWidth="2"
                        className="population-point"
                      />
                      {/* Tooltip on hover */}
                      <title>
                        {getCivilizationName(area.id)} - {populationChartTexts.tooltip.round} {point.round}
                        {'\n'}{populationChartTexts.tooltip.year}: {point.year}
                        {'\n'}{populationChartTexts.tooltip.acc}: {point.acc.toFixed(2)}
                        {'\n'}{populationChartTexts.tooltip.power}: {point.power.toFixed(2)}
                        {'\n'}{populationChartTexts.tooltip.populationValue}: {point.populationValue.toFixed(2)}
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
      <div className="final-population-chart-legend">
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
      
      {/* Explanation */}
      <div className="final-population-chart-explanation">
        <p>
          {populationChartTexts.explanation}
        </p>
      </div>
    </div>
  );
};

