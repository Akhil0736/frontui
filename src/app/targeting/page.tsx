
"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, MapPin, Clock, Users, Shield, AlertTriangle, CheckCircle, Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface GlassCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

const GlassCard: React.FC<GlassCardProps> = ({ title, children, className = "" }) => {
  return (
    <div className={`bg-white/72 dark:bg-black/50 backdrop-blur-md border border-[#E5E5EA] dark:border-white/10 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${className}`}>
      <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-gray-100 mb-4">{title}</h3>
      {children}
    </div>
  )
}

interface HeaderBarProps {
  title: string
  onBack?: () => void
}

const HeaderBar: React.FC<HeaderBarProps> = ({ title, onBack }) => {
  return (
    <div className="bg-white/72 dark:bg-black/50 backdrop-blur-md border-b border-[#E5E5EA] dark:border-white/10 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-[#007AFF] hover:bg-[#007AFF]/10 transition-all duration-150"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h1 className="text-xl font-semibold text-[#1D1D1F] dark:text-gray-100">{title}</h1>
      </div>
    </div>
  )
}

interface TagInputProps {
  id: string
  label: string
  helper: string
  value?: string[]
  onChange?: (tags: string[]) => void
}

const TagInput: React.FC<TagInputProps> = ({ 
  id, 
  label, 
  helper, 
  value = [], 
  onChange = () => {} 
}) => {
  const [inputValue, setInputValue] = useState("")
  const [tags, setTags] = useState<string[]>(value)

  const addTag = useCallback((tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      const newTags = [...tags, tag.trim()]
      setTags(newTags)
      onChange(newTags)
      setInputValue("")
    }
  }, [tags, onChange])

  const removeTag = useCallback((tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setTags(newTags)
    onChange(newTags)
  }, [tags, onChange])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-[#1D1D1F] dark:text-gray-200">
        {label}
      </Label>
      <div className="space-y-2">
        <Input
          id={id}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Add ${label.toLowerCase()}...`}
          className="border-[#E5E5EA] dark:border-white/20 focus:border-[#007AFF] focus:ring-[#007AFF]/20"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 transition-colors duration-150"
              >
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTag(tag)}
                  className="ml-1 h-auto p-0 text-[#007AFF] hover:text-[#FF3B30]"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-[#6E6E73] dark:text-gray-400">{helper}</p>
    </div>
  )
}

interface LocationSelectProps {
  id: string
  value?: string
  onChange?: (value: string) => void
}

const LocationSelect: React.FC<LocationSelectProps> = ({ 
  id, 
  value = "", 
  onChange = () => {} 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-[#1D1D1F] dark:text-gray-200 flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Location
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border-[#E5E5EA] dark:border-white/20 focus:border-[#007AFF] focus:ring-[#007AFF]/20">
          <SelectValue placeholder="Select location..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="global">Global</SelectItem>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="uk">United Kingdom</SelectItem>
          <SelectItem value="ca">Canada</SelectItem>
          <SelectItem value="au">Australia</SelectItem>
          <SelectItem value="de">Germany</SelectItem>
          <SelectItem value="fr">France</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-[#6E6E73] dark:text-gray-400">Target users from specific regions</p>
    </div>
  )
}

interface LimitSliderProps {
  id: string
  label: string
  max: number
  safe: number
  value?: number
  onChange?: (value: number) => void
}

const LimitSlider: React.FC<LimitSliderProps> = ({ 
  id, 
  label, 
  max, 
  safe, 
  value = safe, 
  onChange = () => {} 
}) => {
  const [sliderValue, setSliderValue] = useState(value)
  const isRisk = sliderValue > safe

  const handleValueChange = (newValue: number[]) => {
    const val = newValue[0]
    setSliderValue(val)
    onChange(val)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium text-[#1D1D1F] dark:text-gray-200">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#1D1D1F] dark:text-gray-200">{sliderValue}</span>
          <Badge 
            variant={isRisk ? "destructive" : "default"}
            className={isRisk ? "bg-[#FF3B30] text-white" : "bg-[#30D158] text-white"}
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
        value={[sliderValue]}
        onValueChange={handleValueChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-[#6E6E73] dark:text-gray-400">
        <span>0</span>
        <span className="text-[#30D158]">Safe: {safe}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

interface SafetyNoticeProps {
  hasRisk?: boolean
}

const SafetyNotice: React.FC<SafetyNoticeProps> = ({ hasRisk = false }) => {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-150 ${
      hasRisk 
        ? "bg-[#FF3B30]/10 border-[#FF3B30]/20 text-[#FF3B30]" 
        : "bg-[#30D158]/10 border-[#30D158]/20 text-[#30D158]"
    }`}>
      {hasRisk ? (
        <AlertTriangle className="w-4 h-4" />
      ) : (
        <CheckCircle className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {hasRisk ? "Warning: Some limits exceed safe zone" : "All limits within safe zone"}
      </span>
    </div>
  )
}

