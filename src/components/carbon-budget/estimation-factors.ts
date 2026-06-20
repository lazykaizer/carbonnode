/** Emission estimation factors for the manual carbon budget entry form. Maps activity subtypes to kg CO₂ per unit with Indian-context defaults. */
import type { CarbonCategory } from '@/types';
import {
  CAR_PETROL_KG_PER_KM,
  CAR_DIESEL_KG_PER_KM,
  CAR_EV_KG_PER_KM,
  TWO_WHEELER_INDIA_KG_PER_KM,
  AUTO_RICKSHAW_KG_PER_KM,
  BUS_INDIA_KG_PER_KM,
  METRO_INDIA_KG_PER_KM,
  MEAL_BEEF_KG,
  MEAL_CHICKEN_KG,
  MEAL_VEG_KG,
  MEAL_VEGAN_KG,
  AC_KG_PER_HOUR,
  HEATER_KG_PER_HOUR,
  APPLIANCES_KG_PER_HOUR,
  LIGHTS_KG_PER_HOUR,
  SHOP_POLYESTER_KG,
  SHOP_COTTON_KG,
  SHOP_ELECTRONICS_KG,
  SHOP_PLASTIC_KG,
  CUSTOM_KG,
} from '@/utils/emissionFactors';

export interface EstimationFactor {
  id: string;
  name: string;
  unit: string;
  factor: number;
  requiresMultiplier: boolean;
}

export type EstimationFactors = Record<CarbonCategory, EstimationFactor[]>;

export const ESTIMATION_FACTORS: EstimationFactors = {
  transport: [
    {
      id: 'car_petrol',
      name: 'Petrol Car Ride',
      unit: 'km',
      factor: CAR_PETROL_KG_PER_KM,
      requiresMultiplier: true,
    },
    {
      id: 'car_diesel',
      name: 'Diesel Car Ride',
      unit: 'km',
      factor: CAR_DIESEL_KG_PER_KM,
      requiresMultiplier: true,
    },
    {
      id: 'car_ev',
      name: 'Electric Vehicle (EV)',
      unit: 'km',
      factor: CAR_EV_KG_PER_KM,
      requiresMultiplier: true,
    },
    {
      id: 'two_wheeler',
      name: 'Scooter/Motorcycle',
      unit: 'km',
      factor: TWO_WHEELER_INDIA_KG_PER_KM,
      requiresMultiplier: true,
    },
    {
      id: 'auto_rickshaw',
      name: 'Auto Rickshaw',
      unit: 'km',
      factor: AUTO_RICKSHAW_KG_PER_KM,
      requiresMultiplier: true,
    },
    {
      id: 'public_bus',
      name: 'Public Bus Ride',
      unit: 'km',
      factor: BUS_INDIA_KG_PER_KM,
      requiresMultiplier: true,
    },
    {
      id: 'metro_train',
      name: 'Metro / Local Train',
      unit: 'km',
      factor: METRO_INDIA_KG_PER_KM,
      requiresMultiplier: true,
    },
  ],
  food: [
    {
      id: 'meal_beef',
      name: 'Red Meat (Beef/Mutton) Meal',
      unit: 'meals',
      factor: MEAL_BEEF_KG,
      requiresMultiplier: true,
    },
    {
      id: 'meal_chicken',
      name: 'Poultry/Fish Meal',
      unit: 'meals',
      factor: MEAL_CHICKEN_KG,
      requiresMultiplier: true,
    },
    {
      id: 'meal_veg',
      name: 'Vegetarian Meal',
      unit: 'meals',
      factor: MEAL_VEG_KG,
      requiresMultiplier: true,
    },
    {
      id: 'meal_vegan',
      name: 'Vegan Meal',
      unit: 'meals',
      factor: MEAL_VEGAN_KG,
      requiresMultiplier: true,
    },
  ],
  energy: [
    {
      id: 'energy_ac',
      name: 'Air Conditioning',
      unit: 'hours',
      factor: AC_KG_PER_HOUR,
      requiresMultiplier: true,
    },
    {
      id: 'energy_heater',
      name: 'Space Heater',
      unit: 'hours',
      factor: HEATER_KG_PER_HOUR,
      requiresMultiplier: true,
    },
    {
      id: 'energy_appliances',
      name: 'Computer / TV',
      unit: 'hours',
      factor: APPLIANCES_KG_PER_HOUR,
      requiresMultiplier: true,
    },
    {
      id: 'energy_lights',
      name: 'Lighting & Fan (Average room)',
      unit: 'hours',
      factor: LIGHTS_KG_PER_HOUR,
      requiresMultiplier: true,
    },
  ],
  shopping: [
    {
      id: 'shop_polyester',
      name: 'Polyester/Synthetic Clothes',
      unit: 'items',
      factor: SHOP_POLYESTER_KG,
      requiresMultiplier: true,
    },
    {
      id: 'shop_cotton',
      name: 'Cotton Clothing',
      unit: 'items',
      factor: SHOP_COTTON_KG,
      requiresMultiplier: true,
    },
    {
      id: 'shop_electronics',
      name: 'Smartphone / Gadget',
      unit: 'items',
      factor: SHOP_ELECTRONICS_KG,
      requiresMultiplier: true,
    },
    {
      id: 'shop_plastic',
      name: 'Plastic/Household goods',
      unit: 'items',
      factor: SHOP_PLASTIC_KG,
      requiresMultiplier: true,
    },
  ],
  other: [
    {
      id: 'other_custom',
      name: 'Custom footprint entry',
      unit: 'kg CO₂',
      factor: CUSTOM_KG,
      requiresMultiplier: false,
    },
  ],
};
