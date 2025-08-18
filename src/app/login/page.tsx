"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Mail, Phone, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loginValue, setLoginValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState("email");
  const [showValue, setShowValue] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication
    setTimeout(() => {
      const isEmailLogin = loginType === 'email' && loginValue === "somvang.pingsanijai13@gmail.com";
      const isPhoneLogin = loginType === 'phone' && loginValue === "02059112974";

      if (isEmailLogin || isPhoneLogin) {
        toast({
          title: "Login Successful",
          description: "ຍິນດີຕ້ອນຮັບ!",
        });
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "ກະລຸນາກວດສອບຂໍ້ມູນຂອງທ່ານຄືນໃໝ່.",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
      <Card className="w-full max-w-sm shadow-2xl bg-card text-card-foreground">
        <CardHeader className="text-center p-4 md:p-6">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-lg md:text-xl font-bold">
            BoyMo Pizza
          </CardTitle>
          <CardDescription className="text-sm">
            ກະລຸນາເລືອກວິທີເຂົ້າສູ່ລະບົບຂອງທ່ານ
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
          <Tabs 
            value={loginType} 
            onValueChange={(value) => {
              setLoginType(value);
              setLoginValue("");
              setShowValue(false);
            }} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">ອີເມວ</TabsTrigger>
              <TabsTrigger value="phone">ເບີໂທ</TabsTrigger>
            </TabsList>
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <TabsContent value="email" className="m-0">
                <div className="space-y-2">
                  <Label htmlFor="email">Gmail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type={showValue ? "text" : "password"}
                      placeholder="ປ້ອນອີເມວຂອງທ່ານ"
                      value={loginValue}
                      onChange={(e) => setLoginValue(e.target.value)}
                      required
                      className="pl-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowValue(!showValue)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      aria-label="Toggle visibility"
                    >
                      {showValue ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="phone" className="m-0">
                <div className="space-y-2">
                  <Label htmlFor="phone">ເບີໂທ</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type={showValue ? "text" : "password"}
                      placeholder="ປ້ອນເບີໂທຂອງທ່ານ"
                      value={loginValue}
                      onChange={(e) => setLoginValue(e.target.value)}
                      required
                      className="pl-9 pr-9"
                    />
                     <button
                      type="button"
                      onClick={() => setShowValue(!showValue)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      aria-label="Toggle visibility"
                    >
                      {showValue ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
              </TabsContent>
              <Button type="submit" className="w-full text-base py-4 bg-primary hover:bg-primary/80" disabled={isLoading}>
                {isLoading ? "ກຳລັງກວດສອບ..." : "ເຂົ້າສູ່ລະບົບ"}
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
