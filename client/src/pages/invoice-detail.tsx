import { useRef, useEffect, useState } from "react";
import { useRoute, Link, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { useInvoice } from "@/hooks/use-api";
import { InvoiceDocument } from "@/components/invoice-document";
import { downloadPrintablePdf } from "@/lib/invoice-pdf";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown, Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { InvoiceDetailPayload } from "@/hooks/use-api";
import type { InvoiceDocumentData } from "@/components/invoice-document";
import { usePrintDocumentTitle } from "@/hooks/use-print-document-title";

function invoiceBody(d: InvoiceDetailPayload): InvoiceDocumentData {
  const { customer: _c, settings: _s, ...rest } = d;
  return rest;
}

export default function InvoiceDetail() {
  const [, params] = useRoute("/invoices/:id");
  const id = params?.id ? parseInt(params.id, 10) : NaN;
  const search = useSearch();
  const { data, isLoading, isError, error } = useInvoice(Number.isFinite(id) ? id : null);
  usePrintDocumentTitle(data?.invoiceNumber ? `Invoice ${data.invoiceNumber}` : undefined);
  const ref = useRef<HTMLDivElement>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    if (new URLSearchParams(search).get("print") !== "1") return;
    const t = window.setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, [data, search]);

  const handlePdf = async () => {
    if (!ref.current || !data) return;
    setPdfBusy(true);
    try {
      const safe = data.invoiceNumber.replace(/[^\w.-]+/g, "_");
      await downloadPrintablePdf(ref.current, `invoice-${safe}.pdf`);
    } finally {
      setPdfBusy(false);
    }
  };

  if (!Number.isFinite(id)) {
    return (
      <Layout>
        <p className="text-muted-foreground">Invalid invoice.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 print:space-y-0">
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <Button variant="outline" size="sm" asChild>
            <Link href="/invoices">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            disabled={!data}
            title="In Chrome/Edge print dialog: More settings → turn off Headers and footers to remove date, URL, and icon from the PDF."
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            size="sm"
            className="bg-primary text-black font-semibold hover:bg-primary/90"
            onClick={handlePdf}
            disabled={pdfBusy || !data}
          >
            <FileDown className="w-4 h-4 mr-2" />
            {pdfBusy ? "Generating…" : "Download PDF"}
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-4 max-w-[210mm] mx-auto">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        )}

        {isError && (
          <p className="text-destructive">{error instanceof Error ? error.message : "Could not load invoice."}</p>
        )}

        {data ? (
          <InvoiceDocument
            ref={ref}
            invoice={invoiceBody(data)}
            customer={data.customer}
            settings={data.settings}
          />
        ) : null}
      </div>
    </Layout>
  );
}
