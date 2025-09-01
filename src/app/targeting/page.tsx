
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Hash, Users, MapPin, Shield, Bot, TrendingUp, RefreshCw, X, ChevronDown, Plus, AlertTriangle, CheckCircle, Info, Target, Zap } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';


// TypeScript Interfaces
interface TargetingConfig {
  targeting: {
    hashtags: string[];
    competitors: string[];
    locations: string[];
    audienceFilters: {
      ageRange: [number, number];
      gender: 'all' | 'male' | 'female';
      languages: string[];
    };
  };
  safetyLimits: {
    dailyFollows: number;
    dailyLikes: number;
    dailyComments: number;
    sessionDuration: number;
  };
  aiComments: {
    style: 'friendly' | 'professional' | 'casual' | 'enthusiastic';
    length: 'short' | 'medium' | 'long';
    useEmojis: boolean;
    personalizationLevel: number;
  };
  schedule: {
    activeDays: number[];
    preferredTimes: string[];
    timezone: string;
  };
}

interface SafetySliderProps {
  label: string;
  value: number;
  max: number;
  safeThreshold: number;
  warningThreshold: number;
  unit?: string;
  onChange: (value: number) => void;
}

interface TagInputProps {
  label: string;
  placeholder: string;
  suggestions?: string[];
  maxTags?: number;
  validation?: (tag: string) => boolean;
  helperText?: string;
  value: string[];
  onChange: (tags: string[]) => void;
}


// Safety Slider Component
const SafetySlider: React.FC<SafetySliderProps> = ({
  label,
  value,
  max,
  safeThreshold,
  warningThreshold,
  unit = '',
  onChange
}) => {
  const getSafetyColor = (val: number) => {
    if (val <= safeThreshold) return 'var(--apple-green)';
    if (val <= warningThreshold) return 'var(--apple-orange)';
    return 'var(--apple-red)';
  };

  const getSafetyLabel = (val: number) => {
    if (val <= safeThreshold) return 'Safe';
    if (val <= warningThreshold) return 'Caution';
    return 'Danger';
  };

  const percentage = (value / max) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{
              backgroundColor: `${getSafetyColor(value)}1A`, // 10% opacity
              color: getSafetyColor(value)
            }}
          >
            {getSafetyLabel(value)}
          </span>
        </div>
      </div>
      
      <div className="relative">
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${percentage}%`,
              backgroundColor: getSafetyColor(value)
            }}
          />
        </div>
        
        <input
          type="range"
          min="0"
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
        
        <div className="absolute top-0 h-2 flex items-center pointer-events-none w-full">
          <div
            className="h-1 bg-green-200/50 dark:bg-green-800/50 rounded-l-full"
            style={{ width: `${(safeThreshold / max) * 100}%` }}
          />
          <div
            className="h-1 bg-orange-200/50 dark:bg-orange-800/50"
            style={{ width: `${((warningThreshold - safeThreshold) / max) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};


