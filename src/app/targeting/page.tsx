
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
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

const GlassCard: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = '' }) => {
  return (
    <Card className={`bg-glass backdrop-blur-xl border-stroke shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-txt-primary mb-4">{title}</h3>
        {children}
      </div>
    </Card>
  );
};

const TagInput: React.FC<{
  id: string;
  label: string;
  helper: string;
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ id, label, helper, value, onChange }) => {
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
      <Label htmlFor={id} className="text-txt-primary font-medium">{label}</Label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            id={id}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            className="flex-1 bg-white/50 border-stroke focus:border-accent focus:ring-accent/20"
            placeholder={`Add ${label.toLowerCase()}...`}
          />
          <Button 
            type="button" 
            onClick={addTag}
            variant="outline"
            className="bg-white/50 border-stroke hover:bg-accent hover:text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 hover:text-danger"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <p className="text-sm text-txt-second">{helper}</p>
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
      <Label htmlFor={id} className="text-txt-primary font-medium">Target Locations</Label>
      <Select onValueChange={(newValue) => {
        if (!value.includes(newValue)) {
          onChange([...value, newValue]);
        }
      }}>
        <SelectTrigger className="bg-white/50 border-stroke focus:border-accent">
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
            className="bg-accent/10 text-accent border-accent/20"
          >
            <MapPin className="w-3 h-3 mr-1" />
            {location}
            <button
              onClick={() => onChange(value.filter(l => l !== location))}
              className="ml-2 hover:text-danger"
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
        <Label htmlFor={id} className="text-txt-primary font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <span className="text-txt-primary font-semibold">{value}</span>
          <Badge 
            variant={isRisk ? "destructive" : "default"}
            className={isRisk ? "bg-danger text-white" : "bg-success text-white"}
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
        className="w-full"
      />
      <div className="flex justify-between text-xs text-txt-second">
        <span>0</span>
        <span className="text-success">Safe: {safe}</span>
        <span>Max: {max}</span>
      </div>
    </div>
  );
};

const SafetyNotice: React.FC<{ hasRisk: boolean }> = ({ hasRisk }) => {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${
      hasRisk 
        ? 'bg-danger/10 border border-danger/20 text-danger' 
        : 'bg-success/10 border border-success/20 text-success'
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
      <Label className="text-txt-primary font-medium">Comment Style</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`p-3 rounded-lg border transition-all ${
              value === option
                ? 'bg-accent text-white border-accent'
                : 'bg-white/50 border-stroke hover:border-accent/50 text-txt-primary'
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
      <Label className="text-txt-primary font-medium">Comment Length</Label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`flex-1 p-2 rounded-lg border transition-all ${
              value === option
                ? 'bg-accent text-white border-accent'
                : 'bg-white/50 border-stroke hover:border-accent/50 text-txt-primary'
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
      <Label className="text-txt-primary font-medium">Emoji Usage</Label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`flex-1 p-2 rounded-lg border transition-all ${
              value === option
                ? 'bg-accent text-white border-accent'
                : 'bg-white/50 border-stroke hover:border-accent/50 text-txt-primary'
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
      <Label className="text-txt-primary font-medium">Live Preview</Label>
      <div className="p-4 bg-white/30 border border-stroke rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">AI</span>
          </div>
          <div className="flex-1">
            <p className="text-txt-primary">{preview}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-txt-second">
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
        <Label className="text-txt-primary font-medium">Active Hours</Label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-txt-second">Start Time</Label>
          <Input
            type="time"
            value={value.start}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            className="bg-white/50 border-stroke"
          />
        </div>
        <div>
          <Label className="text-sm text-txt-second">End Time</Label>
          <Input
            type="time"
            value={value.end}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            className="bg-white/50 border-stroke"
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
      <Label className="text-txt-primary font-medium">Auto-Pause Rules</Label>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-txt-primary">Pause on weekends</span>
          <Switch
            checked={value.weekends}
            onCheckedChange={(checked) => onChange({ ...value, weekends: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-txt-primary">Pause on holidays</span>
          <Switch
            checked={value.holidays}
            onCheckedChange={(checked) => onChange({ ...value, holidays: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-txt-primary">Pause on low engagement</span>
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
        <Label className="text-txt-primary font-medium">Demographics</Label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-txt-second">Min Age</Label>
          <Input
            type="number"
            min="13"
            max="100"
            value={value.minAge}
            onChange={(e) => onChange({ ...value, minAge: parseInt(e.target.value) || 18 })}
            className="bg-white/50 border-stroke"
          />
        </div>
        <div>
          <Label className="text-sm text-txt-second">Max Age</Label>
          <Input
            type="number"
            min="13"
            max="100"
            value={value.maxAge}
            onChange={(e) => onChange({ ...value, maxAge: parseInt(e.target.value) || 65 })}
            className="bg-white/50 border-stroke"
          />
        </div>
      </div>
      <div>
        <Label className="text-sm text-txt-second">Gender</Label>
        <Select value={value.gender} onValueChange={(gender) => onChange({ ...value, gender })}>
          <SelectTrigger className="bg-white/50 border-stroke">
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
      <h3 className="text-lg font-semibold text-txt-primary">Quick Tips</h3>
      {tips.map((tip, index) => (
        <Card key={index} className="p-4 bg-white/30 border-stroke">
          <div className="flex items-start gap-3">
            <tip.icon className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <h4 className="font-medium text-txt-primary mb-1">{tip.title}</h4>
              <p className="text-sm text-txt-second">{tip.content}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const HeaderBar: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-6 bg-glass backdrop-blur-xl border-b border-stroke">
      <Button variant="ghost" size="sm" className="text-txt-primary hover:bg-white/20">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div>
        <h1 className="text-xl font-semibold text-txt-primary">Smart Targeting</h1>
        <p className="text-sm text-txt-second">Configure your AI-powered engagement strategy</p>
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
    <div className="fixed bottom-0 left-0 right-0 bg-glass backdrop-blur-xl border-t border-stroke p-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="text-sm text-txt-second">
          {hasSettings ? 'Settings saved' : 'Configure your targeting settings'}
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onSave}
            disabled={isLoading}
            className="bg-white/50 border-stroke hover:bg-white/70"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
          <Button 
            onClick={onStart}
            disabled={isLoading || !hasSettings}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
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
    <div className="min-h-screen bg-gradient-to-br from-white via-accent/5 to-white">
      <HeaderBar />
      
      <div className="mx-auto max-w-5xl px-6 py-8 grid gap-6 lg:grid-cols-[1fr_280px] pb-24">
        {/* Main Column */}
        <div className="space-y-6">
          <GlassCard title="Target Audience">
            <div className="grid gap-6 md:grid-cols-2">
              <TagInput
                id="hashtags"
                label="Hashtags"
                helper="5-10 tags • 100K–1M posts"
                value={settings.hashtags}
                onChange={(hashtags) => setSettings({ ...settings, hashtags })}
              />
              <TagInput
                id="competitors"
                label="Competitors"
                helper="2-5 engaged accounts"
                value={settings.competitors}
                onChange={(competitors) => setSettings({ ...settings, competitors })}
              />
              <div className="md:col-span-2">
                <LocationSelect
                  id="locations"
                  value={settings.locations}
                  onChange={(locations) => setSettings({ ...settings, locations })}
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Engagement Limits">
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
          </GlassCard>

          <GlassCard title="AI Comments">
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
          </GlassCard>

          <Card className="bg-glass backdrop-blur-xl border-stroke">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced" className="border-none">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-accent" />
                    <span className="text-lg font-semibold text-txt-primary">Advanced Targeting</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    <TimeWindowPicker
                      value={settings.activeHours}
                      onChange={(activeHours) => setSettings({ ...settings, activeHours })}
                    />
                    <Separator className="bg-stroke" />
                    <PauseRules
                      value={settings.pauseRules}
                      onChange={(pauseRules) => setSettings({ ...settings, pauseRules })}
                    />
                    <Separator className="bg-stroke" />
                    <DemographicFilter
                      value={settings.demographics}
                      onChange={(demographics) => setSettings({ ...settings, demographics })}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
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

      <style jsx global>{`
        :root {
          --white: #FFFFFF;
          --glass: rgba(255,255,255,0.72);
          --stroke: #E5E5EA;
          --txt-primary: #1D1D1F;
          --txt-second: #6E6E73;
          --accent: #007AFF;
          --danger: #FF3B30;
          --success: #30D158;
        }

        .bg-glass {
          background-color: var(--glass);
        }

        .border-stroke {
          border-color: var(--stroke);
        }

        .text-txt-primary {
          color: var(--txt-primary);
        }

        .text-txt-second {
          color: var(--txt-second);
        }

        .text-accent {
          color: var(--accent);
        }

        .bg-accent {
          background-color: var(--accent);
        }

        .text-danger {
          color: var(--danger);
        }

        .bg-danger {
          background-color: var(--danger);
        }

        .text-success {
          color: var(--success);
        }

        .bg-success {
          background-color: var(--success);
        }

        .hover\\:bg-accent\\/90:hover {
          background-color: rgba(0, 122, 255, 0.9);
        }

        .focus\\:border-accent:focus {
          border-color: var(--accent);
        }

        .focus\\:ring-accent\\/20:focus {
          box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.18);
        }

        * {
          transition: all 150ms ease;
        }

        *:hover {
          transform: translateY(-1px);
        }

        button:hover, .hover\\:bg-white\\/70:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

```