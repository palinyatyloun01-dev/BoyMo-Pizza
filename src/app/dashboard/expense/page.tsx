
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, PlusCircle, RotateCcw, Calendar as CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation, useTransactions } from "../layout";
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


export default function ExpensePage() {
    const { t, isTranslating } = useTranslation();
    const { addTransaction, updateTransaction, getTransactionById } = useTransactions();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [editId, setEditId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [expenseItem, setExpenseItem] = useState('');
    const [amount, setAmount] = useState<string | number>('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState(format(new Date(), "HH:mm"));

    const expenseItems = [
        "ເຕົາອົບສະແຕນເລດ", "ວັດຖຸດິບ", "ແປ້ງພິຊຊ່າສຳເລັດຮູບ (6 ນິ້ວ)", 
        "ແປ້ງພິຊຊ່າສຳເລັດຮູບ (7 ນິ້ວ)", "ແປ້ງພິຊຊ່າສຳເລັດຮູບ (9 ນິ້ວ)", "ແປ້ງພິຊຊ່າສຳເລັດຮູບ (10 ນິ້ວ)",
        "ຊອສທາວາຊັ່ນ", "ຊອສພິຊຊ່າສູດພິເສດ", "ຊອສມາຢອງເນສ", "ຊອສລາດໜ້າພິຊຊ່າ", 
        "ຊອສ Rosa ແດງ", "ຊອສ Rosa ຂຽວ", "ຊີສ (ກ້ອນໃຫຍ່)", "ຊີສ (ເປັນກ້ອນ)", 
        "ເຫຼັກຕັດພິຊຊ່າ", "ເຈ້ຍຮອງພິຊຊ່າ", "ສາລ່າຍ", "ອາລິກາໂນ", 
        "ຖາດຮອງແຕ່ງໜ້າພິຊຊ່າ", "ປູອັດເບນໂຕະ", "ກຸ້ງ", "ໝາກນັດ", "ໝາກເພັດໃຫຍ່", 
        "ໝາກເລັ່ນ", "ຮັອດດ໋ອກ", "ແຮມໝູ+ໄກ່", "ນ້ຳມັນລົດ", "ປາມຶກວົງ", 
        "ປາມຶກລາຍ", "ອັນຂູດຊີສ", "ແນວຊ້ອນພິຊຊ່າ", "ອື່ນໆ"
    ];

    useEffect(() => {
        const id = searchParams.get('edit');
        setEditId(id);
        if (id) {
            const fetchTransaction = async () => {
                const tx = await getTransactionById(id);
                if (tx && tx.type === 'expense') {
                    setAmount(tx.amount);
                    const txDate = new Date(tx.timestamp);
                    setDate(txDate);
                    setTime(format(txDate, "HH:mm"));
                    
                    const descParts = tx.description.split(' - ');
                    const mainItem = descParts[0];
                    const additionalDesc = descParts.length > 1 ? descParts.slice(1).join(' - ') : '';

                    if (expenseItems.includes(mainItem)) {
                        setExpenseItem(mainItem);
                    } else {
                        setExpenseItem("ອື່ນໆ");
                    }
                    setDescription(additionalDesc);


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
    }, [searchParams, getTransactionById, router, toast]); // Removed expenseItems from dependency array

    const handleSubmit = async () => {
        const expenseAmount = Number(amount);
        if (!expenseAmount || expenseAmount <= 0 || !expenseItem || !date) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all required fields.' });
            return;
        }

        let finalDescription = expenseItem;
        if (description) {
            finalDescription += ` - ${description}`;
        }
        
        const [hours, minutes] = time.split(':').map(Number);
        const transactionTimestamp = new Date(date);
        transactionTimestamp.setHours(hours, minutes);

        const transactionData = {
            type: 'expense',
            amount: expenseAmount,
            description: finalDescription,
            expenseItem: expenseItem,
            timestamp: transactionTimestamp,
        };

        try {
             if (editId) {
                await updateTransaction(editId, transactionData);
                toast({ title: 'Success', description: 'Expense updated successfully!' });
            } else {
                await addTransaction(transactionData);
                toast({ title: 'Success', description: 'Expense saved successfully!' });
            }
            router.push('/dashboard');
        } catch (error) {
             toast({ variant: 'destructive', title: "Error", description: "Failed to save expense."});
        }
    };
    
    const text = (key: string) => isTranslating ? '...' : t(key);
    
    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-base md:text-lg font-semibold text-card-foreground">{editId ? text('editExpenseTitle') : text('addExpenseTitle')}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{text('expenseFormTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <Label htmlFor="date">{text('transactionDate')}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>{text('pickDate')}</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="time">{text('time')}</Label>
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expense-item">{text('expenseItem')}</Label>
                        <Select value={expenseItem} onValueChange={setExpenseItem}>
                            <SelectTrigger id="expense-item">
                                <SelectValue placeholder={text('selectExpenseItem')} />
                            </SelectTrigger>
                            <SelectContent>
                                {expenseItems.map(item => (
                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="amount">{text('amountKip')}</Label>
                        <Input 
                            id="amount" 
                            type="number" 
                            placeholder={text('enterAmount')} 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{text('description')}</Label>
                        <Input 
                            id="description" 
                            placeholder={text('enterDescription')} 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{text('bill')}</Label>
                         <Button variant="outline" className="w-full">
                            <Upload className="mr-2 h-4 w-4" />
                            {text('uploadBill')}
                        </Button>
                    </div>

                    <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleSubmit}>
                        {editId ? <RotateCcw className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />}
                        {editId ? text('updateExpense') : text('saveExpense')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
