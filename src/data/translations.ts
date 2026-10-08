import { Language } from "../types"

export interface TranslationStrings {
  // Navigation & Branding
  brandTitle: string
  brandSubtitle: string
  publicBadge: string
  adminBadge: string
  switchToAdmin: string
  switchToCitizen: string
  scanQrBtn: string
  selectDog: string

  // Dog Profile Card
  liveBadge: string
  dogId: string
  registered: string
  breedAi: string
  vaccinationStatus: string
  vaccinated: string
  sterilisationStatus: string
  sterilised: string
  healthy: string
  observation: string
  recovery: string
  geofenceAlert: string
  viewIdCard: string
  viewMedicalLog: string

  // About & Health Card
  aboutTitle: string
  approxAge: string
  gender: string
  male: string
  female: string
  area: string
  nature: string
  specialNotes: string
  healthOverview: string
  bodyTemp: string
  activityScore: string
  normal: string
  active: string
  resting: string
  elevated: string
  lastUpdated: string
  syncCollar: string

  // Live Location
  liveLocation: string
  lastSeen: string
  minsAgo: string
  navigate: string
  movementTrail: string
  safeZoneBadge: string
  outsideZoneBadge: string
  playTrail: string
  pauseTrail: string
  gpsAccuracy: string
  locationStr: string
  coordinates: string
  copyCoords: string
  copied: string

  // Collar & Emergency
  collarTitle: string
  collarInstalled: string
  batteryLevel: string
  lastGpsUpdate: string
  emergencyTitle: string
  emergencyNotice: string
  contactHelpline: string
  ngoNotified: string

  // Modals & Action
  reportIncident: string
  reportSubtitle: string
  issueCategory: string
  selectCategory: string
  catInjured: string
  catAggression: string
  catCollar: string
  catFood: string
  catSighting: string
  yourName: string
  yourPhone: string
  incidentDetails: string
  submitReport: string
  closeBtn: string
  ticketGenerated: string
  ticketNotice: string
  callHelplineNow: string

  // QR Scanner Modal
  qrScannerTitle: string
  qrScannerDesc: string
  simulatingScan: string
  tagDetected: string
  viewProfileNow: string

  // Digital ID Modal
  digitalIdTitle: string
  officialWelfareId: string
  registeredWithMGM: string
  printPass: string
  sharePass: string

  // Footer
  footerText: string
}

