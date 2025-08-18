import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
      <Card className="w-full max-w-sm shadow-2xl bg-card text-card-foreground border-primary border-4">
        <CardHeader className="text-center p-4 md:p-6">
          <div className="mx-auto mb-4">
            <Logo size={100} />
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold text-primary">
            BoyMo Pizza Finances
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            ບັນທຶກລາຍຮັບ-ລາຍຈ່າຍ
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <Link href="/login" className="w-full">
            <Button className="w-full text-base py-4 md:py-5 bg-primary hover:bg-primary/80 text-primary-foreground">
              ຍິນດີຕ້ອນຮັບເຂົ້າສູ່ຮ້ານ Mo Pizza
            </Button>
          </Link>
        </CardContent>
        <CardFooter className="p-4 md:p-6">
          <p className="w-full text-center text-xs md:text-sm text-muted-foreground">
            ແອັບນີ້ໃຊ້ງານໄດ້ສະເພາະເຈົ້າຂອງຮ້ານ BoyMo Pizza ເທົ່ານັ້ນ.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
