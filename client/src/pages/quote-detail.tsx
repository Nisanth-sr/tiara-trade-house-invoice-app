import { useRef, useEffect, useState } from "react";
import { useRoute, Link, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { useQuote, useSettings, useCustomers, useProducts, type QuoteDetailPayload } from "@/hooks/use-api";
import { QuoteDocument, type QuoteDocumentData } from "@/components/quote-document";
import { downloadPrintablePdf } from "@/lib/invoice-pdf";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown, Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrintDocumentTitle } from "@/hooks/use-print-document-title";

function quoteBody(d: QuoteDetailPayload): QuoteDocumentData {
  const { customer: _c, settings: _s, ...rest } = d;
  return rest;
}

export default function QuoteDetail() {
  const [, params] = useRoute("/quotes/:id");
  const id = params?.id ? parseInt(params.id, 10) : NaN;
  const search = useSearch();
  const { data, isLoading, isError, error } = useQuote(Number.isFinite(id) ? id : null);
  usePrintDocumentTitle(data?.quoteNumber ? `Quotation ${data.quoteNumber}` : undefined);
  const { data: appSettings } = useSettings();
  const { data: customers = [] } = useCustomers();
  const { data: products = [] } = useProducts();
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
      const safe = data.quoteNumber.replace(/[^\w.-]+/g, "_");
      await downloadPrintablePdf(ref.current, `quote-${safe}.pdf`);
    } finally {
      setPdfBusy(false);
    }
  };

  if (!Number.isFinite(id)) {
    return (
      <Layout>
        <p className="text-muted-foreground">Invalid quote.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 print:space-y-0">
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <Button variant="outline" size="sm" asChild>
            <Link href="/quotes">
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
          <p className="text-destructive">{error instanceof Error ? error.message : "Could not load quote."}</p>
        )}

        {data ? (
          <QuoteDocument
            ref={ref}
            quote={quoteBody(data)}
            customer={
              data.customer ??
              customers.find((c) => c.id === data.customerId) ??
              undefined
            }
            settings={data.settings ?? appSettings ?? undefined}
            products={products}
          />
        ) : null}
      </div>
    </Layout>
  );
}
