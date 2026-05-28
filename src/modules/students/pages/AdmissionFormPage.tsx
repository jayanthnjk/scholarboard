/**
 * Multi-step Admission Form Page.
 * Uses Stepper, React Hook Form + Zod validation, autosave, and draft persistence.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, CheckCircle2, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Stepper } from '@/components/ui/stepper';
import { useCreateStudent } from '../api';
import { useToast } from '@/components/toast/use-toast';

// ─── Zod Schemas per Step ───────────────────────────────────────────────────

const personalSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  nationality: z.string().min(1, 'Nationality is required'),
  religion: z.string().optional(),
  category: z.string().optional(),
});

const academicSchema = z.object({
  className: z.string().min(1, 'Class is required'),
  section: z.string().min(1, 'Section is required'),
  rollNumber: z.number().optional(),
  admissionDate: z.string().min(1, 'Admission date is required'),
  previousSchool: z.string().optional(),
  transportRoute: z.string().optional(),
  hostelRoom: z.string().optional(),
});

const contactSchema = z.object({
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(5, 'Pincode is required'),
  country: z.string().min(1, 'Country is required'),
});

const guardianSchema = z.object({
  guardians: z.array(
    z.object({
      name: z.string().min(2, 'Name is required'),
      relation: z.enum(['father', 'mother', 'guardian', 'uncle', 'aunt', 'grandparent']),
      phone: z.string().min(10, 'Phone is required'),
      email: z.string().email('Invalid email'),
      occupation: z.string().min(1, 'Occupation is required'),
      annualIncome: z.number().min(0, 'Income must be positive'),
      isPrimary: z.boolean(),
    })
  ).min(1, 'At least one guardian is required'),
});

const documentsSchema = z.object({
  documents: z.array(
    z.object({
      type: z.string(),
      name: z.string(),
    })
  ).optional(),
});

// Combined schema for the full form
const admissionFormSchema = z.object({
  personal: personalSchema,
  academic: academicSchema,
  contact: contactSchema,
  guardian: guardianSchema,
  documents: documentsSchema,
});

type AdmissionFormValues = z.infer<typeof admissionFormSchema>;

const STEPS = [
  { id: 'personal', label: 'Personal Info', description: 'Basic details' },
  { id: 'academic', label: 'Academic', description: 'Class & section' },
  { id: 'contact', label: 'Contact', description: 'Address & phone' },
  { id: 'guardian', label: 'Guardian', description: 'Parent/guardian info' },
  { id: 'documents', label: 'Documents', description: 'Upload files' },
  { id: 'review', label: 'Review', description: 'Confirm & submit' },
];

const STEP_SCHEMAS = [personalSchema, academicSchema, contactSchema, guardianSchema, documentsSchema] as const;
void STEP_SCHEMAS; // Used for reference; per-step validation uses trigger()
const DRAFT_KEY = 'admission_form_draft';
const AUTOSAVE_INTERVAL = 30_000;

function AdmissionFormPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createStudent = useCreateStudent();
  const [activeStep, setActiveStep] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autosaveRef = useRef<ReturnType<typeof setInterval>>();

  // Load draft from localStorage
  const loadDraft = (): Partial<AdmissionFormValues> => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const defaultValues: AdmissionFormValues = {
    personal: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      nationality: 'Indian',
      religion: '',
      category: '',
    },
    academic: {
      className: '',
      section: '',
      admissionDate: new Date().toISOString().split('T')[0] ?? '',
      previousSchool: '',
      transportRoute: '',
      hostelRoom: '',
    },
    contact: {
      phone: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    guardian: {
      guardians: [
        {
          name: '',
          relation: 'father',
          phone: '',
          email: '',
          occupation: '',
          annualIncome: 0,
          isPrimary: true,
        },
      ],
    },
    documents: {
      documents: [],
    },
    ...loadDraft(),
  };

  const methods = useForm<AdmissionFormValues>({
    defaultValues,
    resolver: zodResolver(admissionFormSchema),
    mode: 'onChange',
  });

  const { handleSubmit, getValues, trigger } = methods;

  // Autosave
  const saveDraft = useCallback(() => {
    const values = getValues();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    setLastSaved(new Date());
  }, [getValues]);

  useEffect(() => {
    autosaveRef.current = setInterval(saveDraft, AUTOSAVE_INTERVAL);
    return () => {
      if (autosaveRef.current) clearInterval(autosaveRef.current);
    };
  }, [saveDraft]);

  // Step validation and navigation
  const getStepFieldPrefix = (step: number): string => {
    const prefixes = ['personal', 'academic', 'contact', 'guardian', 'documents'];
    return prefixes[step] ?? '';
  };

  const handleNext = async () => {
    if (activeStep >= STEPS.length - 1) return;

    const prefix = getStepFieldPrefix(activeStep);
    const isValid = await trigger(prefix as keyof AdmissionFormValues);

    if (isValid) {
      saveDraft();
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleStepClick = (index: number) => {
    if (index < activeStep) {
      setActiveStep(index);
    }
  };

  const onSubmit = async (data: AdmissionFormValues) => {
    try {
      await createStudent.mutateAsync(data as never);
      localStorage.removeItem(DRAFT_KEY);
      toast({ type: 'success', title: 'Student admitted successfully' });
      navigate('/students');
    } catch {
      toast({ type: 'error', title: 'Failed to submit admission form' });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="New Admission"
        subtitle="Complete all steps to admit a new student"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Students', href: '/students', onClick: () => navigate('/students') },
          { label: 'New Admission' },
        ]}
        actions={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {lastSaved && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Draft saved {lastSaved.toLocaleTimeString()}</span>
              </>
            )}
            <button
              onClick={saveDraft}
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
          </div>
        }
      />

      {/* Stepper */}
      <Stepper
        steps={STEPS}
        activeStep={activeStep}
        onStepClick={handleStepClick}
      />

      {/* Form content */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-lg border p-4 md:p-6">
            {activeStep === 0 && <PersonalInfoStep />}
            {activeStep === 1 && <AcademicStep />}
            {activeStep === 2 && <ContactStep />}
            {activeStep === 3 && <GuardianStep />}
            {activeStep === 4 && <DocumentsStep />}
            {activeStep === 5 && <ReviewStep />}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={activeStep === 0}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {activeStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={createStudent.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {createStudent.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Admission
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

// ─── Step Components ────────────────────────────────────────────────────────

function PersonalInfoStep() {
  const { register, formState: { errors } } = useFormContext<AdmissionFormValues>();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField label="First Name" error={errors.personal?.firstName?.message} required>
        <input {...register('personal.firstName')} className="form-input" placeholder="Enter first name" />
      </FormField>
      <FormField label="Last Name" error={errors.personal?.lastName?.message} required>
        <input {...register('personal.lastName')} className="form-input" placeholder="Enter last name" />
      </FormField>
      <FormField label="Date of Birth" error={errors.personal?.dateOfBirth?.message} required>
        <input type="date" {...register('personal.dateOfBirth')} className="form-input" />
      </FormField>
      <FormField label="Gender" error={errors.personal?.gender?.message} required>
        <select {...register('personal.gender')} className="form-input">
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </FormField>
      <FormField label="Blood Group" error={errors.personal?.bloodGroup?.message}>
        <select {...register('personal.bloodGroup')} className="form-input">
          <option value="">Select</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Nationality" error={errors.personal?.nationality?.message} required>
        <input {...register('personal.nationality')} className="form-input" placeholder="Nationality" />
      </FormField>
      <FormField label="Religion" error={errors.personal?.religion?.message}>
        <input {...register('personal.religion')} className="form-input" placeholder="Religion" />
      </FormField>
      <FormField label="Category" error={errors.personal?.category?.message}>
        <select {...register('personal.category')} className="form-input">
          <option value="">Select</option>
          {['General', 'OBC', 'SC', 'ST', 'EWS'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </FormField>
    </div>
  );
}

function AcademicStep() {
  const { register, formState: { errors } } = useFormContext<AdmissionFormValues>();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField label="Class" error={errors.academic?.className?.message} required>
        <select {...register('academic.className')} className="form-input">
          <option value="">Select Class</option>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((c) => (
            <option key={c} value={c}>Class {c}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Section" error={errors.academic?.section?.message} required>
        <select {...register('academic.section')} className="form-input">
          <option value="">Select Section</option>
          {['A', 'B', 'C', 'D'].map((s) => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Admission Date" error={errors.academic?.admissionDate?.message} required>
        <input type="date" {...register('academic.admissionDate')} className="form-input" />
      </FormField>
      <FormField label="Previous School" error={errors.academic?.previousSchool?.message}>
        <input {...register('academic.previousSchool')} className="form-input" placeholder="Previous school name" />
      </FormField>
      <FormField label="Transport Route" error={errors.academic?.transportRoute?.message}>
        <select {...register('academic.transportRoute')} className="form-input">
          <option value="">Not Required</option>
          <option value="Route 1 - North">Route 1 - North</option>
          <option value="Route 2 - South">Route 2 - South</option>
          <option value="Route 3 - East">Route 3 - East</option>
          <option value="Route 4 - West">Route 4 - West</option>
        </select>
      </FormField>
      <FormField label="Hostel Room" error={errors.academic?.hostelRoom?.message}>
        <input {...register('academic.hostelRoom')} className="form-input" placeholder="Room number (if applicable)" />
      </FormField>
    </div>
  );
}

function ContactStep() {
  const { register, formState: { errors } } = useFormContext<AdmissionFormValues>();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField label="Phone" error={errors.contact?.phone?.message} required>
        <input type="tel" {...register('contact.phone')} className="form-input" placeholder="+91 9876543210" />
      </FormField>
      <FormField label="Email" error={errors.contact?.email?.message} required>
        <input type="email" {...register('contact.email')} className="form-input" placeholder="student@example.com" />
      </FormField>
      <FormField label="Address Line 1" error={errors.contact?.addressLine1?.message} required>
        <input {...register('contact.addressLine1')} className="form-input" placeholder="Street address" />
      </FormField>
      <FormField label="Address Line 2" error={errors.contact?.addressLine2?.message}>
        <input {...register('contact.addressLine2')} className="form-input" placeholder="Apartment, suite, etc." />
      </FormField>
      <FormField label="City" error={errors.contact?.city?.message} required>
        <input {...register('contact.city')} className="form-input" placeholder="City" />
      </FormField>
      <FormField label="State" error={errors.contact?.state?.message} required>
        <input {...register('contact.state')} className="form-input" placeholder="State" />
      </FormField>
      <FormField label="Pincode" error={errors.contact?.pincode?.message} required>
        <input {...register('contact.pincode')} className="form-input" placeholder="110001" />
      </FormField>
      <FormField label="Country" error={errors.contact?.country?.message} required>
        <input {...register('contact.country')} className="form-input" placeholder="India" />
      </FormField>
    </div>
  );
}

function GuardianStep() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<AdmissionFormValues>();
  const guardians = watch('guardian.guardians');

  const addGuardian = () => {
    setValue('guardian.guardians', [
      ...guardians,
      { name: '', relation: 'guardian', phone: '', email: '', occupation: '', annualIncome: 0, isPrimary: false },
    ]);
  };

  const removeGuardian = (index: number) => {
    if (guardians.length <= 1) return;
    setValue(
      'guardian.guardians',
      guardians.filter((_g: unknown, i: number) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      {guardians.map((_guardian: unknown, index: number) => (
        <div key={index} className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Guardian {index + 1}</h4>
            {guardians.length > 1 && (
              <button
                type="button"
                onClick={() => removeGuardian(index)}
                className="text-sm text-destructive hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Name" error={errors.guardian?.guardians?.[index]?.name?.message} required>
              <input {...register(`guardian.guardians.${index}.name`)} className="form-input" placeholder="Full name" />
            </FormField>
            <FormField label="Relation" error={errors.guardian?.guardians?.[index]?.relation?.message} required>
              <select {...register(`guardian.guardians.${index}.relation`)} className="form-input">
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
                <option value="uncle">Uncle</option>
                <option value="aunt">Aunt</option>
                <option value="grandparent">Grandparent</option>
              </select>
            </FormField>
            <FormField label="Phone" error={errors.guardian?.guardians?.[index]?.phone?.message} required>
              <input type="tel" {...register(`guardian.guardians.${index}.phone`)} className="form-input" />
            </FormField>
            <FormField label="Email" error={errors.guardian?.guardians?.[index]?.email?.message} required>
              <input type="email" {...register(`guardian.guardians.${index}.email`)} className="form-input" />
            </FormField>
            <FormField label="Occupation" error={errors.guardian?.guardians?.[index]?.occupation?.message} required>
              <input {...register(`guardian.guardians.${index}.occupation`)} className="form-input" />
            </FormField>
            <FormField label="Annual Income" error={errors.guardian?.guardians?.[index]?.annualIncome?.message} required>
              <input
                type="number"
                {...register(`guardian.guardians.${index}.annualIncome`, { valueAsNumber: true })}
                className="form-input"
              />
            </FormField>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register(`guardian.guardians.${index}.isPrimary`)}
                className="h-4 w-4 rounded border-input"
                id={`primary-${index}`}
              />
              <label htmlFor={`primary-${index}`} className="text-sm">Primary Guardian</label>
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addGuardian}
        className="rounded-md border border-dashed px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        + Add Another Guardian
      </button>
    </div>
  );
}

function DocumentsStep() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Upload required documents. You can also upload documents later from the student profile.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          'Birth Certificate',
          'Transfer Certificate',
          'Previous Marksheet',
          'Passport Photo',
          'Aadhar Card',
          'Medical Report',
        ].map((doc) => (
          <div key={doc} className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm font-medium">{doc}</p>
            <input
              type="file"
              className="mt-2 text-xs text-muted-foreground file:mr-2 file:rounded file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:text-primary"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewStep() {
  const { getValues } = useFormContext<AdmissionFormValues>();
  const values = getValues();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review Admission Details</h3>

      <ReviewSection title="Personal Information">
        <ReviewField label="Name" value={`${values.personal.firstName} ${values.personal.lastName}`} />
        <ReviewField label="Date of Birth" value={values.personal.dateOfBirth} />
        <ReviewField label="Gender" value={values.personal.gender} />
        <ReviewField label="Nationality" value={values.personal.nationality} />
      </ReviewSection>

      <ReviewSection title="Academic Details">
        <ReviewField label="Class" value={values.academic.className} />
        <ReviewField label="Section" value={values.academic.section} />
        <ReviewField label="Admission Date" value={values.academic.admissionDate} />
        <ReviewField label="Previous School" value={values.academic.previousSchool || 'N/A'} />
      </ReviewSection>

      <ReviewSection title="Contact Information">
        <ReviewField label="Phone" value={values.contact.phone} />
        <ReviewField label="Email" value={values.contact.email} />
        <ReviewField label="City" value={values.contact.city} />
        <ReviewField label="State" value={values.contact.state} />
      </ReviewSection>

      <ReviewSection title="Guardians">
        {values.guardian.guardians.map((g: { name: string; relation: string }, i: number) => (
          <ReviewField key={i} label={`Guardian ${i + 1}`} value={`${g.name} (${g.relation})`} />
        ))}
      </ReviewSection>

      <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Please review all details carefully before submitting. Once submitted, the student will be
          registered in the system.
        </p>
      </div>
    </div>
  );
}

// ─── Shared Form UI ─────────────────────────────────────────────────────────

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4">
      <h4 className="mb-3 font-medium text-sm text-muted-foreground uppercase tracking-wider">{title}</h4>
      <div className="grid gap-2 md:grid-cols-2">{children}</div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm font-medium capitalize">{value}</p>
    </div>
  );
}

export { AdmissionFormPage };
