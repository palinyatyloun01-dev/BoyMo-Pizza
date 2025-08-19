// src/app/dashboard/income/IncomePageContent.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function IncomePageContent() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Income Dashboard</h1>

      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Total Income</span>
            <span className="text-xl font-bold text-green-600">$12,450</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
          <ul className="space-y-2">
            <li className="flex justify-between border-b pb-1">
              <span>Order #1023</span>
              <span className="text-green-500">+$45</span>
            </li>
            <li className="flex justify-between border-b pb-1">
              <span>Order #1022</span>
              <span className="text-green-500">+$78</span>
            </li>
            <li className="flex justify-between">
              <span>Order #1021</span>
              <span className="text-green-500">+$120</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Button className="bg-green-600 hover:bg-green-700 text-white">
        Export Income Report
      </Button>
    </div>
  );
}
