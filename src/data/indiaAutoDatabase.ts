export interface VehicleDatabaseEntry {
  id: string;
  category: string; // 'Car' | 'Bike' | 'Scooter' | 'Truck' | 'Bus' | 'Pickup' | 'Van' | 'Auto Rickshaw' | 'Tractor';
  brand: string;
  model: string;
  variants: string[];
  years: string;
  engine: string;
  engineCode: string;
  fuel: string;
  transmission: string;
  popularOemParts: {
    partName: string;
    oemPartNumber: string;
    category: string;
  }[];
}

export interface PopularSearchItem {
  query: string;
  type: 'part' | 'vehicle' | 'oem' | 'brand';
  count: string;
  category?: string;
}

export const INDIA_VEHICLE_DATABASE: VehicleDatabaseEntry[] = [
  // ==================== CARS ====================
  {
    id: 'car-maruti-swift',
    category: 'Car',
    brand: 'Maruti Suzuki',
    model: 'Swift',
    variants: ['LXi', 'VXi', 'ZXi', 'ZXi+', 'DDiS VDi', 'ZDi+'],
    years: '2005 - 2026',
    engine: '1.2L DualJet K12N / 1.3L DDiS Diesel',
    engineCode: 'K12N / D13A',
    fuel: 'Petrol / Diesel / CNG',
    transmission: '5-Speed Manual / 5-Speed AMT',
    popularOemParts: [
      { partName: 'Front Brake Pad Set (Genuine)', oemPartNumber: '55810-M74L00', category: 'Brakes & Suspension' },
      { partName: 'Clutch Plate & Pressure Plate Kit', oemPartNumber: '22100-M74L00', category: 'Engine & Transmission' },
      { partName: 'Projector Headlight Unit Right', oemPartNumber: '35100-M74P10', category: 'Lights, Mirrors & Glass' },
      { partName: 'Oil Filter Element', oemPartNumber: '16510-M68P00', category: 'Accessories & Fluids' },
      { partName: 'Front Shock Absorber Strut Left', oemPartNumber: '41602-M74L00', category: 'Brakes & Suspension' },
    ]
  },
  {
    id: 'car-maruti-baleno',
    category: 'Car',
    brand: 'Maruti Suzuki',
    model: 'Baleno',
    variants: ['Sigma', 'Delta', 'Zeta', 'Alpha'],
    years: '2015 - 2026',
    engine: '1.2L K12M DualJet',
    engineCode: 'K12M',
    fuel: 'Petrol / CNG',
    transmission: '5-Speed Manual / AMT',
    popularOemParts: [
      { partName: 'LED Tail Lamp Assembly Left', oemPartNumber: '35670-M68P00', category: 'Lights, Mirrors & Glass' },
      { partName: 'Front Bumper Grille with Chrome', oemPartNumber: '71711-M68P00', category: 'Body Parts & Frame' },
      { partName: 'Steering Rack Assembly', oemPartNumber: '48510-M68P00', category: 'Brakes & Suspension' }
    ]
  },
  {
    id: 'car-maruti-brezza',
    category: 'Car',
    brand: 'Maruti Suzuki',
    model: 'Brezza',
    variants: ['LXi', 'VXi', 'ZXi', 'ZXi+ Dual Tone'],
    years: '2016 - 2026',
    engine: '1.5L K15C Smart Hybrid',
    engineCode: 'K15C',
    fuel: 'Petrol / CNG',
    transmission: '5-Speed Manual / 6-Speed Automatic',
    popularOemParts: [
      { partName: 'Radiator Assembly with Fan', oemPartNumber: '17700-M79M00', category: 'Exhaust, Fuel & Cooling' },
      { partName: 'Front Alloy Wheel 16 Inch', oemPartNumber: '43210-M79M00', category: 'Wheels, Tyres & Alloys' },
      { partName: 'Alternator 12V 90A', oemPartNumber: '31400-M79M00', category: 'Electrical & Battery' }
    ]
  },
  {
    id: 'car-hyundai-creta',
    category: 'Car',
    brand: 'Hyundai',
    model: 'Creta',
    variants: ['EX', 'S', 'SX', 'SX(O)', 'Knight Edition'],
    years: '2015 - 2026',
    engine: '1.5L MPi Petrol / 1.5L U2 CRDi Diesel / 1.5L Turbo GDi',
    engineCode: 'D4FA / G4FG / G4FS',
    fuel: 'Petrol / Diesel',
    transmission: '6-Speed Manual / IVT / 7-Speed DCT / 6-Speed AT',
    popularOemParts: [
      { partName: 'Trio-Beam LED Headlight Unit (Pair)', oemPartNumber: '92101-C9000', category: 'Lights, Mirrors & Glass' },
      { partName: 'Front Brake Disc Rotor', oemPartNumber: '51712-C9000', category: 'Brakes & Suspension' },
      { partName: 'Fuel Injector Nozzle Diesel', oemPartNumber: '35310-2U000', category: 'Exhaust, Fuel & Cooling' },
      { partName: 'Turbocharger Unit 1.5 CRDi', oemPartNumber: '28231-2U000', category: 'Engine & Transmission' }
    ]
  },
  {
    id: 'car-hyundai-venue',
    category: 'Car',
    brand: 'Hyundai',
    model: 'Venue',
    variants: ['E', 'S', 'S+', 'SX', 'SX(O) N-Line'],
    years: '2019 - 2026',
    engine: '1.2L Kappa / 1.0L Turbo GDi / 1.5L Diesel',
    engineCode: 'Kappa 1.2 / G3LC',
    fuel: 'Petrol / Diesel',
    transmission: '5-Speed MT / 6-Speed iMT / 7-Speed DCT',
    popularOemParts: [
      { partName: 'Connecting Rod Set 1.0 Turbo', oemPartNumber: '23510-04000', category: 'Engine & Transmission' },
      { partName: 'Power Steering Motor ECU', oemPartNumber: '56310-Q5000', category: 'Electrical & Battery' }
    ]
  },
  {
    id: 'car-tata-nexon',
    category: 'Car',
    brand: 'Tata',
    model: 'Nexon',
    variants: ['Smart', 'Pure', 'Creative', 'Fearless', 'EV Long Range'],
    years: '2017 - 2026',
    engine: '1.2L Revotron Turbo Petrol / 1.5L Revotorq Diesel / EV Motor',
    engineCode: 'Revotron 1.2T / Revotorq 1.5',
    fuel: 'Petrol / Diesel / Electric',
    transmission: '6-Speed Manual / 6-Speed AMT / 7-Speed DCA',
    popularOemParts: [
      { partName: 'Turbocharger Actuator Assembly', oemPartNumber: '28200-NEX-01', category: 'Engine & Transmission' },
      { partName: 'Front Bumper Fascia with LED DRLs', oemPartNumber: '5401-NEX-BMP', category: 'Body Parts & Frame' },
      { partName: 'Front Suspension Arm Assembly', oemPartNumber: '5401-NEX-ARM', category: 'Brakes & Suspension' },
      { partName: 'AC Compressor Unit', oemPartNumber: '5401-NEX-ACC', category: 'Interior, AC & Comfort' }
    ]
  },
  {
    id: 'car-tata-harrier',
    category: 'Car',
    brand: 'Tata',
    model: 'Harrier',
    variants: ['Pure', 'Adventure', 'Fearless', 'Dark Edition'],
    years: '2019 - 2026',
    engine: '2.0L Kryotec Diesel',
    engineCode: 'Kryotec 170',
    fuel: 'Diesel',
    transmission: '6-Speed Manual / 6-Speed Automatic',
    popularOemParts: [
      { partName: 'EGR Valve & Cooler Assembly', oemPartNumber: '5412-HAR-EGR', category: 'Exhaust, Fuel & Cooling' },
      { partName: 'Rear LED Lightbar Strip', oemPartNumber: '5412-HAR-LGT', category: 'Lights, Mirrors & Glass' }
    ]
  },
  {
    id: 'car-mahindra-thar',
    category: 'Car',
    brand: 'Mahindra',
    model: 'Thar',
    variants: ['AX Opt', 'LX Hard Top', 'RWD', 'Thar Roxx 5-Door'],
    years: '2020 - 2026',
    engine: '2.0L mStallion Turbo Petrol / 2.2L mHawk Diesel',
    engineCode: 'mStallion150 / mHawk130',
    fuel: 'Petrol / Diesel',
    transmission: '6-Speed Manual / 6-Speed Automatic 4x4',
    popularOemParts: [
      { partName: 'Offroad Hard Top Shell Composite', oemPartNumber: 'MAH-THR-HTP', category: 'Body Parts & Frame' },
      { partName: '4x4 Transfer Case Servo Motor', oemPartNumber: 'MAH-THR-TRF', category: 'Engine & Transmission' },
      { partName: 'Alloy Wheel 18 Inch 5-Spoke', oemPartNumber: 'MAH-THR-WHL', category: 'Wheels, Tyres & Alloys' },
      { partName: 'Heavy Duty Front Bumper Guard', oemPartNumber: 'MAH-THR-BMP', category: 'Body Parts & Frame' }
    ]
  },
  {
    id: 'car-mahindra-scorpio',
    category: 'Car',
    brand: 'Mahindra',
    model: 'Scorpio-N / Classic',
    variants: ['Z2', 'Z4', 'Z8', 'Z8L 4XPLOR', 'Classic S11'],
    years: '2002 - 2026',
    engine: '2.2L mHawk CRDe Diesel / 2.0L mStallion',
    engineCode: 'mHawk220',
    fuel: 'Diesel / Petrol',
    transmission: '6-Speed Manual / 6-Speed AT',
    popularOemParts: [
      { partName: 'High Pressure Fuel Pump (Bosch)', oemPartNumber: '0445010206', category: 'Exhaust, Fuel & Cooling' },
      { partName: 'Clutch Slave Cylinder Unit', oemPartNumber: 'MAH-SCP-CSC', category: 'Engine & Transmission' },
      { partName: 'Power Window Master Switch Box', oemPartNumber: 'MAH-SCP-PWS', category: 'Electrical & Battery' }
    ]
  },
  {
    id: 'car-kia-seltos',
    category: 'Car',
    brand: 'Kia',
    model: 'Seltos',
    variants: ['HTE', 'HTK+', 'HTX', 'GTX+', 'X-Line'],
    years: '2019 - 2026',
    engine: '1.5L Smartstream Petrol / 1.5L CRDi / 1.5L Turbo',
    engineCode: 'G1.5 / D1.5',
    fuel: 'Petrol / Diesel',
    transmission: '6MT / 6iMT / IVT / 6AT / 7DCT',
    popularOemParts: [
      { partName: 'Crown LED DRL Headlight Unit Right', oemPartNumber: '92102-Q5100', category: 'Lights, Mirrors & Glass' },
      { partName: 'Bose Center Speaker Assembly', oemPartNumber: '96310-Q5000', category: 'Electrical & Battery' }
    ]
  },
  {
    id: 'car-toyota-fortuner',
    category: 'Car',
    brand: 'Toyota',
    model: 'Fortuner',
    variants: ['4x2 MT', '4x4 AT', 'Legender', 'GR-Sport'],
    years: '2009 - 2026',
    engine: '2.8L 1GD-FTV Turbo Diesel / 2.7L 2TR-FE Petrol',
    engineCode: '1GD-FTV / 2TR-FE',
    fuel: 'Diesel / Petrol',
    transmission: '6-Speed Manual / 6-Speed Automatic 4WD',
    popularOemParts: [
      { partName: '1GD Turbocharger Assembly Genuine', oemPartNumber: '17201-11080', category: 'Engine & Transmission' },
      { partName: 'Front Brake Disc Rotor Pair', oemPartNumber: '43512-0K150', category: 'Brakes & Suspension' },
      { partName: 'Legender Body Kit Bumper Conversions', oemPartNumber: 'TOY-FTN-LEG', category: 'Body Parts & Frame' }
    ]
  },
  {
    id: 'car-bmw-3series',
    category: 'Car',
    brand: 'BMW',
    model: '3 Series / 3 Gran Limousine',
    variants: ['320d Luxury Line', '330i M Sport', '330Li'],
    years: '2012 - 2026',
    engine: '2.0L B48 Turbo Petrol / 2.0L B47 Diesel',
    engineCode: 'B48B20 / B47D20',
    fuel: 'Petrol / Diesel',
    transmission: '8-Speed Steptronic Sport Automatic',
    popularOemParts: [
      { partName: 'Laser Headlight Module Left', oemPartNumber: '63118496155', category: 'Lights, Mirrors & Glass' },
      { partName: 'Front Suspension Control Arm Kit', oemPartNumber: '31126852991', category: 'Brakes & Suspension' },
      { partName: 'Engine Ignition Coil Box Bosch', oemPartNumber: '12138647689', category: 'Electrical & Battery' }
    ]
  },
  {
    id: 'car-mercedes-cclass',
    category: 'Car',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    variants: ['C 200', 'C 220d', 'C 300d AMG Line'],
    years: '2014 - 2026',
    engine: '2.0L OM654 Turbo Diesel / 1.5L M254 Mild-Hybrid',
    engineCode: 'OM654 / M254',
    fuel: 'Diesel / Petrol Hybrid',
    transmission: '9G-TRONIC Automatic',
    popularOemParts: [
      { partName: 'Air Suspension Strut Front', oemPartNumber: 'A2053200125', category: 'Brakes & Suspension' },
      { partName: 'Digital Light Headlamp Unit', oemPartNumber: 'A2069060100', category: 'Lights, Mirrors & Glass' }
    ]
  },

  // ==================== BIKES ====================
  {
    id: 'bike-hero-splendor',
    category: 'Bike',
    brand: 'Hero',
    model: 'Splendor Plus / XTEC',
    variants: ['Kick Start', 'Self Start i3S', 'XTEC i3S Bluetooth'],
    years: '1994 - 2026',
    engine: '97.2cc Air-Cooled OHC Engine',
    engineCode: 'HA08E',
    fuel: 'Petrol',
    transmission: '4-Speed Constant Mesh Manual',
    popularOemParts: [
      { partName: 'Cylinder Block & Piston Kit Genuine', oemPartNumber: '12100-KCC-900', category: 'Engine & Transmission' },
      { partName: 'Carburetor Assembly / FI Injector', oemPartNumber: '16100-KCC-941', category: 'Exhaust, Fuel & Cooling' },
      { partName: 'Clutch Assembly with Friction Plates', oemPartNumber: '22100-KCC-900', category: 'Engine & Transmission' },
      { partName: 'Chain Sprocket Kit 428 pitch', oemPartNumber: '40530-KCC-900', category: 'Engine & Transmission' }
    ]
  },
  {
    id: 'bike-re-classic350',
    category: 'Bike',
    brand: 'Royal Enfield',
    model: 'Classic 350 / Bullet 350',
    variants: ['Single Channel ABS', 'Dual Channel ABS', 'Dark Series', 'Signals'],
    years: '2009 - 2026',
    engine: '349cc Air-Oil Cooled J-Series Engine',
    engineCode: 'J1-349',
    fuel: 'Petrol',
    transmission: '5-Speed Manual',
    popularOemParts: [
      { partName: 'Original Chrome Silencer Exhaust Pipe', oemPartNumber: 'RAM-EXH-350', category: 'Exhaust, Fuel & Cooling' },
      { partName: 'Front Hydraulic Disc Brake Caliper Unit', oemPartNumber: 'RAM-BRK-FNT', category: 'Brakes & Suspension' },
      { partName: 'Classic Teardrop Fuel Tank Chrome', oemPartNumber: 'RAM-TNK-CHR', category: 'Body Parts & Frame' },
      { partName: 'Self Starter Motor Unit', oemPartNumber: 'RAM-STR-MTR', category: 'Electrical & Battery' }
    ]
  },
  {
    id: 'bike-tvs-apache',
    category: 'Bike',
    brand: 'TVS',
    model: 'Apache RTR 160 / 200 4V',
    variants: ['RTR 160 2V', 'RTR 160 4V Special Edition', 'RTR 200 4V Ride Modes'],
    years: '2007 - 2026',
    engine: '159.7cc / 197.75cc Oil-Cooled 4V',
    engineCode: 'RTR160-4V',
    fuel: 'Petrol (Fi)',
    transmission: '5-Speed / 5-Speed with Slipper Clutch',
    popularOemParts: [
      { partName: 'Racing Throttle Body & Injector Unit', oemPartNumber: 'TVS-RTR-INJ', category: 'Exhaust, Fuel & Cooling' },
      { partName: 'Digital Instrument Speedometer Console', oemPartNumber: 'TVS-RTR-SPD', category: 'Electrical & Battery' },
      { partName: 'Front Fork Telescopic Inner Tubes', oemPartNumber: 'TVS-RTR-FRK', category: 'Brakes & Suspension' }
    ]
  },
  {
    id: 'bike-yamaha-r15',
    category: 'Bike',
    brand: 'Yamaha',
    model: 'R15 V4 / MT-15 V2',
    variants: ['Metallic Red', 'Dark Knight', 'Racing Blue', 'M World GP Edition'],
    years: '2008 - 2026',
    engine: '155cc Liquid-Cooled SOHC VVA Engine',
    engineCode: 'G3J4E',
    fuel: 'Petrol',
    transmission: '6-Speed Manual with Quickshifter',
    popularOemParts: [
      { partName: 'Upside Down (USD) Front Fork Set Golden', oemPartNumber: 'YAM-USD-FRK', category: 'Brakes & Suspension' },
      { partName: 'Full Fairing Body Kit Panel Set', oemPartNumber: 'YAM-R15-FRG', category: 'Body Parts & Frame' },
      { partName: 'Radiator Cooling Fan Assembly', oemPartNumber: 'YAM-R15-RAD', category: 'Exhaust, Fuel & Cooling' }
    ]
  },
  {
    id: 'bike-ktm-duke390',
    category: 'Bike',
    brand: 'KTM',
    model: 'Duke 390 / RC 390',
    variants: ['BS6 Phase 2', 'Gen-3 Duke 390'],
    years: '2013 - 2026',
    engine: '398.7cc Single Cylinder Liquid-Cooled',
    engineCode: 'LC4c',
    fuel: 'Petrol',
    transmission: '6-Speed with Quickshifter+',
    popularOemParts: [
      { partName: 'TFT Display Instrument Dashboard Screen', oemPartNumber: 'KTM-390-TFT', category: 'Electrical & Battery' },
      { partName: 'WP Apex Adjustable Rear Monoshock', oemPartNumber: 'KTM-WP-MONO', category: 'Brakes & Suspension' },
      { partName: 'ByBre Radial Brake Caliper Front', oemPartNumber: 'KTM-BYB-CAL', category: 'Brakes & Suspension' }
    ]
  },

  // ==================== SCOOTERS ====================
  {
    id: 'scooter-honda-activa',
    category: 'Scooter',
    brand: 'Honda',
    model: 'Activa 6G / 125',
    variants: ['Standard', 'Deluxe', 'H-Smart (Keyless)', '125 Disc'],
    years: '2000 - 2026',
    engine: '109.51cc / 124cc eSP Fi Engine',
    engineCode: 'JF50E',
    fuel: 'Petrol',
    transmission: 'V-Matic CVT Automatic',
    popularOemParts: [
      { partName: 'CVT Belt Drive Bando OEM', oemPartNumber: '23100-K0W-N01', category: 'Engine & Transmission' },
      { partName: 'Variator Clutch Roller Set (6 Pcs)', oemPartNumber: '22123-KWP-900', category: 'Engine & Transmission' },
      { partName: 'Front Metal Body Panel / Apron', oemPartNumber: '64300-K0W-N00', category: 'Body Parts & Frame' },
      { partName: 'LED Headlight Mask Unit', oemPartNumber: '33100-K0W-N01', category: 'Lights, Mirrors & Glass' }
    ]
  },
  {
    id: 'scooter-tvs-ntorq',
    category: 'Scooter',
    brand: 'TVS',
    model: 'Ntorq 125',
    variants: ['Disc', 'Race Edition', 'Super Squad (Marvel)', 'XT'],
    years: '2018 - 2026',
    engine: '124.8cc 3-Valve CVTi-REFi Engine',
    engineCode: 'TVS-NT125',
    fuel: 'Petrol',
    transmission: 'Automatic CVT',
    popularOemParts: [
      { partName: 'Sport Exhaust Muffler Pipe Assembly', oemPartNumber: 'TVS-NTQ-EXH', category: 'Exhaust, Fuel & Cooling' },
      { partName: 'SmartXonnect Bluetooth Speedo Meter', oemPartNumber: 'TVS-NTQ-MTR', category: 'Electrical & Battery' }
    ]
  },
  {
    id: 'scooter-ather-450x',
    category: 'Scooter',
    brand: 'Ather',
    model: '450X / Apex / Rizta',
    variants: ['2.9 kWh', '3.7 kWh Pro Pack', '450S'],
    years: '2018 - 2026',
    engine: 'PMSM Permanent Magnet Synchronous Motor',
    engineCode: 'Ather-PMSM-6.4kW',
    fuel: 'Electric',
    transmission: 'Belt Drive Automatic Single Speed',
    popularOemParts: [
      { partName: 'High Performance Belt Drive Kit Gates', oemPartNumber: 'ATH-BLT-450', category: 'Engine & Transmission' },
      { partName: 'Touchscreen LCD Dashboard Display', oemPartNumber: 'ATH-SCR-7IN', category: 'Electrical & Battery' },
      { partName: 'Fast Portable Charger 700W', oemPartNumber: 'ATH-CHG-700', category: 'Electrical & Battery' }
    ]
  },

  // ==================== TRUCKS ====================
  {
    id: 'truck-tata-prima',
    category: 'Truck',
    brand: 'Tata Motors',
    model: 'Prima / Signa / 407 Gold',
    variants: ['Prima 3525.K Tipper', 'Signa 2823.K', '407 Gold SFC'],
    years: '2010 - 2026',
    engine: '3.8L SGI / 6.7L Cummins ISBe Turbo Diesel',
    engineCode: 'Cummins ISBe 6.7 / 4SP CR',
    fuel: 'Diesel / CNG',
    transmission: 'G950 6-Speed / 9-Speed Heavy Duty Manual',
    popularOemParts: [
      { partName: 'Cummins ISBe Turbocharger Unit Holset', oemPartNumber: 'HOL-4032120', category: 'Engine & Transmission' },
      { partName: 'Heavy Duty Rear Axle Crown Wheel Pinion', oemPartNumber: 'TATA-AXL-3525', category: 'Engine & Transmission' },
      { partName: 'Air Brake Master Valve Unit WABCO', oemPartNumber: 'WAB-4613150', category: 'Brakes & Suspension' },
      { partName: 'Diesel Exhaust Fluid DEF SCR Pump', oemPartNumber: 'TATA-DEF-PMP', category: 'Exhaust, Fuel & Cooling' }
    ]
  },
  {
    id: 'truck-ashok-leyland',
    category: 'Truck',
    brand: 'Ashok Leyland',
    model: 'AVTR / Ecomet / Boss',
    variants: ['AVTR 2820 Haulage', 'Ecomet STAR 1115', 'Boss 1215'],
    years: '2008 - 2026',
    engine: 'iGen6 H-Series 6-Cylinder Diesel Engine',
    engineCode: 'H-Series 4Cyl / 6Cyl iGen6',
    fuel: 'Diesel',
    transmission: 'Synchromesh 6-Speed / 9-Speed Manual',
    popularOemParts: [
      { partName: 'iGen6 Engine ECU Electronic Control Unit', oemPartNumber: 'AL-ECU-GEN6', category: 'Electrical & Battery' },
      { partName: 'Heavy Duty Leaf Spring Main Assembly', oemPartNumber: 'AL-LEAF-REAR', category: 'Brakes & Suspension' },
      { partName: 'Diesel Fuel Injection Pump FIP Bosch', oemPartNumber: '0402736030', category: 'Exhaust, Fuel & Cooling' }
    ]
  },
  {
    id: 'truck-bharatbenz',
    category: 'Truck',
    brand: 'BharatBenz',
    model: '1917R / 2823C Tipper / 3528C',
    variants: ['Medium Duty Haulage', 'Heavy Duty Mining Tipper'],
    years: '2012 - 2026',
    engine: 'OM926 7.2L Turbo Diesel / 4D34i',
    engineCode: 'OM926 / 4D34i',
    fuel: 'Diesel',
    transmission: 'G85 6-Speed / G131 9-Speed Manual',
    popularOemParts: [
      { partName: 'Clutch Master Cylinder WABCO', oemPartNumber: 'BB-CMC-926', category: 'Engine & Transmission' },
      { partName: 'Front Axle Hub Assembly with Bearings', oemPartNumber: 'BB-HUB-FNT', category: 'Brakes & Suspension' }
    ]
  },

  // ==================== BUSES ====================
  {
    id: 'bus-ashok-viking',
    category: 'Bus',
    brand: 'Ashok Leyland',
    model: 'Viking / Oyster / Lynx',
    variants: ['Viking 225 Passenger Chassis', 'Oyster School Bus', 'Lynx Smart Bus'],
    years: '2002 - 2026',
    engine: 'H-Series 6 Cylinder Turbocharged Intercooled',
    engineCode: 'H6E4N225',
    fuel: 'Diesel / CNG',
    transmission: '5-Speed Overdrive Synchromesh',
    popularOemParts: [
      { partName: 'Air Suspension Bellow Air Bag Unit WABCO', oemPartNumber: 'AL-AIR-BLW', category: 'Brakes & Suspension' },
      { partName: 'Power Steering Pump Unit Vickers', oemPartNumber: 'AL-STR-PMP', category: 'Brakes & Suspension' },
      { partName: 'Pneumatic Passenger Door Actuator', oemPartNumber: 'AL-DOR-ACT', category: 'Body Parts & Frame' }
    ]
  },
  {
    id: 'bus-volvo-9400',
    category: 'Bus',
    brand: 'Volvo',
    model: '9400 / B11R / B8R',
    variants: ['9400 Multi-Axle Intercity', 'B11R 15m Sleeper Coach'],
    years: '2005 - 2026',
    engine: 'Volvo D11K 11-Cylinder 430 HP Diesel',
    engineCode: 'D11K430 / D8K',
    fuel: 'Diesel',
    transmission: 'Volvo I-Shift 12-Speed Automated Manual',
    popularOemParts: [
      { partName: 'I-Shift Transmission Clutch Actuator Unit', oemPartNumber: 'VOL-22307238', category: 'Engine & Transmission' },
      { partName: 'Retarder Hydraulic Auxiliary Brake', oemPartNumber: 'VOL-21430982', category: 'Brakes & Suspension' }
    ]
  },

  // ==================== PICKUPS ====================
  {
    id: 'pickup-mahindra-bolero',
    category: 'Pickup',
    brand: 'Mahindra',
    model: 'Bolero Maxi Truck / Pickup ExtraLong',
    variants: ['1.3T ExtraLong', '1.7T Heavy Duty', 'Bolero Camper 4x4'],
    years: '2005 - 2026',
    engine: '2.5L m2DiCR Turbo Diesel Engine',
    engineCode: 'm2DiCR',
    fuel: 'Diesel / CNG',
    transmission: '5-Speed Manual',
    popularOemParts: [
      { partName: 'm2DiCR Diesel Injector Nozzle Assembly', oemPartNumber: '0445110321', category: 'Exhaust, Fuel & Cooling' },
      { partName: 'Heavy Duty Rear Axle Differential Unit', oemPartNumber: 'MAH-PU-DIFF', category: 'Engine & Transmission' },
      { partName: 'Front Metal Bumper Guard Heavy', oemPartNumber: 'MAH-PU-BMP', category: 'Body Parts & Frame' },
      { partName: 'Clutch Pressure Plate Kit 230mm', oemPartNumber: 'MAH-PU-CLT', category: 'Engine & Transmission' }
    ]
  },
  {
    id: 'pickup-isuzu-dmax',
    category: 'Pickup',
    brand: 'Isuzu',
    model: 'D-Max / V-Cross / S-CAB',
    variants: ['S-CAB Commercial', 'V-Cross Z 4x4 MT', 'V-Cross Z-Prestige 4x4 AT'],
    years: '2016 - 2026',
    engine: '1.9L Ddi VGS Turbo Diesel / 2.5L 4JA1',
    engineCode: 'RZ4E-TC / 4JA1',
    fuel: 'Diesel',
    transmission: '6-Speed Manual / 6-Speed Automatic 4WD',
    popularOemParts: [
      { partName: 'Variable Geometry Turbo VGS Actuator', oemPartNumber: 'ISZ-RZ4E-TRB', category: 'Engine & Transmission' },
      { partName: 'Heavy Duty Cargo Bed Liner Composite', oemPartNumber: 'ISZ-BED-LNR', category: 'Body Parts & Frame' }
    ]
  },

  // ==================== VANS ====================
  {
    id: 'van-maruti-eeco',
    category: 'Van',
    brand: 'Maruti Suzuki',
    model: 'Eeco / Omni',
    variants: ['5-Seater Standard', '7-Seater Flat Floor', 'Eeco Cargo Van', 'Ambulance'],
    years: '2010 - 2026',
    engine: '1.2L Advanced K-Series DualJet Engine',
    engineCode: 'K12N Van',
    fuel: 'Petrol / CNG',
    transmission: '5-Speed Manual',
    popularOemParts: [
      { partName: 'Sliding Door Roller & Guide Mechanism', oemPartNumber: '83100-M78L00', category: 'Body Parts & Frame' },
      { partName: 'Propeller Shaft Rear Driveshaft Universal Joint', oemPartNumber: '27100-M78L00', category: 'Engine & Transmission' },
      { partName: 'Rear Axle Differential Bearing Set', oemPartNumber: '27400-M78L00', category: 'Engine & Transmission' }
    ]
  },
  {
    id: 'van-force-traveller',
    category: 'Van',
    brand: 'Force Motors',
    model: 'Traveller / Urbania',
    variants: ['3050 Delivery Van', '3350 12-Seater', '4020 20-Seater', 'Urbania Short Wheelbase'],
    years: '1987 - 2026',
    engine: '2.6L FM 2.6 CR ED Diesel Engine (Mercedes Licensed)',
    engineCode: 'FM 2.6 CR',
    fuel: 'Diesel',
    transmission: 'G28 5-Speed Manual',
    popularOemParts: [
      { partName: 'FM2.6 High Pressure Common Rail Fuel Pump', oemPartNumber: 'FRC-TRV-CRP', category: 'Exhaust, Fuel & Cooling' },
      { partName: 'Front Independent Suspension Control Arm', oemPartNumber: 'FRC-TRV-ARM', category: 'Brakes & Suspension' }
    ]
  },

  // ==================== AUTO RICKSHAWS ====================
  {
    id: 'auto-bajaj-re',
    category: 'Auto Rickshaw',
    brand: 'Bajaj',
    model: 'RE Compact / Maxima Z',
    variants: ['RE Compact 4S Petrol', 'RE CNG 236cc', 'Maxima Z Diesel 470cc'],
    years: '1977 - 2026',
    engine: '236cc DTS-i Air Cooled / Kubota 470cc Diesel',
    engineCode: 'DTSi 236 / Kubota Z482',
    fuel: 'CNG / Petrol / Diesel / LPG',
    transmission: '4-Speed Hand-Shifted Manual',
    popularOemParts: [
      { partName: 'DTS-i Cylinder Block & Piston Kit', oemPartNumber: 'BAJ-RE-CYL', category: 'Engine & Transmission' },
      { partName: 'Reverse Gear Box Assembly Complete', oemPartNumber: 'BAJ-RE-REV', category: 'Engine & Transmission' },
      { partName: 'Drive Shaft Axle Rubber Boot & U-Joint', oemPartNumber: 'BAJ-RE-AXL', category: 'Engine & Transmission' },
      { partName: 'CNG Regulator Pressure Valve Kit', oemPartNumber: 'BAJ-RE-REG', category: 'Exhaust, Fuel & Cooling' }
    ]
  },
  {
    id: 'auto-piaggio-ape',
    category: 'Auto Rickshaw',
    brand: 'Piaggio',
    model: 'Ape DX / Ape Xtra LDX',
    variants: ['Ape City+ Petrol/CNG', 'Ape Xtra LDX Cargo Diesel', 'Ape E-City Electric'],
    years: '1999 - 2026',
    engine: '599cc Greaves Diesel Engine / Electric Motor',
    engineCode: 'Greaves 510 / Greaves 599',
    fuel: 'Diesel / CNG / Electric',
    transmission: '4-Speed Manual / Automatic EV Direct Drive',
    popularOemParts: [
      { partName: 'Greaves 599cc Diesel Engine Block', oemPartNumber: 'PIA-GRV-ENG', category: 'Engine & Transmission' },
      { partName: 'Rear Brake Drum & Shoe Set', oemPartNumber: 'PIA-BRK-SHO', category: 'Brakes & Suspension' }
    ]
  },

  // ==================== TRACTORS ====================
  {
    id: 'tractor-mahindra-575',
    category: 'Tractor',
    brand: 'Mahindra',
    model: '575 DI / 275 DI / Arjun 555',
    variants: ['575 DI XP Plus (47 HP)', 'Arjun 555 DI (49.3 HP)', '275 DI TU (39 HP)'],
    years: '1985 - 2026',
    engine: '2730cc 4-Cylinder mDi Tech Engine',
    engineCode: 'mDi 2730',
    fuel: 'Diesel',
    transmission: '8 Forward + 2 Reverse Partial Constant Mesh',
    popularOemParts: [
      { partName: 'mDi Engine Cylinder Liner & Piston Sleeve Kit', oemPartNumber: 'MAH-TRC-SLV', category: 'Engine & Transmission' },
      { partName: 'Dual Clutch Plate Assembly 280mm Heavy Duty', oemPartNumber: 'MAH-TRC-CLT', category: 'Engine & Transmission' },
      { partName: 'Hydraulics Lift Pump Unit MICO', oemPartNumber: 'MAH-HYD-PMP', category: 'Engine & Transmission' },
      { partName: 'PTO Shaft Gear 540 RPM', oemPartNumber: 'MAH-PTO-GAR', category: 'Engine & Transmission' }
    ]
  },
  {
    id: 'tractor-swaraj-744',
    category: 'Tractor',
    brand: 'Swaraj',
    model: '744 FE / 855 FE / 735 FE',
    variants: ['744 FE 48 HP', '855 FE 52 HP 4WD', '735 FE 40 HP'],
    years: '1974 - 2026',
    engine: '3478cc 3-Cylinder Water Cooled Diesel',
    engineCode: 'RB30 3-Cyl',
    fuel: 'Diesel',
    transmission: '8 Forward + 2 Reverse Combination Constant Mesh',
    popularOemParts: [
      { partName: '3-Cylinder Bosch Inline Fuel Injection Pump', oemPartNumber: '0400073001', category: 'Exhaust, Fuel & Cooling' },
      { partName: 'Heavy Duty Steering Drop Arm Box', oemPartNumber: 'SWR-STR-ARM', category: 'Brakes & Suspension' }
    ]
  },
  {
    id: 'tractor-sonalika-di35',
    category: 'Tractor',
    brand: 'Sonalika',
    model: 'DI 35 / DI 745 / Tiger 55',
    variants: ['DI 35 Rx 39 HP', 'Sonalika Tiger 55 4WD', 'DI 745 III Sikander'],
    years: '1995 - 2026',
    engine: '2780cc Heavy Duty Fuel Saver Engine',
    engineCode: 'HDM-2780',
    fuel: 'Diesel',
    transmission: '8 Forward + 2 Reverse Constant Mesh',
    popularOemParts: [
      { partName: 'Hydraulics Control Valve Assembly', oemPartNumber: 'SON-HYD-VAL', category: 'Engine & Transmission' },
      { partName: 'Radiator Intercooler Water Tank', oemPartNumber: 'SON-RAD-TNK', category: 'Exhaust, Fuel & Cooling' }
    ]
  },
  {
    id: 'tractor-john-deere-5050',
    category: 'Tractor',
    brand: 'John Deere',
    model: '5050D / 5310 / 5042D',
    variants: ['5050D 50 HP 2WD/4WD', '5310 Trem IV 55 HP', '5042D 42 HP'],
    years: '1998 - 2026',
    engine: '2900cc 3-Cylinder Turbocharged PowerTech Engine',
    engineCode: '3029D',
    fuel: 'Diesel',
    transmission: '8 Forward + 4 Reverse Collarshift',
    popularOemParts: [
      { partName: 'PowerTech 3029 Water Pump Assembly', oemPartNumber: 'RE505980', category: 'Exhaust, Fuel & Cooling' },
      { partName: 'Oil Immersed Disc Brake Pad Set', oemPartNumber: 'AL168393', category: 'Brakes & Suspension' }
    ]
  }
];

