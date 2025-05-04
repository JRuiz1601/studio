'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera } from 'lucide-react';


// Placeholder schema - adapt based on actual editable fields
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number').optional(),
  // identificationNumber: z.string().min(1, 'ID number is required'), // Likely not editable
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Placeholder user data - fetch this from your auth context/API
const mockUserData = {
  firstName: 'Usuario',
  lastName: 'Zyren',
  email: 'usuario@example.com',
  phone: '123-456-7890',
  identificationNumber: '123456789', // Display only, not editable
  avatarUrl: undefined, // or a URL string
};


export default function EditProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // Simulate fetching user data
  const { toast } = useToast();
   const [avatarPreview, setAvatarPreview] = useState<string | undefined>(mockUserData.avatarUrl); // For previewing avatar changes


  // Simulate data fetching
  useState(() => {
    setTimeout(() => {
      setIsFetching(false);
      // Reset form with fetched data
       form.reset({
           firstName: mockUserData.firstName,
           lastName: mockUserData.lastName,
           email: mockUserData.email,
           phone: mockUserData.phone || '',
       });
        setAvatarPreview(mockUserData.avatarUrl);
    }, 1000);
  });


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

   const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       const file = event.target.files?.[0];
       if (file) {
         // TODO: Implement actual file upload logic here
         console.log("File selected:", file.name);
         // Create a preview URL
         const reader = new FileReader();
         reader.onloadend = () => {
           setAvatarPreview(reader.result as string);
         };
         reader.readAsDataURL(file);
         // You would typically upload the file here and get back a URL
         // Then potentially update the form state if the URL is part of the form
       }
     };


  async function onSubmit(values: ProfileFormValues) {
    setIsLoading(true);
    console.log('Updating profile:', values);
     // Include avatar update if implemented
     if (avatarPreview && avatarPreview !== mockUserData.avatarUrl) {
         console.log("Avatar needs update (logic not fully implemented)");
         // TODO: Handle avatar upload/update API call
     }

    // TODO: Replace with actual API call to update user profile
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

    setIsLoading(false);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
    // Optionally refetch user data or update local state
    // Example: Update mock data for demonstration
     Object.assign(mockUserData, values);
     if (avatarPreview) mockUserData.avatarUrl = avatarPreview;

     form.reset(values); // Reset form with the saved values to clear dirty state
  }

   const getInitials = (firstName: string, lastName: string) => {
     if (!firstName && !lastName) return '?';
     const firstInitial = firstName ? firstName.charAt(0) : '';
     const lastInitial = lastName ? lastName.charAt(0) : '';
     return `${firstInitial}${lastInitial}`.toUpperCase();
   };


  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
              <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                      <Skeleton className="h-20 w-20 rounded-full" />
                      <div className="space-y-2">
                         <Skeleton className="h-4 w-32" />
                         <Skeleton className="h-4 w-24" />
                      </div>
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
              </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 {/* Avatar Upload */}
                 <div className="flex items-center space-x-4">
                     <div className="relative">
                         <Avatar className="h-20 w-20">
                           <AvatarImage src={avatarPreview} alt="User Avatar" />
                           <AvatarFallback>{getInitials(form.watch('firstName'), form.watch('lastName'))}</AvatarFallback>
                         </Avatar>
                         <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90">
                           <Camera className="h-4 w-4" />
                           <input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} disabled={isLoading}/>
                         </label>
                     </div>
                      <div>
                        <p className="text-sm font-medium">{mockUserData.identificationNumber}</p>
                        <p className="text-xs text-muted-foreground">Identification Number (Cannot be changed)</p>
                      </div>
                 </div>


                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Enter your phone number" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </form>
            </Form>
          )}
        </CardContent>
         {!isFetching && (
             <CardFooter>
                <Button
                    type="submit"
                    form="profile-form" // Link button to the form outside of its direct hierarchy if needed
                    disabled={isLoading || !form.formState.isDirty}
                    onClick={form.handleSubmit(onSubmit)} // Ensure submit is triggered
                    className="w-full md:w-auto"
                 >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                 </Button>
             </CardFooter>
         )}
      </Card>
    </div>
  );
}
