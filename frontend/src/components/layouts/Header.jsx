import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

export const Header = () => {
    return (
        <header className="fixed top-0 right-0 z-30 flex h-[var(--header-height)] w-full items-center justify-between border-b border-border bg-white px-6 lg:left-[var(--sidebar-width)] lg:w-[calc(100%-var(--sidebar-width))]">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="relative hidden w-96 md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search products, sales, customers..."
                        className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500" />
                </Button>
                <div className="ml-2 flex items-center gap-3 border-l border-border pl-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold">Mazidul Islam</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                </div>
            </div>
        </header>
    );
};