export const POPULAR_SEARCHES: PopularSearchItem[] = [
  { query: 'Swift DDiS Engine Block', type: 'part', count: '14.2k searches', category: 'Engine & Transmission' },
  { query: 'Creta LED Headlight', type: 'part', count: '18.9k searches', category: 'Lights, Mirrors & Glass' },
  { query: 'Thar Alloy Wheels', type: 'part', count: '22.5k searches', category: 'Wheels, Tyres & Alloys' },
  { query: 'Classic 350 Chrome Silencer', type: 'part', count: '11.8k searches', category: 'Exhaust, Fuel & Cooling' },
  { query: '55810-M74L00', type: 'oem', count: '8.4k searches', category: 'Brakes & Suspension' },
  { query: 'Nexon Turbocharger', type: 'part', count: '12.1k searches', category: 'Engine & Transmission' },
  { query: 'Activa 6G CVT Belt', type: 'part', count: '16.7k searches', category: 'Engine & Transmission' },
  { query: 'Mahindra 575 DI Clutch Plate', type: 'part', count: '9.3k searches', category: 'Engine & Transmission' },
  { query: 'Tata Prima Cummins Turbo', type: 'part', count: '6.2k searches', category: 'Engine & Transmission' },
  { query: 'Fortuner Legender Body Kit', type: 'part', count: '15.4k searches', category: 'Body Parts & Frame' },
  { query: 'Splendor Cylinder Piston Kit', type: 'part', count: '13.9k searches', category: 'Engine & Transmission' },
  { query: 'Eeco Sliding Door Roller', type: 'part', count: '7.1k searches', category: 'Body Parts & Frame' }
];

