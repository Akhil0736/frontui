
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  Minus, 
  Plus, 
  Shield, 
  ShieldAlert,
  Clock,
  Users,
  MapPin,
  Hash,
  MessageCircle,
  Smile,
  ChevronRight,
  Save,
  Play,
  Info,
  Lightbulb,
  Target,
  Settings as SettingsIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import HolographicCard from '@/components/ui/holographic-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface TargetingSettings {
  hashtags: string[];
  competitors: string[];
  locations: string[];
  dailyFollows: number;
  dailyLikes: number;
  dailyComments: number;
  sessionHours: number;
  commentStyle: string;
  commentLength: string;
  emojiLevel: string;
  activeHours: { start: string; end: string };
  pauseRules: {
    weekends: boolean;
    holidays: boolean;
    lowEngagement: boolean;
  };
  demographics: {
    minAge: number;
    maxAge: number;
    gender: string;
  };
}

const TagInput: React.FC<{
  id: string;
  label: string;
  helper: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}> = ({ id, label, helper, value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-foreground font-medium">{label}</Label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            id={id}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            className="flex-1"
            placeholder={placeholder}
          />
          <Button 
            type="button" 
            onClick={addTag}
            variant="outline"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{helper}</p>
      </div>
    </div>
  );
};

const LocationSelect: React.FC<{
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ id, value, onChange }) => {
  const locations = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France'];

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-foreground font-medium">Target Locations</Label>
      <Select onValueChange={(newValue) => {
        if (!value.includes(newValue)) {
          onChange([...value, newValue]);
        }
      }}>
        <SelectTrigger>
          <SelectValue placeholder="Select locations..." />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex flex-wrap gap-2">
        {value.map((location) => (
          <Badge 
            key={location} 
            variant="secondary"
          >
            <MapPin className="w-3 h-3 mr-1" />
            {location}
            <button
              onClick={() => onChange(value.filter(l => l !== location))}
              className="ml-2 hover:text-destructive"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

const LimitSlider: React.FC<{
  id: string;
  label: string;
  max: number;
  safe: number;
  value: number;
  onChange: (value: number) => void;
}> = ({ id, label, max, safe, value, onChange }) => {
  const isRisk = value > safe;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-foreground font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <span className="text-foreground font-semibold">{value}</span>
          <Badge 
            variant={isRisk ? "destructive" : "default"}
          >
            {isRisk ? "Risk" : "Safe"}
          </Badge>
        </div>
      </div>
      <Slider
        id={id}
        min={0}
        max={max}
        step={1}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span className="text-green-500">Safe: {safe}</span>
        <span>Max: {max}</span>
      </div>
    </div>
  );
};

const SafetyNotice: React.FC<{ hasRisk: boolean }> = ({ hasRisk }) => {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${
      hasRisk 
        ? 'bg-destructive/10 border border-destructive/20 text-destructive' 
        : 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400'
    }`}>
      {hasRisk ? (
        <ShieldAlert className="w-5 h-5" />
      ) : (
        <Shield className="w-5 h-5" />
      )}
      <span className="font-medium">
        {hasRisk ? 'Warning: Some limits exceed safe zone' : 'All limits within safe zone'}
      </span>
    </div>
  );
};

const RadioMatrix: React.FC<{
  id: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}> = ({ id, options, value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">Comment Style</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`p-3 rounded-lg border transition-all ${
              value === option
                ? 'bg-accent text-accent-foreground border-accent'
                : 'bg-background hover:border-accent/50 text-foreground'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

const LengthRadio: React.FC<{
  id: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ id, value, onChange }) => {
  const options = ['Short', 'Medium', 'Long'];

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">Comment Length</Label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`flex-1 p-2 rounded-lg border transition-all ${
              value === option
                ? 'bg-accent text-accent-foreground border-accent'
                : 'bg-background hover:border-accent/50 text-foreground'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

const EmojiToggle: React.FC<{
  id: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ id, value, onChange }) => {
  const options = ['None', 'Minimal', 'Moderate', 'Liberal'];

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">Emoji Usage</Label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`flex-1 p-2 rounded-lg border transition-all ${
              value === option
                ? 'bg-accent text-accent-foreground border-accent'
                : 'bg-background hover:border-accent/50 text-foreground'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

const LivePreview: React.FC<{ settings: TargetingSettings }> = ({ settings }) => {
  const [preview, setPreview] = useState('');

  useEffect(() => {
    // Simulate AI comment generation
    const generatePreview = () => {
      const styles = {
        Professional: "This is an excellent post! Your insights are valuable.",
        Friendly: "Love this! Thanks for sharing your thoughts 😊",
        Casual: "This is so cool! Really enjoyed reading this.",
        Enthusiastic: "Amazing work! This totally made my day! 🔥"
      };
      
      let baseComment = styles[settings.commentStyle as keyof typeof styles] || styles.Professional;
      
      if (settings.commentLength === 'Short') {
        baseComment = baseComment.split('.')[0] + '.';
      } else if (settings.commentLength === 'Long') {
        baseComment += " Looking forward to seeing more content like this!";
      }
      
      if (settings.emojiLevel === 'None') {
        baseComment = baseComment.replace(/[😊🔥]/g, '');
      }
      
      setPreview(baseComment);
    };

    generatePreview();
  }, [settings]);

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">Live Preview</Label>
      <div className="p-4 bg-background/30 border border-border rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-accent-foreground text-sm font-medium">AI</span>
          </div>
          <div className="flex-1">
            <p className="text-foreground">{preview}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>2m ago</span>
              <button className="hover:text-accent">Like</button>
              <button className="hover:text-accent">Reply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeWindowPicker: React.FC<{
  value: { start: string; end: string };
  onChange: (value: { start: string; end: string }) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-accent" />
        <Label className="text-foreground font-medium">Active Hours</Label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground">Start Time</Label>
          <Input
            type="time"
            value={value.start}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">End Time</Label>
          <Input
            type="time"
            value={value.end}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

const PauseRules: React.FC<{
  value: { weekends: boolean; holidays: boolean; lowEngagement: boolean };
  onChange: (value: { weekends: boolean; holidays: boolean; lowEngagement: boolean }) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <Label className="text-foreground font-medium">Auto-Pause Rules</Label>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-foreground">Pause on weekends</span>
          <Switch
            checked={value.weekends}
            onCheckedChange={(checked) => onChange({ ...value, weekends: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground">Pause on holidays</span>
          <Switch
            checked={value.holidays}
            onCheckedChange={(checked) => onChange({ ...value, holidays: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground">Pause on low engagement</span>
          <Switch
            checked={value.lowEngagement}
            onCheckedChange={(checked) => onChange({ ...value, lowEngagement: checked })}
          />
        </div>
      </div>
    </div>
  );
};

const DemographicFilter: React.FC<{
  value: { minAge: number; maxAge: number; gender: string };
  onChange: (value: { minAge: number; maxAge: number; gender: string }) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-accent" />
        <Label className="text-foreground font-medium">Demographics</Label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground">Min Age</Label>
          <Input
            type="number"
            min="13"
            max="100"
            value={value.minAge}
            onChange={(e) => onChange({ ...value, minAge: parseInt(e.target.value) || 18 })}
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Max Age</Label>
          <Input
            type="number"
            min="13"
            max="100"
            value={value.maxAge}
            onChange={(e) => onChange({ ...value, maxAge: parseInt(e.target.value) || 65 })}
          />
        </div>
      </div>
      <div>
        <Label className="text-sm text-muted-foreground">Gender</Label>
        <Select value={value.gender} onValueChange={(gender) => onChange({ ...value, gender })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const HelperPanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  const tips = [
    {
      icon: Target,
      title: "Targeting Tips",
      content: "Use hashtags with 100K-1M posts for optimal reach. Mix popular and niche tags."
    },
    {
      icon: Shield,
      title: "Stay Safe",
      content: "Keep daily actions within safe limits to avoid account restrictions."
    },
    {
      icon: MessageCircle,
      title: "Engagement Quality",
      content: "Authentic comments perform better. Let AI adapt to your brand voice."
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-foreground">Quick Tips</h3>
      {tips.map((tip, index) => (
        <HolographicCard key={index}>
           <div className="flex items-start gap-3">
            <tip.icon className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1">{tip.title}</h4>
              <p className="text-sm text-muted-foreground">{tip.content}</p>
            </div>
          </div>
        </HolographicCard>
      ))}
    </div>
  );
};

const HeaderBar: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-6 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-10">
      <Button variant="ghost" size="sm">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div>
        <h1 className="text-xl font-semibold text-foreground">Smart Targeting</h1>
        <p className="text-sm text-muted-foreground">Configure your AI-powered engagement strategy</p>
      </div>
    </div>
  );
};

const FooterCTA: React.FC<{
  onSave: () => void;
  onStart: () => void;
  isLoading: boolean;
  hasSettings: boolean;
}> = ({ onSave, onStart, isLoading, hasSettings }) => {
  return (
    <div className="sticky bottom-0 z-10 bg-background/80 backdrop-blur-xl border-t border-border p-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {hasSettings ? 'Settings saved' : 'Configure your targeting settings'}
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onSave}
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
          <Button 
            onClick={onStart}
            disabled={isLoading || !hasSettings}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Start Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function SmartTargetingScreen() {
  const [settings, setSettings] = useState<TargetingSettings>({
    hashtags: ['socialmedia', 'marketing'],
    competitors: ['@competitor1'],
    locations: ['United States'],
    dailyFollows: 25,
    dailyLikes: 100,
    dailyComments: 20,
    sessionHours: 4,
    commentStyle: 'Professional',
    commentLength: 'Medium',
    emojiLevel: 'Minimal',
    activeHours: { start: '09:00', end: '17:00' },
    pauseRules: {
      weekends: true,
      holidays: true,
      lowEngagement: false
    },
    demographics: {
      minAge: 18,
      maxAge: 65,
      gender: 'all'
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasSettings, setHasSettings] = useState(true);

  const hasRisk = settings.dailyFollows > 25 || 
                  settings.dailyLikes > 100 || 
                  settings.dailyComments > 20 || 
                  settings.sessionHours > 4;

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasSettings(true);
    setIsLoading(false);
  };

  const handleStart = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderBar />
      
      <div className="mx-auto max-w-5xl px-6 py-8 grid gap-6 lg:grid-cols-[1fr_280px] pb-24">
        {/* Main Column */}
        <div className="space-y-6">
          <HolographicCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">Target Audience</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <TagInput
                id="hashtags"
                label="Hashtags"
                helper="5-10 tags • 100K–1M posts"
                value={settings.hashtags}
                onChange={(hashtags) => setSettings({ ...settings, hashtags })}
                placeholder="Add hashtags..."
              />
              <TagInput
                id="competitors"
                label="Competitors"
                helper="2-5 engaged accounts"
                value={settings.competitors}
                onChange={(competitors) => setSettings({ ...settings, competitors })}
                placeholder="Add competitors..."
              />
              <div className="md:col-span-2">
                <LocationSelect
                  id="locations"
                  value={settings.locations}
                  onChange={(locations) => setSettings({ ...settings, locations })}
                />
              </div>
            </div>
          </HolographicCard>

          <HolographicCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">Engagement Limits</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <LimitSlider
                id="follows"
                label="Daily Follows"
                max={50}
                safe={25}
                value={settings.dailyFollows}
                onChange={(dailyFollows) => setSettings({ ...settings, dailyFollows })}
              />
              <LimitSlider
                id="likes"
                label="Daily Likes"
                max={200}
                safe={100}
                value={settings.dailyLikes}
                onChange={(dailyLikes) => setSettings({ ...settings, dailyLikes })}
              />
              <LimitSlider
                id="comments"
                label="Daily Comments"
                max={50}
                safe={20}
                value={settings.dailyComments}
                onChange={(dailyComments) => setSettings({ ...settings, dailyComments })}
              />
              <LimitSlider
                id="hours"
                label="Session Hours"
                max={8}
                safe={4}
                value={settings.sessionHours}
                onChange={(sessionHours) => setSettings({ ...settings, sessionHours })}
              />
            </div>
            <div className="mt-6">
              <SafetyNotice hasRisk={hasRisk} />
            </div>
          </HolographicCard>

          <HolographicCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">AI Comments</h3>
            <div className="space-y-6">
              <RadioMatrix
                id="style"
                options={['Professional', 'Friendly', 'Casual', 'Enthusiastic']}
                value={settings.commentStyle}
                onChange={(commentStyle) => setSettings({ ...settings, commentStyle })}
              />
              <div className="grid gap-6 md:grid-cols-2">
                <LengthRadio
                  id="length"
                  value={settings.commentLength}
                  onChange={(commentLength) => setSettings({ ...settings, commentLength })}
                />
                <EmojiToggle
                  id="emoji"
                  value={settings.emojiLevel}
                  onChange={(emojiLevel) => setSettings({ ...settings, emojiLevel })}
                />
              </div>
              <LivePreview settings={settings} />
            </div>
          </HolographicCard>

          <HolographicCard>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced" className="border-none">
                <AccordionTrigger className="px-6">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-accent" />
                    <span className="text-lg font-semibold text-foreground">Advanced Targeting</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pt-4 pb-6">
                  <div className="space-y-6">
                    <TimeWindowPicker
                      value={settings.activeHours}
                      onChange={(activeHours) => setSettings({ ...settings, activeHours })}
                    />
                    <Separator/>
                    <PauseRules
                      value={settings.pauseRules}
                      onChange={(pauseRules) => setSettings({ ...settings, pauseRules })}
                    />
                    <Separator/>
                    <DemographicFilter
                      value={settings.demographics}
                      onChange={(demographics) => setSettings({ ...settings, demographics })}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </HolographicCard>
        </div>

        {/* Right Rail */}
        <HelperPanel className="hidden lg:block" />
      </div>

      <FooterCTA
        onSave={handleSave}
        onStart={handleStart}
        isLoading={isLoading}
        hasSettings={hasSettings}
      />
    </div>
  );
};
