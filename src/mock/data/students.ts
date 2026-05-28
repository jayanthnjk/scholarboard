/**
 * Student data generator for mock server.
 * Generates 500-2000 realistic student records per tenant.
 * @see Task 2.6 - MSW mock server system
 */

import { TENANT_SUNRISE_ID, TENANT_METRO_ID } from './tenants';

/** Student gender */
export type Gender = 'male' | 'female' | 'other';

/** Student blood group */
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

/** Student status */
export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'transferred' | 'suspended' | 'dropped';

/** Guardian relationship */
export type GuardianRelation = 'father' | 'mother' | 'guardian' | 'uncle' | 'aunt' | 'grandparent';

/** Document type */
export type DocumentType = 'birth_certificate' | 'transfer_certificate' | 'marksheet' | 'photo' | 'aadhar' | 'passport' | 'medical_report';

/** Guardian record */
export interface Guardian {
  readonly id: string;
  readonly name: string;
  readonly relation: GuardianRelation;
  readonly phone: string;
  readonly email: string;
  readonly occupation: string;
  readonly annualIncome: number;
  readonly isPrimary: boolean;
}

/** Student document */
export interface StudentDocument {
  readonly id: string;
  readonly type: DocumentType;
  readonly name: string;
  readonly url: string;
  readonly uploadedAt: string;
  readonly verified: boolean;
}

/** Medical information */
export interface MedicalInfo {
  readonly bloodGroup: BloodGroup;
  readonly allergies: readonly string[];
  readonly conditions: readonly string[];
  readonly emergencyContact: string;
  readonly emergencyPhone: string;
  readonly lastCheckupDate: string;
}

/** Address */
export interface Address {
  readonly line1: string;
  readonly line2: string;
  readonly city: string;
  readonly state: string;
  readonly pincode: string;
  readonly country: string;
}

/** Complete student record */
export interface StudentRecord {
  readonly id: string;
  readonly studentId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly dateOfBirth: string;
  readonly gender: Gender;
  readonly className: string;
  readonly section: string;
  readonly rollNumber: number;
  readonly admissionDate: string;
  readonly admissionNumber: string;
  readonly phone: string;
  readonly email: string;
  readonly address: Address;
  readonly medical: MedicalInfo;
  readonly guardians: readonly Guardian[];
  readonly documents: readonly StudentDocument[];
  readonly feeStatus: 'paid' | 'partial' | 'overdue' | 'waived';
  readonly status: StudentStatus;
  readonly tenantId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly avatar: string;
  readonly nationality: string;
  readonly religion: string;
  readonly category: string;
  readonly previousSchool: string;
  readonly transportRoute: string | null;
  readonly hostelRoom: string | null;
}

// --- Seed data for realistic generation ---

const FIRST_NAMES_MALE = [
  'Aarav', 'Arjun', 'Vihaan', 'Aditya', 'Sai', 'Reyansh', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Dhruv', 'Kabir', 'Ritvik', 'Anirudh', 'Vivaan', 'Advait',
  'Arnav', 'Lakshay', 'Karthik', 'Pranav', 'Rohan', 'Dev', 'Yash', 'Sahil',
  'Rahul', 'Amit', 'Nikhil', 'Varun', 'Manish', 'Harish',
];

const FIRST_NAMES_FEMALE = [
  'Aadhya', 'Ananya', 'Diya', 'Isha', 'Kavya', 'Mira', 'Nisha', 'Priya',
  'Riya', 'Sara', 'Tanya', 'Vanya', 'Zara', 'Aisha', 'Bhavya', 'Charvi',
  'Deepika', 'Ekta', 'Fatima', 'Gauri', 'Hina', 'Jiya', 'Kiara', 'Lavanya',
  'Meera', 'Neha', 'Pooja', 'Shreya', 'Tanvi', 'Uma',
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Reddy', 'Nair',
  'Joshi', 'Mishra', 'Iyer', 'Desai', 'Mehta', 'Shah', 'Das', 'Rao',
  'Malhotra', 'Banerjee', 'Choudhury', 'Agarwal', 'Pillai', 'Hegde',
  'Kapoor', 'Bhat', 'Saxena', 'Chauhan', 'Tiwari', 'Pandey',
];

