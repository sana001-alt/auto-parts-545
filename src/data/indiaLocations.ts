export interface StateDistrictMap {
  [stateName: string]: string[];
}

export const INDIA_STATES_DISTRICTS: StateDistrictMap = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Assam": ["Cachar", "Dibrugarh", "Kamrup Metropolitan (Guwahati)", "Jorhat", "Nagaon", "Sivasagar", "Sonitpur", "Tinsukia"],
  "Bihar": ["Bhagalpur", "Gaya", "Muzaffarpur", "Nalanda", "Patna", "Purnia", "Rohtas", "Saran", "Vaishali"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Bhilai", "Bilaspur", "Durg", "Korba", "Raipur", "Rajnandgaon"],
  "Delhi NCR": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "South Delhi", "South West Delhi", "West Delhi", "Gurugram (Haryana)", "Noida (UP)", "Ghaziabad (UP)", "Faridabad (Haryana)"],
  "Goa": ["North Goa (Panaji)", "South Goa (Margao)"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Banaskantha", "Bharuch", "Bhavnagar", "Gandhinagar", "Jamnagar", "Junagadh", "Kheda", "Kutch (Gandhidham)", "Mehsana", "Rajkot", "Surat", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Faridabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Karnal", "Kurukshetra", "Panipat", "Rohtak", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra (Dharamshala)", "Kullu", "Mandi", "Shimla", "Solan", "Una"],
  "Jammu & Kashmir": ["Anantnag", "Baramulla", "Jammu", "Kathua", "Pulwama", "Srinagar", "Udhampur"],
  "Jharkhand": ["Bokaro", "Dhanbad", "East Singhbhum (Jamshedpur)", "Hazaribagh", "Ramgarh", "Ranchi"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Urban", "Bengaluru Rural", "Bidar", "Chamarajanagar", "Chikkamagaluru", "Dakshina Kannada (Mangaluru)", "Davanagere", "Dharwad (Hubballi)", "Hassan", "Kalaburagi", "Kodagu (Madikeri)", "Kolar", "Mandya", "Mysuru", "Raichur", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada (Karwar)"],
  "Kerala": ["Alappuzha", "Ernakulam (Kochi)", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Madhya Pradesh": ["Bhopal", "Chhindwara", "Gwalior", "Indore", "Jabalpur", "Katni", "Mandsaur", "Morena", "Rewa", "Sagar", "Satna", "Ujjain"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Chhatrapati Sambhajinagar (Aurangabad)", "Beed", "Bhandara", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban (Kurla)", "Nagpur", "Nanded", "Nashik", "Navi Mumbai", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Solapur", "Thane", "Wardha", "Yavatmal"],
  "Odisha": ["Angul", "Balasore", "Bargarh", "Bhadrak", "Cuttack", "Ganjam (Berhampur)", "Jharsuguda", "Khurda (Bhubaneswar)", "Puri", "Sambalpur", "Sundergarh (Rourkela)"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Moga", "Pathankot", "Patiala", "Rupnagar (Ropar)", "Sahibzada Ajit Singh Nagar (Mohali)", "Sangrur"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Chittorgarh", "Churu", "Dausa", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Kota", "Nagaur", "Pali", "Sikar", "Sirohi", "Sri Ganganagar", "Udaipur"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai (Pudupet)", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli (Trichy)", "Tirunelveli", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Karimnagar", "Khammam", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Nalgonda", "Nizamabad", "Rangareddy", "Sangareddy", "Suryapet", "Warangal"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Amroha", "Ayodhya", "Bareilly", "Bijnor", "Bulandshahr", "Etawah", "Farrukhabad", "Ghaziabad", "Gorakhpur", "Jhansi", "Kanpur Nagar", "Lucknow", "Mathura", "Meerut", "Moradabad", "Muzaffarnagar", "Gautam Buddha Nagar (Noida)", "Prayagraj (Allahabad)", "Saharanpur", "Shahjahanpur", "Varanasi"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Udham Singh Nagar (Rudrapur)"],
  "West Bengal": ["Bankura", "Birbhum", "Cooch Behar", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman (Durgapur/Asansol)", "Paschim Medinipur", "Purba Bardhaman", "Siliguri", "South 24 Parganas"]
};

export const POPULAR_BRANDS: Record<string, string[]> = {
  'Four Wheeler (Car)': [
    'Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Mahindra & Mahindra', 'Honda', 
    'Toyota', 'Kia', 'Volkswagen', 'Skoda', 'Ford', 'Renault', 'MG Motor',
    'Nissan', 'Chevrolet', 'Fiat', 'BMW', 'Mercedes-Benz', 'Audi'
  ],
  'Two Wheeler (Bike/Scooter)': [
    'Hero MotoCorp', 'Honda 2-Wheelers', 'Bajaj Auto', 'TVS Motor', 'Royal Enfield',
    'Yamaha', 'Suzuki', 'KTM', 'Ather Energy', 'Ola Electric', 'Kawasaki', 'Jawa / Yezdi'
  ],
  'Commercial (Truck/Bus/Auto)': [
    'Tata Commercial', 'Ashok Leyland', 'Mahindra Commercial', 'Eicher Motors',
    'Force Motors', 'Bajaj Auto Commercial', 'Piaggio Ape', 'Swaraj Mazda'
  ],
  'Tractor & Heavy Equipment': [
    'Mahindra Tractors', 'Swaraj Tractors', 'Sonalika', 'TAFE / Massey Ferguson',
    'Escorts Kubota / Farmtrac', 'John Deere', 'New Holland', 'JCB India'
  ]
};
