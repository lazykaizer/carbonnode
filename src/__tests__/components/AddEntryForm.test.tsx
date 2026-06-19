import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddEntryForm from '@/components/carbon-budget/AddEntryForm';
import { useCarbonStore } from '@/stores/carbonStore';
import { useGamificationStore } from '@/stores/gamificationStore';

describe('AddEntryForm Component Tests', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCarbonStore.getState().clearAllEntries();
    useGamificationStore.getState().resetGamification();
  });

  it('calculates transport emission correctly and submits transport entry', () => {
    // Proves that selecting transport petrol car option calculates emission as factor * multiplier and updates store
    render(<AddEntryForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Fill description
    fireEvent.change(screen.getByLabelText(/activity description/i), { target: { value: 'Petrol Commute' } });
    
    // Choose Petrol Car Ride
    fireEvent.change(screen.getByLabelText(/type of transport/i), { target: { value: 'car_petrol' } });
    
    // Set multiplier/km
    fireEvent.change(screen.getByLabelText(/amount \(km\)/i), { target: { value: '20' } });
    
    // Check calculated footprint display: CAR_PETROL_KG_PER_KM = 0.171 * 20 = 3.42 kg
    expect(screen.getByText(/3.42 kg/i)).toBeInTheDocument();
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /save activity/i }));
    
    expect(useCarbonStore.getState().entries.length).toBe(1);
    expect(useCarbonStore.getState().entries[0].co2Kg).toBe(3.42);
    expect(useCarbonStore.getState().entries[0].category).toBe('transport');
    expect(useCarbonStore.getState().entries[0].activityName).toBe('Petrol Commute');
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('calculates food emission correctly and awards transport streak if metro used', () => {
    // Proves that selecting metro transport option updates the transport streak in gamification store
    render(<AddEntryForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    fireEvent.change(screen.getByLabelText(/activity description/i), { target: { value: 'Metro Commute' } });
    fireEvent.change(screen.getByLabelText(/type of transport/i), { target: { value: 'metro_train' } });
    fireEvent.change(screen.getByLabelText(/amount \(km\)/i), { target: { value: '10' } });
    
    // METRO_INDIA_KG_PER_KM = 0.031 * 10 = 0.31 kg
    expect(screen.getByText(/0.31 kg/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /save activity/i }));
    
    expect(useGamificationStore.getState().publicTransportDays).toBe(1);
  });

  it('calculates food beef meal emission correctly', () => {
    // Proves that selecting food category and meat option computes beef meal emissions correctly
    render(<AddEntryForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Click Food category button
    const foodBtn = screen.getByRole('button', { name: /food & dining category/i });
    fireEvent.click(foodBtn);
    
    fireEvent.change(screen.getByLabelText(/activity description/i), { target: { value: 'Beef dinner' } });
    fireEvent.change(screen.getByLabelText(/type of food & dining/i), { target: { value: 'meal_beef' } });
    fireEvent.change(screen.getByLabelText(/amount \(meals\)/i), { target: { value: '2' } });
    
    // MEAL_BEEF_KG = 7.2 * 2 = 14.4 kg
    expect(screen.getByText(/14.40 kg/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /save activity/i }));
    expect(useCarbonStore.getState().entries[0].co2Kg).toBe(14.4);
  });

  it('calculates energy AC emission correctly', () => {
    // Proves that selecting energy category and AC option computes AC emissions correctly
    render(<AddEntryForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    const energyBtn = screen.getByRole('button', { name: /energy category/i });
    fireEvent.click(energyBtn);
    
    fireEvent.change(screen.getByLabelText(/activity description/i), { target: { value: 'Ran AC' } });
    fireEvent.change(screen.getByLabelText(/type of energy/i), { target: { value: 'energy_ac' } });
    fireEvent.change(screen.getByLabelText(/amount \(hours\)/i), { target: { value: '5' } });
    
    // AC_KG_PER_HOUR = 0.8 * 5 = 4.0 kg
    expect(screen.getByText(/4.00 kg/i)).toBeInTheDocument();
  });

  it('calculates shopping polyester emission correctly', () => {
    // Proves that selecting shopping category and polyester option computes synthetic clothes emissions correctly
    render(<AddEntryForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    const shopBtn = screen.getByRole('button', { name: /shopping category/i });
    fireEvent.click(shopBtn);
    
    fireEvent.change(screen.getByLabelText(/activity description/i), { target: { value: 'New t-shirt' } });
    fireEvent.change(screen.getByLabelText(/type of shopping/i), { target: { value: 'shop_polyester' } });
    fireEvent.change(screen.getByLabelText(/amount \(items\)/i), { target: { value: '3' } });
    
    // SHOP_POLYESTER_KG = 9.0 * 3 = 27.0 kg
    expect(screen.getByText(/27.00 kg/i)).toBeInTheDocument();
  });

  it('allows entering a direct emission amount', () => {
    // Proves that toggling to direct amount entry mode allows manual input of raw kg CO2 values
    render(<AddEntryForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    fireEvent.change(screen.getByLabelText(/activity description/i), { target: { value: 'Direct Entry' } });
    
    // Click "Enter Direct kg CO2" toggle button
    const directToggle = screen.getByRole('button', { name: /enter direct kg co₂/i });
    fireEvent.click(directToggle);
    
    // Set direct amount
    fireEvent.change(screen.getByLabelText(/carbon footprint/i), { target: { value: '45.67' } });
    
    expect(screen.getByText(/45.67 kg/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /save activity/i }));
    expect(useCarbonStore.getState().entries[0].co2Kg).toBe(45.67);
  });

  it('triggers cancel handler on Cancel click', () => {
    // Proves that clicking the cancel button calls the onCancel callback
    render(<AddEntryForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
