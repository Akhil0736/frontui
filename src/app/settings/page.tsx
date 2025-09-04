
'use client';

import React, { useMemo, useState } from 'react';
import { RionaClient } from '@/sdk/rionaClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Instagram, 
  Loader2, 
  ExternalLink, 
  FileText, 
  HelpCircle, 
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast"


// Mock services
const authService = {
  saveSessionCookie: (cookie: string) => {
    console.log('Saving session cookie:', cookie)
    // In a real extension, this would save to chrome.storage.local
    return Promise.resolve({ success: true, username: 'luna_assistant_pro' });
  }
};

const chromeStorageService = {
  saveSetting: (key: string, value: any) => console.log(`Saving ${key}:`, value),
  getStoredSettings: () => ({
    subscriptionType: 'Pro',
    daysRemaining: 23,
    autoStart: false,
    notifications: ['session', 'errors'],
    dataStorage: 'local'
  })
};

// ConnectedInstagramField Component
const ConnectedInstagramField: React.FC = () => {
  const client = React.useMemo(() => new RionaClient({ credentials: 'include' }), []);
  const [sessionId, setSessionId] = useState('');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const extractSessionId = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.includes('sessionid')) {
      // Accept full cookie string; extract sessionid value
      const match = trimmed.match(/(?:^|;\s*)sessionid=([^;\s]+)/i);
      return match ? match[1] : '';
    }
    return trimmed; // assume raw sessionid value
  };

  const handleConnect = async () => {
    const sid = extractSessionId(sessionId);
    if (!sid) {
      setMessage('Please provide a valid Instagram sessionid.');
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      await client.loginWithSession(sid, username || undefined);
      setIsConnected(true);
      toast({ title: 'Account Connected', description: 'Session verified and saved.' });
      setMessage('Connected successfully.');
    } catch (e: any) {
      setMessage(e?.message || 'Failed to connect.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await client.logout();
      setIsConnected(false);
      toast({ title: 'Logged out' });
      setMessage('Logged out.');
    } catch (e: any) {
      setMessage(e?.message || 'Failed to logout.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="instagram-sessionid" className="text-sm font-medium text-foreground">
          Instagram Session (sessionid) Cookie
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input
            id="instagram-sessionid"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Paste your sessionid value or full cookie string"
            className="h-9 px-3 rounded-md bg-white/60 dark:bg-card/50 backdrop-blur placeholder:text-gray-500"
          />
          <Input
            id="instagram-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Optional: username label"
            className="h-9 px-3 rounded-md bg-white/60 dark:bg-card/50 backdrop-blur placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Button
            onClick={handleConnect}
            disabled={isLoading || !sessionId.trim()}
            variant="outline"
            size="sm"
            className="h-9 px-4 bg-white/60 dark:bg-card/50 backdrop-blur hover:bg-pink-500/10"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isConnected ? 'Reconnect' : 'Connect'}
          </Button>
          <Button
            onClick={handleLogout}
            disabled={isLoading || !isConnected}
            variant="outline"
            size="sm"
            className="h-9 px-4 bg-white/60 dark:bg-card/50 backdrop-blur hover:bg-pink-500/10"
          >
            Logout
          </Button>
          <div className="text-xs text-muted-foreground">
            {isConnected ? 'Status: Connected' : 'Status: Not connected'}
          </div>
        </div>
        {message && (
          <div className="text-xs text-muted-foreground">{message}</div>
        )}
      </div>

      {!isConnected && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="text-xs text-muted-foreground hover:no-underline">
              How to get your session cookie?
            </AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal list-inside space-y-2 text-xs text-muted-foreground">
                <li>Open Instagram.com in a new tab and log in.</li>
                <li>Open DevTools (Right-click &gt; Inspect, or F12).</li>
                <li>Go to Application/Storage &gt; Cookies &gt; https://www.instagram.com.</li>
                <li>Copy the value of the cookie named "sessionid".</li>
                <li>Paste it above and click Connect.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};


// AutoStartToggle Component
const AutoStartToggle: React.FC = () => {
  const [autoStart, setAutoStart] = useState(false);

  const handleToggle = (checked: boolean) => {
    setAutoStart(checked);
    chromeStorageService.saveSetting('autoStart', checked);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label htmlFor="auto-start" className="text-sm font-medium text-foreground">
          Auto-Start on Browser Launch
        </Label>
        <p className="text-xs text-muted-foreground">
          {autoStart ? 'Enabled' : 'Disabled'}
        </p>
      </div>
      <Switch
        id="auto-start"
        checked={autoStart}
        onCheckedChange={handleToggle}
      />
    </div>
  );
};

// NotificationsGroup Component
const NotificationsGroup: React.FC = () => {
  const [notifications, setNotifications] = useState(['session', 'errors']);

  const handleNotificationChange = (type: string, checked: boolean) => {
    const updated = checked 
      ? [...notifications, type]
      : notifications.filter(n => n !== type);
    setNotifications(updated);
    chromeStorageService.saveSetting('notifications', updated);
  };

  const notificationTypes = [
    { id: 'session', label: 'Session Updates', description: 'Get notified about session status' },
    { id: 'errors', label: 'Error Alerts', description: 'Receive alerts for errors' },
    { id: 'milestones', label: 'Milestones', description: 'Celebrate your achievements' }
  ];

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-foreground">Notifications</Label>
      {notificationTypes.map((type) => (
        <div key={type.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor={type.id} className="text-sm font-medium text-foreground cursor-pointer">
              {type.label}
            </Label>
            <p className="text-xs text-muted-foreground">{type.description}</p>
          </div>
          <Checkbox
            id={type.id}
            checked={notifications.includes(type.id)}
            onCheckedChange={(checked) => handleNotificationChange(type.id, checked as boolean)}
          />
        </div>
      ))}
    </div>
  );
};

// DataStorageSelect Component
const DataStorageSelect: React.FC = () => {
  const [storage, setStorage] = useState('local');

  return (
    <div className="space-y-2">
      <Label htmlFor="data-storage" className="text-sm font-medium text-foreground">
        Data Storage
      </Label>
      <Select value={storage} onValueChange={setStorage}>
        <SelectTrigger className="h-9 px-3 rounded-md bg-white/60 dark:bg-card/50 backdrop-blur">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="local">Local Storage Only</SelectItem>
          <SelectItem value="cloud" disabled>Cloud Sync (Coming Soon)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

// SaveSettingsButton Component
const SaveSettingsButton: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: 'Settings saved successfully',
        description: 'Your preferences have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Failed to save settings',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={isSaving}
      className="bg-primary text-primary-foreground rounded-lg px-6 h-10 font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      Save Settings
    </Button>
  );
};

// GeneralSettingsCard Component
const GeneralSettingsCard: React.FC<{className?: string}> = ({ className }) => {
  return (
    <Card className={cn("bg-card/80 backdrop-blur-md", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">General Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ConnectedInstagramField />
        <AutoStartToggle />
        <NotificationsGroup />
        <DataStorageSelect />
        <div className="pt-4">
          <SaveSettingsButton />
        </div>
      </CardContent>
    </Card>
  );
};

// LicenseInfoCard Component
const LicenseInfoCard: React.FC<{className?: string}> = ({ className }) => {
  const settings = chromeStorageService.getStoredSettings();

  return (
    <Card className={cn("bg-card/80 backdrop-blur-md", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">License Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">License Type</span>
            <Badge variant="secondary">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="text-sm font-medium text-foreground">{settings.subscriptionType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Accounts</span>
            <span className="text-sm font-medium text-foreground">1 / 3</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Expires</span>
            <span className="text-sm font-medium text-foreground">{settings.daysRemaining} days</span>
          </div>
        </div>
        <Button className="w-full bg-primary text-primary-foreground rounded-lg px-6 h-10 font-medium hover:bg-primary/90">
          Upgrade License
        </Button>
      </CardContent>
    </Card>
  );
};

// HelpSupportCard Component
const HelpSupportCard: React.FC<{className?: string}> = ({ className }) => {
  const supportLinks = [
    { icon: FileText, label: 'Documentation', href: '#' },
    { icon: HelpCircle, label: 'FAQ', href: '#' },
    { icon: MessageCircle, label: 'Support', href: '#' }
  ];

  return (
    <Card className={cn("bg-card/80 backdrop-blur-md", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Help & Support</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {supportLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
            >
              <link.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-medium text-foreground group-hover:text-primary">{link.label}</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary ml-auto" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// AboutCard Component
const AboutCard: React.FC<{className?: string}> = ({ className }) => {
  return (
    <Card className={cn("bg-card/80 backdrop-blur-md", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">About Luna</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-2xl">
            <Instagram className="text-primary-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Luna v1.0.0</h3>
          <p className="text-sm text-muted-foreground">AI-Powered Instagram Engagement Assistant</p>
        </div>
        <p className="text-xs text-muted-foreground">© 2023 Luna Assistant</p>
      </CardContent>
    </Card>
  );
};

// Main Settings Component
export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background font-sans">
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
            {/* Left Column - General Settings */}
            <div>
                <GeneralSettingsCard />
            </div>
            
            {/* Right Column - License, Help, About */}
            <div className="space-y-6">
                <LicenseInfoCard />
                <HelpSupportCard />
                <AboutCard />
            </div>
            </div>
        </div>
      </main>
    </div>
  );
};

      