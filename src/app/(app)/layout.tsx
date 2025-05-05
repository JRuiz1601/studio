'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react'; // Import useEffect
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import {
  Home,
  ShieldCheck,
  Lightbulb,
  User,
  Settings,
  LogOut,
  Bell,
  Bot, // Import Bot icon
  Menu,
  X,
  LifeBuoy, // Added LifeBuoy
  Phone, // Added Phone
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // For mobile menu
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { NotificationsProvider, useNotifications } from '@/context/notifications-context'; // Import context

// Updated navItems based on user specification for bottom navigation
const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/insurances', label: 'Mis Seguros', icon: ShieldCheck },
  { href: '/recommendations', label: 'Ideas', icon: Lightbulb }, // Changed label to "Ideas"
  { href: '/profile/settings', label: 'Ajustes', icon: Settings }, // Changed label to "Ajustes" and icon to Settings, linking to settings page
];

const profileMenuItems = [
   { href: '/profile/edit', label: 'Edit Profile', icon: User },
   { href: '/profile/settings', label: 'Settings', icon: Settings },
   { href: '/terms', label: 'Terms & Conditions', icon: null }, // Handled separately or link here
];

// Inner component to consume the context
function AppLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); // Initialize useRouter
  const { toast } = useToast(); // Initialize useToast
  const { unreadCount } = useNotifications(); // Get unread count from context
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

   // Placeholder user data
   const user = {
     name: 'Usuario Zyren',
     email: 'usuario@example.com',
     avatarUrl: undefined, // Use undefined for no image initially
   };

   const getInitials = (name: string) => {
     const names = name.split(' ');
     if (names.length === 1) return names[0].charAt(0).toUpperCase();
     return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
   };

  const handleLogout = () => {
      console.log("Logging out...");
      toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
      });
      // Redirect to login page
      router.push('/login');
      closeMobileMenu(); // Close mobile menu if open
  };


  const Header = () => (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
       {/* Left side: Logo and Mobile Menu Trigger */}
       <div className="flex items-center gap-4">
         {/* Mobile Menu Trigger */}
         <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
             <SheetContent side="left" className="flex flex-col p-0">
                 <div className="flex h-16 items-center justify-between border-b px-4">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={closeMobileMenu}>
                       {/* Mobile Logo */}
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-6 w-6 text-primary">
                           <defs>
                            <linearGradient id="grad1_mobile" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
                                <stop offset="100%" style={{stopColor: 'hsl(var(--accent))', stopOpacity: 1}} />
                            </linearGradient>
                           </defs>
                           <path fill="url(#grad1_mobile)" d="M50,5 C74.85,5 95,25.15 95,50 C95,74.85 74.85,95 50,95 C25.15,95 5,74.85 5,50 C5,25.15 25.15,5 50,5 Z M50,15 C30.67,15 15,30.67 15,50 C15,69.33 30.67,85 50,85 C69.33,85 85,69.33 85,50 C85,30.67 69.33,15 50,15 Z M50,30 Q60,40 50,50 Q40,60 50,70 M50,30 Q70,50 50,70 M50,30 L50,70" stroke="hsl(var(--card))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                       <span className="">Zyren</span>
                    </Link>
                     <Button variant="ghost" size="icon" onClick={closeMobileMenu} className="ml-auto">
                       <X className="h-5 w-5" />
                       <span className="sr-only">Close menu</span>
                     </Button>
                 </div>
                <nav className="flex-1 overflow-y-auto p-4">
                  <ul className="space-y-2">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} passHref>
                          <Button
                            variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'} // Use startsWith for profile/settings matching
                            className="w-full justify-start"
                            onClick={closeMobileMenu}
                          >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </Button>
                        </Link>
                      </li>
                    ))}
                     <DropdownMenuSeparator />
                      {/* Profile items in mobile menu */}
                       <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Account</DropdownMenuLabel>
                         {profileMenuItems.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href} passHref>
                                <Button
                                    variant='ghost'
                                    className="w-full justify-start"
                                    onClick={closeMobileMenu}
                                >
                                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                    {item.label}
                                </Button>
                                </Link>
                            </li>
                            ))}
                         <li>
                            <Button
                                variant='ghost'
                                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={handleLogout} // Add logout handler here for mobile
                                >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </li>
                  </ul>
                </nav>
              </SheetContent>
         </Sheet>

        {/* Desktop Logo */}
         <Link href="/dashboard" className="hidden items-center gap-2 font-semibold md:flex">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-8 w-8 text-primary">
                <defs>
                <linearGradient id="grad1_desktop" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: 'hsl(var(--accent))', stopOpacity: 1}} />
                </linearGradient>
                </defs>
                <path fill="url(#grad1_desktop)" d="M50,5 C74.85,5 95,25.15 95,50 C95,74.85 74.85,95 50,95 C25.15,95 5,74.85 5,50 C5,25.15 25.15,5 50,5 Z M50,15 C30.67,15 15,30.67 15,50 C15,69.33 30.67,85 50,85 C69.33,85 85,69.33 85,50 C85,30.67 69.33,15 50,15 Z M50,30 Q60,40 50,50 Q40,60 50,70 M50,30 Q70,50 50,70 M50,30 L50,70" stroke="hsl(var(--card))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
           <span className="text-lg">Zyren</span>
         </Link>
       </div>


      {/* Right side: Notifications and Profile */}
      <div className="flex items-center gap-4">
         {/* Notification Button with Badge */}
        <Link href="/notifications" passHref>
           <Button variant="ghost" size="icon" className="relative"> {/* Added relative positioning */}
             <Bell className="h-5 w-5" />
             <span className="sr-only">Notifications</span>
              {/* Unread Count Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                   {unreadCount > 9 ? '9+' : unreadCount} {/* Cap count display */}
                </span>
              )}
           </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                 {user.avatarUrl ? (
                     <AvatarImage src={user.avatarUrl} alt={user.name} />
                 ) : (
                     <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                 )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {profileMenuItems.map((item) => (
               <DropdownMenuItem key={item.href} asChild>
                 <Link href={item.href}>
                   {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                   <span>{item.label}</span>
                 </Link>
               </DropdownMenuItem>
             ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer" // Added cursor-pointer
             onClick={handleLogout} // Add logout handler here for desktop dropdown
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );


  const BottomNavBar = () => (
    // Fixed position, background, subtle top border/shadow for separation
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/50 bg-background shadow-[0_-2px_4px_rgba(0,0,0,0.05)] md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          // Determine if the current path starts with the item's href
          const isActive = item.href === '/dashboard'
            ? pathname === item.href // Exact match for dashboard
            : pathname.startsWith(item.href) && item.href !== '/dashboard'; // StartsWith for others, excluding dashboard

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                 'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors duration-150 ease-in-out rounded-md', // Added rounding and transition
                isActive
                  ? 'text-primary font-semibold bg-primary/5' // Active state: primary color, bolder font, subtle background
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50' // Inactive state: muted color, hover effect
              )}
              aria-current={isActive ? 'page' : undefined} // Improve accessibility
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

   // Determine FAB target and icon based on current path
   const isChatPage = pathname === '/chat';
   const fabHref = isChatPage ? '/dashboard' : '/chat';
   // Always use the Bot icon
   const FabIcon = Bot;
   const fabAriaLabel = isChatPage ? 'Go to Dashboard' : 'Chat with Zy'; // Adjusted label for clarity

  return (
    <div className="flex min-h-screen w-full flex-col">
       <Header />
       <main className="flex-1 overflow-y-auto bg-muted/40 pb-20 md:pb-0"> {/* Increased padding-bottom for mobile nav */}
         {children}
       </main>
        {/* Floating Action Button */}
        <Link href={fabHref} passHref legacyBehavior>
            <a
            aria-label={fabAriaLabel}
            className={cn(
                "fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:bottom-6 md:right-6",
                "flex items-center justify-center", // Center the icon
                "bg-primary text-primary-foreground", // Use primary colors
                "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", // Hover/Focus states
                "transition-transform hover:scale-105" // Add subtle scale animation on hover
            )}
            >
            <FabIcon className="h-7 w-7" />
            </a>
        </Link>
       <BottomNavBar />
    </div>
  );
}

// Main layout component that includes the provider
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <NotificationsProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </NotificationsProvider>
  );
}
