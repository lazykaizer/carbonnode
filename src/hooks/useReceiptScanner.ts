/** Manages receipt image selection, compression, and Gemini Vision analysis flow. Encapsulates all receipt scanning state. */
import { useState, useCallback, useRef } from 'react';
import { useCarbonStore } from '@/stores/carbonStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useUiStore } from '@/stores/uiStore';
import { analyzeReceipt } from '@/services/geminiService';
import { validateFile } from '@/utils/validators';
import { fileToBase64, formatFileSize, createImagePreviewUrl } from '@/utils/fileUtils';
import type { ReceiptItem } from '@/types';

const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
} as const;

export interface ReceiptScannerState {
  selectedFile: File | null;
  previewUrl: string | null;
  items: ReceiptItem[];
  totalCo2: number;
  storeName: string;
  validationError: string | null;
  compressionProgress: number | null;
  originalSize: number | null;
  compressedSize: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface ReceiptScannerActions {
  handleFileSelect: (file: File) => void;
  handleDrop: (event: React.DragEvent) => void;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleScan: () => Promise<void>;
  clearFile: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  formatFileSize: typeof formatFileSize;
}

/**
 * Encapsulates all state and business logic for the Receipt Scanner feature.
 * Extracted from ReceiptScannerCard.tsx to reduce that component below 150 lines.
 */
export function useReceiptScanner(): ReceiptScannerState & ReceiptScannerActions {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [totalCo2, setTotalCo2] = useState(0);
  const [storeName, setStoreName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [compressionProgress, setCompressionProgress] = useState<number | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { addEntry } = useCarbonStore();
  const { awardXp, unlockBadge } = useGamificationStore();
  const { loading, errors, setLoading, setError } = useUiStore();

  const handleFileSelect = useCallback(
    (file: File) => {
      const validation = validateFile(file);
      if (!validation.isValid) {
        setValidationError(validation.error);
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      setValidationError(null);
      setSelectedFile(file);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(file.type.startsWith('image/') ? createImagePreviewUrl(file) : null);
    },
    [previewUrl],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleScan = useCallback(async () => {
    if (!selectedFile) return;

    setLoading('receiptScanner', true);
    setError('receiptScanner', null);
    setOriginalSize(null);
    setCompressedSize(null);

    try {
      let fileToScan = selectedFile;

      if (selectedFile.type.startsWith('image/')) {
        setCompressionProgress(0);
        setOriginalSize(selectedFile.size);
        try {
          const imageCompression = (await import('browser-image-compression')).default;
          const compressed = await imageCompression(selectedFile, {
            ...IMAGE_COMPRESSION_OPTIONS,
            onProgress: (p: number) => setCompressionProgress(p),
          });
          setCompressedSize(compressed.size);
          fileToScan = compressed;
        } catch {
          // Compression failed — proceed with original file
        } finally {
          setCompressionProgress(null);
        }
      }

      const base64 = await fileToBase64(fileToScan);
      const result = await analyzeReceipt(base64, fileToScan.type, selectedFile.name);

      setItems(result.items);
      setTotalCo2(result.totalCo2Kg);
      setStoreName(result.storeName);

      for (const item of result.items) {
        addEntry({
          category: 'food',
          activityName: `${item.name} (${result.storeName || 'Receipt'})`,
          co2Kg: item.co2Kg,
          source: 'receipt',
        });
      }

      awardXp('receipt_scan');
      unlockBadge('first_scan');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to scan receipt. Please try again.';
      setError('receiptScanner', message);
    } finally {
      setLoading('receiptScanner', false);
      setCompressionProgress(null);
    }
  }, [selectedFile, addEntry, awardXp, unlockBadge, setLoading, setError]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setItems([]);
    setTotalCo2(0);
    setStoreName('');
    setValidationError(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setCompressionProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [previewUrl]);

  return {
    // State
    selectedFile,
    previewUrl,
    items,
    totalCo2,
    storeName,
    validationError,
    compressionProgress,
    originalSize,
    compressedSize,
    isLoading: loading.receiptScanner,
    error: errors.receiptScanner,
    // Actions
    handleFileSelect,
    handleDrop,
    handleInputChange,
    handleScan,
    clearFile,
    fileInputRef,
    formatFileSize,
  };
}
