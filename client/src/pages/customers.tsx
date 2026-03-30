import { useState } from "react";
import * as React from "react";
import { Layout } from "@/components/layout";
import { useCustomers, useCreateCustomer, useUpdateCustomer } from "@/hooks/use-api";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { insertCustomerSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export default function Customers() {
  const { data: customers = [], isLoading } = useCustomers();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-display font-bold">Customers</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search customers..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white border-border"
              />
            </div>
            <CustomerDialog open={open} setOpen={setOpen} editId={editId} onEditIdChange={setEditId} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Company / Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No customers found.</TableCell></TableRow>
              ) : (
                filtered.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-foreground">{customer.company}</div>
                      <div className="text-sm text-muted-foreground">{customer.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Mail className="w-3 h-3" /> {customer.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" /> {customer.phone || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{customer.country || 'N/A'}</TableCell>
                    <TableCell><StatusBadge status={customer.status!} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => { setEditId(customer.id); setOpen(true); }}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}

function CustomerDialog({ open, setOpen, editId, onEditIdChange }: { open: boolean, setOpen: (val: boolean) => void, editId: number | null, onEditIdChange: (id: number | null) => void }) {
  const { data: customers = [] } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const editingCustomer = editId ? customers.find(c => c.id === editId) : null;
  
  const form = useForm<z.infer<typeof insertCustomerSchema>>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: { name: "", company: "", email: "", phone: "", country: "", currency: "AED", status: "active", address: "", whatsapp: "", paymentTerms: "Net 30", taxNumber: "", notes: "" }
  });

  // Update form when editing customer changes
  React.useEffect(() => {
    if (editingCustomer) {
      form.reset({
        name: editingCustomer.name,
        company: editingCustomer.company,
        email: editingCustomer.email || "",
        phone: editingCustomer.phone || "",
        country: editingCustomer.country || "",
        currency: editingCustomer.currency || "AED",
        status: editingCustomer.status || "active",
        address: editingCustomer.address || "",
        whatsapp: editingCustomer.whatsapp || "",
        paymentTerms: editingCustomer.paymentTerms || "Net 30",
        taxNumber: editingCustomer.taxNumber || "",
        notes: editingCustomer.notes || ""
      });
    } else if (open && !editingCustomer) {
      form.reset();
    }
  }, [editingCustomer, open, form]);

  const onSubmit = (data: z.infer<typeof insertCustomerSchema>) => {
    if (editingCustomer) {
      updateCustomer.mutate({ id: editingCustomer.id, data }, {
        onSuccess: () => { setOpen(false); form.reset(); onEditIdChange(null); }
      });
    } else {
      createCustomer.mutate(data, {
        onSuccess: () => { setOpen(false); form.reset(); }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-black font-semibold shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="company" render={({ field }) => (
                <FormItem><FormLabel>Company Name *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Contact Person *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} value={field.value || ''} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem><FormLabel>Currency</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="taxNumber" render={({ field }) => (
              <FormItem><FormLabel>Tax number (TRN / VAT)</FormLabel><FormControl><Input {...field} value={field.value || ''} placeholder="e.g. 100123456700003" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="whatsapp" render={({ field }) => (
              <FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="paymentTerms" render={({ field }) => (
              <FormItem><FormLabel>Payment Terms</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Notes</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
            )} />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createCustomer.isPending || updateCustomer.isPending} className="w-full bg-black text-white hover:bg-black/90">
                {createCustomer.isPending || updateCustomer.isPending ? "Saving..." : "Save Customer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
