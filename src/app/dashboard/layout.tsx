

"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Home, BarChart2, User, Menu, LogOut, Languages, Briefcase, Pizza, ArrowLeft, Share2, Star, Info, CheckCircle, Contact, Phone, Mail, Search, Upload } from "lucide-react";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';
import { translateText, TranslateTextInput } from '@/ai/flows/translate-text';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSettings } from '../layout';


const originalText: Record<string, string> = {
    // Nav
    home: "ໜ້າຫຼັກ",
    income: "ລາຍຮັບ",
    expense: "ລາຍຈ່າຍ",
    report: "ລາຍງານ",

    // Header
    menu: "ເມນູ",
    back: "ກັບຄືນ",
    changeLanguage: "ປ່ຽນພາສາ",
    profile: "ໂປຣໄຟລ໌",
    logout: "ອອກຈາກລະບົບ",

    // Dashboard Page
    welcome: "ຍິນດີຕ້ອນຮັບເຂົ້າສູ່ຮ້ານ BoyMo Pizza",
    addIncome: "ເພີ່ມລາຍຮັບ",
    addExpense: "ເພີ່ມລາຍຈ່າຍ",
    todayIncome: "ລາຍຮັບມື້ນີ້",
    noIncome: "ຍັງບໍ່ມີລາຍຮັບສໍາລັບມື້ນີ້",
    todayExpense: "ລາຍຈ່າຍມື້ນີ້",
    noExpense: "ຍັງບໍ່ມີລາຍຈ່າຍສໍາລັບມື້ນີ້",
    todayProfit: "ກຳໄລມື້ນີ້",
    profitDesc: "ກຳໄລຄິດໄລ່ຈາກ ລາຍຮັບ - ລາຍຈ່າຍ",
    todayBalance: "ຍອດເງິນຄົງເຫຼືອມື້ນີ້",
    todayBalanceDesc: "ຍອດເງິນທັງໝົດໃນມື້ນີ້",
    recentTransactions: "ທຸລະກຳຫຼ້າສຸດ",
    colId: "ລ/ດ",
    colType: "ປະເພດ",
    colDetails: "ລາຍລະອຽດ",
    colTime: "ເວລາ",
    colDate: "ວັນທີ",
    colAmountKip: "ຈຳນວນ (KIP)",
    txTypeIncome: "ລາຍຮັບ",
    txTypeExpense: "ລາຍຈ່າຍ",
    noTransactions: "ຍັງບໍ່ມີທຸລະກຳເທື່ອ.",
    colActions: "ການກະທຳ",
    edit: "ແກ້ໄຂ",
    delete: "ລຶບ",
    deleteConfirmTitle: "ຢືນຢັນການລຶບ",
    deleteConfirmDesc: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້? ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.",
    cancel: "ຍົກເລີກ",
    confirm: "ຢືນຢັນ",


    // Income Page
    addIncomeTitle: "ເພີ່ມລາຍຮັບ",
    editIncomeTitle: "ແກ້ໄຂລາຍຮັບ",
    editData: "ແກ້ໄຂຂໍ້ມູນ",
    incomeFormTitle: "ປ້ອນຂໍ້ມູນລາຍຮັບ",
    incomeType: "ປະເພດລາຍຮັບ",
    fromPizza: "ຈາກການຂາຍພິຊຊ່າ",
    fromSalary: "ຈາກເງິນເດືອນ",
    fromMom: "ຈາກແມ່",
    fromOther: "ອື່ນໆ",
    pizzaDetails: "ລາຍລະອຽດພິຊຊ່າ",
    sizeInches: "ຂະໜາດ (ນິ້ວ)",
    selectSize: "ເລືອກຂະໜາດ",
    size6: "6 ນິ້ວ",
    size7: "7 ນິ້ວ",
    size9: "9 ນິ້ວ",
    size10: "10 ນິ້ວ",
    toppingType: "ໜ້າ",
    normal: "ທຳມະດາ",
    seafood: "ທະເລ",
    pizzaTopping: "ໜ້າພິຊຊ່າ",
    selectTopping: "ເລືອກໜ້າພິຊຊ່າ",
    extraCheese: "ເພີ່ມຊີສ (+15,000 KIP)",
    calculatedPrice: "ລາຄາທີ່ຄິດໄລ່",
    actualAmountKip: "ຈຳນວນເງິນທີ່ໄດ້ຮັບຕົວຈິງ (KIP)",
    enterActualAmount: "ປ້ອນຈຳນວນເງິນທີ່ໄດ້ຮັບຕົວຈິງ",
    description: "ລາຍລະອຽດ",
    enterDescription: "ປ້ອນລາຍລະອຽດເພີ່ມເຕີມ (ຖ້າມີ)",
    bill: "ໃບບິນ",
    uploadBill: "ອັບໂຫຼດໃບບິນ",
    saveIncome: "ບັນທຶກລາຍຮັບ",
    updateIncome: "ອັບເດດລາຍຮັບ",

    // Expense Page
    addExpenseTitle: "ເພີ່ມລາຍຈ່າຍ",
    editExpenseTitle: "ແກ້ໄຂລາຍຈ່າຍ",
    expenseFormTitle: "ປ້ອນຂໍ້ມູນລາຍຈ່າຍ",
    expenseItem: "ລາຍການລາຍຈ່າຍ",
    selectExpenseItem: "ເລືອກລາຍການ",
    amountKip: "ຈຳນວນເງິນ (KIP)",
    enterAmount: "ປ້ອນຈຳນວນເງິນ",
    saveExpense: "ບັນທຶກລາຍຈ່າຍ",
    updateExpense: "ອັບເດດລາຍຈ່າຍ",
    
    // Date/Time
    transactionDate: "ວັນທີທຸລະກຳ",
    time: "ເວລາ",
    pickDate: "ເລືອກວັນທີ",


    // Profile Page
    manageProfile: "ຈັດການໂປຣໄຟລ໌",
    personalInfo: "ຂໍ້ມູນສ່ວນຕົວ",
    updateProfileInfo: "ປັບປຸງຂໍ້ມູນສ່ວນຕົວຂອງທ່ານ.",
    changePhoto: "ປ່ຽນຮູບ",
    uploadInstructions: "ອັບໂຫຼດຮູບຈາກ Gallery ຫຼື ຖ່າຍຈາກກ້ອງ",
    uploadFromGallery: "ອັບໂຫຼດຈາກ Gallery",
    takePhoto: "ຖ່າຍຮູບ",
    capture: "ຖ່າຍຮູບ",
    retake: "ຖ່າຍໃໝ່",
    usePhoto: "ໃຊ້ຮູບນີ້",
    cameraAccessRequired: "ຕ້ອງການການເຂົ້າເຖິງກ້ອງ",
    allowCameraAccess: "ກະລຸນາອະນຸຍາດໃຫ້ເຂົ້າເຖິງກ້ອງເພື່ອໃຊ້ງານ.",
    nickname: "ຊື່ຫຼິ້ນ",
    saveChanges: "ບັນທຶກການປ່ຽນແປງ",
    storeStatus: "ສະຖານະຮ້ານ",
    setStoreStatus: "ຕັ້ງຄ່າສະຖານະຂອງຮ້ານ BoyMo Pizza.",
    selectStatus: "ເລືອກສະຖານະ",
    statusOpen: "🟢 ເປີດ",
    statusClosed: "🔴 ປິດ",
    statusMaintenance: "🟡 ປັບປຸງ",
    statusHoliday: "🎉 ພັກວັນບຸນ",
    customerFeedback: "Feedback ລູກຄ້າ",
    checkCustomerFeedback: "ກວດສອບຄວາມຄິດເຫັນຈາກລູກຄ້າ.",
    noFeedback: "ຍັງບໍ່ມີ Feedback.",
    manageLogo: "ຈັດການໂລໂກ້ຮ້ານ",
    updateLogoInfo: "ປ່ຽນໂລໂກ້ຂອງຮ້ານ.",
    uploadLogo: "ອັບໂຫຼດໂລໂກ້",

    // Report Page
    reportTitle: "ລາຍງານ",
    selectPeriod: "ເລືອກຊ່ວງເວລາ",
    today: "ມື້ນີ້",
    thisWeek: "ອາທິດນີ້",
    thisMonth: "ເດືອນນີ້",
    thisYear: "ປີນີ້",
    pickDate: "ເລືອກວັນທີ",
    totalIncome: "ລາຍຮັບລວມ",
    totalExpense: "ລາຍຈ່າຍລວມ",
    netProfit: "ກຳໄລສຸດທິ",
    closingBalance: "ຍອດເຫຼືອທ້າຍງວດ",
    overview: "ພາບລວມ",
    transactions: "ທຸລະກຳ",

    // New menu items
    shareApp: "ແບ່ງປັນແອັບ",
    rateApp: "ໃຫ້ຄະແນນແອັບ",
    rateAppTitle: "ໃຫ້ຄະແນນແອັບຂອງພວກເຮົາ",
    rateAppDescription: "ກະລຸນາບອກພວກເຮົາວ່າທ່ານມັກແອັບນີ້ຫຼາຍສ່ຳໃດ.",
    submitRating: "ສົ່ງຄະແນນ",
    aboutApp: "ກ່ຽວກັບແອັບ",
    aboutAppTitle: "ກ່ຽວກັບແອັບ BoyMo Finances",
    aboutAppDesc1: "ແອັບ BoyMo Finances ເປັນເຄື່ອງມືສະເພາະສຳລັບຮ້ານ BoyMo Pizza ເພື່ອຊ່ວຍໃນການບໍລິຫານຈັດການການເງິນປະຈຳວັນ.",
    aboutAppDesc2: "ຄຸນສົມບັດຫຼັກ:",
    featureIncome: "ບັນທຶກລາຍຮັບ: ຕິດຕາມລາຍຮັບຈາກການขายພິຊຊ່າ ແລະ ແຫຼ່ງອື່ນໆ.",
    featureExpense: "ບັນທຶກລາຍຈ່າຍ: ຕິດຕາມລາຍຈ່າຍທີ່ເກີດຂຶ້ນໃນຮ້ານ.",
    featureReport: "ລາຍງານ: ສະຫຼຸບພາບລວມການເງິນ, ລາຍຮັບ, ລາຍຈ່າຍ, ແລະກຳໄລ.",
    featureProfile: "ຈັດການໂປຣໄຟລ໌: ປັບປຸງຂໍ້ມູນຮ້ານ ແລະ ສະຖານະ.",
    featureMultiLang: "ຫຼາຍພາສາ: ຮອງຮັບ 5 ພາສາ (ລາວ, ໄທ, ຈີນ, ອັງກິດ, ຫວຽດນາມ).",
    close: "ປິດ",

    // Developer Info
    developerInfo: "ຂໍ້ມູນຜູ້ພັດທະນາ",
    developerInfoTitle: "ຂໍ້ມູນຕິດຕໍ່ຜູ້ພັດທະນາ",
    developerNameLabel: "ຊື່ ແລະ ນາມສະກຸນ:",
    developerName: "ທ້າວ ສົມຫວັງ ປິງສະນີໃຈ (ບອຍ)",
    developerPhoneLabel: "ເບີໂທ/WhatsApp:",
    developerEmailLabel: "Gmail:",
};


