import { useState } from "react";
import * as React from "react";
import { Layout } from "@/components/layout";
import { useProducts, useCreateProduct, useUpdateProduct } from "@/hooks/use-api";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { insertProductSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export default function Products() {
  const { data: products = [], isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-display font-bold">Products & Services</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white border-border"
              />
            </div>
            <ProductDialog open={open} setOpen={setOpen} editId={editId} onEditIdChange={setEditId} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price (AED)</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No products found.</TableCell></TableRow>
              ) : (
                filtered.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                    <TableCell className="font-semibold">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right font-medium">{Number(product.price).toLocaleString(undefined, {minimumFractionDigits:2})}</TableCell>
                    <TableCell className="text-right font-medium">{product.stock || 0}</TableCell>
                    <TableCell><StatusBadge status={product.status!} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => { setEditId(product.id); setOpen(true); }}>Edit</Button>
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

function ProductDialog({ open, setOpen, editId, onEditIdChange }: { open: boolean, setOpen: (val: boolean) => void, editId: number | null, onEditIdChange: (id: number | null) => void }) {
  const { data: products = [] } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const editingProduct = editId ? products.find(p => p.id === editId) : null;
  
  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: { name: "", sku: "", category: "", unit: "Pcs", price: "0", taxRate: "5", status: "active", description: "", stock: 0 }
  });

  // Update form when editing product changes
  React.useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        sku: editingProduct.sku,
        category: editingProduct.category,
        unit: editingProduct.unit,
        price: editingProduct.price.toString(),
        taxRate: editingProduct.taxRate?.toString() || "5",
        status: editingProduct.status || "active",
        description: editingProduct.description || "",
        stock: editingProduct.stock || 0
      });
    } else if (open && !editingProduct) {
      form.reset();
    }
  }, [editingProduct, open, form]);

  const onSubmit = (data: z.infer<typeof insertProductSchema>) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: { ...data, price: data.price.toString() } }, {
        onSuccess: () => { setOpen(false); form.reset(); onEditIdChange(null); }
      });
    } else {
      createProduct.mutate({ ...data, price: data.price.toString() }, {
        onSuccess: () => { setOpen(false); form.reset(); }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-black font-semibold shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Product Name *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="sku" render={({ field }) => (
                <FormItem><FormLabel>SKU / Item Code *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Category *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Unit (e.g. Pcs, Ltr) *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>Price (AED) *</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="taxRate" render={({ field }) => (
                <FormItem><FormLabel>Tax Rate (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value || ''} /></FormControl></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="stock" render={({ field }) => (
                <FormItem><FormLabel>Stock Availability</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
            )} />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="w-full bg-black text-white hover:bg-black/90">
                {createProduct.isPending || updateProduct.isPending ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
