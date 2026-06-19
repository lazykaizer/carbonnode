import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CarbonMirrorCard from '@/components/carbon-mirror/CarbonMirrorCard';
import { analyzeDailyActivity } from '@/services/geminiService';
import { useCarbonStore } from '@/stores/carbonStore';

// Mock the analysis service
vi.mock('@/services/geminiService', () => ({
  analyzeDailyActivity: vi.fn(),
}));

describe('CarbonMirrorCard Component Tests', () => {
  const mockStream = {
    getTracks: vi.fn(() => [
      { stop: vi.fn() }
    ])
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCarbonStore.getState().clearAllEntries();
    
    // Mock getUserMedia
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    });
  });

  it('renders textarea and analyzes natural language day descriptions', async () => {
    // Proves that entering daily text and clicking analyze calls the API and saves the resulting carbon activities
    const mockAnalysisResult = {
      activities: [
        { name: 'Commuted by car', category: 'transport' as const, co2Kg: 2.5, suggestion: 'Take train' }
      ],
      overallSuggestion: 'Overall good day'
    };
    (analyzeDailyActivity as import('vitest').Mock).mockResolvedValueOnce(mockAnalysisResult);

    render(<CarbonMirrorCard />);

    const textarea = screen.getByLabelText(/what did you do today/i);
    fireEvent.change(textarea, { target: { value: 'I rode a car to the office.' } });

    const analyzeBtn = screen.getByRole('button', { name: /analyze my day/i });
    fireEvent.click(analyzeBtn);

    // Verify loading state renders
    expect(screen.getAllByText(/ai is analyzing your day/i)[0]).toBeInTheDocument();

    // Verify results show up
    await waitFor(() => {
      expect(screen.getByText('Commuted by car')).toBeInTheDocument();
      expect(screen.getByText('2.5 kg')).toBeInTheDocument();
      expect(screen.getByText(/take train/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(useCarbonStore.getState().entries.length).toBe(1);
    expect(useCarbonStore.getState().entries[0].activityName).toBe('Commuted by car');
  });

  it('starts webcam stream and displays active video element on trigger', async () => {
    // Proves that clicking the camera icon calls getUserMedia, updates the UI to show the video tag and a Live indicator
    render(<CarbonMirrorCard />);

    const cameraBtn = screen.getByLabelText(/open webcam mirror/i);
    fireEvent.click(cameraBtn);

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true });

    // Wait for the video element to render
    const video = await screen.findByLabelText(/webcam live preview/i);
    expect(video).toBeInTheDocument();
    expect(screen.getByText(/live mirror/i)).toBeInTheDocument();
  });

  it('closes webcam stream and resets UI when Cancel is clicked', async () => {
    // Proves that clicking Cancel stops the webcam tracks and returns to the textarea view
    render(<CarbonMirrorCard />);

    const cameraBtn = screen.getByLabelText(/open webcam mirror/i);
    fireEvent.click(cameraBtn);

    const cancelBtn = await screen.findByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    // Video preview should be gone, textarea should be visible again
    expect(screen.queryByLabelText(/webcam live preview/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/what did you do today/i)).toBeInTheDocument();
  });

  it('captures a simulated frame and analyzes it on Capture click', async () => {
    // Proves that clicking Capture stops the stream and submits the default captured text description
    const mockAnalysisResult = {
      activities: [
        { name: 'Commuted by Metro', category: 'transport' as const, co2Kg: 0.3, suggestion: 'Good' },
        { name: 'Vegetarian Meal', category: 'food' as const, co2Kg: 0.6, suggestion: 'Excellent' }
      ],
      overallSuggestion: 'Excellent daily footprint!'
    };
    (analyzeDailyActivity as import('vitest').Mock).mockResolvedValueOnce(mockAnalysisResult);

    render(<CarbonMirrorCard />);

    const cameraBtn = screen.getByLabelText(/open webcam mirror/i);
    fireEvent.click(cameraBtn);

    const captureBtn = await screen.findByRole('button', { name: /capture & analyze/i });
    fireEvent.click(captureBtn);

    // API should be called with default captured scene content
    expect(analyzeDailyActivity).toHaveBeenCalledWith('I rode the metro to work and ate a vegetarian meal.');

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Commuted by Metro')).toBeInTheDocument();
      expect(screen.getByText('Vegetarian Meal')).toBeInTheDocument();
      expect(screen.getByText('0.30 kg')).toBeInTheDocument();
      expect(screen.getByText('0.60 kg')).toBeInTheDocument();
    });
  });
});