const originalNavItems = [
    { nameKey: "home", icon: Home, href: "/dashboard" },
    { nameKey: "income", icon: Briefcase, href: "/dashboard/income" },
    { nameKey: "expense", icon: Pizza, href: "/dashboard/expense" },
    { nameKey: "report", icon: BarChart2, href: "/dashboard/report" },
];

const languages = [
      { name: "Lao", code: "Lao", flag: "🇱🇦" },
      { name: "Thai", code: "Thai", flag: "🇹🇭" },
      { name: "Chinese", code: "Chinese", flag: "🇨🇳" },
      { name: "English", code: "English", flag: "🇬🇧" },
      { name: "Vietnamese", code: "Vietnamese", flag: "🇻🇳" },
];

// --- Translation Context ---
interface TranslationContextType {
    t: (key: string) => string;
    isTranslating: boolean;
    selectedLanguage: string;
    handleLanguageChange: (languageCode: string) => void;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export const useTranslation = () => {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error("useTranslation must be used within a TranslationProvider");
    }
    return context;
};

function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLanguage, setSelectedLanguage] = useState("Lao");
  const [translations, setTranslations] = useState<Record<string, string>>(originalText);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const savedLanguage = localStorage.getItem('selectedLanguage') || "Lao";
        if (savedLanguage !== 'Lao') {
            handleLanguageChange(savedLanguage, true);
        } else {
            setSelectedLanguage(savedLanguage);
        }
    }
  }, []);

  const handleLanguageChange = useCallback(async (languageCode: string, isInitialLoad = false) => {
    if (!isInitialLoad) {
        setIsTranslating(true);
    }
    try {
        if (languageCode === 'Lao') {
            setTranslations(originalText);
        } else {
            const textsToTranslate = Object.values(originalText);
            const translationInput: TranslateTextInput = {
                texts: textsToTranslate,
                targetLanguage: languageCode,
            };
            const translationOutput = await translateText(translationInput);
            
            const newTranslations: any = {};
            const originalKeys = Object.keys(originalText);
            originalKeys.forEach((key, index) => {
                newTranslations[key] = translationOutput.translatedTexts[index];
            });
            setTranslations(newTranslations);
        }
        setSelectedLanguage(languageCode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedLanguage', languageCode);
        }
    } catch (error) {
        console.error("Translation failed:", error);
    } finally {
        if (!isInitialLoad) {
            setIsTranslating(false);
        }
    }
  }, []);
  
  const t = useCallback((key: string): string => {
      return translations[key] || key;
  }, [translations]);

  return (
    <TranslationContext.Provider value={{ t, isTranslating, selectedLanguage, handleLanguageChange }}>
        {children}
    </TranslationContext.Provider>
  )
}

