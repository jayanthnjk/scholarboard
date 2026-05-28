import React from 'react';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';

interface StepperStep {
  /** Unique step identifier */
  id: string;
  /** Step label */
  label: string;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Whether the step is optional */
  optional?: boolean;
}

interface StepperProps extends React.HTMLAttributes<HTMLElement> {
  /** Array of step definitions */
  steps: StepperStep[];
  /** Currently active step index (0-based) */
  activeStep: number;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Callback when a completed step is clicked */
  onStepClick?: (index: number) => void;
}

function Stepper({
  steps,
  activeStep,
  orientation = 'horizontal',
  onStepClick,
  className,
  ...props
}: StepperProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <nav
      aria-label="Progress"
      className={cn(
        'flex',
        isHorizontal ? 'items-center justify-between' : 'flex-col gap-2',
        className
      )}
      {...props}
    >
      <ol
        className={cn(
          'flex w-full',
          isHorizontal ? 'items-center' : 'flex-col gap-0'
        )}
        role="list"
      >
        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isCurrent = index === activeStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <li
              key={step.id}
              className={cn(
                'flex',
                isHorizontal
                  ? 'flex-1 items-center'
                  : 'relative pb-8 last:pb-0'
              )}
            >
              {/* Connector line (vertical) */}
              {!isHorizontal && index < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute left-4 top-9 h-full w-0.5 -translate-x-1/2',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                  aria-hidden="true"
                />
              )}

              <div
                className={cn(
                  'flex',
                  isHorizontal ? 'flex-col items-center' : 'items-start gap-3'
                )}
              >
                {/* Step indicator */}
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(index)}
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                    isCompleted &&
                      'border-primary bg-primary text-primary-foreground',
                    isCurrent &&
                      'border-primary bg-background text-primary',
                    !isCompleted &&
                      !isCurrent &&
                      'border-muted-foreground/30 bg-background text-muted-foreground',
                    isClickable && 'cursor-pointer hover:bg-primary/90 hover:text-primary-foreground'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Step ${index + 1}: ${step.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : step.icon ? (
                    <span className="[&>svg]:h-4 [&>svg]:w-4">{step.icon}</span>
                  ) : (
                    index + 1
                  )}
                </button>

                {/* Step content */}
                <div
                  className={cn(
                    isHorizontal ? 'mt-2 text-center' : ''
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isCurrent
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                  {step.optional && (
                    <span className="text-xs text-muted-foreground italic">
                      Optional
                    </span>
                  )}
                </div>
              </div>

              {/* Connector line (horizontal) */}
              {isHorizontal && index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Stepper };
export type { StepperProps, StepperStep };