export const TRANSLATIONS: Record<Language, TranslationStrings> = {
  en: {
    brandTitle: "Smart Street Dog",
    brandSubtitle: "Identification & Tracking System",
    publicBadge: "Public Profile – No Login Required",
    adminBadge: "Municipal & Vet Portal",
    switchToAdmin: "Admin Portal",
    switchToCitizen: "Citizen View",
    scanQrBtn: "Scan Collar QR",
    selectDog: "Select Dog",

    liveBadge: "Live",
    dogId: "Dog ID",
    registered: "Registered",
    breedAi: "Breed",
    vaccinationStatus: "Vaccination Status",
    vaccinated: "Vaccinated",
    sterilisationStatus: "Sterilisation Status",
    sterilised: "Sterilised",
    healthy: "Healthy",
    observation: "Under Observation",
    recovery: "Medical Recovery",
    geofenceAlert: "Geofence Warning",
    viewIdCard: "Digital ID Pass",
    viewMedicalLog: "Vet Health Log",

    aboutTitle: "About This Dog",
    approxAge: "Approx. Age",
    gender: "Gender",
    male: "Male",
    female: "Female",
    area: "Area",
    nature: "Nature",
    specialNotes: "Special Notes",
    healthOverview: "Health Overview",
    bodyTemp: "Body Temperature",
    activityScore: "Activity Score",
    normal: "Normal",
    active: "Active",
    resting: "Resting",
    elevated: "Elevated",
    lastUpdated: "Last updated",
    syncCollar: "Sync Telemetry",

    liveLocation: "Live Location",
    lastSeen: "Last seen",
    minsAgo: "mins ago",
    navigate: "Navigate",
    movementTrail: "Movement trail – Last 24 hours",
    safeZoneBadge: "Inside Campus Safe Zone",
    outsideZoneBadge: "Outside Geofence Alert",
    playTrail: "Play 24h Trail",
    pauseTrail: "Pause Playback",
    gpsAccuracy: "GPS Accuracy",
    locationStr: "Location",
    coordinates: "Coordinates",
    copyCoords: "Copy Coordinates",
    copied: "Copied!",

    collarTitle: "Collar & Tracking",
    collarInstalled: "Collar Installed",
    batteryLevel: "Battery Level",
    lastGpsUpdate: "Last GPS Update",
    emergencyTitle: "Emergency Information",
    emergencyNotice: "In case of emergency, please contact your local NGO or Municipal Authority immediately.",
    contactHelpline: "Contact Animal Helpline: +91 98221 45789",
    ngoNotified: "NGO / Municipal Authority has been notified and is monitoring this dog's welfare.",

    reportIncident: "Report Dog / Incident",
    reportSubtitle: "Submit a welfare report or emergency alert directly to municipal rescuers.",
    issueCategory: "Issue Category",
    selectCategory: "Select problem type...",
    catInjured: "Dog is Sick / Injured",
    catAggression: "Aggressive / Distress Behavior",
    catCollar: "Damaged / Missing Collar",
    catFood: "Request Food / Water Spot Check",
    catSighting: "General Sighting Update",
    yourName: "Your Full Name",
    yourPhone: "Contact Phone Number",
    incidentDetails: "Additional Details (Optional)",
    submitReport: "Submit Official Report",
    closeBtn: "Close",
    ticketGenerated: "Emergency Dispatch Ticket Generated",
    ticketNotice: "Rescuers from MGM Animal Welfare & Municipal Ward 12 have been dispatched with this geo-tag.",
    callHelplineNow: "Direct Helpline: +91 98221 45789",

    qrScannerTitle: "Scan Collar QR / NFC Tag",
    qrScannerDesc: "Point camera at the smart collar tag to load the verified digital welfare record.",
    simulatingScan: "Scanning for Smart Collar QR...",
    tagDetected: "Collar Tag Authenticated!",
    viewProfileNow: "Loading Verified Profile...",

    digitalIdTitle: "Smart City Animal Welfare ID",
    officialWelfareId: "Official Municipal Public ID Card",
    registeredWithMGM: "MGM University & Municipal Animal Welfare Cell",
    printPass: "Print / Save Pass",
    sharePass: "Share Public Link",

    footerText: "This is an initiative for the welfare of dogs. Please be kind and keep them safe.",
  },

  mr: {
    brandTitle: "स्मार्ट स्ट्रीट डॉग",
    brandSubtitle: "ओळख व थेट ट्रॅकिंग प्रणाली",
    publicBadge: "सार्वजनिक प्रोफाइल – लॉगिन आवश्यक नाही",
    adminBadge: "महानगरपालिका व पशुवैद्यकीय पोर्टल",
    switchToAdmin: "अॅडमिन पोर्टल",
    switchToCitizen: "नागरिक दृश्य",
    scanQrBtn: "कॉलर QR स्कॅन करा",
    selectDog: "श्वान निवडा",

    liveBadge: "थेट",
    dogId: "श्वान ओळख क्रमांक",
    registered: "नोंदणी तारीख",
    breedAi: "जात",
    vaccinationStatus: "लसीकरण स्थिती",
    vaccinated: "लसीकरण पूर्ण",
    sterilisationStatus: "नसबंदी स्थिती",
    sterilised: "नसबंदी पूर्ण",
    healthy: "निरोगी",
    observation: "निरीक्षणाखाली",
    recovery: "उपचार सुरू",
    geofenceAlert: "हद्द ओलांडली (सूचना)",
    viewIdCard: "डिजिटल ओळखपत्र",
    viewMedicalLog: "वैद्यकीय नोंदवही",

    aboutTitle: "या श्वानाबद्दल माहिती",
    approxAge: "अंदाजे वय",
    gender: "लिंग",
    male: "नर",
    female: "मादी",
    area: "परिसर",
    nature: "स्वभाव",
    specialNotes: "विशेष नोंदी",
    healthOverview: "आरोग्य सारांश",
    bodyTemp: "शरीराचे तापमान",
    activityScore: "सक्रियता स्कोअर",
    normal: "सामान्य",
    active: "सक्रिय",
    resting: "विश्रांती",
    elevated: "जास्त",
    lastUpdated: "शेवटचे अपडेट",
    syncCollar: "डेटा सिंक करा",

    liveLocation: "थेट स्थान",
    lastSeen: "शेवटचे दिसले",
    minsAgo: "मिनिटांपूर्वी",
    navigate: "मार्ग दाखवा",
    movementTrail: "हालचालीचा मार्ग – मागील २४ तास",
    safeZoneBadge: "कॅम्पस सुरक्षित क्षेत्रात",
    outsideZoneBadge: "हद्द ओलांडली (अलर्ट)",
    playTrail: "मार्ग प्ले करा",
    pauseTrail: "थांबवा",
    gpsAccuracy: "GPS अचूकता",
    locationStr: "स्थान",
    coordinates: "अक्षांश-रेखांश",
    copyCoords: "स्थान कॉपी करा",
    copied: "कॉपी झाले!",

    collarTitle: "स्मार्ट कॉलर व ट्रॅकिंग",
    collarInstalled: "कॉलर बसवली",
    batteryLevel: "बॅटरी पातळी",
    lastGpsUpdate: "शेवटचे GPS अपडेट",
    emergencyTitle: "आपत्कालीन माहिती",
    emergencyNotice: "आपत्कालीन परिस्थितीत कृपया स्थानिक एनजीओ किंवा महानगरपालिका प्राधिकरणाशी त्वरित संपर्क साधा.",
    contactHelpline: "प्राणी हेल्पलाईनशी संपर्क साधा: +९१ ९८२२१ ४५७८९",
    ngoNotified: "एनजीओ/महानगरपालिकेला सूचित करण्यात आले असून ते या श्वानाच्या सुरक्षेवर लक्ष ठेवून आहेत.",

    reportIncident: "तक्रार / माहिती नोंदवा",
    reportSubtitle: "जखमी श्वान किंवा आपत्कालीन मदतीसाठी त्वरित माहिती सादर करा.",
    issueCategory: "समस्येचा प्रकार",
    selectCategory: "प्रकार निवडा...",
    catInjured: "श्वान आजारी / जखमी आहे",
    catAggression: "आक्रमक / भीतीदायक वर्तन",
    catCollar: "कॉलर तुटलेली / गहाळ आहे",
    catFood: "अन्न व पाण्याची आवश्यकता",
    catSighting: "सामान्य निरीक्षण",
    yourName: "आपले पूर्ण नाव",
    yourPhone: "मोबाईल नंबर",
    incidentDetails: "अधिक माहिती (पर्यायी)",
    submitReport: "माहिती सबमिट करा",
    closeBtn: "बंद करा",
    ticketGenerated: "मदत तिकीट तयार झाले!",
    ticketNotice: "एमजीएम प्राणी कल्याण दल व प्रभाग १२ ला हे स्थान आणि माहिती पाठवण्यात आली आहे.",
    callHelplineNow: "थेट हेल्पलाईन: +९१ ९८२२१ ४५७८९",

    qrScannerTitle: "कॉलर QR / NFC स्कॅन करा",
    qrScannerDesc: "प्रमाणित डिजिटल ओळख तपासण्यासाठी कॅमेरा कॉलर टॅगकडे धरा.",
    simulatingScan: "कॉलर टॅग शोधत आहे...",
    tagDetected: "कॉलर टॅग सापडला!",
    viewProfileNow: "प्रोफाइल लोड होत आहे...",

    digitalIdTitle: "स्मार्ट सिटी प्राणी कल्याण ओळखपत्र",
    officialWelfareId: "अधिकृत महानगरपालिका डिजिटल कार्ड",
    registeredWithMGM: "एमजीएम विद्यापीठ व महापालिका प्राणी कल्याण कक्ष",
    printPass: "कार्ड सेव्ह / प्रिंट करा",
    sharePass: "लिंक शेअर करा",

    footerText: "हा उपक्रम श्वानांच्या कल्याणासाठी आहे. कृपया त्यांच्यावर दया करा आणि त्यांना सुरक्षित ठेवा.",
  },

  hi: {
    brandTitle: "स्मार्ट स्ट्रीट डॉग",
    brandSubtitle: "पहचान एवं लाइव ट्रैकिंग सिस्टम",
    publicBadge: "पब्लिक प्रोफाइल – लॉगिन आवश्यक नहीं",
    adminBadge: "नगर निगम एवं पशु चिकित्सा पोर्टल",
    switchToAdmin: "एडमिन पोर्टल",
    switchToCitizen: "नागरिक व्यू",
    scanQrBtn: "कॉलर QR स्कैन करें",
    selectDog: "कुत्ता चुनें",

    liveBadge: "लाइव",
    dogId: "डॉग आईडी",
    registered: "पंजीकरण तिथि",
    breedAi: "नस्ल",
    vaccinationStatus: "टीकाकरण स्थिति",
    vaccinated: "टीकाकरण पूर्ण",
    sterilisationStatus: "नसबंदी स्थिति",
    sterilised: "नसबंदी पूर्ण",
    healthy: "स्वस्थ",
    observation: "निगरानी में",
    recovery: "उपचाराधीन",
    geofenceAlert: "सीमा उल्लंघन (चेतावनी)",
    viewIdCard: "डिजिटल पहचान पत्र",
    viewMedicalLog: "चिकित्सा रिकॉर्ड",

    aboutTitle: "इस कुत्ते के बारे में",
    approxAge: "अनुमानित आयु",
    gender: "लिंग",
    male: "नर",
    female: "मादा",
    area: "क्षेत्र",
    nature: "स्वभाव",
    specialNotes: "विशेष विवरण",
    healthOverview: "स्वास्थ्य सारांश",
    bodyTemp: "शरीर का तापमान",
    activityScore: "गतिविधि स्कोर",
    normal: "सामान्य",
    active: "सक्रिय",
    resting: "विश्राम",
    elevated: "अधिक",
    lastUpdated: "अंतिम अपडेट",
    syncCollar: "डेटा सिंक करें",

    liveLocation: "लाइव लोकेशन",
    lastSeen: "अंतिम बार देखा गया",
    minsAgo: "मिनट पहले",
    navigate: "मार्ग देखें",
    movementTrail: "मूवमेंट ट्रेल – पिछले 24 घंटे",
    safeZoneBadge: "परिसर सुरक्षित क्षेत्र में",
    outsideZoneBadge: "जियोफेंस चेतावनी",
    playTrail: "ट्रेल चलाएं",
    pauseTrail: "रोकें",
    gpsAccuracy: "GPS सटीकता",
    locationStr: "स्थान",
    coordinates: "निर्देशांक",
    copyCoords: "लोकेशन कॉपी करें",
    copied: "कॉपी हुआ!",

    collarTitle: "स्मार्ट कॉलर एवं ट्रैकिंग",
    collarInstalled: "कॉलर लगाया गया",
    batteryLevel: "बैटरी स्तर",
    lastGpsUpdate: "अंतिम GPS अपडेट",
    emergencyTitle: "आपातकालीन जानकारी",
    emergencyNotice: "आपात स्थिति में कृपया स्थानीय एनजीओ या नगर निगम प्राधिकरण से तुरंत संपर्क करें।",
    contactHelpline: "पशु हेल्पलाइन से संपर्क करें: +91 98221 45789",
    ngoNotified: "एनजीओ/नगर निगम को सूचित किया गया है और वे इस कुत्ते की सुरक्षा पर नजर रखे हुए हैं।",

    reportIncident: "घटना / समस्या दर्ज करें",
    reportSubtitle: "घायल कुत्ते या आपात सहायता के लिए तुरंत रिपोर्ट दर्ज करें।",
    issueCategory: "समस्या का प्रकार",
    selectCategory: "प्रकार चुनें...",
    catInjured: "कुत्ता बीमार / घायल है",
    catAggression: "आक्रामक / भयभीत व्यवहार",
    catCollar: "कॉलर टूटा / गायब है",
    catFood: "भोजन व पानी की आवश्यकता",
    catSighting: "सामान्य जानकारी",
    yourName: "आपका पूरा नाम",
    yourPhone: "मोबाइल नंबर",
    incidentDetails: "अतिरिक्त विवरण (वैकल्पिक)",
    submitReport: "रिपोर्ट सबमिट करें",
    closeBtn: "बंद करें",
    ticketGenerated: "सहायता टिकट जनरेट हुआ!",
    ticketNotice: "एमजीएम एनिमल वेलफेयर टीम और नगर निगम वार्ड 12 को यह अलर्ट भेज दिया गया है।",
    callHelplineNow: "सीधी हेल्पलाइन: +91 98221 45789",

    qrScannerTitle: "कॉलर QR / NFC स्कैन करें",
    qrScannerDesc: "प्रमाणित डिजिटल रिकॉर्ड देखने के लिए कैमरा कॉलर टैग पर रखें।",
    simulatingScan: "कॉलर टैग खोजा जा रहा है...",
    tagDetected: "कॉलर टैग प्रमाणित हुआ!",
    viewProfileNow: "प्रोफाइल लोड हो रहा है...",

    digitalIdTitle: "स्मार्ट सिटी पशु कल्याण पहचान पत्र",
    officialWelfareId: "आधिकारिक नगर निगम डिजिटल कार्ड",
    registeredWithMGM: "एमजीएम विश्वविद्यालय एवं नगर निगम पशु कल्याण प्रकोष्ठ",
    printPass: "कार्ड सेव / प्रिंट करें",
    sharePass: "लिंक शेयर करें",

    footerText: "यह पहल कुत्तों के कल्याण के लिए है। कृपया उनके प्रति दयालु रहें और उन्हें सुरक्षित रखें।",
  },
}
