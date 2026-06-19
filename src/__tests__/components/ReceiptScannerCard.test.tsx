import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReceiptScannerCard from '@/components/receipt-scanner/ReceiptScannerCard';
import { useReceiptScanner } from '@/hooks/useReceiptScanner';

// Mock the hook to control state transitions
vi.mock('@/hooks/useReceiptScanner', () => ({
  useReceiptScanner: vi.fn(),
}));

describe('ReceiptScannerCard Component Tests', () => {
  const mockHandleDrop = vi.fn();
  const mockHandleInputChange = vi.fn();
  const mockHandleScan = vi.fn();
  const mockClearFile = vi.fn();
  const mockFormatFileSize = vi.fn((size) => `${size} B`);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial empty state with upload instructions', () => {
    // Proves that when no file is selected, the upload dropzone and empty state are visible
    (useReceiptScanner as import('vitest').Mock).mockReturnValue({
      selectedFile: null,
      previewUrl: null,
      items: [],
      totalCo2: 0,
      storeName: '',
      validationError: null,
      compressionProgress: null,
      originalSize: null,
      compressedSize: null,
      isLoading: false,
      error: null,
      handleDrop: mockHandleDrop,
      handleInputChange: mockHandleInputChange,
      handleScan: mockHandleScan,
      clearFile: mockClearFile,
      formatFileSize: mockFormatFileSize,
    });

    render(<ReceiptScannerCard />);

    expect(screen.getByText(/drop your receipt here or click to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/scan a receipt/i)).toBeInTheDocument();
  });

  it('shows file preview, size details, and allows triggers for scanning', () => {
    // Proves that when a file is selected, the file preview, size reductions, and Scan button are rendered
    (useReceiptScanner as import('vitest').Mock).mockReturnValue({
      selectedFile: new File([''], 'receipt.jpg', { type: 'image/jpeg' }),
      previewUrl: 'mock-preview-url',
      items: [],
      totalCo2: 0,
      storeName: '',
      validationError: null,
      compressionProgress: null,
      originalSize: 1000,
      compressedSize: 400,
      isLoading: false,
      error: null,
      handleDrop: mockHandleDrop,
      handleInputChange: mockHandleInputChange,
      handleScan: mockHandleScan,
      clearFile: mockClearFile,
      formatFileSize: mockFormatFileSize,
    });

    render(<ReceiptScannerCard />);

    expect(screen.getByAltText(/receipt preview/i)).toBeInTheDocument();
    expect(screen.getByText(/-60% Size Reduced/i)).toBeInTheDocument();
    const scanBtn = screen.getByRole('button', { name: /scan receipt/i });
    fireEvent.click(scanBtn);
    expect(mockHandleScan).toHaveBeenCalledTimes(1);
  });

  it('displays scan results when receipt items are processed', () => {
    // Proves that scan results, including item names, CO2 equivalents, and store names, are rendered correctly
    (useReceiptScanner as import('vitest').Mock).mockReturnValue({
      selectedFile: null,
      previewUrl: null,
      items: [
        { name: 'Veg Biryani', quantity: 2, co2Kg: 1.2 },
        { name: 'Packaging', quantity: 1, co2Kg: 0.3 }
      ],
      totalCo2: 1.5,
      storeName: 'Swiggy Delivery',
      validationError: null,
      compressionProgress: null,
      originalSize: null,
      compressedSize: null,
      isLoading: false,
      error: null,
      handleDrop: mockHandleDrop,
      handleInputChange: mockHandleInputChange,
      handleScan: mockHandleScan,
      clearFile: mockClearFile,
      formatFileSize: mockFormatFileSize,
    });

    render(<ReceiptScannerCard />);

    expect(screen.getByText(/swiggy delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/veg biryani ×2/i)).toBeInTheDocument();
    expect(screen.getByText(/1.2 kg/i)).toBeInTheDocument();
    expect(screen.getByText(/0.30 kg/i)).toBeInTheDocument();
    expect(screen.getByText(/1.5 kg/i)).toBeInTheDocument();
  });

  it('renders loading indicators during API scans', () => {
    // Proves that while scanning is in progress, the Loader is active in the UI
    (useReceiptScanner as import('vitest').Mock).mockReturnValue({
      selectedFile: null,
      previewUrl: null,
      items: [],
      totalCo2: 0,
      storeName: '',
      validationError: null,
      compressionProgress: null,
      originalSize: null,
      compressedSize: null,
      isLoading: true,
      error: null,
      handleDrop: mockHandleDrop,
      handleInputChange: mockHandleInputChange,
      handleScan: mockHandleScan,
      clearFile: mockClearFile,
      formatFileSize: mockFormatFileSize,
    });

    render(<ReceiptScannerCard />);

    expect(screen.getAllByText(/ai is reading your receipt/i)[0]).toBeInTheDocument();
  });
});
