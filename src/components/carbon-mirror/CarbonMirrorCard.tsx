import { FeatureCardShell } from '@/components/dashboard/FeatureGrid';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import { CATEGORY_ICONS } from '@/utils/constants';
import { getCitedSource } from '@/utils/emissionFactors';
import { formatCo2Kg } from '@/utils/formatters';
import { useWebcam } from './useWebcam';
import { useCarbonMirror } from './useCarbonMirror';

export default function CarbonMirrorCard() {
  const {
    inputText,
    setInputText,
    activities,
    suggestion,
    validationError,
    handleSubmit,
    isLoading,
    error,
  } = useCarbonMirror();
  const { isWebcamActive, webcamError, videoRef, startWebcam, stopWebcam, captureFrame } =
    useWebcam(() => handleSubmit('I rode the metro to work and ate a vegetarian meal.'));

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <FeatureCardShell title="Carbon Mirror" icon="🪞" accentColor="#1a7a4a">
      <div className="space-y-4">
        {!isWebcamActive ? (
          <div>
            <label htmlFor="mirror-input" className="block text-sm text-text-secondary mb-2">
              What did you do today?
            </label>
            <textarea
              id="mirror-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="I drove 10km to work..."
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm resize-none h-20 transition-colors focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 min-h-[44px]"
              aria-invalid={!!validationError}
              aria-describedby={validationError ? 'mirror-error' : undefined}
              disabled={isLoading}
            />
            {validationError && (
              <p id="mirror-error" className="text-xs text-status-danger mt-1" role="alert">
                {validationError}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">Position yourself in the camera mirror:</p>
            <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-gray-300">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                aria-label="Webcam live preview"
              />
              <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>LIVE MIRROR
              </div>
            </div>
            {webcamError && (
              <p className="text-xs text-status-danger mt-1" role="alert">
                {webcamError}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!isWebcamActive ? (
            <>
              <Button
                onClick={() => handleSubmit()}
                size="sm"
                className="flex-1"
                isLoading={isLoading}
              >
                Analyze My Day
              </Button>
              <Button
                onClick={startWebcam}
                size="sm"
                variant="outline"
                aria-label="Open Webcam Mirror"
              >
                📷
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={captureFrame}
                size="sm"
                className="flex-1 text-xs"
                isLoading={isLoading}
              >
                📸 Capture & Analyze
              </Button>
              <Button
                onClick={stopWebcam}
                size="sm"
                variant="outline"
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
            </>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl" role="alert">
            <p className="text-sm text-status-danger">{error}</p>
          </div>
        )}
        {isLoading && <Loader size="sm" message="AI is analyzing your day..." />}

        {activities.length > 0 && !isLoading && (
          <div className="space-y-2">
            {activities.map((activity, index) => (
              <div
                key={`${activity.name}-${index}`}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">{CATEGORY_ICONS[activity.category]}</span>
                  <div className="flex flex-col">
                    <span className="text-sm text-text-primary">{activity.name}</span>
                    {activity.suggestion && (
                      <span className="text-xs text-brand-primary mt-0.5">
                        💡 {activity.suggestion}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-600 mt-0.5">
                      Source:{' '}
                      {getCitedSource(
                        activity.category === 'transport'
                          ? /flight/i.test(activity.name)
                            ? 'flight'
                            : /metro|train/i.test(activity.name)
                              ? 'metro'
                              : 'car'
                          : activity.category === 'food'
                            ? /beef|mutton|meat/i.test(activity.name)
                              ? 'beef'
                              : 'chicken'
                            : activity.category,
                      )}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold carbon-value text-text-primary">
                  {formatCo2Kg(activity.co2Kg)}
                </span>
              </div>
            ))}
            {suggestion && (
              <p className="text-xs text-brand-primary bg-brand-bg rounded-lg px-3 py-2 mt-2">
                💡 {suggestion}
              </p>
            )}
          </div>
        )}

        {activities.length === 0 && !isLoading && !error && (
          <EmptyState
            icon="💬"
            title="Describe your day"
            description="Tell us what you did today in plain language. Our AI will calculate the carbon cost."
          />
        )}
      </div>
    </FeatureCardShell>
  );
}
