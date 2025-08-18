
"use client";

import { useState, useMemo } from 'react';
import { useTranslation, useTransactions, Transaction } from "../layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const COLORS = {
    income: 'hsl(var(--chart-2))',
    expense: 'hsl(var(--chart-5))',
    profit: 'hsl(var(--chart-1))',
};

export default function ReportPage() {
    const { t, isTranslating } = useTranslation();
    const { transactions } = useTransactions();
    const text = (key: string) => isTranslating ? '...' : t(key);

    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    const setDateRange = (range: 'today' | 'week' | 'month' | 'year') => {
        const today = new Date();
        if (range === 'today') {
            setDate({ from: today, to: today });
        } else if (range === 'week') {
            setDate({ from: startOfWeek(today), to: endOfWeek(today) });
        } else if (range === 'month') {
            setDate({ from: startOfMonth(today), to: endOfMonth(today) });
        } else if (range === 'year') {
            setDate({ from: startOfYear(today), to: endOfYear(today) });
        }
    };
    
    const { filteredTransactions, totalIncome, totalExpense, netProfit } = useMemo(() => {
        const fromDate = date?.from;
        const toDate = date?.to ? addDays(date.to, 1) : undefined; // Include the full end day

        const filtered = fromDate && toDate 
            ? transactions.filter(tx => {
                const txDate = new Date(tx.timestamp);
                return isWithinInterval(txDate, { start: fromDate, end: toDate });
            })
            : [];
            
        const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        return {
            filteredTransactions: filtered.sort((a,b) => b.timestamp - a.timestamp),
            totalIncome: income,
            totalExpense: expense,
            netProfit: income - expense,
        }
    }, [transactions, date]);

    const chartData = [
        { name: text('totalIncome'), value: totalIncome },
        { name: text('totalExpense'), value: totalExpense },
    ].filter(item => item.value > 0);
    
    const pieColors = [COLORS.income, COLORS.expense];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                    {payload[0].name}
                    </span>
                    <span className="font-bold text-muted-foreground">
                    {payload[0].value.toLocaleString()} KIP
                    </span>
                </div>
                </div>
            </div>
            );
        }

        return null;
    };


    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-lg font-semibold md:text-xl">{text('reportTitle')}</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground mr-2">{text('selectPeriod')}:</span>
                    <Button variant="outline" size="sm" onClick={() => setDateRange('today')}>{text('today')}</Button>
                    <Button variant="outline" size="sm" onClick={() => setDateRange('week')}>{text('thisWeek')}</Button>
                    <Button variant="outline" size="sm" onClick={() => setDateRange('month')}>{text('thisMonth')}</Button>
                    <Button variant="outline" size="sm" onClick={() => setDateRange('year')}>{text('thisYear')}</Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                size="sm"
                                className={cn(
                                    "w-full sm:w-[240px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>{text('pickDate')}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{text('totalIncome')}</CardTitle>
                        <span className="text-xl">💰</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{totalIncome.toLocaleString()} KIP</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{text('totalExpense')}</CardTitle>
                        <span className="text-xl">💸</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{totalExpense.toLocaleString()} KIP</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{text('netProfit')}</CardTitle>
                        <span className="text-xl">📈</span>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {netProfit.toLocaleString()} KIP
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{text('closingBalance')}</CardTitle>
                        <span className="text-xl">🏦</span>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-xl font-bold`}>
                            {netProfit.toLocaleString()} KIP
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>{text('overview')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                           {chartData.length > 0 ? (
                                <PieChart>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                        ))}
                                    </Pie>
                                    <Legend 
                                        iconType="circle"
                                        formatter={(value, entry) => (
                                            <span className="text-card-foreground">{value}</span>
                                        )}
                                    />
                                </PieChart>
                           ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    {text('noTransactions')}
                                </div>
                           )}
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>{text('transactions')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{text('colId')}</TableHead>
                                    <TableHead>{text('colType')}</TableHead>
                                    <TableHead>{text('colDetails')}</TableHead>
                                    <TableHead className="text-right">{text('colAmountKip')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((tx, index) => (
                                         <TableRow key={tx.id}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell>
                                                <Badge variant={tx.type === 'income' ? 'default' : 'destructive'} className={tx.type === 'income' ? 'bg-green-600' : 'bg-red-600'}>
                                                  {tx.type === 'income' ? text('txTypeIncome') : text('txTypeExpense')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{tx.description}</TableCell>
                                            <TableCell className={`text-right font-medium ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                                {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                     <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">
                                            {text('noTransactions')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
