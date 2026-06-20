/** Module containing UI components for ReceiptScannerCard. */
import { useRef } from 'react';
import { FeatureCardShell } from '@/components/dashboard/FeatureGrid';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import { UploadDropzone } from './UploadDropzone';
import { useReceiptScanner } from '@/hooks/useReceiptScanner';
import { formatCo2Kg } from '@/utils/formatters';
import { getCitedSource } from '@/utils/emissionFactors';

export default function ReceiptScannerCard() {
  const {
    selectedFile,
    previewUrl,
    items,
    totalCo2,
    storeName,
    validationError,
    compressionProgress,
    originalSize,
    compressedSize,
    isLoading,
    error,
    handleDrop,
    handleInputChange,
    handleScan,
    clearFile,
    formatFileSize,
  } = useReceiptScanner();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <FeatureCardShell
      title="Receipt Scanner"
      icon="📱"
      accentColor="#2980b9"
      headerAction={
        selectedFile ? (
          <button
            onClick={clearFile}
            className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer touch-target"
            aria-label="Clear selected file"
          >
            Clear
          </button>
        ) : null
      }
    >
      <div className="space-y-4">
        {!selectedFile && <UploadDropzone handleDrop={handleDrop} fileInputRef={fileInputRef} />}

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleInputChange}
          className="hidden"
          aria-label="Select receipt file"
        />

        {validationError && (
          <p className="text-xs text-status-danger" role="alert">
            {validationError}
          </p>
        )}

        {selectedFile && (
          <div className="space-y-3">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="w-full h-32 object-cover rounded-xl"
              />
            )}
            <div className="flex items-center justify-between text-sm text-text-secondary">
              <span className="truncate max-w-[60%]">{selectedFile.name}</span>
              <span>{formatFileSize(selectedFile.size)}</span>
            </div>

            {originalSize && compressedSize && (
              <div className="text-xs text-text-muted bg-gray-50 border border-gray-200/50 p-2.5 rounded-xl flex flex-col gap-1 text-left">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-text-secondary">Image Optimization:</span>
                  <span className="text-emerald-600 font-bold">
                    -{Math.round((1 - compressedSize / originalSize) * 100)}% Size Reduced
                  </span>
                </div>
                <div className="text-[11px] text-text-muted">
                  Original: {formatFileSize(originalSize)} → Optimized:{' '}
                  {formatFileSize(compressedSize)}
                </div>
              </div>
            )}

            <Button
              onClick={handleScan}
              size="sm"
              fullWidth
              isLoading={isLoading || compressionProgress !== null}
            >
              Scan Receipt
            </Button>
          </div>
        )}

        {compressionProgress !== null && (
          <div className="space-y-1.5 text-left bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex justify-between text-xs font-medium text-text-secondary">
              <span>Optimizing image...</span>
              <span>{compressionProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-green-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${compressionProgress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl" role="alert">
            <p className="text-sm text-status-danger">{error}</p>
          </div>
        )}

        {isLoading && <Loader size="sm" message="AI is reading your receipt..." />}

        {items.length > 0 && !isLoading && (
          <div className="space-y-2">
            {storeName && (
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                {storeName}
              </p>
            )}
            {items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
              >
                <div className="flex flex-col text-left">
                  <span className="text-sm text-text-primary">
                    {item.name} {item.quantity > 1 ? `×${item.quantity}` : ''}
                  </span>
                  <span className="text-[10px] text-gray-600 mt-0.5">
                    Source:{' '}
                    {getCitedSource(
                      /delivery|packaging|ride|courier/i.test(item.name)
                        ? 'car'
                        : /beef|mutton|meat/i.test(item.name)
                          ? 'beef'
                          : 'chicken',
                    )}
                  </span>
                </div>
                <span className="text-sm font-bold carbon-value text-text-primary">
                  {formatCo2Kg(item.co2Kg)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2 px-3 bg-brand-bg rounded-lg font-bold">
              <span className="text-sm text-brand-primary">Total</span>
              <span className="text-sm carbon-value text-brand-primary">
                {formatCo2Kg(totalCo2)}
              </span>
            </div>
          </div>
        )}

        {items.length === 0 && !selectedFile && !isLoading && !error && (
          <EmptyState
            icon="📸"
            title="Scan a receipt"
            description="Upload a Swiggy, Zomato, or grocery receipt. AI will calculate the carbon cost of each item."
          />
        )}
      </div>
    </FeatureCardShell>
  );
}