// --- Transaction Context ---
type TransactionInput = Omit<Transaction, 'id' | 'date' | 'time'> & { timestamp: Date };
type PartialTransactionInput = Partial<Omit<Transaction, 'id' | 'date' | 'time'>> & { timestamp?: Date };

export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    date: string;
    time: string;
    timestamp: number;
    // For pizza income
    pizzaSize?: string;
    pizzaType?: string;
    extraCheese?: boolean;
    pizzaTopping?: string;
    // For expense
    expenseItem?: string;
}
interface TransactionContextType {
    transactions: Transaction[];
    addTransaction: (transaction: TransactionInput) => Promise<void>;
    updateTransaction: (id: string, transaction: PartialTransactionInput) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    getTransactionById: (id: string) => Promise<Transaction | null>;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error("useTransactions must be used within a TransactionProvider");
    }
    return context;
}

function TransactionProvider({ children }: { children: ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const transactionsData: Transaction[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const docTimestamp = data.timestamp as Timestamp;
                const jsDate = docTimestamp.toDate();
                transactionsData.push({
                    id: doc.id,
                    type: data.type,
                    amount: data.amount,
                    description: data.description,
                    timestamp: jsDate.getTime(),
                    date: format(jsDate, 'yyyy-MM-dd'),
                    time: format(jsDate, 'HH:mm:ss'),
                    // pizza fields
                    pizzaSize: data.pizzaSize,
                    pizzaType: data.pizzaType,
                    extraCheese: data.extraCheese,
                    pizzaTopping: data.pizzaTopping,
                    // expense fields
                    expenseItem: data.expenseItem,
                });
            });
            setTransactions(transactionsData);
        });

        return () => unsubscribe();
    }, []);

    const addTransaction = async (transaction: TransactionInput) => {
        try {
            const { timestamp, ...rest } = transaction;
            await addDoc(collection(db, "transactions"), {
                ...rest,
                timestamp: Timestamp.fromDate(timestamp),
            });
        } catch (e) {
            console.error("Error adding document: ", e);
            throw e;
        }
    };
    
    const updateTransaction = async (id: string, transaction: PartialTransactionInput) => {
        const txDocRef = doc(db, 'transactions', id);
        const { timestamp, ...rest } = transaction;
        const dataToUpdate: any = { ...rest };
        if (timestamp) {
            dataToUpdate.timestamp = Timestamp.fromDate(timestamp);
        }
        await updateDoc(txDocRef, dataToUpdate);
    };

    const deleteTransaction = async (id: string) => {
        await deleteDoc(doc(db, 'transactions', id));
    };
    
    const getTransactionById = async (id: string): Promise<Transaction | null> => {
        const txDocRef = doc(db, 'transactions', id);
        const docSnap = await getDoc(txDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const docTimestamp = data.timestamp as Timestamp;
            const jsDate = docTimestamp.toDate();
            return {
                id: docSnap.id,
                ...data,
                timestamp: jsDate.getTime(),
                date: format(jsDate, 'yyyy-MM-dd'),
                time: format(jsDate, 'HH:mm:ss'),
            } as Transaction;
        } else {
            return null;
        }
    }


    return (
        <TransactionContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction, getTransactionById }}>
            {children}
        </TransactionContext.Provider>
    )
}


