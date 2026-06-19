import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useReceiptScanner } from '../../hooks/useReceiptScanner';
import { analyzeReceipt } from '../../services/geminiService';

vi.mock('browser-image-compression', () => ({
  default: vi.fn().mockImplementation((file, options) => {
    if (options?.onProgress) {
      options.onProgress(0.5);
    }
    return Promise.resolve(file);
  }),
}));

vi.mock('../../services/geminiService', () => ({
  analyzeReceipt: vi.fn(),
}));

describe('useReceiptScanner', () => {
  it('should initialize and reset state', () => {
    const { result } = renderHook(() => useReceiptScanner());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.previewUrl).toBeNull();
  });

  it('should compress and handle image selection', async () => {
    const { result } = renderHook(() => useReceiptScanner());
    
    const file = new File(['dummy content'], 'dummy.png', { type: 'image/png' });
    
    await act(async () => {
      await result.current.handleFileSelect(file);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle API failure', async () => {
    (analyzeReceipt as import('vitest').Mock).mockRejectedValueOnce(new Error('Network Error'));
    
    const { result } = renderHook(() => useReceiptScanner());
    
    const file = new File([''], 'dummy.png', { type: 'image/png' });
    
    await act(async () => {
      result.current.handleFileSelect(file);
    });

    await act(async () => {
      // handleScan doesn't take arguments, it uses selectedFile
      await result.current.handleScan();
    });

    expect(result.current.error).toBe('Network Error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle successful scan and clearFile', async () => {
    const mockItems = [{ name: 'apples', co2Kg: 0.5 }];
    (analyzeReceipt as import('vitest').Mock).mockResolvedValueOnce({
      items: mockItems,
      totalCo2Kg: 0.5,
      storeName: 'Grocer'
    });

    const { result } = renderHook(() => useReceiptScanner());
    const file = new File([''], 'dummy.png', { type: 'image/png' });

    await act(async () => {
      result.current.handleFileSelect(file);
    });

    await act(async () => {
      await result.current.handleScan();
    });

    expect(result.current.items).toEqual(mockItems);
    expect(result.current.totalCo2).toBe(0.5);
    expect(result.current.storeName).toBe('Grocer');

    act(() => {
      result.current.clearFile();
    });

    expect(result.current.selectedFile).toBeNull();
    expect(result.current.items).toEqual([]);
    expect(result.current.totalCo2).toBe(0);
  });

  it('should handle drop and input change events', () => {
    const { result } = renderHook(() => useReceiptScanner());
    const file = new File([''], 'dummy.png', { type: 'image/png' });

    // Test handleDrop
    const dragEvent = {
      preventDefault: vi.fn(),
      dataTransfer: {
        files: [file]
      }
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDrop(dragEvent);
    });
    expect(result.current.selectedFile).toEqual(file);

    // Test handleInputChange
    const changeEvent = {
      target: {
        files: [file]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleInputChange(changeEvent);
    });
    expect(result.current.selectedFile).toEqual(file);
  });

  it('should handle validation failure', () => {
    const { result } = renderHook(() => useReceiptScanner());
    const file = new File([''], 'dummy.pdf', { type: 'application/pdf' });
    act(() => {
      result.current.handleFileSelect(file);
    });
    expect(result.current.validationError).toBe('Only JPG, PNG, and WebP files are allowed.');
    expect(result.current.selectedFile).toBeNull();
  });
});
