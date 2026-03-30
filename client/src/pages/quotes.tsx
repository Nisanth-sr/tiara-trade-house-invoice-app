import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import {
  useQuotes,
  useCreateQuote,
  useUpdateQuote,
  useDeleteQuote,
  useCustomers,
  useProducts,
  useQuote,
} from "@/hooks/use-api";
import type { QuoteWithItems } from "@shared/schema";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

function newQuoteFormDefaults() {
  return {
    quoteNumber: `QT-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 1000)}`,
    customerId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    expiryDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    status: "Draft",
    items: [{ productId: "", description: "", qty: 1, unitPrice: 0, taxRate: 5 }],
    notes: "",
  };
}

export default function Quotes() {
  const { data: quotes = [], isLoading } = useQuotes();
  const deleteQuote = useDeleteQuote();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<QuoteWithItems | null>(null);

  const filtered = quotes.filter((q) =>
    q.quoteNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-display font-bold">Quotes</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white border-border"
              />
            </div>
            <QuoteSheet open={open} setOpen={setOpen} editId={editId} onEditIdChange={setEditId} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead className="text-right">Amount (AED)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No quotes found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((quote) => (
                  <TableRow key={quote.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-primary">{quote.quoteNumber}</TableCell>
                    <TableCell>{quote.date}</TableCell>
                    <TableCell>{quote.expiryDate}</TableCell>
                    <TableCell className="text-right font-bold">
                      {Number(quote.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={quote.status!} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="View quote" asChild>
                          <Link href={`/quotes/${quote.id}`}>
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Edit quote"
                          onClick={() => {
                            setEditId(quote.id);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Delete quote"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setPendingDelete(quote)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete quote?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? (
                <>
                  <span className="font-medium text-foreground">{pendingDelete.quoteNumber}</span> will be
                  permanently removed. This cannot be undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteQuote.isPending}
              onClick={() => {
                if (!pendingDelete) return;
                deleteQuote.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
              }}
            >
              {deleteQuote.isPending ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

function QuoteSheet({
  open,
  setOpen,
  editId,
  onEditIdChange,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
  editId: number | null;
  onEditIdChange: (id: number | null) => void;
}) {
  const { data: customers = [] } = useCustomers();
  const { data: products = [] } = useProducts();
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const { data: existingQuote, isLoading: quoteLoading } = useQuote(open && editId ? editId : null);

  const form = useForm({
    defaultValues: newQuoteFormDefaults(),
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    if (!open) return;
    if (editId && existingQuote) {
      form.reset({
        quoteNumber: existingQuote.quoteNumber,
        customerId: String(existingQuote.customerId),
        date: existingQuote.date,
        expiryDate: existingQuote.expiryDate,
        status: existingQuote.status || "Draft",
        notes: existingQuote.notes || "",
        items: existingQuote.items.map((item) => ({
          productId: String(item.productId),
          description: item.description || "",
          qty: item.qty,
          unitPrice: parseFloat(String(item.unitPrice)),
          taxRate: parseFloat(String(item.taxRate ?? 5)),
        })),
      });
    } else if (!editId) {
      form.reset(newQuoteFormDefaults());
    }
  }, [open, editId, existingQuote, form]);

  const onSubmit = (data: any) => {
    let subtotal = 0;
    let totalVat = 0;
    const items = data.items.map((item: any) => {
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const qty = parseFloat(item.qty) || 0;
      const taxRate = parseFloat(item.taxRate) || 5;
      const lineTotal = qty * unitPrice;
      const tax = lineTotal * (taxRate / 100);
      subtotal += lineTotal;
      totalVat += tax;
      return {
        ...item,
        qty,
        unitPrice: unitPrice.toString(),
        taxRate: taxRate.toString(),
        lineTotal: lineTotal.toString(),
        productId: parseInt(item.productId, 10) || 1,
      };
    });

    const payload = {
      quoteNumber: data.quoteNumber,
      customerId: parseInt(data.customerId, 10),
      date: data.date,
      expiryDate: data.expiryDate,
      subtotal: subtotal.toString(),
      totalVat: totalVat.toString(),
      grandTotal: (subtotal + totalVat).toString(),
      totalDiscount: "0",
      items,
      status: data.status || "Draft",
      notes: data.notes || "",
    };

    if (editId) {
      updateQuote.mutate(
        { id: editId, data: payload },
        {
          onSuccess: () => {
            setOpen(false);
            onEditIdChange(null);
            form.reset(newQuoteFormDefaults());
          },
        }
      );
    } else {
      createQuote.mutate(payload, {
        onSuccess: () => {
          setOpen(false);
          form.reset(newQuoteFormDefaults());
        },
      });
    }
  };

  const busy = createQuote.isPending || updateQuote.isPending;
  const showLoader = open && editId && quoteLoading;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) onEditIdChange(null);
      }}
    >
      <SheetTrigger asChild>
        <Button
          className="bg-primary hover:bg-primary/90 text-black font-semibold shadow-lg shadow-primary/20"
          onClick={() => onEditIdChange(null)}
        >
          <Plus className="w-4 h-4 mr-2" /> Create Quote
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">{editId ? "Edit Quote" : "New Quote"}</SheetTitle>
        </SheetHeader>
        {showLoader ? (
          <p className="mt-8 text-muted-foreground">Loading quote…</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quoteNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quote Number</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-muted" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Sent">Sent</SelectItem>
                        <SelectItem value="Accepted">Accepted</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="mt-8 border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Line Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ productId: "", description: "", qty: 1, unitPrice: 0, taxRate: 5 })
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                  </Button>
                </div>

                {fields.map((field, index) => {
                  const qty = form.watch(`items.${index}.qty`) || 0;
                  const unitPrice = form.watch(`items.${index}.unitPrice`) || 0;
                  const lineTotal = qty * unitPrice;

                  return (
                    <div key={field.id} className="flex items-end gap-3 mb-4 bg-muted/30 p-4 rounded-xl">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field: f }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs">Product (Available)</FormLabel>
                            <Select
                              onValueChange={(val) => {
                                f.onChange(val);
                                const prod = products.find((p) => p.id.toString() === val);
                                if (prod) {
                                  form.setValue(
                                    `items.${index}.unitPrice`,
                                    parseFloat(String(prod.price))
                                  );
                                }
                              }}
                              value={f.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products
                                  .filter((p) => (p.stock || 0) > 0)
                                  .map((p) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                      {p.name} (Qty: {p.stock})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.qty`}
                        render={({ field: f }) => (
                          <FormItem className="w-20">
                            <FormLabel className="text-xs">Qty</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...f}
                                onChange={(e) => f.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field: f }) => (
                          <FormItem className="w-32">
                            <FormLabel className="text-xs">Price (AED)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...f}
                                onChange={(e) => f.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="w-32">
                        <FormLabel className="text-xs">Total</FormLabel>
                        <div className="font-semibold text-sm">{lineTotal.toFixed(2)}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-500 mb-0.5"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / Terms</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-6 pb-12 border-t">
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full sm:w-auto px-8 bg-black text-white hover:bg-black/90"
                >
                  {busy ? "Saving..." : editId ? "Update Quote" : "Save Quote"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
