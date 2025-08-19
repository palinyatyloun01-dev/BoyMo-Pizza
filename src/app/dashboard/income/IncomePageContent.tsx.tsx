"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, PlusCircle, RotateCcw, Calendar as CalendarIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation, useTransactions } from '../layout';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function IncomePageContent() {
  const { t, isTranslating } = useTranslation();
  const { addTransaction, updateTransaction, getTransactionById } = useTransactions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [editId, setEditId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [incomeType, setIncomeType] = useState("pizza");
  const [pizzaSize, setPizzaSize] = useState("6");
  const [pizzaType, setPizzaType] = useState("normal");
  const [extraCheese, setExtraCheese] = useState(false);
  const [pizzaTopping, setPizzaTopping] = useState("");
  const [actualAmount, setActualAmount] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState(format(new Date(), "HH:mm"));

  const pizzaPrices: any = {
    "6": { normal: 65000, seafood: 79000 },
    "7": { normal: 85000, seafood: 99000 },
    "9": { normal: 129000, seafood: 139000 },
    "10": { normal: 149000, seafood: 159000 },
  };

  const pizzaToppings = [
    "ລວມມິດຊາລາຍ", "ຮັອດດ໋ອກຊີສ", "ເຂົ້າໂພດຫວານ",
    "ປູອັດ+ຊີສ", "ກຸ້ງເດິລຸກ", "ແຮມຊີສ", "ປູອັດ",
    "ຮັອດດ໋ອກ", "ດັບເບີ້ນຊີສ", "ເບຄ່ອນຊີສ",
    "ຮາວາອ້ຽນ", "ຊີຟູດລວມສະໄປຣຊີ່"
  ];

  useEffect(() => {
    const id = searchParams.get('edit');
    setEditId(id);
    if (id) {
      const fetchTransaction = async () => {
        const tx = await getTransactionById(id);
        if (tx && tx.type === 'income') {
          setIncomeType(tx.pizzaSize ? 'pizza' : tx.expenseItem ? 'other' : 'other'); 
          setActualAmount(tx.amount);
          setDescription(tx.description);
          const txDate = new Date(tx.timestamp);
          setDate(txDate);
          setTime(format(txDate, "HH:mm"));

          if (tx.pizzaSize) setPizzaSize(tx.pizzaSize);
          if (tx.pizzaType) setPizzaType(tx.pizzaType);
          if (tx.pizzaTopping) setPizzaTopping(tx.extraCheese);

        } else {
          toast({ variant: 'destructive', title: "Error", description: "Transaction not found." });
          router.push('/dashboard');
        }
        setIsLoading(false);
      };
      fetchTransaction();
    } else {
      setIsLoading(false);
    }
  }, [searchParams, getTransactionById, router, toast]);


  const calculatePrice = useCallback(() => {
    if (incomeType !== 'pizza') return 0;
    let price = pizzaPrices[pizzaSize]?.[pizzaType] || 0;
    if (extraCheese) {
      price += 15000;
    }
    return price;
  }, [incomeType, pizzaSize, pizzaType, extraCheese, pizzaPrices]);

  useEffect(() => {
    if (incomeType === 'pizza') {
      setActualAmount('');
    }
  }, [incomeType, pizzaSize, pizzaType, extraCheese]);

  const handleSubmit = async () => {
    const amount = Number(actualAmount);
    if (!amount || amount <= 0 || !date) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a valid amount and date.' });
      return;
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    const transactionTimestamp = new Date(date);
    transactionTimestamp.setHours(hours, minutes);

    let finalDescription = '';
    let transactionData: any = {
      type: 'income',
      amount: amount,
      timestamp: transactionTimestamp,
    };

    if (incomeType === 'pizza') {
      finalDescription = `Pizza ${pizzaSize}" ${pizzaType} (${pizzaTopping || 'N/A'}) ${extraCheese ? '+ Cheese' : ''}`;
      if (description) {
        finalDescription += ` - ${description}`;
      }
      transactionData = {
        ...transactionData,
        description: finalDescription,
        pizzaSize,
        pizzaType,
        pizzaTopping,
        extraCheese,
      }
    } else {
      finalDescription = description || t(`from${incomeType.charAt(0).toUpperCase() + incomeType.slice(1)}`);
      transactionData = {
        ...transactionData,
        description: finalDescription,
      }
    }
    
    try {
      if (editId) {
        await updateTransaction(editId, transactionData);
        toast({ title: 'Success', description: 'Income updated successfully!' });
      } else {
        await addTransaction(transactionData);
        toast({ title: 'Success', description: 'Income saved successfully!' });
      }
      router.push('/dashboard');
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Failed to save income."});
    }
  };
  
  const text = (key: string) => isTranslating ? '...' : t(key);

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* TODO: UI Form for income entry */}
      <Card>
        <CardHeader>
          <CardTitle>{text("Add Income")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* You can extend UI here */}
          <Button onClick={handleSubmit}>💾 Save Income</Button>
        </CardContent>
      </Card>
    </div>
  )
}
