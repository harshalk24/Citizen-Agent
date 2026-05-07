export interface PrefillField {
  label: string;
  hint?: string;
  citizenKey?: "name" | "phone";
  example?: string;
}

export interface ApplyEnrichment {
  applyUrl: string;
  authNote?: string;
  prefillFields: PrefillField[];
}

export const applyEnrichment: Record<string, ApplyEnrichment> = {

  // ═══════════════════ IRELAND — NEW BABY ═══════════════════════

  "ie-maternity-benefit": {
    applyUrl: "https://www.welfare.ie/en/Pages/Apply-for-Maternity-Benefit-Online.aspx",
    authNote: "Log in with MyGovID (or create a free account)",
    prefillFields: [
      { label: "PPS Number", hint: "On your payslip or Revenue correspondence", example: "1234567T" },
      { label: "IBAN (bank account for payment)", hint: "Your Irish IBAN — starts with IE", example: "IE29 AIBK 9311 5212 3456 78" },
      { label: "Expected due date / date of birth", hint: "From MB2 form completed by your doctor" },
      { label: "Employer name & PAYE registration number", hint: "From your MB1 form — ask HR" },
      { label: "Last day of work before maternity leave", hint: "Date you stop working" },
    ],
  },

  "ie-paternity-benefit": {
    applyUrl: "https://www.welfare.ie/en/Pages/Apply-Online-for-Paternity-Benefit.aspx",
    authNote: "Log in with MyGovID",
    prefillFields: [
      { label: "PPS Number", example: "1234567T" },
      { label: "IBAN", hint: "Irish bank account for payment" },
      { label: "Baby's date of birth or expected due date" },
      { label: "Employer name", hint: "From your PB1 form — ask HR" },
      { label: "Paternity leave start date", hint: "The date your 2-week leave begins" },
    ],
  },

  "ie-parents-benefit": {
    applyUrl: "https://www.welfare.ie/en/Pages/Apply-Online-for-Parents-Benefit.aspx",
    authNote: "Log in with MyGovID",
    prefillFields: [
      { label: "PPS Number", example: "1234567T" },
      { label: "Child's PPS Number", hint: "From birth certificate registration" },
      { label: "Baby's date of birth" },
      { label: "IBAN", hint: "Irish bank account" },
      { label: "Leave start date and end date" },
    ],
  },

  "ie-child-benefit": {
    applyUrl: "https://www.welfare.ie/en/Pages/Apply-for-Child-Benefit-Online.aspx",
    authNote: "Log in with MyGovID",
    prefillFields: [
      { label: "Your PPS Number" },
      { label: "Child's PPS Number", hint: "Generated when you register the birth" },
      { label: "Child's date of birth" },
      { label: "Child's full name", citizenKey: "name" },
      { label: "IBAN for payment" },
    ],
  },

  "ie-maternity-infant-care": {
    applyUrl: "https://www2.hse.ie/services/maternity-and-infant-care-scheme/",
    prefillFields: [
      { label: "Your name", citizenKey: "name" },
      { label: "PPS Number" },
      { label: "GP name and address", hint: "Register with a local GP if not already" },
      { label: "Due date" },
    ],
  },

  "ie-public-health-nurse": {
    applyUrl: "https://www2.hse.ie/services/public-health-nursing/",
    prefillFields: [
      { label: "Name", citizenKey: "name" },
      { label: "Phone number", citizenKey: "phone" },
      { label: "Home address", hint: "Nurse will visit at home" },
      { label: "Baby's date of birth" },
    ],
  },

  "ie-gp-visit-card-under8": {
    applyUrl: "https://www.sspcrs.ie/portal/free-gp-care/pub/application",
    prefillFields: [
      { label: "Child's full name" },
      { label: "Child's PPS Number" },
      { label: "Child's date of birth" },
      { label: "GP name and GMS number", hint: "Ask your GP's receptionist for the GMS number" },
    ],
  },

  "ie-ecce": {
    applyUrl: "https://ncs.gov.ie/en/Programmes/ECCE/ECCE.aspx",
    authNote: "Register on NCS (National Childcare Scheme) portal",
    prefillFields: [
      { label: "Child's PPS Number" },
      { label: "Child's date of birth", hint: "Child must be between 2 years 8 months and 5 years 6 months" },
      { label: "Chosen preschool / childcare provider", hint: "Must be registered with Tusla" },
    ],
  },

  "ie-maternity-benefit-se": {
    applyUrl: "https://www.welfare.ie/en/Pages/Apply-for-Maternity-Benefit-Online.aspx",
    authNote: "Log in with MyGovID",
    prefillFields: [
      { label: "PPS Number" },
      { label: "IBAN" },
      { label: "Evidence of self-employment", hint: "Tax assessment or S45 letter from Revenue" },
      { label: "Expected due date" },
    ],
  },

  "ie-working-family-payment": {
    applyUrl: "https://www.welfare.ie/en/Pages/Working-Family-Payment-Online-Application.aspx",
    authNote: "Log in with MyGovID",
    prefillFields: [
      { label: "PPS Number (yours and each child's)" },
      { label: "Employer name and address" },
      { label: "Recent payslip", hint: "Last 6 weeks of payslips" },
      { label: "IBAN" },
      { label: "Number of qualifying children and ages" },
    ],
  },

  // ═══════════════════ IRELAND — JOB LOSS ═══════════════════════

  "ie-jobseekers-benefit": {
    applyUrl: "https://www.welfare.ie/en/Pages/Apply-Online-for-Jobseekers-Benefit.aspx",
    authNote: "Log in with MyGovID",
    prefillFields: [
      { label: "PPS Number" },
      { label: "Last day of employment and employer name" },
      { label: "IBAN for payment" },
      { label: "Proof of job-seeking", hint: "You will need to register with Intreo and confirm you are actively seeking work" },
    ],
  },

  "ie-jobseekers-allowance": {
    applyUrl: "https://www.welfare.ie/en/Pages/Apply-Online-for-Jobseekers-Allowance.aspx",
    authNote: "Log in with MyGovID — means-tested, income details required",
    prefillFields: [
      { label: "PPS Number" },
      { label: "Household income details", hint: "All sources: partner income, savings, rent income" },
      { label: "IBAN" },
      { label: "Details of any assets or savings" },
    ],
  },

  "ie-back-to-education": {
    applyUrl: "https://www.welfare.ie/en/Pages/BackToEducation.aspx",
    prefillFields: [
      { label: "PPS Number" },
      { label: "Current social welfare payment reference" },
      { label: "Course name and FETAC/NFQ level" },
      { label: "College/institution name and start date" },
    ],
  },

  "ie-back-to-work-enterprise": {
    applyUrl: "https://www.welfare.ie/en/Pages/Back-to-Work-Enterprise-Allowance-BTWEA.aspx",
    prefillFields: [
      { label: "PPS Number" },
      { label: "Current social welfare payment reference" },
      { label: "Business plan", hint: "Brief description of proposed business" },
      { label: "Intreo case officer name", hint: "Get this from your local Intreo office" },
    ],
  },

  "ie-housing-assistance": {
    applyUrl: "https://www.hap.ie/apply/",
    prefillFields: [
      { label: "Name", citizenKey: "name" },
      { label: "PPS Number" },
      { label: "Local authority area", hint: "The county/city council where you are renting" },
      { label: "Current rent amount and landlord details" },
      { label: "Household income" },
    ],
  },

  "ie-medical-card": {
    applyUrl: "https://www.medicalcard.ie/",
    authNote: "Apply online or download paper form",
    prefillFields: [
      { label: "PPS Number (all household members)" },
      { label: "Household income details", hint: "All weekly income sources for everyone in the household" },
      { label: "GP name and GMS number", hint: "Must be registered with a GP who accepts medical cards" },
      { label: "Any regular expenses", hint: "Rent, mortgage, childcare — reduces assessed income" },
    ],
  },

  "ie-community-employment": {
    applyUrl: "https://www.welfare.ie/en/Pages/community-employment-scheme.aspx",
    prefillFields: [
      { label: "PPS Number" },
      { label: "Duration on social welfare payment", hint: "Must be on a qualifying payment for at least 1 year" },
      { label: "Preferred CE scheme / local sponsor", hint: "Search schemes at your local Intreo office" },
    ],
  },

  // ═══════════════════ IRELAND — START BUSINESS ═══════════════════════

  "ie-new-enterprise-allowance": {
    applyUrl: "https://www.welfare.ie/en/Pages/Back-to-Work-Enterprise-Allowance-BTWEA.aspx",
    prefillFields: [
      { label: "PPS Number" },
      { label: "Current Jobseeker's payment reference" },
      { label: "Business idea description", hint: "One page is sufficient at this stage" },
      { label: "Intreo case officer contact", hint: "They must approve the business plan" },
    ],
  },

  "ie-leo-grant": {
    applyUrl: "https://www.localenterprise.ie/Discover-Business-Supports/Trading-Online-Voucher-Scheme/",
    authNote: "Apply through your county's Local Enterprise Office website",
    prefillFields: [
      { label: "Business name and legal structure" },
      { label: "Business plan or executive summary" },
      { label: "Business address and Eircode" },
      { label: "Revenue tax registration number (if trading)" },
      { label: "Bank statements (last 3 months)" },
    ],
  },

  "ie-cro-registration": {
    applyUrl: "https://www.core.ie/",
    authNote: "Create a free CORE account to file online",
    prefillFields: [
      { label: "Proposed company name", hint: "Check availability on CRO website first" },
      { label: "Registered office address", hint: "Must be a physical Irish address" },
      { label: "Director(s) PPS Number(s)" },
      { label: "Company secretary details" },
      { label: "Share capital amount and structure" },
    ],
  },

  "ie-revenue-registration": {
    applyUrl: "https://www.ros.ie/",
    authNote: "Register for ROS (Revenue Online Service) or use myAccount",
    prefillFields: [
      { label: "PPS Number" },
      { label: "Tax type to register", example: "Income Tax (self-employed), VAT, PAYE/PRSI Employer" },
      { label: "Business name and address" },
      { label: "Business commencement date" },
      { label: "Company registration number (if applicable)" },
    ],
  },

  "ie-ei-competitive-start": {
    applyUrl: "https://www.enterprise-ireland.com/en/funding-supports/company/competitive-start-fund/",
    authNote: "Online application via Enterprise Ireland client portal",
    prefillFields: [
      { label: "Company name and registration number" },
      { label: "Pitch deck (max 10 slides)" },
      { label: "Executive team CVs" },
      { label: "Financial projections (3 years)" },
      { label: "Evidence of market validation" },
    ],
  },

  "ie-microfinance": {
    applyUrl: "https://microfinanceireland.ie/how-to-apply/",
    prefillFields: [
      { label: "Business name and address" },
      { label: "Loan amount requested", hint: "Up to €25,000" },
      { label: "Business plan", hint: "Includes cash flow projections" },
      { label: "Personal financial statement" },
      { label: "Evidence of bank refusal (if applicable)", hint: "Required if declined by a mainstream bank" },
    ],
  },

  "ie-startup-tax-relief": {
    applyUrl: "https://www.revenue.ie/en/self-assessment-and-self-employment/sure/index.aspx",
    authNote: "Apply via Revenue Online Service (ROS)",
    prefillFields: [
      { label: "PPS Number" },
      { label: "Company CRO registration number" },
      { label: "Employment income in previous years", hint: "SURE is based on previously paid income tax" },
      { label: "Share subscription amount" },
      { label: "Solicitor confirmation of share subscription" },
    ],
  },

  // ═══════════════════ UAE — NEW BABY ═══════════════════════

  "uae-parental-leave": {
    applyUrl: "https://www.mohre.gov.ae/en/services/mohre-services.aspx",
    authNote: "Submit via UAE Pass or through your employer's HR system",
    prefillFields: [
      { label: "Emirates ID number" },
      { label: "Baby's birth certificate number", hint: "Register birth within 30 days first" },
      { label: "Employer name and labour contract number" },
      { label: "Leave start date" },
    ],
  },

  "uae-birth-registration": {
    applyUrl: "https://icp.gov.ae/en/services",
    authNote: "Apply via ICP (Federal Authority for Identity) online portal",
    prefillFields: [
      { label: "Hospital birth notification", hint: "Issued by hospital within 24 hours" },
      { label: "Father's Emirates ID or passport" },
      { label: "Mother's Emirates ID or passport" },
      { label: "Marriage certificate (attested)", hint: "Must be attested for non-UAE marriages" },
    ],
  },

  "uae-health-insurance-newborn": {
    applyUrl: "https://www.dha.gov.ae/en/services",
    authNote: "Contact your current health insurer within 30 days of birth",
    prefillFields: [
      { label: "Baby's birth certificate copy" },
      { label: "Your health insurance policy number" },
      { label: "Baby's full name as on birth certificate" },
      { label: "Emirates ID of parent (policy holder)" },
    ],
  },

  "uae-abu-dhabi-child-allowance": {
    applyUrl: "https://www.tamm.abudhabi/en/family-and-individuals/personal-affairs/children/childrens-allowance",
    authNote: "Log in with UAE Pass on TAMM Abu Dhabi portal",
    prefillFields: [
      { label: "Emirates ID" },
      { label: "Child's birth certificate" },
      { label: "Proof of Abu Dhabi residency" },
      { label: "Bank account IBAN (Emirates NBD or ADCB)" },
    ],
  },

  "uae-maternity-insurance": {
    applyUrl: "https://iloe.mohre.gov.ae/",
    authNote: "Check with your employer — mandatory for all private sector employees",
    prefillFields: [
      { label: "Emirates ID" },
      { label: "Employer registration number" },
      { label: "Salary certificate" },
      { label: "Medical certificate confirming pregnancy" },
    ],
  },

  // ═══════════════════ UAE — JOB LOSS ═══════════════════════

  "uae-iloe": {
    applyUrl: "https://iloe.mohre.gov.ae/",
    authNote: "Register via UAE Pass within 30 days of losing your job",
    prefillFields: [
      { label: "Emirates ID" },
      { label: "UAE Pass account", hint: "Download UAE Pass app if you don't have it" },
      { label: "Employer's establishment card number", hint: "From your labour contract" },
      { label: "Bank account IBAN for benefit payment" },
      { label: "Last working day" },
    ],
  },

  "uae-end-of-service": {
    applyUrl: "https://www.mohre.gov.ae/en/services/mohre-services.aspx",
    authNote: "File a wage complaint if employer doesn't pay within 14 days",
    prefillFields: [
      { label: "Emirates ID" },
      { label: "Employer establishment card number" },
      { label: "Start date and end date of employment" },
      { label: "Last basic salary amount", hint: "EoS is calculated on basic salary only, not allowances" },
      { label: "Reason for termination", hint: "Affects calculation — resignation vs. termination" },
    ],
  },

  "uae-visa-grace-period": {
    applyUrl: "https://icp.gov.ae/en/services",
    authNote: "Apply via ICP online or AMER centres",
    prefillFields: [
      { label: "Emirates ID" },
      { label: "Passport copy" },
      { label: "Cancellation of residence visa document", hint: "Issued when residence visa is cancelled" },
      { label: "New employer offer letter (if available)" },
    ],
  },

  "uae-mohre-job-portal": {
    applyUrl: "https://www.mohre.gov.ae/en/services/mohre-services/job-seekers.aspx",
    authNote: "Register with UAE Pass or create MOHRE account",
    prefillFields: [
      { label: "Emirates ID" },
      { label: "Updated CV / resume", hint: "Upload in PDF or Word format" },
      { label: "Professional qualifications and certificates" },
      { label: "Preferred job sector and location" },
      { label: "Phone and email for recruiter contact", citizenKey: "phone" },
    ],
  },

  // ═══════════════════ UAE — START BUSINESS ═══════════════════════

  "uae-ded-trade-license": {
    applyUrl: "https://invest.dubai.gov.ae/en/set-up/",
    authNote: "Apply via Dubai DED online or visit Amer centre",
    prefillFields: [
      { label: "Emirates ID" },
      { label: "Business activity type", hint: "Choose from DED's approved activities list" },
      { label: "Trade name (3 options)", hint: "Check availability on DED portal" },
      { label: "Business address / local sponsor details" },
      { label: "Passport copy (for non-UAE national directors)" },
    ],
  },

  "uae-free-zone": {
    applyUrl: "https://www.jafza.ae/set-up-your-business/",
    authNote: "Each free zone has its own application portal",
    prefillFields: [
      { label: "Passport copy" },
      { label: "Business activity description" },
      { label: "Office space requirement (flexi-desk, shared, dedicated)" },
      { label: "Number of visa applications required" },
      { label: "Business plan (1–2 pages)" },
    ],
  },

  "uae-khalifa-fund": {
    applyUrl: "https://www.khalifafund.ae/",
    authNote: "UAE nationals only — apply via Khalifa Fund portal",
    prefillFields: [
      { label: "Emirates ID" },
      { label: "Business plan with financial projections" },
      { label: "Personal financial statement" },
      { label: "Trade licence (if already incorporated)" },
      { label: "Collateral details (if any)" },
    ],
  },

  "uae-edb-sme-loan": {
    applyUrl: "https://www.edb.gov.ae/en/services/sme-finance.html",
    prefillFields: [
      { label: "Trade licence copy" },
      { label: "Audited financial statements (2 years)", hint: "Or management accounts for startups" },
      { label: "Bank statements (6 months)" },
      { label: "Business plan and loan purpose" },
      { label: "Emirates ID and passport of shareholders" },
    ],
  },

  "uae-uae-pass": {
    applyUrl: "https://www.uaepass.ae/",
    authNote: "Download UAE Pass app from App Store or Google Play",
    prefillFields: [
      { label: "Emirates ID", hint: "Physical card required for NFC scan" },
      { label: "Mobile number registered with Emirates ID" },
      { label: "Face scan (biometric)", hint: "Done in-app" },
    ],
  },

  // ═══════════════════ RWANDA — NEW BABY ═══════════════════════

  "rw-maternity-leave": {
    applyUrl: "https://www.rssb.rw/en/services",
    authNote: "Notify employer; RSSB processes benefit automatically via payroll",
    prefillFields: [
      { label: "National ID (Indangamuntu)" },
      { label: "Employer RSSB registration number" },
      { label: "Medical certificate confirming pregnancy/birth" },
      { label: "Leave start date" },
    ],
  },

  "rw-birth-registration": {
    applyUrl: "https://irembo.gov.rw/rolportal/en/web/irembo/home",
    authNote: "Apply on Irembo with Irembo account or at local Civil Registration office",
    prefillFields: [
      { label: "Hospital birth notification (imbonerahamwe)" },
      { label: "Parents' National IDs" },
      { label: "Marriage certificate (if applicable)" },
      { label: "Baby's name as to be registered" },
    ],
  },

  "rw-mutuelle-de-sante": {
    applyUrl: "https://irembo.gov.rw/rolportal/en/web/irembo/home",
    authNote: "Apply on Irembo or at local sector office",
    prefillFields: [
      { label: "National ID (Indangamuntu)" },
      { label: "Household income category", hint: "Ubudehe category — check at sector office" },
      { label: "Number of household members" },
      { label: "Mobile Money number (MTN or Airtel) for payment" },
    ],
  },

  "rw-vup": {
    applyUrl: "https://www.minaloc.gov.rw/index.php/en/programmes/vup",
    authNote: "Register at your local sector Social Affairs office",
    prefillFields: [
      { label: "National ID" },
      { label: "Ubudehe poverty category certificate", hint: "Category 1 or 2 required — obtained at sector" },
      { label: "Household composition details" },
      { label: "Mobile Money number for transfers" },
    ],
  },

  "rw-rssb-social-security": {
    applyUrl: "https://www.rssb.rw/en/services",
    prefillFields: [
      { label: "National ID" },
      { label: "Employer RSSB number" },
      { label: "Last salary slip" },
      { label: "Reason for claim", example: "Job loss, maternity, pension" },
    ],
  },

  "rw-wda-skills": {
    applyUrl: "https://www.wda.gov.rw/index.php/en/",
    prefillFields: [
      { label: "National ID" },
      { label: "Desired skills / trade area", example: "Tailoring, ICT, Welding, Tourism" },
      { label: "Previous education certificates" },
      { label: "Preferred WDA training center (district)" },
    ],
  },

  "rw-employment-services": {
    applyUrl: "https://www.mifotra.gov.rw/",
    prefillFields: [
      { label: "National ID" },
      { label: "Updated CV" },
      { label: "Educational qualifications" },
      { label: "Preferred job sector" },
    ],
  },

  "rw-irembo-business-reg": {
    applyUrl: "https://irembo.gov.rw/rolportal/en/web/irembo/home",
    authNote: "Create an Irembo account (free) to apply online",
    prefillFields: [
      { label: "National ID" },
      { label: "Business name (3 options)", hint: "Check availability on RDB portal" },
      { label: "Business activity description" },
      { label: "Business address (province, district, sector)" },
      { label: "Proof of physical address (utility bill or lease)" },
    ],
  },

  "rw-rra-tax-registration": {
    applyUrl: "https://www.rra.gov.rw/",
    authNote: "Register on RRA online portal or visit RRA office",
    prefillFields: [
      { label: "National ID or company registration certificate" },
      { label: "Business name and TIN (if company)" },
      { label: "Business physical address" },
      { label: "Bank account details for tax payments" },
      { label: "Business activity description for VAT assessment" },
    ],
  },

  "rw-bdf-guarantee": {
    applyUrl: "https://www.bdf.rw/",
    prefillFields: [
      { label: "Business registration certificate" },
      { label: "Business plan with financial projections" },
      { label: "Bank loan application reference", hint: "Apply to a partner bank first" },
      { label: "Audited accounts or management accounts" },
      { label: "National ID of directors" },
    ],
  },

  "rw-rdb-investment-cert": {
    applyUrl: "https://www.rdb.rw/",
    authNote: "Apply on RDB portal — response within 3 working days",
    prefillFields: [
      { label: "Business registration certificate" },
      { label: "Investment project description" },
      { label: "Investment amount (minimum USD 50,000)" },
      { label: "Number of jobs to be created" },
      { label: "Environmental Impact Assessment (if applicable)" },
    ],
  },

  "rw-africa-free-trade": {
    applyUrl: "https://www.tradeportal.rw/",
    prefillFields: [
      { label: "Business registration and TIN" },
      { label: "Product description and HS code" },
      { label: "Certificate of origin", hint: "Issued by Rwanda Standards Board" },
      { label: "Invoice and packing list" },
      { label: "Target export market and buyer details" },
    ],
  },

  // ═══════════════════ INDIA — NEW BABY ═══════════════════════
  "in-maternity-benefit": {
    applyUrl: "https://labour.gov.in/maternity-benefit-act",
    authNote: "Apply through your employer's HR department",
    prefillFields: [
      { label: "Aadhaar card number" },
      { label: "Employer / company name" },
      { label: "Expected delivery date or baby's date of birth" },
      { label: "Bank account number and IFSC code for payment" },
    ],
  },
  "in-pmmvy": {
    applyUrl: "https://pmmvy.wcd.gov.in/",
    authNote: "Apply at nearest Anganwadi Centre or online via PMMVY portal",
    prefillFields: [
      { label: "Aadhaar number (mother's)" },
      { label: "Bank account number linked to Aadhaar" },
      { label: "LMP date (Last Menstrual Period)", hint: "From MCP card" },
      { label: "Mobile number registered with Aadhaar" },
    ],
  },
  "in-uip-vaccination": {
    applyUrl: "https://www.nhp.gov.in/immunization_pg",
    authNote: "Visit your nearest government health centre or Anganwadi",
    prefillFields: [
      { label: "Baby's name and date of birth" },
      { label: "Mother's Aadhaar or ID proof" },
      { label: "Local Anganwadi or PHC address" },
    ],
  },
  "in-jsy": {
    applyUrl: "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=842",
    authNote: "Register at your nearest PHC (Primary Health Centre)",
    prefillFields: [
      { label: "Aadhaar card (mother's)" },
      { label: "BPL card or Scheduled Caste/Tribe certificate (if applicable)" },
      { label: "Bank account details for cash transfer" },
      { label: "ANC registration card from PHC" },
    ],
  },
  "in-birth-registration": {
    applyUrl: "https://crsorgi.gov.in/",
    authNote: "Register online on CRS (Civil Registration System) portal or at local municipal office",
    prefillFields: [
      { label: "Hospital birth discharge summary or certificate" },
      { label: "Parents' Aadhaar cards" },
      { label: "Parents' marriage certificate" },
      { label: "Baby's name as to be registered" },
    ],
  },

  // ═══════════════════ INDIA — JOB LOSS ═══════════════════════
  "in-esi-unemployment": {
    applyUrl: "https://www.esic.gov.in/",
    authNote: "Submit claim at your nearest ESIC office or via ESIC portal",
    prefillFields: [
      { label: "ESI Insurance Number (on ESI card)" },
      { label: "Last employer's establishment code" },
      { label: "Termination letter or Form-5A from employer" },
      { label: "Bank account number linked to Aadhaar" },
    ],
  },
  "in-svanidhi": {
    applyUrl: "https://pmsvanidhi.mohua.gov.in/",
    authNote: "Apply online or through lending institutions (MFIs, Banks)",
    prefillFields: [
      { label: "Aadhaar card" },
      { label: "Vending certificate / letter of recommendation from ULB" },
      { label: "Bank account / Jan Dhan account details" },
      { label: "Mobile number for OTP verification" },
    ],
  },
  "in-ncs-portal": {
    applyUrl: "https://www.ncs.gov.in/",
    authNote: "Create free account on NCS portal",
    prefillFields: [
      { label: "Name and contact details", citizenKey: "name" },
      { label: "Aadhaar number (optional but recommended)" },
      { label: "Educational qualifications and certificates" },
      { label: "Work experience details" },
      { label: "Preferred job location and sector" },
    ],
  },
  "in-pmkvy": {
    applyUrl: "https://www.pmkvyofficial.org/",
    authNote: "Find a nearby PMKVY training centre on the portal",
    prefillFields: [
      { label: "Aadhaar card" },
      { label: "Educational qualification proof" },
      { label: "Bank account for post-placement support payment" },
      { label: "Preferred skill / trade area" },
    ],
  },

  // ═══════════════════ INDIA — START BUSINESS ═══════════════════════
  "in-udyam": {
    applyUrl: "https://udyamregistration.gov.in/",
    authNote: "Self-declaration — no documents needed, only Aadhaar + PAN",
    prefillFields: [
      { label: "Aadhaar number (proprietor/partner/director)" },
      { label: "PAN of business entity" },
      { label: "Business name and address" },
      { label: "Bank account details" },
      { label: "NIC code for main activity", hint: "Select from portal dropdown" },
    ],
  },
  "in-gst": {
    applyUrl: "https://www.gst.gov.in/",
    authNote: "Register on GST portal — required if turnover exceeds ₹40 lakh",
    prefillFields: [
      { label: "PAN of business / proprietor" },
      { label: "Aadhaar of proprietor / authorised signatory" },
      { label: "Proof of principal place of business (rent agreement / utility bill)" },
      { label: "Bank account details (cancelled cheque)" },
      { label: "Digital Signature Certificate (for companies / LLPs)" },
    ],
  },
  "in-startup-india": {
    applyUrl: "https://www.startupindia.gov.in/content/sih/en/startupgov/startup-recognition-page.html",
    authNote: "Apply for DPIIT recognition via Startup India portal",
    prefillFields: [
      { label: "Certificate of Incorporation (Company) or LLP Agreement" },
      { label: "PAN of entity" },
      { label: "Brief description of innovative product/service" },
      { label: "Director / Partner Aadhaar and DIN numbers" },
      { label: "Website or pitch deck URL (optional)" },
    ],
  },
  "in-mudra": {
    applyUrl: "https://www.mudra.org.in/",
    authNote: "Apply at any MUDRA-registered bank, NBFC, or MFI branch",
    prefillFields: [
      { label: "Aadhaar and PAN card" },
      { label: "Business plan / project report" },
      { label: "Business address proof" },
      { label: "Bank statements (last 6 months, if existing business)" },
      { label: "Loan amount and purpose" },
    ],
  },
  "in-trade-license": {
    applyUrl: "https://www.india.gov.in/topics/local-government/trade-license",
    authNote: "Apply at your local municipal corporation / panchayat office",
    prefillFields: [
      { label: "Identity proof (Aadhaar / PAN)" },
      { label: "Business premises address proof" },
      { label: "Property tax receipt (if applicable)" },
      { label: "Nature of business / trade activity" },
      { label: "No-objection certificate from landlord (if rented premises)" },
    ],
  },

  // ═══════════════════ CALIFORNIA — NEW BABY ═══════════════════════
  "ca-pfl": {
    applyUrl: "https://edd.ca.gov/en/disability/paid-family-leave/",
    authNote: "File online via SDI Online or mail DE 2501F form",
    prefillFields: [
      { label: "Social Security Number (SSN)" },
      { label: "California Driver License or ID number" },
      { label: "Employer name and address" },
      { label: "Baby's date of birth" },
      { label: "Bank account for direct deposit" },
    ],
  },
  "ca-sdi-pregnancy": {
    applyUrl: "https://edd.ca.gov/en/disability/apply_for_di_benefits_online/",
    authNote: "Apply online via SDI Online — file 9 months before expected delivery",
    prefillFields: [
      { label: "Social Security Number" },
      { label: "Employment information (last employer, wages)" },
      { label: "Physician certification (DE 2501)", hint: "Your doctor completes Part B" },
      { label: "Expected delivery date" },
      { label: "Direct deposit bank details" },
    ],
  },
  "ca-calworks": {
    applyUrl: "https://benefitscal.com/",
    authNote: "Apply online at BenefitsCal.com or visit local county office",
    prefillFields: [
      { label: "Social Security Numbers (all household members)" },
      { label: "Proof of citizenship or immigration status" },
      { label: "Birth certificates (all children)" },
      { label: "Proof of income (pay stubs, tax returns)" },
      { label: "Proof of residency (utility bill, lease)" },
    ],
  },
  "ca-wic": {
    applyUrl: "https://www.myfamily.wic.ca.gov/",
    authNote: "Schedule appointment at local WIC clinic via My Family WIC portal",
    prefillFields: [
      { label: "Proof of California residency" },
      { label: "Proof of income (pay stubs or self-declaration)" },
      { label: "Proof of identity (ID card or passport)" },
      { label: "Baby's date of birth / pregnancy documentation" },
    ],
  },
  "ca-medicaid-infant": {
    applyUrl: "https://benefitscal.com/",
    authNote: "Apply online at BenefitsCal.com (Medi-Cal)",
    prefillFields: [
      { label: "Social Security Number (parent and child)" },
      { label: "Proof of income" },
      { label: "Proof of California residency" },
      { label: "Child's date of birth" },
    ],
  },

  // ═══════════════════ CALIFORNIA — JOB LOSS ═══════════════════════
  "ca-ui": {
    applyUrl: "https://edd.ca.gov/en/unemployment/",
    authNote: "File online at UI Online — file within first week after job loss",
    prefillFields: [
      { label: "Social Security Number" },
      { label: "Last employer name, address, and phone" },
      { label: "Last day worked and reason for separation" },
      { label: "Gross earnings in last 18 months" },
      { label: "Bank account for direct deposit" },
    ],
  },
  "ca-calfresh": {
    applyUrl: "https://benefitscal.com/",
    authNote: "Apply at BenefitsCal.com or local county social services",
    prefillFields: [
      { label: "Social Security Numbers (all household members)" },
      { label: "Proof of identity (state ID, passport)" },
      { label: "Proof of California residency" },
      { label: "Proof of income or unemployment determination letter" },
      { label: "Monthly expenses (rent, utilities)" },
    ],
  },
  "ca-medicaid-jobloss": {
    applyUrl: "https://benefitscal.com/",
    authNote: "Apply at BenefitsCal.com — qualify immediately after job loss",
    prefillFields: [
      { label: "Social Security Number" },
      { label: "Proof of California residency" },
      { label: "Proof of income / job loss" },
    ],
  },
  "ca-edd-jobs": {
    applyUrl: "https://www.caljobs.ca.gov/",
    authNote: "Register free on CalJOBS — required for UI recipients",
    prefillFields: [
      { label: "Social Security Number" },
      { label: "Resume / work history" },
      { label: "Educational background" },
      { label: "Job preferences and location" },
    ],
  },

  // ═══════════════════ CALIFORNIA — START BUSINESS ═══════════════════════
  "ca-biz-registration": {
    applyUrl: "https://bizfileonline.sos.ca.gov/",
    authNote: "File online via California Secretary of State BizFile Online",
    prefillFields: [
      { label: "Proposed business entity name (check availability first)" },
      { label: "Business purpose / activity description" },
      { label: "Registered agent name and California address" },
      { label: "Director / member names and addresses" },
      { label: "Initial filing fee ($0 for LLCs until 2024)" },
    ],
  },
  "ca-sellers-permit": {
    applyUrl: "https://www.cdtfa.ca.gov/services/",
    authNote: "Register free online via CDTFA — required to collect sales tax",
    prefillFields: [
      { label: "Social Security Number or Federal EIN" },
      { label: "Business name and address" },
      { label: "Type of products or services sold" },
      { label: "Estimated monthly sales" },
      { label: "Bank account details" },
    ],
  },
  "ca-ein": {
    applyUrl: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online",
    authNote: "Apply free online — receive EIN immediately",
    prefillFields: [
      { label: "Social Security Number (responsible party)" },
      { label: "Business legal name" },
      { label: "Business entity type (LLC, S-Corp, Sole Proprietor)" },
      { label: "Reason for applying", example: "Started a new business" },
      { label: "Business mailing address" },
    ],
  },
  "ca-osba-grants": {
    applyUrl: "https://calosba.ca.gov/",
    authNote: "Check CA OSBA portal for current small business grant programs",
    prefillFields: [
      { label: "Business registration number (California)" },
      { label: "Federal EIN" },
      { label: "Business plan or project description" },
      { label: "Financial statements or projections" },
      { label: "Number of employees" },
    ],
  },
  "ca-city-license": {
    applyUrl: "https://www.calgold.ca.gov/",
    authNote: "Use CalGold to find permits required for your specific business type",
    prefillFields: [
      { label: "Business name and address" },
      { label: "Business activity / type" },
      { label: "City and county of operation" },
      { label: "State Seller's Permit number (if applicable)" },
      { label: "Federal EIN" },
    ],
  },
};
