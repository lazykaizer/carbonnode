/** Module containing UI components for CarbonSubtitlesPage. */
import { useState, useCallback } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import Card from '@/components/common/Card';
import SubtitleResultCard from '@/components/carbon-subtitles/SubtitleResultCard';
import { useUiStore } from '@/stores/uiStore';
import { useCarbonStore } from '@/stores/carbonStore';
import { analyzeUrl } from '@/services/geminiService';
import { validateUrl } from '@/utils/validators';
import { sanitizeInput } from '@/utils/sanitize';
import { formatCo2Kg } from '@/utils/formatters';
import { useIsMobile, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import type { SubtitleResult } from '@/types';

export default function CarbonSubtitlesPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<SubtitleResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { loading, errors, setLoading, setError } = useUiStore();
  const { addEntry } = useCarbonStore();

  const handleAnalyze = useCallback(async () => {
    const sanitized = sanitizeInput(url);
    const validation = validateUrl(sanitized);

    if (!validation.isValid) {
      setValidationError(validation.error);
      setAnnouncement(`Validation error: ${validation.error}`);
      return;
    }

    setValidationError(null);
    setLoading('carbonSubtitles', true);
    setError('carbonSubtitles', null);
    setAnnouncement('Analyzing URL carbon footprint...');

    try {
      const analysisResult = await analyzeUrl(sanitized);
      setResult(analysisResult);
      setAnnouncement(
        `Analysis completed. ${analysisResult.activity} emits ${formatCo2Kg(analysisResult.co2Kg)}.`,
      );
      addEntry({
        category: 'other',
        activityName: analysisResult.activity,
        co2Kg: analysisResult.co2Kg,
        source: 'subtitles',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to analyze URL. Please try again.';
      setError('carbonSubtitles', message);
      setAnnouncement(`Error analyzing URL: ${message}`);
    } finally {
      setLoading('carbonSubtitles', false);
    }
  }, [url, addEntry, setLoading, setError]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleAnalyze();
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <Sidebar />
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <main
        id="main-content"
        className={`transition-all duration-300 ${isMobile ? 'pb-20 px-4 pt-4' : 'ml-64 p-6'}`}
      >
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
            📺 Carbon Subtitles
          </h1>
          <p className="text-text-secondary">
            Paste any URL — get the carbon cost of that choice before you make it.
          </p>
        </header>

        <Card className="mb-6" hoverable={false}>
          <label htmlFor="url-input" className="block text-sm font-medium text-text-secondary mb-2">
            Paste a product or service URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://www.swiggy.com/... or any product URL"
              className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none min-h-[44px]"
              aria-invalid={validationError ? 'true' : 'false'}
              aria-describedby={validationError ? 'url-error' : undefined}
              disabled={loading.carbonSubtitles}
            />
            <Button
              onClick={handleAnalyze}
              isLoading={loading.carbonSubtitles}
              className="whitespace-nowrap"
            >
              Analyze URL
            </Button>
          </div>
          {validationError && (
            <p id="url-error" className="text-xs text-status-danger mt-2" role="alert">
              {validationError}
            </p>
          )}
        </Card>

        {errors.carbonSubtitles && (
          <Card className="mb-6 border-l-4 border-status-danger" hoverable={false}>
            <p className="text-sm text-status-danger" role="alert">
              {errors.carbonSubtitles}
            </p>
          </Card>
        )}

        {loading.carbonSubtitles && (
          <Loader size="lg" message="AI is analyzing the carbon cost of this URL..." />
        )}

        {result && !loading.carbonSubtitles && (
          <SubtitleResultCard result={result} prefersReducedMotion={prefersReducedMotion} />
        )}

        {!result && !loading.carbonSubtitles && !errors.carbonSubtitles && (
          <div className="text-center py-16">
            <span className="text-6xl block mb-4" aria-hidden="true">
              🔍
            </span>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              See the carbon cost of any choice
            </h2>
            <p className="text-text-secondary max-w-md mx-auto">
              Paste a URL from any online store, food delivery app, or service. AI will estimate the
              carbon footprint and suggest greener alternatives.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