const US_FIRST_NAMES_MALE = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
  'Thomas', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Andrew', 'Joshua', 'Ethan',
  'Noah', 'Liam', 'Mason', 'Logan',
];

const US_FIRST_NAMES_FEMALE = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Susan', 'Jessica', 'Sarah',
  'Emily', 'Emma', 'Olivia', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia',
  'Harper', 'Evelyn', 'Abigail', 'Ella',
];

const US_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
];

const CLASSES_SCHOOL = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const CLASSES_COLLEGE = ['B.Tech Year 1', 'B.Tech Year 2', 'B.Tech Year 3', 'B.Tech Year 4', 'M.Tech Year 1', 'M.Tech Year 2', 'MBA Year 1', 'MBA Year 2'];
const SECTIONS_COLLEGE = ['CS-A', 'CS-B', 'EC-A', 'EC-B', 'ME-A', 'MBA-A'];

const CITIES_INDIA = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const STATES_INDIA = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Maharashtra', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'];
const CITIES_US = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin'];
const STATES_US = ['New York', 'California', 'Illinois', 'Texas', 'Arizona', 'Texas', 'California', 'Texas', 'California', 'Texas'];

const ALLERGIES = ['None', 'Peanuts', 'Dust', 'Pollen', 'Dairy', 'Gluten', 'Shellfish', 'Penicillin'];
const CONDITIONS = ['None', 'Asthma', 'Diabetes Type 1', 'Epilepsy', 'ADHD', 'Myopia'];
const OCCUPATIONS = ['Engineer', 'Doctor', 'Teacher', 'Business', 'Lawyer', 'Accountant', 'Government Employee', 'Self Employed', 'Farmer', 'IT Professional'];
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const TRANSPORT_ROUTES = ['Route 1 - North', 'Route 2 - South', 'Route 3 - East', 'Route 4 - West', 'Route 5 - Central'];
const PREVIOUS_SCHOOLS = ['DAV Public School', 'Kendriya Vidyalaya', 'St. Xavier\'s School', 'Delhi Public School', 'Ryan International', 'Amity School'];

// --- Seeded random number generator ---

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xffffffff;
    return (this.seed >>> 0) / 0xffffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(arr: readonly T[]): T {
    return arr[this.nextInt(0, arr.length - 1)] as T;
  }

  pickMultiple<T>(arr: readonly T[], count: number): T[] {
    const result: T[] = [];
    const available = [...arr];
    for (let i = 0; i < Math.min(count, available.length); i++) {
      const idx = this.nextInt(0, available.length - 1);
      result.push(available[idx] as T);
      available.splice(idx, 1);
    }
    return result;
  }
}

