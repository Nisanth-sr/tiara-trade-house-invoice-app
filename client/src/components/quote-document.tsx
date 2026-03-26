import { forwardRef } from "react";
import logo from "@assets/tth-logo_1773213573131.png";
import type { Customer, QuoteWithItems, Settings } from "@shared/schema";

export type QuoteDocumentData = QuoteWithItems;

type QuoteDocumentProps = {
  quote: QuoteDocumentData;
  customer?: Customer | null;
  /** Company profile; may be missing if API omits it — use optional chaining internally */
  settings?: Partial<Settings> | null;
};

function formatMoney(n: number, currency: string) {
  return `${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export const QuoteDocument = forwardRef<HTMLDivElement, QuoteDocumentProps>(
  function QuoteDocument({ quote, customer, settings }, ref) {
    const currency = settings?.defaultCurrency || "AED";
    const companyName = settings?.companyName || "TIARA TRADE HOUSE FZ LLC";

    return (
      <div
        ref={ref}
        className="quote-print-root bg-white text-black p-8 md:p-10 mx-auto w-full max-w-[210mm] text-[13px] leading-snug shadow-sm border border-neutral-200 print:shadow-none print:border-0 print:max-w-none"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-b-2 border-black pb-6">
          <div className="flex items-start gap-4">
            <img src={logo} alt="" className="h-16 w-auto object-contain shrink-0" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">{companyName}</h1>
              {settings?.address ? <p className="mt-1 whitespace-pre-line text-neutral-800">{settings.address}</p> : null}
              <div className="mt-2 space-y-0.5 text-neutral-800">
                {settings?.phone ? <p>Tel: {settings.phone}</p> : null}
                {settings?.email ? <p>Email: {settings.email}</p> : null}
                {settings?.website ? <p>{settings.website}</p> : null}
                {settings?.vatNumber ? (
                  <p className="font-semibold">TRN / VAT: {settings.vatNumber}</p>
                ) : null}
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-2xl font-bold">QUOTATION</p>
            <p className="mt-2 font-semibold">{quote.quoteNumber}</p>
            <p className="mt-1">Date: {quote.date}</p>
            <p>Valid until: {quote.expiryDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Quote for</p>
            <p className="mt-1 font-semibold text-base">{customer?.company || "—"}</p>
            <p>{customer?.name || ""}</p>
            {customer?.address ? <p className="mt-1 whitespace-pre-line">{customer.address}</p> : null}
            {customer?.country ? <p>{customer.country}</p> : null}
            {customer?.email ? <p className="mt-1">{customer.email}</p> : null}
            {customer?.phone ? <p>{customer.phone}</p> : null}
          </div>
          <div className="sm:text-right text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Quoted total</p>
            <p className="mt-1 text-2xl font-bold">{formatMoney(Number(quote.grandTotal), currency)}</p>
            <p className="mt-1 text-neutral-600">Status: {quote.status || "—"}</p>
          </div>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-100 border-y border-black">
              <th className="text-left py-2 px-2 font-semibold w-8">#</th>
              <th className="text-left py-2 px-2 font-semibold">Description</th>
              <th className="text-right py-2 px-2 font-semibold w-16">Qty</th>
              <th className="text-right py-2 px-2 font-semibold w-24">Price</th>
              <th className="text-right py-2 px-2 font-semibold w-14">Tax %</th>
              <th className="text-right py-2 px-2 font-semibold w-28">Net</th>
              <th className="text-right py-2 px-2 font-semibold w-24">VAT</th>
              <th className="text-right py-2 px-2 font-semibold w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, idx) => {
              const net = Number(item.lineTotal ?? 0);
              const rate = Number(item.taxRate ?? 0);
              const vat = net * (rate / 100);
              const gross = net + vat;
              return (
                <tr key={item.id ?? idx} className="border-b border-neutral-200">
                  <td className="py-2 px-2 align-top">{idx + 1}</td>
                  <td className="py-2 px-2 align-top">{item.description || "—"}</td>
                  <td className="py-2 px-2 text-right align-top">{item.qty}</td>
                  <td className="py-2 px-2 text-right align-top">
                    {formatMoney(Number(item.unitPrice), currency)}
                  </td>
                  <td className="py-2 px-2 text-right align-top">{rate}%</td>
                  <td className="py-2 px-2 text-right align-top">{formatMoney(net, currency)}</td>
                  <td className="py-2 px-2 text-right align-top">{formatMoney(vat, currency)}</td>
                  <td className="py-2 px-2 text-right align-top font-medium">{formatMoney(gross, currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between border-b border-neutral-200 py-1">
              <span>Subtotal (ex-VAT)</span>
              <span className="font-medium">{formatMoney(Number(quote.subtotal), currency)}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 py-1">
              <span>VAT</span>
              <span className="font-medium">{formatMoney(Number(quote.totalVat), currency)}</span>
            </div>
            {Number(quote.totalDiscount) > 0 ? (
              <div className="flex justify-between border-b border-neutral-200 py-1">
                <span>Discount</span>
                <span className="font-medium">−{formatMoney(Number(quote.totalDiscount), currency)}</span>
              </div>
            ) : null}
            <div className="flex justify-between py-2 text-base font-bold border-t-2 border-black">
              <span>Grand total</span>
              <span>{formatMoney(Number(quote.grandTotal), currency)}</span>
            </div>
          </div>
        </div>

        {quote.notes ? (
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Notes / terms</p>
            <p className="mt-2 whitespace-pre-line text-neutral-800">{quote.notes}</p>
          </div>
        ) : null}
      </div>
    );
  }
);