// Tag Input Component
const TagInput: React.FC<TagInputProps> = ({
  label,
  placeholder,
  suggestions = [],
  maxTags = 10,
  validation,
  helperText,
  value,
  onChange
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
  );

  const addTag = (tag: string) => {
    if (tag && value.length < maxTags && !value.includes(tag)) {
      if (!validation || validation(tag)) {
        onChange([...value, tag]);
        setInputValue('');
        setShowSuggestions(false);
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };
  
  const handleBlur = () => {
    // Timeout to allow click on suggestion to register
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      
      <div className="relative">
        <div className="min-h-[42px] bg-background border border-border rounded-xl p-3 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-[var(--apple-blue)] focus-within:border-[var(--apple-blue)]">
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-muted text-foreground px-3 py-1 rounded-lg text-sm font-medium"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-muted-foreground hover:text-[var(--apple-red)] transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (!showSuggestions) setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={handleBlur}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
            {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => addTag(suggestion)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};


export default function TargetingPage() {
  const [config, setConfig] = useState<TargetingConfig>({
    targeting: {
      hashtags: ['#fitness', '#lifestyle', '#health'],
      competitors: ['@competitor1', '@competitor2'],
      locations: ['United States', 'Canada'],
      audienceFilters: {
        ageRange: [25, 45],
        gender: 'all',
        languages: ['English']
      }
    },
    safetyLimits: {
      dailyFollows: 25,
      dailyLikes: 75,
      dailyComments: 15,
      sessionDuration: 3
    },
    aiComments: {
      style: 'professional',
      length: 'medium',
      useEmojis: true,
      personalizationLevel: 7
    },
    schedule: {
      activeDays: [1, 2, 3, 4, 5],
      preferredTimes: ['6-8 PM', '12-2 PM'],
      timezone: 'America/New_York'
    }
  });

  const [commentPreview, setCommentPreview] = useState("Excellent work! Your attention to detail really shows. Keep inspiring others! 👏");

  const hashtagSuggestions = [
    '#entrepreneur', '#business', '#motivation', '#success', '#marketing',
    '#branding', '#startup', '#leadership', '#innovation', '#networking'
  ];

  const validateHashtag = (tag: string) => {
    return tag.startsWith('#') && tag.length > 1 && !tag.includes(' ');
  };

  const validateCompetitor = (handle: string) => {
    return handle.startsWith('@') && handle.length > 1 && !handle.includes(' ');
  };

  const generateNewComment = () => {
    const comments = {
      professional: [
        "Excellent work! Your attention to detail really shows.",
        "This is incredibly insightful. Thank you for sharing your expertise.",
        "Outstanding content! Your perspective adds real value.",
        "Impressive work! This demonstrates real expertise."
      ],
      friendly: [
        "Love this! Thanks for sharing your journey 😊",
        "This is so inspiring! Keep up the amazing work! 💪",
        "Absolutely love your content! Thanks for the motivation! ✨",
        "This made my day! Thank you for sharing! 🌟"
      ],
      casual: [
        "This is so cool! Keep it up!",
        "Nice one! Really enjoyed this.",
        "Awesome stuff! Thanks for sharing.",
        "Love it! More like this please! 🔥"
      ],
      enthusiastic: [
        "WOW! Absolutely amazing content! 🔥✨",
        "INCREDIBLE! This is exactly what I needed to see! 🚀",
        "AMAZING work! You're crushing it! 💥⭐",
        "LOVE THIS! Keep shining! ✨🌟🔥"
      ]
    };
    
    const styleComments = comments[config.aiComments.style];
    const randomComment = styleComments[Math.floor(Math.random() * styleComments.length)];
    setCommentPreview(randomComment);
  };

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background">
      {/* Apple Navigation Header */}
      <div className="bg-card/80 border-b border-border backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-accent rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-[var(--apple-blue)]" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Smart Targeting</h1>
              <p className="text-sm text-muted-foreground">Configure your Instagram automation settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Target Settings Card */}
        <GradientCard>
            <div className="flex items-start gap-3 mb-6">
                <div className={'w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/20'}>
                    <div className={'text-[var(--apple-blue)]'}>
                        <Target className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex-1">
                <h3 className="text-lg font-semibold text-card-foreground mb-1">Target Settings</h3>
                <p className="text-sm text-muted-foreground">Configure your ideal audience</p>
                </div>
            </div>
            <div className="space-y-6">
                <TagInput
                label="Hashtags"
                placeholder="Enter hashtags like #fitness"
                suggestions={hashtagSuggestions}
                maxTags={10}
                validation={validateHashtag}
                helperText="Use 5-10 hashtags with 100K-1M posts for optimal reach"
                value={config.targeting.hashtags}
                onChange={(hashtags) => setConfig(prev => ({
                    ...prev,
                    targeting: { ...prev.targeting, hashtags }
                }))}
                />
                
                <TagInput
                label="Competitor Accounts"
                placeholder="Enter usernames like @competitor"
                maxTags={5}
                validation={validateCompetitor}
                helperText="Target competitor followers - they're 3x more likely to engage"
                value={config.targeting.competitors}
                onChange={(competitors) => setConfig(prev => ({
                    ...prev,
                    targeting: { ...prev.targeting, competitors }
                }))}
                />
                
                <TagInput
                label="Target Locations"
                placeholder="Enter cities or countries"
                suggestions={['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany']}
                maxTags={3}
                helperText="Focus on 1-3 locations for better engagement rates"
                value={config.targeting.locations}
                onChange={(locations) => setConfig(prev => ({
                    ...prev,
                    targeting: { ...prev.targeting, locations }
                }))}
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[var(--apple-blue)] mt-0.5" />
                    <div>
                    <p className="text-sm font-medium text-[var(--apple-blue)] mb-1">Smart Tip</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Target hashtags with 100K-1M posts for optimal reach. Competitor followers are 3x more likely to engage with your content.</p>
                    </div>
                </div>
                </div>
            </div>
        </GradientCard>

        {/* Safety-First Engagement Card */}
        <GradientCard>
            <div className="flex items-start gap-3 mb-6">
                <div className={'w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/20'}>
                    <div className={'text-[var(--apple-blue)]'}>
                       <Shield className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-card-foreground mb-1">Safety-First Engagement</h3>
                    <p className="text-sm text-muted-foreground">Stay within Instagram's safe limits</p>
                </div>
            </div>
            <div className="space-y-6">
                <SafetySlider
                label="Daily Follows"
                value={config.safetyLimits.dailyFollows}
                max={50}
                safeThreshold={25}
                warningThreshold={35}
                onChange={(dailyFollows) => setConfig(prev => ({
                    ...prev,
                    safetyLimits: { ...prev.safetyLimits, dailyFollows }
                }))}
                />
                
                <SafetySlider
                label="Daily Likes"
                value={config.safetyLimits.dailyLikes}
                max={200}
                safeThreshold={100}
                warningThreshold={150}
                onChange={(dailyLikes) => setConfig(prev => ({
                    ...prev,
                    safetyLimits: { ...prev.safetyLimits, dailyLikes }
                }))}
                />
                
                <SafetySlider
                label="Daily Comments"
                value={config.safetyLimits.dailyComments}
                max={50}
                safeThreshold={20}
                warningThreshold={35}
                onChange={(dailyComments) => setConfig(prev => ({
                    ...prev,
                    safetyLimits: { ...prev.safetyLimits, dailyComments }
                }))}
                />
                
                <SafetySlider
                label="Session Duration"
                value={config.safetyLimits.sessionDuration}
                max={8}
                safeThreshold={4}
                warningThreshold={6}
                unit="hours"
                onChange={(sessionDuration) => setConfig(prev => ({
                    ...prev,
                    safetyLimits: { ...prev.safetyLimits, sessionDuration }
                }))}
                />

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[var(--apple-orange)] mt-0.5" />
                    <div>
                    <p className="text-sm font-medium text-[var(--apple-orange)] mb-1">Safety Reminder</p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">Staying in safe zones protects your account from Instagram penalties and maintains long-term growth.</p>
                    </div>
                </div>
                </div>
            </div>
        </GradientCard>

        {/* AI Comment Intelligence Card */}
        <GradientCard>
            <div className="flex items-start gap-3 mb-6">
                <div className={'w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/20'}>
                    <div className={'text-[var(--apple-blue)]'}>
                        <Bot className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-card-foreground mb-1">AI Comment Intelligence</h3>
                    <p className="text-sm text-muted-foreground">Generate authentic, engaging comments</p>
                </div>
            </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Comment Style</label>
              <div className="grid grid-cols-2 gap-3">
                {(['friendly', 'professional', 'casual', 'enthusiastic'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setConfig(prev => ({
                      ...prev,
                      aiComments: { ...prev.aiComments, style }
                    }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      config.aiComments.style === style
                        ? 'border-[var(--apple-blue)] bg-blue-50 dark:bg-blue-900/20'
                        : 'border-border hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-sm capitalize mb-1">{style}</div>
                    <div className="text-xs text-muted-foreground">
                      {style === 'friendly' && 'Warm and approachable'}
                      {style === 'professional' && 'Business-focused tone'}
                      {style === 'casual' && 'Relaxed and informal'}
                      {style === 'enthusiastic' && 'High energy and excited'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Preview</span>
                <button
                  onClick={generateNewComment}
                  className="flex items-center gap-2 px-3 py-1 bg-[var(--apple-blue)] text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate New
                </button>
              </div>
              <div className="bg-background rounded-lg p-3 border border-border">
                <p className="text-sm text-foreground">"{commentPreview}"</p>
              </div>
            </div>
          </div>
        </GradientCard>

        {/* Luna's Tactical Insights Card */}
        <GradientCard>
            <div className="flex items-start gap-3 mb-6">
                <div className={'w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/20'}>
                    <div className={'text-[var(--apple-blue)]'}>
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-card-foreground mb-1">Luna's Tactical Insights</h3>
                    <p className="text-sm text-muted-foreground">AI-powered optimization recommendations</p>
                </div>
            </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-[var(--apple-green)]" />
                  <span className="text-sm font-medium text-[var(--apple-green)]">Predicted Growth</span>
                </div>
                <div className="text-xl font-bold text-green-800 dark:text-green-200">+127</div>
                <div className="text-xs text-green-700 dark:text-green-400">followers/week</div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[var(--apple-blue)]" />
                  <span className="text-sm font-medium text-[var(--apple-blue)]">Engagement Boost</span>
                </div>
                <div className="text-xl font-bold text-blue-800 dark:text-blue-200">+15%</div>
                <div className="text-xs text-blue-700 dark:text-blue-400">average increase</div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[var(--apple-purple)]" />
                  <span className="text-sm font-medium text-[var(--apple-purple)]">Optimal Times</span>
                </div>
                <div className="text-sm font-semibold text-purple-800 dark:text-purple-200">6-8 PM</div>
                <div className="text-xs text-purple-700 dark:text-purple-400">12-2 PM</div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--apple-green)] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[var(--apple-green)] mb-1">Optimization Status</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Your settings are optimized for maximum safe growth. Expected ROI: 2.3x within 30 days.</p>
                </div>
              </div>
            </div>
          </div>
        </GradientCard>

        {/* Save Configuration Button */}
        <div className="sticky bottom-6 flex justify-center">
          <button className="bg-[var(--apple-blue)] text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-[1.02]">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