/** Generate a date string within range */
function generateDate(rng: SeededRandom, yearMin: number, yearMax: number): string {
  const year = rng.nextInt(yearMin, yearMax);
  const month = rng.nextInt(1, 12);
  const day = rng.nextInt(1, 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Generate phone number */
function generateIndianPhone(rng: SeededRandom): string {
  const prefix = rng.pick(['9', '8', '7', '6']);
  let phone = `+91-${prefix}`;
  for (let i = 0; i < 9; i++) {
    phone += String(rng.nextInt(0, 9));
  }
  return phone;
}

function generateUSPhone(rng: SeededRandom): string {
  const area = rng.nextInt(200, 999);
  const mid = rng.nextInt(200, 999);
  const last = rng.nextInt(1000, 9999);
  return `+1-${area}-${mid}-${last}`;
}

/** Generate students for a specific tenant */
function generateStudentsForTenant(
  tenantId: string,
  count: number,
  seed: number,
): StudentRecord[] {
  const rng = new SeededRandom(seed);
  const isSchool = tenantId === TENANT_SUNRISE_ID;
  const students: StudentRecord[] = [];

  const firstNamesMale = isSchool ? FIRST_NAMES_MALE : US_FIRST_NAMES_MALE;
  const firstNamesFemale = isSchool ? FIRST_NAMES_FEMALE : US_FIRST_NAMES_FEMALE;
  const lastNames = isSchool ? LAST_NAMES : US_LAST_NAMES;
  const classes = isSchool ? CLASSES_SCHOOL : CLASSES_COLLEGE;
  const sections = isSchool ? SECTIONS : SECTIONS_COLLEGE;
  const cities = isSchool ? CITIES_INDIA : CITIES_US;
  const states = isSchool ? STATES_INDIA : STATES_US;
  const generatePhone = isSchool ? generateIndianPhone : generateUSPhone;
  const country = isSchool ? 'India' : 'United States';
  const emailDomain = isSchool ? 'sunriseacademy.edu' : 'metrouniversity.edu';

  for (let i = 0; i < count; i++) {
    const gender: Gender = rng.next() > 0.48 ? 'male' : (rng.next() > 0.02 ? 'female' : 'other');
    const firstName = gender === 'male'
      ? rng.pick(firstNamesMale)
      : rng.pick(firstNamesFemale);
    const lastName = rng.pick(lastNames);
    const fullName = `${firstName} ${lastName}`;

    const classIdx = rng.nextInt(0, classes.length - 1);
    const className = classes[classIdx] as string;
    const section = rng.pick(sections);
    const rollNumber = rng.nextInt(1, 60);

    const cityIdx = rng.nextInt(0, cities.length - 1);
    const city = cities[cityIdx] as string;
    const state = states[cityIdx] as string;

    const dobYear = isSchool ? rng.nextInt(2006, 2018) : rng.nextInt(1998, 2005);
    const dob = generateDate(rng, dobYear, dobYear);
    const admissionDate = generateDate(rng, 2020, 2024);

    const studentId = isSchool
      ? `SA${String(2024)}${String(i + 1).padStart(4, '0')}`
      : `MU${String(2024)}${String(i + 1).padStart(5, '0')}`;

    const guardianCount = rng.nextInt(1, 2);
    const guardians: Guardian[] = [];
    for (let g = 0; g < guardianCount; g++) {
      const gGender = g === 0 ? 'male' : 'female';
      const gFirstName = gGender === 'male' ? rng.pick(firstNamesMale) : rng.pick(firstNamesFemale);
      guardians.push({
        id: `guardian_${i}_${g}`,
        name: `${gFirstName} ${lastName}`,
        relation: g === 0 ? 'father' : 'mother',
        phone: generatePhone(rng),
        email: `${gFirstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
        occupation: rng.pick(OCCUPATIONS),
        annualIncome: rng.nextInt(3, 50) * 100000,
        isPrimary: g === 0,
      });
    }

    const docCount = rng.nextInt(1, 4);
    const docTypes: DocumentType[] = ['birth_certificate', 'photo', 'aadhar', 'marksheet', 'transfer_certificate', 'medical_report'];
    const documents: StudentDocument[] = rng.pickMultiple(docTypes, docCount).map((type, dIdx) => ({
      id: `doc_${i}_${dIdx}`,
      type,
      name: `${type.replace(/_/g, ' ')}.pdf`,
      url: `/documents/${studentId}/${type}.pdf`,
      uploadedAt: generateDate(rng, 2023, 2024) + 'T10:00:00Z',
      verified: rng.next() > 0.3,
    }));

    const allergies = rng.next() > 0.7
      ? rng.pickMultiple(ALLERGIES.filter((a) => a !== 'None'), rng.nextInt(1, 2))
      : ['None'];
    const conditions = rng.next() > 0.85
      ? rng.pickMultiple(CONDITIONS.filter((c) => c !== 'None'), 1)
      : ['None'];

    const statuses: StudentStatus[] = ['active', 'active', 'active', 'active', 'active', 'inactive', 'graduated', 'transferred'];
    const feeStatuses: Array<'paid' | 'partial' | 'overdue' | 'waived'> = ['paid', 'paid', 'paid', 'partial', 'overdue', 'waived'];

    const student: StudentRecord = {
      id: `student_${tenantId}_${String(i + 1).padStart(5, '0')}`,
      studentId,
      firstName,
      lastName,
      fullName,
      dateOfBirth: dob,
      gender,
      className,
      section,
      rollNumber,
      admissionDate,
      admissionNumber: `ADM/${isSchool ? 'SA' : 'MU'}/${2024}/${String(i + 1).padStart(4, '0')}`,
      phone: generatePhone(rng),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rng.nextInt(1, 99)}@${emailDomain}`,
      address: {
        line1: `${rng.nextInt(1, 999)}, ${rng.pick(['Main Street', 'Park Avenue', 'MG Road', 'Ring Road', 'Lake View', 'Hill Top'])}`,
        line2: rng.pick(['Apt 1', 'Floor 2', 'Block A', 'Tower B', '']),
        city,
        state,
        pincode: isSchool ? String(rng.nextInt(100000, 999999)) : String(rng.nextInt(10000, 99999)),
        country,
      },
      medical: {
        bloodGroup: rng.pick(BLOOD_GROUPS),
        allergies,
        conditions,
        emergencyContact: guardians[0]?.name ?? fullName,
        emergencyPhone: guardians[0]?.phone ?? generatePhone(rng),
        lastCheckupDate: generateDate(rng, 2023, 2024),
      },
      guardians,
      documents,
      feeStatus: rng.pick(feeStatuses),
      status: rng.pick(statuses),
      tenantId,
      createdAt: admissionDate + 'T09:00:00Z',
      updatedAt: generateDate(rng, 2024, 2024) + 'T14:00:00Z',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName.toLowerCase()}${i}`,
      nationality: country === 'India' ? 'Indian' : 'American',
      religion: isSchool ? rng.pick(RELIGIONS) : '',
      category: isSchool ? rng.pick(CATEGORIES) : '',
      previousSchool: rng.next() > 0.4 ? rng.pick(PREVIOUS_SCHOOLS) : '',
      transportRoute: rng.next() > 0.6 ? rng.pick(TRANSPORT_ROUTES) : null,
      hostelRoom: rng.next() > 0.85 ? `Room ${rng.nextInt(101, 410)}` : null,
    };

    students.push(student);
  }

  return students;
}

/** In-memory student data store - generated once, persisted during session */
let sunriseStudents: StudentRecord[] | null = null;
let metroStudents: StudentRecord[] | null = null;

/** Get or generate students for Sunrise Academy */
export function getSunriseStudents(): StudentRecord[] {
  if (!sunriseStudents) {
    sunriseStudents = generateStudentsForTenant(TENANT_SUNRISE_ID, 800, 42);
  }
  return sunriseStudents;
}

/** Get or generate students for Metro University */
export function getMetroStudents(): StudentRecord[] {
  if (!metroStudents) {
    metroStudents = generateStudentsForTenant(TENANT_METRO_ID, 1200, 84);
  }
  return metroStudents;
}

/** Get students for a tenant */
export function getStudentsForTenant(tenantId: string): StudentRecord[] {
  if (tenantId === TENANT_SUNRISE_ID) return getSunriseStudents();
  if (tenantId === TENANT_METRO_ID) return getMetroStudents();
  // Default to Sunrise Academy in development when no tenant is set
  return getSunriseStudents();
}

/** Add a student to the in-memory store */
export function addStudent(student: StudentRecord): void {
  const students = getStudentsForTenant(student.tenantId);
  students.push(student);
}

/** Update a student in the in-memory store */
export function updateStudent(id: string, tenantId: string, updates: Partial<StudentRecord>): StudentRecord | null {
  const students = getStudentsForTenant(tenantId);
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const updated = { ...students[idx], ...updates, updatedAt: new Date().toISOString() } as StudentRecord;
  students[idx] = updated;
  return updated;
}

/** Delete a student from the in-memory store */
export function deleteStudent(id: string, tenantId: string): boolean {
  const students = getStudentsForTenant(tenantId);
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  students.splice(idx, 1);
  return true;
}

/** Reset all student data */
export function resetStudentData(): void {
  sunriseStudents = null;
  metroStudents = null;
}
