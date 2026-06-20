/** Module containing UI components for CarbonTimeline. */
import { useDailyTimeline } from '@/hooks/useDailyTimeline';
import { formatCo2Kg } from '@/utils/formatters';
import { INDIA_URBAN_DAILY_KG } from '@/utils/emissionFactors';
import { CATEGORY_ICONS } from '@/utils/constants';
import type { CarbonEntry } from '@/types';

export default function CarbonTimeline() {
  const { dailyData, selectedNode, maxVal, budgetLinePercentage, toggleDay } = useDailyTimeline();

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm text-left">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl" aria-hidden="true">
          📈
        </span>
        <h2 className="text-lg font-bold text-text-primary">Carbon Impact Timeline</h2>
      </div>
      <p className="text-xs text-text-secondary mb-6">
        Click on any node to view daily milestones and log itemization relative to the national
        average.
      </p>

      {/* Chart Container */}
      <div
        className="relative border-b border-gray-200 pb-2 mb-4 h-48 bg-gray-50/50 rounded-xl p-4 overflow-x-auto scrollbar-thin"
        role="region"
        aria-label="Daily carbon emissions interactive chart"
      >
        <div className="min-w-[960px] h-full flex justify-between items-end relative pt-6 px-4">
          {/* National Budget Line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-red-500/40 pointer-events-none flex justify-end pr-2"
            style={{ bottom: `${budgetLinePercentage}%` }}
          >
            <span className="text-[9px] font-bold text-red-500 bg-white px-1 -mt-2 shadow-sm border border-red-100 rounded">
              Daily Average ({INDIA_URBAN_DAILY_KG} kg)
            </span>
          </div>

          {dailyData.map((node) => {
            const heightPercent = (node.totalCo2 / maxVal) * 100;
            const isSelected = selectedNode?.dayStr === node.dayStr;
            const isOverLimit = node.totalCo2 > INDIA_URBAN_DAILY_KG;
            const hasData = node.entries.length > 0;

            return (
              <div
                key={node.dayStr}
                className="flex flex-col items-center gap-2 relative z-10 flex-1"
              >
                {/* Milestone Badge */}
                {node.milestones.length > 0 && (
                  <div className="absolute -top-7 flex gap-0.5 justify-center">
                    {node.milestones.map((ms, idx) => (
                      <span
                        key={idx}
                        title={ms.label}
                        className="text-xs cursor-help bg-white p-0.5 rounded-full shadow border border-gray-100"
                      >
                        {ms.icon}
                      </span>
                    ))}
                  </div>
                )}

                {/* Node Button */}
                <button
                  onClick={() => toggleDay(node.dayStr)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 relative focus:outline-none cursor-pointer ${
                    isSelected ? 'ring-4 ring-brand-primary ring-offset-2' : ''
                  } ${
                    !hasData
                      ? 'bg-gray-300 hover:bg-gray-400'
                      : isOverLimit
                        ? 'bg-status-danger hover:scale-125'
                        : 'bg-status-success hover:scale-125'
                  }`}
                  style={{ bottom: `calc(${heightPercent}% - 6px)` }}
                  aria-label={`Emissions for ${node.formattedDate}: ${node.totalCo2} kg. Click for details.`}
                />

                {/* Vertical Bar */}
                {hasData && (
                  <div
                    className={`w-1 rounded-t-full absolute bottom-0 pointer-events-none transition-colors duration-300 ${
                      isSelected
                        ? 'bg-brand-primary'
                        : isOverLimit
                          ? 'bg-status-danger/20'
                          : 'bg-status-success/20'
                    }`}
                    style={{ height: `${heightPercent}%`, bottom: '6px' }}
                  />
                )}

                <span className="text-[10px] font-semibold text-text-secondary select-none">
                  {node.formattedDate}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visually hidden data table for screen readers */}
      <table className="sr-only" aria-label="Carbon emissions data table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Total CO2 (kg)</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {dailyData.map((node) => (
            <tr key={node.dayStr}>
              <td>{node.formattedDate}</td>
              <td>{node.totalCo2}</td>
              <td>{node.totalCo2 > INDIA_URBAN_DAILY_KG ? 'Over limit' : 'Under limit'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Selected Day Detail Panel */}
      <div
        className={[
          'overflow-hidden transition-all duration-300',
          selectedNode ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 pointer-events-none',
        ].join(' ')}
      >
        {selectedNode && (
          <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-text-primary">
                Logs for{' '}
                {selectedNode.date.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h3>
              <div className="text-right">
                <span className="text-xs text-text-muted block">Daily Footprint</span>
                <span
                  className={`text-sm font-black ${selectedNode.totalCo2 > INDIA_URBAN_DAILY_KG ? 'text-status-danger' : 'text-status-success'}`}
                >
                  {formatCo2Kg(selectedNode.totalCo2)}
                </span>
              </div>
            </div>

            {selectedNode.milestones.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedNode.milestones.map((ms, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[10px] bg-white border border-gray-150 px-2 py-0.5 rounded-full text-text-secondary shadow-sm"
                  >
                    <span>{ms.icon}</span>
                    <span>{ms.label}</span>
                  </span>
                ))}
              </div>
            )}

            {selectedNode.entries.length > 0 ? (
              <div className="space-y-1.5 pt-2 max-h-48 overflow-y-auto pr-1">
                {selectedNode.entries.map((entry: CarbonEntry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-2 truncate pr-4">
                      <span className="text-xs" aria-hidden="true">
                        {CATEGORY_ICONS[entry.category]}
                      </span>
                      <span className="truncate text-text-primary font-medium">
                        {entry.activityName}
                      </span>
                    </div>
                    <span className="font-bold text-text-primary flex-shrink-0">
                      {formatCo2Kg(entry.co2Kg)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted py-2">
                No carbon footprint logged on this day.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
