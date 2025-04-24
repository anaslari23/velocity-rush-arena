import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { GameSettings } from './types';
import { useToast } from '../ui/use-toast';

interface SettingsScreenProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onBack
}) => {
  const { toast } = useToast();
  const [currentSettings, setCurrentSettings] = useState<GameSettings>(settings);
  
  // Handle audio settings change
  const handleAudioChange = (key: keyof GameSettings['audio'], value: number) => {
    setCurrentSettings(prev => ({
      ...prev,
      audio: {
        ...prev.audio,
        [key]: value
      }
    }));
  };
  
  // Handle graphics settings change
  const handleGraphicsChange = (key: keyof GameSettings['graphics'], value: any) => {
    setCurrentSettings(prev => ({
      ...prev,
      graphics: {
        ...prev.graphics,
        [key]: value
      }
    }));
  };
  
  // Handle controls settings change
  const handleControlsChange = (key: keyof GameSettings['controls'], value: any) => {
    setCurrentSettings(prev => ({
      ...prev,
      controls: {
        ...prev.controls,
        [key]: value
      }
    }));
  };
  
  // Save settings
  const handleSaveSettings = () => {
    onUpdateSettings(currentSettings);
    toast({
      title: "Settings Saved",
      description: "Your game settings have been updated.",
    });
  };
  
  // Reset settings to defaults
  const handleResetSettings = () => {
    setCurrentSettings({
      audio: {
        master: 80,
        music: 70,
        sfx: 90
      },
      graphics: {
        quality: 'high',
        shadows: true,
        particles: true,
        postProcessing: true
      },
      controls: {
        type: 'keyboard',
        sensitivity: 5,
        invertY: false,
        vibration: true
      }
    });
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };
  
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-blue-950">
        <div className="absolute inset-0 bg-[url('/settings-background.png')] bg-cover opacity-20"></div>
      </div>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-6">
        <Button 
          variant="outline" 
          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black"
          onClick={onBack}
        >
          Back to Menu
        </Button>
        
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        
        <Button 
          variant="outline" 
          className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-black"
          onClick={handleResetSettings}
        >
          Reset Defaults
        </Button>
      </div>
      
      {/* Settings content */}
      <div className="absolute inset-0 flex items-center justify-center pt-16 pb-8 px-8">
        <Card className="w-full max-w-4xl h-full bg-black/70 border border-blue-500 backdrop-blur-sm overflow-hidden">
          <Tabs defaultValue="audio" className="h-full flex flex-col">
            <div className="border-b border-gray-800 px-6 pt-4">
              <TabsList className="bg-gray-900">
                <TabsTrigger 
                  value="audio" 
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-black"
                >
                  Audio
                </TabsTrigger>
                <TabsTrigger 
                  value="graphics" 
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-black"
                >
                  Graphics
                </TabsTrigger>
                <TabsTrigger 
                  value="controls" 
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-black"
                >
                  Controls
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <TabsContent value="audio" className="h-full mt-0 space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="master-volume">Master Volume: {currentSettings.audio.master}%</Label>
                    </div>
                    <Slider
                      id="master-volume"
                      min={0}
                      max={100}
                      step={1}
                      value={[currentSettings.audio.master]}
                      onValueChange={(value) => handleAudioChange('master', value[0])}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="music-volume">Music Volume: {currentSettings.audio.music}%</Label>
                    </div>
                    <Slider
                      id="music-volume"
                      min={0}
                      max={100}
                      step={1}
                      value={[currentSettings.audio.music]}
                      onValueChange={(value) => handleAudioChange('music', value[0])}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="sfx-volume">Sound Effects Volume: {currentSettings.audio.sfx}%</Label>
                    </div>
                    <Slider
                      id="sfx-volume"
                      min={0}
                      max={100}
                      step={1}
                      value={[currentSettings.audio.sfx]}
                      onValueChange={(value) => handleAudioChange('sfx', value[0])}
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="graphics" className="h-full mt-0 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-medium">Graphics Quality</Label>
                    <RadioGroup 
                      value={currentSettings.graphics.quality} 
                      onValueChange={(value) => handleGraphicsChange('quality', value)}
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="quality-low" />
                        <Label htmlFor="quality-low">Low</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="quality-medium" />
                        <Label htmlFor="quality-medium">Medium</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="quality-high" />
                        <Label htmlFor="quality-high">High</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ultra" id="quality-ultra" />
                        <Label htmlFor="quality-ultra">Ultra</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="shadows">Shadows</Label>
                      <Switch
                        id="shadows"
                        checked={currentSettings.graphics.shadows}
                        onCheckedChange={(checked) => handleGraphicsChange('shadows', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="particles">Particle Effects</Label>
                      <Switch
                        id="particles"
                        checked={currentSettings.graphics.particles}
                        onCheckedChange={(checked) => handleGraphicsChange('particles', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="post-processing">Post Processing</Label>
                      <Switch
                        id="post-processing"
                        checked={currentSettings.graphics.postProcessing}
                        onCheckedChange={(checked) => handleGraphicsChange('postProcessing', checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="controls" className="h-full mt-0 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-medium">Control Type</Label>
                    <RadioGroup 
                      value={currentSettings.controls.type} 
                      onValueChange={(value: 'keyboard' | 'touch' | 'tilt') => handleControlsChange('type', value)}
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="keyboard" id="control-keyboard" />
                        <Label htmlFor="control-keyboard">Keyboard</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="touch" id="control-touch" />
                        <Label htmlFor="control-touch">Touch Controls</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tilt" id="control-tilt" />
                        <Label htmlFor="control-tilt">Tilt Controls</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="sensitivity">Control Sensitivity: {currentSettings.controls.sensitivity}</Label>
                    </div>
                    <Slider
                      id="sensitivity"
                      min={1}
                      max={10}
                      step={1}
                      value={[currentSettings.controls.sensitivity]}
                      onValueChange={(value) => handleControlsChange('sensitivity', value[0])}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="invert-y">Invert Y-Axis</Label>
                      <Switch
                        id="invert-y"
                        checked={currentSettings.controls.invertY}
                        onCheckedChange={(checked) => handleControlsChange('invertY', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="vibration">Vibration</Label>
                      <Switch
                        id="vibration"
                        checked={currentSettings.controls.vibration}
                        onCheckedChange={(checked) => handleControlsChange('vibration', checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
            
            <div className="border-t border-gray-800 p-6">
              <Button 
                className="w-full bg-green-500 text-black hover:bg-blue-500"
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default SettingsScreen;