// --- Dialog Components ---
function RatingDialog({ t }: { t: (key: string) => string }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const ratingEmojis = ["", "😞", "😕", "😐", "🙂", "🤩"];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className={cn(
                    "flex items-center gap-3 rounded-lg px-2 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-primary-foreground w-full text-xs"
                )}>
                    <Star className="h-4 w-4" />
                    {t('rateApp')}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('rateAppTitle')}</DialogTitle>
                    <DialogDescription>{t('rateAppDescription')}</DialogDescription>
                </DialogHeader>
                <div className="flex justify-center items-center gap-4 py-4">
                    <div className="flex items-center text-4xl">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <button
                                    key={ratingValue}
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={() => setRating(ratingValue)}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                >
                                    <Star
                                        className="h-8 w-8 transition-colors"
                                        fill={ratingValue <= (hover || rating) ? "gold" : "gray"}
                                        color={ratingValue <= (hover || rating) ? "gold" : "gray"}
                                    />
                                </button>
                            );
                        })}
                    </div>
                     <div className="text-4xl w-12 h-12 flex items-center justify-center">
                        {rating > 0 && <span>{ratingEmojis[rating]}</span>}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">{t('submitRating')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AboutAppDialog({ t }: { t: (key: string) => string }) {
  const features = ['featureIncome', 'featureExpense', 'featureReport', 'featureProfile', 'featureMultiLang'];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-primary-foreground w-full text-xs"
        )}>
            <Info className="h-4 w-4" />
            {t('aboutApp')}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Logo size={30} />
            {t('aboutAppTitle')}
          </DialogTitle>
          <DialogDescription>{t('aboutAppDesc1')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <h3 className="font-semibold text-card-foreground">{t('aboutAppDesc2')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
                {features.map(feature => (
                    <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                        <span>{t(feature)}</span>
                    </li>
                ))}
            </ul>
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button>{t('close')}</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeveloperInfoDialog({ t }: { t: (key: string) => string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-primary-foreground w-full text-xs"
        )}>
            <Contact className="h-4 w-4" />
            {t('developerInfo')}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('developerInfoTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 text-sm">
            <div className="flex flex-col">
                <span className="font-semibold text-card-foreground">{t('developerNameLabel')}</span>
                <span className="text-muted-foreground">{t('developerName')}</span>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold text-card-foreground">{t('developerPhoneLabel')}</span>
                <span className="text-muted-foreground">02054539859</span>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold text-card-foreground">{t('developerEmailLabel')}</span>
                <span className="text-muted-foreground">somvang.pingsanijai14@gmail.com</span>
            </div>
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button>{t('close')}</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TranslationProvider>
      <TransactionProvider>
        <LayoutContent>{children}</LayoutContent>
      </TransactionProvider>
    </TranslationProvider>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, isTranslating, selectedLanguage, handleLanguageChange } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("https://placehold.co/100x100.png");
  const [nickname, setNickname] = useState("B");
  const { setLogoUrl } = useSettings();
  const logoInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setIsMenuOpen(false);

    const savedNickname = localStorage.getItem('nickname') || "Boy";
    const savedProfileImage = localStorage.getItem('profileImage');
    setNickname(savedNickname);
    if (savedProfileImage) {
        setProfileImage(savedProfileImage);
    }
  }, [pathname]);

  const handleLogout = () => {
    router.push("/login");
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newLogoUrl = reader.result as string;
        localStorage.setItem('logoImage', newLogoUrl);
        setLogoUrl(newLogoUrl);
      };
      reader.readAsDataURL(file);
    }
  };


  const showBackButton = pathname !== '/dashboard';

  return (
    <div className="grid min-h-screen w-full bg-secondary">
      <div className="flex flex-col bg-background rounded-l-3xl border-2 md:border-4 border-primary">
        <header className="flex h-14 items-center gap-2 border-b bg-muted/40 px-2">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 h-8 w-8"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">{t('menu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-sidebar text-sidebar-foreground p-0 w-[240px]">
               <SheetTitle className="sr-only">{t('menu')}</SheetTitle>
               <SheetDescription className="sr-only">{t('menu')}</SheetDescription>
               <div className="flex h-[80px] items-center border-b p-2 justify-center">
                    <div className="flex flex-col items-center gap-2">
                         <Logo size={40} />
                         <input type="file" ref={logoInputRef} onChange={handleLogoFileChange} accept="image/*" className="hidden" />
                         <Button variant="outline" size="sm" className="w-full h-6 text-xs" onClick={() => logoInputRef.current?.click()}>
                            <Upload className="mr-2 h-3 w-3" />
                            {t('uploadLogo')}
                         </Button>
                    </div>
                </div>
              <nav className="grid gap-1 text-sm font-medium p-2">
                {originalNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-primary-foreground text-xs",
                        pathname === item.href ? "bg-sidebar-accent text-primary-foreground" : ""
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {isTranslating ? '...' : t(item.nameKey)}
                    </Link>
                ))}
                
                <hr className="my-2 border-muted-foreground/20" />

                <button className={cn(
                    "flex items-center gap-3 rounded-lg px-2 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-primary-foreground w-full text-xs"
                )}>
                    <Share2 className="h-4 w-4" />
                    {t('shareApp')}
                </button>
                
                <RatingDialog t={t} />
                <AboutAppDialog t={t} />
                <DeveloperInfoDialog t={t} />

              </nav>
            </SheetContent>
          </Sheet>
          {showBackButton && (
             <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="w-full flex-1">
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="h-8 px-2" disabled={isTranslating}>
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map(lang => (
                    <DropdownMenuItem key={lang.code} onSelect={() => handleLanguageChange(lang.code)} disabled={isTranslating}>
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
           <Button asChild variant="ghost" className="relative h-8 w-8 rounded-full">
              <Link href="/dashboard/profile">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={profileImage} alt={nickname} />
                    <AvatarFallback>{nickname.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
            </Button>
        </header>
        <main className="flex flex-1 flex-col gap-2 p-2 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
