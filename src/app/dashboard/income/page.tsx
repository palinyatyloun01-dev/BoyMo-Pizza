"use client";

import { Suspense } from "react";
import IncomePageContent from "./IncomePageContent";
export default function Page() {
  return <IncomePageContent />;
}
export const dynamic = 'force-dynamic';
export default function IncomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IncomePageContent />
    </Suspense>
  );
}
