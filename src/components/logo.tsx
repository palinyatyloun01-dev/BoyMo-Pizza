
"use client";

import Image from "next/image";
import { useSettings } from "@/app/layout";

export function Logo({ size = 100, mdSize }: { size?: number, mdSize?: number }) {
  const { logoUrl } = useSettings();
  const finalMdSize = mdSize || size;
  
  return (
    <div className="flex items-center justify-center rounded-full">
      <Image 
        src={logoUrl || `https://placehold.co/${size}x${size}.png`}
        alt="BoyMo Pizza Logo" 
        width={size} 
        height={size}
        data-ai-hint="sexy woman pizza"
        className="rounded-full border-2 border-primary md:hidden"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      <Image 
        src={logoUrl || `https://placehold.co/${finalMdSize}x${finalMdSize}.png`}
        alt="BoyMo Pizza Logo" 
        width={finalMdSize} 
        height={finalMdSize}
        data-ai-hint="sexy woman pizza"
        className="rounded-full border-2 border-primary hidden md:block"
        style={{ width: `${finalMdSize}px`, height: `${finalMdSize}px` }}
      />
    </div>
  );
}