export const TRENDING_TAGS = [
  '🔥 Mayapuri Engine Scrap Sale',
  '⚡ Genuine OEM Brake Pads',
  '🚗 Thar 4x4 Offroad Accessories',
  '🏍️ Royal Enfield Chrome Exhausts',
  '🚜 Tractor Hydraulics & Lift Pumps',
  '🚚 Heavy Truck Cummins Turbos'
];

export const ALL_AUTOMOTIVE_BRANDS = [
  // Cars
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia', 'Toyota', 'Honda', 'Volkswagen', 'Skoda',
  'MG', 'Renault', 'Nissan', 'Jeep', 'Citroen', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi',
  'Volvo', 'Jaguar', 'Land Rover', 'Lexus', 'Mini', 'Porsche', 'Lamborghini', 'Ferrari', 'Rolls-Royce',
  'Bentley', 'BYD', 'Tesla',
  // Bikes & Scooters
  'Hero', 'TVS', 'Bajaj', 'Royal Enfield', 'Yamaha', 'Suzuki', 'KTM', 'Kawasaki', 'Harley-Davidson',
  'Ducati', 'Triumph', 'BMW Motorrad', 'Aprilia', 'Benelli', 'Jawa', 'Yezdi', 'Husqvarna', 'Ola Electric',
  'Ather', 'Vespa',
  // Commercial & Tractors
  'Tata Motors', 'Ashok Leyland', 'BharatBenz', 'Eicher', 'Force Motors', 'SML Isuzu', 'Piaggio',
  'Atul', 'Montra Electric', 'Swaraj', 'Sonalika', 'John Deere', 'New Holland', 'Kubota', 'Escorts',
  'Massey Ferguson', 'Isuzu'
];
