"use client";

export const dynamic = 'force-dynamic';

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

export default function IncomePage() {
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

    const pizzaPrices:any = {
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
            <div className="flex justify-between items-center">
                <h1 className="text-base md:text-lg font-semibold text-card-foreground">{editId ? text('editIncomeTitle') : text('addIncomeTitle')}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{text('incomeFormTitle')}</CardTitle>
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
                        <Label>{text('incomeType')}</Label>
                        <RadioGroup defaultValue="pizza" value={incomeType} onValueChange={setIncomeType} className="flex gap-4 flex-wrap">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pizza" id="r-pizza" />
                                <Label htmlFor="r-pizza">{text('fromPizza')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="salary" id="r-salary" />
                                <Label htmlFor="r-salary">{text('fromSalary')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="mom" id="r-mom" />
                                <Label htmlFor="r-mom">{text('fromMom')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="r-other" />
                                <Label htmlFor="r-other">{text('fromOther')}</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {incomeType === 'pizza' && (
                        <Card className="bg-muted/30">
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm md:text-base">{text('pizzaDetails')}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4 p-4 pt-0">
                                <div className="space-y-2">
                                    <Label>{text('sizeInches')}</Label>
                                    <Select value={pizzaSize} onValueChange={setPizzaSize}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={text('selectSize')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* ... */}
                                            <SelectItem value="6">{text('size6')}</SelectItem>
                                            <SelectItem value="7">{text('size7')}</SelectItem>
                                            <SelectItem value="9">{text('size9')}</SelectItem>
                                            <SelectItem value="10">{text('size10')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{text('toppingType')}</Label>
                                     <RadioGroup defaultValue="normal" value={pizzaType} onValueChange={setPizzaType} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="normal" id="p-normal" />
                                            <Label htmlFor="p-normal">{text('normal')}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="seafood" id="p-seafood" />
                                            <Label htmlFor="p-seafood">{text('seafood')}</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="space-y-2">
                                    <Label>{text('pizzaTopping')}</Label>
                                    <Select value={pizzaTopping} onValueChange={setPizzaTopping}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={text('selectTopping')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pizzaToppings.map(topping => (
                                                <SelectItem key={topping} value={topping}>{topping}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2 pt-8">
                                    <Checkbox id="extra-cheese" checked={extraCheese} onCheckedChange={(checked) => setExtraCheese(Boolean(checked))} />
                                    <label htmlFor="extra-cheese" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {text('extraCheese')}
                                    </label>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="calculated-price">{text('calculatedPrice')}</Label>
                                    <Input id="calculated-price" type="number" value={calculatePrice() || ''} readOnly className="bg-muted/50" />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="actual-amount">{text('actualAmountKip')}</Label>
                        <Input 
                            id="actual-amount" 
                            type="number" 
                            placeholder={text('enterActualAmount')} 
                            value={actualAmount}
                            onChange={(e) => setActualAmount(e.target.value)}
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

                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSubmit}>
                       {editId ? <RotateCcw className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />}
                       {editId ? text('updateIncome') : text('saveIncome')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
