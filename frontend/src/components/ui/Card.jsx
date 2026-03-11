import React from 'react';
import { cn } from '@/utils/cn';

export const Card = ({ className, children, ...props }) => {
    return (
        <div
            className={cn(
                'rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ className, ...props }) => (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
    <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
    <div className={cn('p-6 pt-0', className)} {...props} />
);
