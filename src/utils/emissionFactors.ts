/** Emission factors in kg CO₂e per unit, each citing its primary source. These are the only place raw numbers appear — all other files import named constants from here. */
// ═══ TRANSPORT ═══
// Source: IPCC 2023 Working Group III Table 10.1
export const FLIGHT_SHORT_HAUL_KG_PER_KM = 0.089;

// Source: UK DEFRA 2023 Conversion Factors
export const CAR_PETROL_KG_PER_KM = 0.171;
export const CAR_DIESEL_KG_PER_KM = 0.163;
export const CAR_EV_KG_PER_KM = 0.053;
export const TWO_WHEELER_INDIA_KG_PER_KM = 0.08;

// Source: Indian Railways GHG Inventory 2022
export const TRAIN_INDIA_KG_PER_KM = 0.012;
export const METRO_INDIA_KG_PER_KM = 0.031;
export const BUS_INDIA_KG_PER_KM = 0.089;
export const AUTO_RICKSHAW_KG_PER_KM = 0.092;

// ═══ FOOD ═══
// Source: Our World in Data - Poore & Nemecek 2018
export const BEEF_KG_CO2_PER_KG = 60.0;
export const CHICKEN_KG_CO2_PER_KG = 6.9;
export const VEGETABLES_KG_CO2_PER_KG = 2.0;
export const RICE_KG_CO2_PER_KG = 4.0;
export const DAIRY_KG_CO2_PER_KG = 3.2;
export const EGGS_KG_CO2_PER_KG = 4.5;
export const FISH_KG_CO2_PER_KG = 5.1;

// Portion factors for meals in Indian households (in kg CO₂ per meal)
export const MEAL_BEEF_KG = 7.2; // 120g red meat portion
export const MEAL_CHICKEN_KG = 1.8; // 260g poultry/fish portion
export const MEAL_VEG_KG = 0.6; // 300g vegetarian portion
export const MEAL_VEGAN_KG = 0.4; // 100g rice/grain portion

// ═══ ENERGY ═══
// Source: CEA India Grid Emission Factor 2023
export const INDIA_GRID_KG_PER_KWH = 0.716;
export const AC_KWH_PER_HOUR = 1.5;
export const FRIDGE_KWH_PER_DAY = 1.2;
export const WASHING_MACHINE_KWH_PER_CYCLE = 0.5;
export const LED_BULB_KWH_PER_HOUR = 0.01;

// Operating factor constants derived using CEA Grid emission index
export const AC_KG_PER_HOUR = 0.8;
export const HEATER_KG_PER_HOUR = 0.6;
export const APPLIANCES_KG_PER_HOUR = 0.05;
export const LIGHTS_KG_PER_HOUR = 0.08;

// ═══ DIGITAL ═══
// Source: IEA 2022 Data Centres and Data Transmission Networks Report
export const VIDEO_STREAM_KG_PER_HOUR = 0.036;
export const EMAIL_WITH_ATTACHMENT_GRAMS = 50;
export const WEB_SEARCH_GRAMS = 0.2;
export const VIDEO_CALL_KG_PER_HOUR = 0.157;

// ═══ SHOPPING ═══
// Source: Our World in Data / DEFRA lifecycle estimates
export const SHOP_POLYESTER_KG = 9.0;
export const SHOP_COTTON_KG = 2.5;
export const SHOP_ELECTRONICS_KG = 25.0;
export const SHOP_PLASTIC_KG = 1.5;

// Custom baseline
export const CUSTOM_KG = 1.0;

// ═══ OFFSETS ═══
// Source: EPA Greenhouse Gas Equivalencies Calculator
export const CO2_PER_TREE_KG_PER_YEAR = 22;

// ═══ INDIA AVERAGES ═══
// Source: MoEFCC India GHG Inventory 2023
export const INDIA_URBAN_ANNUAL_TONS = 1.8;
export const INDIA_URBAN_MONTHLY_KG = 150;
export const INDIA_URBAN_DAILY_KG = 4.8;
export const GLOBAL_AVERAGE_ANNUAL_TONS = 4.0;
export const US_AVERAGE_ANNUAL_TONS = 15.0;

export const getCitedSource = (factorName: string): string => {
  const sources: Record<string, string> = {
    flight: 'IPCC 2023 Working Group III',
    car: 'UK DEFRA 2023 Conversion Factors',
    train: 'Indian Railways GHG Inventory 2022',
    metro: 'Indian Railways GHG Inventory 2022',
    beef: 'Poore & Nemecek 2018 via OurWorldInData',
    chicken: 'Poore & Nemecek 2018 via OurWorldInData',
    energy: 'CEA India Grid Emission Factor 2023',
    digital: 'IEA 2022 Data Centres Report',
    average: 'MoEFCC India GHG Inventory 2023',
    shopping: 'UK DEFRA 2023 lifecycle estimates',
  };
  return sources[factorName] ?? 'IPCC 2023';
};
