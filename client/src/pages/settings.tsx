import { Layout } from "@/components/layout";
import { useSettings, useUpdateSettings } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Redirect } from "wouter";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const form = useForm({
    defaultValues: {
      companyName: "", address: "", phone: "", email: "", vatNumber: "", invoicePrefix: ""
    }
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  if (user?.role !== "admin") return <Redirect to="/" />;

  if (isLoading) return <Layout><Skeleton className="w-full h-96 rounded-xl" /></Layout>;

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-3xl font-display font-bold">Company Settings</h1>
        
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(data => updateSettings.mutate(data as any))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="vatNumber" render={({ field }) => (
                  <FormItem><FormLabel>TRN / VAT Number</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
                )} />
                <div className="md:col-span-2">
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Business Address</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="invoicePrefix" render={({ field }) => (
                  <FormItem><FormLabel>Invoice Prefix</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
                )} />
              </div>

              <Button type="submit" disabled={updateSettings.isPending} className="bg-primary hover:bg-primary/90 text-black font-semibold px-8">
                {updateSettings.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
