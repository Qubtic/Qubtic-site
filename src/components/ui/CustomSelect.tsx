'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function CustomSelect({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  name,
  disabled = false,
  className,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string>(
    defaultValue ?? (options[0]?.value || '')
  );
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const selectedOption = options.find((opt) => opt.value === currentValue) || null;

  // Handle outside click to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    onChange?.(val);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && options[focusedIndex]) {
          handleSelect(options[focusedIndex].value);
        } else {
          setIsOpen((prev) => !prev);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.length - 1);
        } else {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-[#141915] mb-2">
          {label}
        </label>
      )}

      {/* Hidden input for HTML form submission compatibility */}
      {name && <input type="hidden" name={name} value={currentValue} />}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#F8F7F2] border transition-all duration-200 text-left text-sm font-medium focus:outline-none cursor-pointer',
          isOpen
            ? 'border-2 border-[#0C3823] bg-white shadow-sm'
            : 'border border-[#E5E0D8] hover:border-[#0C3823]/40 hover:bg-[#F3F1EA]',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
          error && 'border-red-500 focus:ring-red-500'
        )}
      >
        <span className={cn(selectedOption ? 'text-[#141915]' : 'text-[#9EA39C]')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[#0C3823] transition-transform duration-300 ml-2 shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-auto rounded-2xl bg-white border border-[#E5E0D8] p-1.5 shadow-xl shadow-[#0C3823]/10 focus:outline-none backdrop-blur-md"
            role="listbox"
          >
            {options.map((option, index) => {
              const isSelected = option.value === currentValue;
              const isFocused = index === focusedIndex;

              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={cn(
                    'group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer select-none',
                    isSelected
                      ? 'bg-[#0C3823] text-white font-semibold shadow-sm'
                      : isFocused
                      ? 'bg-[#F8F7F2] text-[#0C3823]'
                      : 'text-[#141915] hover:bg-[#F8F7F2] hover:text-[#0C3823]'
                  )}
                >
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.description && (
                      <span
                        className={cn(
                          'text-xs transition-colors',
                          isSelected ? 'text-white/80' : 'text-[#666C64]'
                        )}
                      >
                        {option.description}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
