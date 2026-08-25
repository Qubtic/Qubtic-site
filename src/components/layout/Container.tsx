import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div className={cn('w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20', className)} {...props}>
      {children}
    </div>
  );
}
