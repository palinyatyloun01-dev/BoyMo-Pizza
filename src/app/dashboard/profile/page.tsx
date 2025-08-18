
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Video, RotateCcw, Check } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "../layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { useSettings } from "@/app/layout";


export default function ProfilePage() {
  const { t, isTranslating } = useTranslation();
  const { toast } = useToast();
  const { setLogoUrl } = useSettings();
  const text = (key: string) => isTranslating ? '...' : t(key);
  
  const [nickname, setNickname] = useState("Boy");
  const [profileImage, setProfileImage] = useState("https://placehold.co/100x100.png");
  const [storeStatus, setStoreStatus] = useState("open");
  const [logoImage, setLogoImage] = useState("https://placehold.co/100x100.png");

  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedNickname = localStorage.getItem('nickname');
    const savedProfileImage = localStorage.getItem('profileImage');
    const savedStoreStatus = localStorage.getItem('storeStatus');
    const savedLogoImage = localStorage.getItem('logoImage');
    if (savedNickname) setNickname(savedNickname);
    if (savedProfileImage) setProfileImage(savedProfileImage);
    if (savedStoreStatus) setStoreStatus(savedStoreStatus);
    if (savedLogoImage) {
        setLogoImage(savedLogoImage);
        setLogoUrl(savedLogoImage);
    }
  }, [setLogoUrl]);

  const handleSaveChanges = () => {
    localStorage.setItem('nickname', nickname);
    localStorage.setItem('profileImage', profileImage);
    localStorage.setItem('storeStatus', storeStatus);
    localStorage.setItem('logoImage', logoImage);
    setLogoUrl(logoImage); // Update logo in context
    toast({ title: "Success", description: "Changes saved successfully!" });
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newLogoUrl = reader.result as string;
        setLogoImage(newLogoUrl);
        setLogoUrl(newLogoUrl); // Update logo in context immediately for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  useEffect(() => {
    if (showCameraDialog) {
      openCamera();
    } else {
      closeCamera();
    }
    return () => closeCamera();
  }, [showCameraDialog]);


  const takePhoto = () => {
    if (videoRef.current && photoRef.current) {
        const video = videoRef.current;
        const photo = photoRef.current;
        photo.width = video.videoWidth;
        photo.height = video.videoHeight;
        const ctx = photo.getContext('2d');
        ctx?.drawImage(video, 0, 0, photo.width, photo.height);
        const dataUri = photo.toDataURL('image/jpeg');
        setProfileImage(dataUri);
        setShowCameraDialog(false);
    }
  };


  return (
    <div className="flex flex-col gap-4 md:gap-6">
        <h1 className="text-base md:text-lg font-semibold text-card-foreground">{text('manageProfile')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{text('personalInfo')}</CardTitle>
          <CardDescription>{text('updateProfileInfo')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 md:h-20 md:w-20">
              <AvatarImage src={profileImage} alt="Profile" data-ai-hint="sexy woman pizza"/>
              <AvatarFallback>{nickname.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {text('uploadFromGallery')}
                </Button>
                <Dialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                            <Camera className="mr-2 h-4 w-4" />
                            {text('takePhoto')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{text('takePhoto')}</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-4">
                           <div className="w-full relative">
                             <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                             <canvas ref={photoRef} className="hidden" />
                             {hasCameraPermission === false && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                                    <Alert variant="destructive" className="w-auto">
                                      <AlertTitle>{text('cameraAccessRequired')}</AlertTitle>
                                      <AlertDescription>{text('allowCameraAccess')}</AlertDescription>
                                    </Alert>
                                </div>
                             )}
                           </div>
                           <Button onClick={takePhoto} disabled={hasCameraPermission !== true} className="w-full">
                                <Video className="mr-2 h-4 w-4" />
                                {text('capture')}
                           </Button>
                        </div>
                    </DialogContent>
                </Dialog>
                <p className="text-xs text-muted-foreground">{text('uploadInstructions')}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">{text('nickname')}</Label>
            <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{text('manageLogo')}</CardTitle>
          <CardDescription>{text('updateLogoInfo')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
              <Logo size={60} mdSize={80} />
              <div className="flex flex-col gap-2">
                  <input type="file" ref={logoInputRef} onChange={handleLogoFileChange} accept="image/*" className="hidden" />
                  <Button onClick={() => logoInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      {text('uploadLogo')}
                  </Button>
              </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{text('storeStatus')}</CardTitle>
          <CardDescription>{text('setStoreStatus')}</CardDescription>
        </CardHeader>
        <CardContent>
            <Select value={storeStatus} onValueChange={setStoreStatus}>
            <SelectTrigger className="w-full md:w-[280px]">
                <SelectValue placeholder={text('selectStatus')} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="open">{text('statusOpen')}</SelectItem>
                <SelectItem value="closed">{text('statusClosed')}</SelectItem>
                <SelectItem value="maintenance">{text('statusMaintenance')}</SelectItem>
                <SelectItem value="holiday">{text('statusHoliday')}</SelectItem>
            </SelectContent>
            </Select>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>{text('customerFeedback')}</CardTitle>
          <CardDescription>{text('checkCustomerFeedback')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{text('noFeedback')}</p>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button onClick={handleSaveChanges}>
          {text('saveChanges')}
        </Button>
      </div>
    </div>
  );
}