interface RadioMatrixProps {
  id: string
  options: string[]
  value?: string
  onChange?: (value: string) => void
}

const RadioMatrix: React.FC<RadioMatrixProps> = ({ 
  id, 
  options, 
  value = options[0], 
  onChange = () => {} 
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-[#1D1D1F] dark:text-gray-200">Comment Style</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {options.map((option) => (
          <Button
            key={option}
            variant={value === option ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option)}
            className={`transition-all duration-150 ${
              value === option 
                ? "bg-[#007AFF] text-white hover:bg-[#007AFF]/90" 
                : "border-[#E5E5EA] dark:border-white/20 text-[#1D1D1F] dark:text-gray-200 hover:bg-[#007AFF]/10"
            }`}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  )
}

interface LengthRadioProps {
  id: string
  value?: string
  onChange?: (value: string) => void
}

const LengthRadio: React.FC<LengthRadioProps> = ({ 
  id, 
  value = "medium", 
  onChange = () => {} 
}) => {
  const options = ["short", "medium", "long"]
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-[#1D1D1F] dark:text-gray-200">Comment Length</Label>
      <div className="flex gap-1 p-1 bg-[#F2F2F7] dark:bg-gray-800 rounded-lg">
        {options.map((option) => (
          <Button
            key={option}
            variant="ghost"
            size="sm"
            onClick={() => onChange(option)}
            className={`flex-1 transition-all duration-150 ${
              value === option 
                ? "bg-white dark:bg-gray-700 text-[#007AFF] shadow-sm" 
                : "text-[#6E6E73] dark:text-gray-400 hover:text-[#1D1D1F] dark:hover:text-white"
            }`}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  )
}

interface EmojiToggleProps {
  id: string
  value?: string
  onChange?: (value: string) => void
}

const EmojiToggle: React.FC<EmojiToggleProps> = ({ 
  id, 
  value = "minimal", 
  onChange = () => {} 
}) => {
  const options = ["none", "minimal", "moderate", "liberal"]
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-[#1D1D1F] dark:text-gray-200">Emoji Usage</Label>
      <div className="flex gap-1 p-1 bg-[#F2F2F7] dark:bg-gray-800 rounded-lg">
        {options.map((option) => (
          <Button
            key={option}
            variant="ghost"
            size="sm"
            onClick={() => onChange(option)}
            className={`flex-1 transition-all duration-150 text-xs ${
              value === option 
                ? "bg-white dark:bg-gray-700 text-[#007AFF] shadow-sm" 
                : "text-[#6E6E73] dark:text-gray-400 hover:text-[#1D1D1F] dark:hover:text-white"
            }`}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  )
}

interface LivePreviewProps {
  className?: string
  settings?: any
}

const LivePreview: React.FC<LivePreviewProps> = ({ className = "" }) => {
  const [preview, setPreview] = useState("Great post! Really love the insights you shared here. 👍")
  
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-[#1D1D1F] dark:text-gray-200">Live Preview</Label>
      <div className="p-4 bg-[#F2F2F7] dark:bg-gray-800 rounded-lg border border-[#E5E5EA] dark:border-white/20">
        <p className="text-sm text-[#1D1D1F] dark:text-gray-200 italic">"{preview}"</p>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setPreview("This is amazing! Thanks for sharing your experience. 🚀")}
        className="text-xs border-[#E5E5EA] dark:border-white/20 text-[#007AFF] hover:bg-[#007AFF]/10"
      >
        Generate New Preview
      </Button>
    </div>
  )
}

interface AdvancedOptionsProps {
  title: string
  children: React.ReactNode
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <GlassCard title="" className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-0 h-auto text-lg font-semibold text-[#1D1D1F] dark:text-gray-100 hover:bg-transparent"
          >
            {title}
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-6 mt-4">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </GlassCard>
  )
}

const TimeWindowPicker: React.FC = () => {
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#6E6E73] dark:text-gray-400" />
        <Label className="text-sm font-medium text-[#1D1D1F] dark:text-gray-200">Active Hours</Label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-[#6E6E73] dark:text-gray-400">Start Time</Label>
          <Input 
            type="time" 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)}
            className="border-[#E5E5EA] dark:border-white/20 focus:border-[#007AFF]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-[#6E6E73] dark:text-gray-400">End Time</Label>
          <Input 
            type="time" 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)}
            className="border-[#E5E5EA] dark:border-white/20 focus:border-[#007AFF]"
          />
        </div>
      </div>
    </div>
  )
}

const PauseRules: React.FC = () => {
  const [pauseOnWeekends, setPauseOnWeekends] = useState(true)
  const [pauseOnHolidays, setPauseOnHolidays] = useState(false)

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-[#1D1D1F] dark:text-gray-200">Auto-Pause Rules</Label>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#1D1D1F] dark:text-gray-200">Pause on weekends</span>
          <Switch 
            checked={pauseOnWeekends} 
            onCheckedChange={setPauseOnWeekends}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#1D1D1F] dark:text-gray-200">Pause on holidays</span>
          <Switch 
            checked={pauseOnHolidays} 
            onCheckedChange={setPauseOnHolidays}
          />
        </div>
      </div>
    </div>
  )
}

const DemographicFilter: React.FC = () => {
  const [ageRange, setAgeRange] = useState([18, 65])
  const [gender, setGender] = useState("all")

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-[#6E6E73] dark:text-gray-400" />
        <Label className="text-sm font-medium text-[#1D1D1F] dark:text-gray-200">Demographics</Label>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-[#6E6E73] dark:text-gray-400">Age Range: {ageRange[0]} - {ageRange[1]}</Label>
          <Slider
            min={13}
            max={80}
            step={1}
            value={ageRange}
            onValueChange={setAgeRange}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-[#6E6E73] dark:text-gray-400">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="border-[#E5E5EA] dark:border-white/20 focus:border-[#007AFF]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

interface HelperPanelProps {
  className?: string
}

const HelperPanel: React.FC<HelperPanelProps> = ({ className = "" }) => {
  return (
    <div className={className}>
      <GlassCard title="💡 Tips & Best Practices">
        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-[#1D1D1F] dark:text-gray-200">Hashtag Strategy</h4>
            <p className="text-[#6E6E73] dark:text-gray-400">Mix popular (1M+ posts) with niche (100K-500K) hashtags for better reach.</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium text-[#1D1D1F] dark:text-gray-200">Safe Limits</h4>
            <p className="text-[#6E6E73] dark:text-gray-400">Stay within safe zones to avoid account restrictions and maintain healthy engagement.</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium text-[#1D1D1F] dark:text-gray-200">Comment Quality</h4>
            <p className="text-[#6E6E73] dark:text-gray-400">Authentic, personalized comments perform 3x better than generic ones.</p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

interface FooterCTAProps {
  onSave?: () => void
  onStart?: () => void
  isLoading?: boolean
  hasSettings?: boolean
}

const FooterCTA: React.FC<FooterCTAProps> = ({ 
  onSave = () => {}, 
  onStart = () => {}, 
  isLoading = false, 
  hasSettings = false 
}) => {
  return (
    <div className="sticky bottom-0 bg-white/72 dark:bg-black/50 backdrop-blur-md border-t border-[#E5E5EA] dark:border-white/10 p-6">
      <div className="max-w-5xl mx-auto flex justify-end">
        <Button 
          onClick={hasSettings ? onStart : onSave}
          disabled={isLoading}
          className="bg-[#007AFF] hover:bg-[#007AFF]/90 text-white px-8 py-2 transition-all duration-150 hover:translate-y-[-1px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,122,255,0.18)]"
        >
          {isLoading ? "Saving..." : hasSettings ? "Start Session" : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}

const SmartTargetingScreen: React.FC = () => {
  const [hashtags, setHashtags] = useState<string[]>(["socialmedia", "marketing"])
  const [competitors, setCompetitors] = useState<string[]>(["@competitor1"])
  const [location, setLocation] = useState("us")
  const [follows, setFollows] = useState(25)
  const [likes, setLikes] = useState(100)
  const [comments, setComments] = useState(20)
  const [hours, setHours] = useState(4)
  const [commentStyle, setCommentStyle] = useState("Professional")
  const [commentLength, setCommentLength] = useState("medium")
  const [emojiUsage, setEmojiUsage] = useState("minimal")
  const [isLoading, setIsLoading] = useState(false)
  const [hasSettings, setHasSettings] = useState(false)

  const hasRisk = follows > 25 || likes > 100 || comments > 20 || hours > 4

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setHasSettings(true)
    setIsLoading(false)
  }

  const handleStart = async () => {
    setIsLoading(true)
    // Simulate session start
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#F2F2F7] dark:bg-gradient-to-br dark:from-black dark:to-[#1a1a1a]">
      <HeaderBar title="Smart Targeting" />
      
      <div className="mx-auto max-w-5xl px-6 py-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <GlassCard title="Target Audience">
            <div className="grid gap-6 md:grid-cols-2">
              <TagInput 
                id="hashtags" 
                label="Hashtags" 
                helper="5-10 tags • 100K–1M posts"
                value={hashtags}
                onChange={setHashtags}
              />
              <TagInput 
                id="competitors" 
                label="Competitors" 
                helper="2-5 engaged accounts"
                value={competitors}
                onChange={setCompetitors}
              />
              <LocationSelect 
                id="locations" 
                value={location}
                onChange={setLocation}
              />
            </div>
          </GlassCard>

          <GlassCard title="Engagement Limits">
            <div className="grid gap-6 md:grid-cols-2">
              <LimitSlider 
                id="follows" 
                label="Daily Follows" 
                max={50} 
                safe={25}
                value={follows}
                onChange={setFollows}
              />
              <LimitSlider 
                id="likes" 
                label="Daily Likes" 
                max={200} 
                safe={100}
                value={likes}
                onChange={setLikes}
              />
              <LimitSlider 
                id="comments" 
                label="Daily Comments" 
                max={50} 
                safe={20}
                value={comments}
                onChange={setComments}
              />
              <LimitSlider 
                id="hours" 
                label="Session Hours" 
                max={8} 
                safe={4}
                value={hours}
                onChange={setHours}
              />
            </div>
            <SafetyNotice hasRisk={hasRisk} />
          </GlassCard>

          <GlassCard title="AI Comments">
            <RadioMatrix 
              id="style" 
              options={["Professional", "Friendly", "Casual", "Enthusiastic"]}
              value={commentStyle}
              onChange={setCommentStyle}
            />
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <LengthRadio 
                id="length" 
                value={commentLength}
                onChange={setCommentLength}
              />
              <EmojiToggle 
                id="emoji" 
                value={emojiUsage}
                onChange={setEmojiUsage}
              />
            </div>
            <LivePreview className="mt-6" />
          </GlassCard>

          <AdvancedOptions title="Advanced Targeting">
            <TimeWindowPicker />
            <PauseRules />
            <DemographicFilter />
          </AdvancedOptions>
        </div>

        <HelperPanel className="hidden lg:block" />
      </div>

      <FooterCTA 
        onSave={handleSave}
        onStart={handleStart}
        isLoading={isLoading}
        hasSettings={hasSettings}
      />
    </div>
  )
}

export default SmartTargetingScreen;

