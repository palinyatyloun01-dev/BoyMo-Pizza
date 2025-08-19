import React, { Suspense } from "react";
import IncomePageContent from "./IncomePageContent";

export const dynamic = "force-dynamic";

export default function IncomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IncomePageContent />
    </Suspense>
  );
}
