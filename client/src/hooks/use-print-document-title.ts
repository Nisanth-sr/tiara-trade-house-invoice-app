import { useEffect, useRef } from "react";

/** Sets a short document.title during print; turn off "Headers and footers" in the print dialog to hide date/URL. */
export function usePrintDocumentTitle(shortTitle: string | undefined) {
  const savedRef = useRef("");

  useEffect(() => {
    if (!shortTitle) return;

    const onBeforePrint = () => {
      savedRef.current = document.title;
      document.title = shortTitle;
    };

    const onAfterPrint = () => {
      document.title = savedRef.current;
    };

    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, [shortTitle]);
}
