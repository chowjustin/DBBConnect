'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export function ComponentsShowcase() {
  return (
    <div className='grid gap-6 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          <Button>Default</Button>
          <Button variant='destructive'>Destructive</Button>
          <Button variant='outline'>Outline</Button>
          <Button variant='secondary'>Secondary</Button>
          <Button variant='ghost'>Ghost</Button>
          <Button variant='link'>Link</Button>
          <Button size='sm'>Small</Button>
          <Button size='lg'>Large</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form fields</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='space-y-1.5'>
            <Label htmlFor='sb-email'>Email</Label>
            <Input id='sb-email' placeholder='you@example.com' />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sb-msg'>Pesan</Label>
            <Textarea id='sb-msg' placeholder='Tulis sesuatu...' />
          </div>
          <div className='space-y-1.5'>
            <Label>Mata pelajaran</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder='Pilih' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='MATH'>Matematika</SelectItem>
                <SelectItem value='PHYSICS'>Fisika</SelectItem>
                <SelectItem value='ENGLISH'>Bahasa Inggris</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <Checkbox id='sb-cb' />
            <Label htmlFor='sb-cb'>Ingat saya</Label>
          </div>
          <div className='flex items-center gap-2'>
            <Switch id='sb-sw' />
            <Label htmlFor='sb-sw'>Notifikasi email</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overlays</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline'>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Konfirmasi</DialogTitle>
                <DialogDescription>
                  Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant='outline'>Batal</Button>
                <Button variant='destructive'>Hapus</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline'>Open sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter</SheetTitle>
                <SheetDescription>
                  Atur kriteria pencarian tutor.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='outline'>Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip body</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Alert>
            <AlertTitle>Verifikasi tertunda</AlertTitle>
            <AlertDescription>
              Dokumen sedang ditinjau oleh admin.
            </AlertDescription>
          </Alert>
          <div className='flex items-center gap-3'>
            <Avatar>
              <AvatarFallback>AW</AvatarFallback>
            </Avatar>
            <Separator orientation='vertical' className='h-8' />
            <Skeleton className='h-4 w-32' />
          </div>
          <Progress value={66} />
        </CardContent>
      </Card>

      <Card className='md:col-span-2'>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='overview'>
            <TabsList>
              <TabsTrigger value='overview'>Ringkasan</TabsTrigger>
              <TabsTrigger value='sessions'>Sesi</TabsTrigger>
              <TabsTrigger value='earnings'>Penghasilan</TabsTrigger>
            </TabsList>
            <TabsContent value='overview' className='py-3 text-sm'>
              Konten ringkasan.
            </TabsContent>
            <TabsContent value='sessions' className='py-3 text-sm'>
              Daftar sesi mendatang.
            </TabsContent>
            <TabsContent value='earnings' className='py-3 text-sm'>
              Grafik penghasilan.
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
