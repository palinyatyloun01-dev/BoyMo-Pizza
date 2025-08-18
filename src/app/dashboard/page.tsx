
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Search, BarChart2, FilePenLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslation, useTransactions, Transaction } from "./layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";


export default function DashboardPage() {
  const { t, isTranslating } = useTranslation();
  const { transactions, deleteTransaction } = useTransactions();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Transaction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const text = (key: string) => isTranslating ? '...' : t(key);

  const today = format(new Date(), 'yyyy-MM-dd');
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      const filteredSuggestions = transactions.filter(tx =>
        tx.description.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (description: string) => {
    setSearchQuery(description);
    setShowSuggestions(false);
  };

  const { todayIncome, todayExpense, todayProfit, filteredTransactions } = useMemo(() => {
    const todaysTx = transactions.filter(tx => tx.date === today);

    const income = todaysTx
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expense = todaysTx
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const recent = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

    const filtered = searchQuery 
        ? recent.filter(tx => tx.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : recent; 

    return { 
        todayIncome: income,
        todayExpense: expense,
        todayProfit: income - expense,
        filteredTransactions: filtered,
    };
  }, [transactions, today, searchQuery]);

  const allTimeBalance = transactions.reduce((balance, tx) => {
    return tx.type === 'income' ? balance + tx.amount : balance - tx.amount;
  }, 0);

  const handleDelete = async (id: string) => {
    try {
        await deleteTransaction(id);
        toast({ title: "Success", description: "Transaction deleted successfully."});
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to delete transaction."});
    }
  }


  return (
    <>
        <div className="w-full overflow-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center">
                <span className="text-lg md:text-xl mx-2">🍕</span>
                <h1 className="text-base md:text-lg font-bold inline-block animate-color-cycle">{text('welcome')}</h1>
                <span className="text-lg md:text-xl mx-2">🍕</span>
            </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-grow sm:flex-grow-0">
            <Link href="/dashboard/income">
              <PlusCircle className="mr-2 h-4 w-4" />
              {text('addIncome')}
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white flex-grow sm:flex-grow-0">
             <Link href="/dashboard/expense">
                <PlusCircle className="mr-2 h-4 w-4" />
                {text('addExpense')}
              </Link>
          </Button>
           <Button asChild size="sm" variant="outline" className="flex-grow sm:flex-grow-0">
             <Link href="/dashboard/report">
                <BarChart2 className="mr-2 h-4 w-4" />
                {text('report')}
              </Link>
          </Button>
          <div className="relative w-full sm:w-auto sm:flex-grow max-w-xs" ref={searchContainerRef}>
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                  placeholder={text('colDetails')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  className="pl-8 h-9 text-xs"
              />
              {showSuggestions && suggestions.length > 0 && (
                 <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map(suggestion => (
                        <div
                            key={suggestion.id}
                            className="px-3 py-2 text-xs hover:bg-muted cursor-pointer"
                            onClick={() => handleSuggestionClick(suggestion.description)}
                        >
                            {suggestion.description}
                        </div>
                    ))}
                </div>
              )}
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">
                {text('todayIncome')}
              </CardTitle>
              <span className="text-base">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold">{todayIncome.toLocaleString()} KIP</div>
              <p className="text-xs text-muted-foreground">
                {todayIncome === 0 ? text('noIncome') : `${transactions.filter(tx => tx.type === 'income' && tx.date === today).length} transactions`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">
                {text('todayExpense')}
              </CardTitle>
               <span className="text-base">💸</span>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold">{todayExpense.toLocaleString()} KIP</div>
               <p className="text-xs text-muted-foreground">
                {todayExpense === 0 ? text('noExpense') : `${transactions.filter(tx => tx.type === 'expense' && tx.date === today).length} transactions`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">{text('todayProfit')}</CardTitle>
              <span className="text-base">📈</span>
            </CardHeader>
            <CardContent>
              <div className={`text-base font-bold ${todayProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{todayProfit.toLocaleString()} KIP</div>
              <p className="text-xs text-muted-foreground">
                {text('profitDesc')}
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">{text('todayBalance')}</CardTitle>
              <span className="text-base">🏦</span>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold">{allTimeBalance.toLocaleString()} KIP</div>
              <p className="text-xs text-muted-foreground">
                {text('todayBalanceDesc')}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-2">
            <CardHeader>
                <CardTitle className="text-base">{text('recentTransactions')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30px] px-2 text-xs">{text('colId')}</TableHead>
                            <TableHead className="px-2 text-xs">{text('colType')}</TableHead>
                            <TableHead className="px-2 text-xs">{text('colDetails')}</TableHead>
                            <TableHead className="px-2 text-xs">{text('colDate')}</TableHead>
                            <TableHead className="text-right px-2 text-xs">{text('colAmountKip')}</TableHead>
                            <TableHead className="text-center px-2 text-xs">{text('colActions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((tx, index) => (
                                 <TableRow key={tx.id}>
                                    <TableCell className="font-medium px-2 py-2 text-xs">{index + 1}</TableCell>
                                    <TableCell className="px-2 py-2">
                                        <Badge variant={tx.type === 'income' ? 'default' : 'destructive'} className={`text-xs ${tx.type === 'income' ? 'bg-green-600' : 'bg-red-600'}`}>
                                          {tx.type === 'income' ? text('txTypeIncome') : text('txTypeExpense')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs break-all px-2 py-2">{tx.description}</TableCell>
                                    <TableCell className="text-xs px-2 py-2">{format(new Date(tx.timestamp), 'dd/MM/yy')}</TableCell>
                                    <TableCell className={`text-right font-medium text-xs px-2 py-2 ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                        {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center px-2 py-2">
                                        <div className="flex justify-center gap-1">
                                            <Button asChild variant="outline" size="icon" className="h-7 w-7">
                                                <Link href={`/dashboard/${tx.type}?edit=${tx.id}`}>
                                                    <FilePenLine className="h-3 w-3" />
                                                </Link>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" className="h-7 w-7">
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>{text('deleteConfirmTitle')}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {text('deleteConfirmDesc')}
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>{text('cancel')}</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(tx.id)}>{text('confirm')}</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-xs">
                                    {text('noTransactions')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </>
  );
}


