import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Trash2, Image as ImageIcon, Loader2, Save, RotateCcw, Layout, Maximize2, MoveHorizontal, Ghost, Palette, UploadCloud as CloudUpload } from 'lucide-react';
import { useLogoSettings } from '@/hooks/useLogoSettings';
import LogoPreviewHeader from './LogoPreviewHeader';
import { SliderEnhanced } from '@/components/ui/slider-enhanced';

const LogoManager = () => {
  const { 
    logoUrl, 
    loading, 
    settings, 
    savedSettings,
    isDirty,
    updateSetting, 
    resetSettings, 
    saveSettings, 
    uploadLogo, 
    deleteLogo 
  } = useLogoSettings();

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewBgColor, setPreviewBgColor] = useState('#ffffff');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("File is too large. Max size is 2MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      await uploadLogo(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      // Error handled in hook
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (confirm("Are you sure you want to remove the current logo?")) {
      setUploading(true);
      await deleteLogo();
      setUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setUploading(true);
    await saveSettings();
    setUploading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (loading && !uploading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 relative z-10" />
        </div>
        <span className="mt-4 text-gray-500 font-medium animate-pulse">Loading logo configuration...</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="p-8 pb-0">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">
                Logo Management
              </h2>
              <p className="text-gray-500 mt-1 text-lg">Customize your brand identity and header appearance</p>
            </div>
            {isDirty && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold border border-amber-200 flex items-center shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></div>
                Unsaved Changes
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 pt-0">
          
          {/* Left Column: Preview & Upload */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-0 shadow-lg bg-white overflow-hidden ring-1 ring-gray-100">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                  <Layout className="w-5 h-5 text-purple-600" /> Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-gradient-to-b from-white to-gray-50/30">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative">
                    <LogoPreviewHeader logoUrl={logoUrl} settings={settings} previewBgColor={previewBgColor} />
                  </div>
                </div>

                {/* Preview Controls (Background) */}
                <div className="mt-6 flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
                  <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-gray-400" /> Preview Background
                  </span>
                  <div className="flex gap-2">
                    {['#ffffff', '#f3f4f6', '#1e293b', '#0f172a'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setPreviewBgColor(color)}
                        className={`w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 ${previewBgColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Set background to ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card className="border-0 shadow-lg ring-1 ring-gray-100">
               <CardContent className="p-0">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <CloudUpload className="w-5 h-5" /> Upload New Logo
                    </h3>
                    <p className="text-blue-700/80 text-sm mb-6">Supported formats: PNG, JPG, SVG, WEBP (Max 2MB)</p>
                    
                    <div className="relative">
                      <Input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/png, image/jpeg, image/svg+xml, image/webp"
                        onChange={handleFileSelect}
                        className="hidden" 
                        id="file-upload"
                      />
                      <label 
                        htmlFor="file-upload"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 group
                          ${selectedFile 
                            ? 'border-blue-400 bg-blue-100/50' 
                            : 'border-blue-200 bg-white/50 hover:bg-white hover:border-blue-400 hover:shadow-md'
                          }`}
                      >
                         {selectedFile ? (
                           <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }} 
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-center"
                           >
                              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                              <p className="text-sm font-semibold text-blue-900">{selectedFile.name}</p>
                              <p className="text-xs text-blue-600 mt-1">Ready to upload</p>
                           </motion.div>
                         ) : (
                           <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                <Upload className="w-6 h-6" />
                              </div>
                              <p className="mb-1 text-sm text-blue-900 font-medium">Click to upload or drag and drop</p>
                              <p className="text-xs text-blue-500">SVG or transparent PNG recommended</p>
                           </div>
                         )}
                      </label>
                    </div>

                    <AnimatePresence>
                      {selectedFile && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4"
                        >
                          <Button 
                            onClick={handleUpload} 
                            disabled={uploading} 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
                          >
                            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Upload & Update Logo
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* Right Column: Settings */}
          <div className="lg:col-span-5">
            <Card className="h-full border-0 shadow-lg ring-1 ring-gray-100 flex flex-col">
              <CardHeader className="border-b bg-white">
                <CardTitle className="text-xl">Appearance Settings</CardTitle>
                <CardDescription>Fine-tune how your logo appears</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-6 space-y-8 bg-white">
                
                {/* Width Control */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2 text-blue-900 font-semibold">
                      <Maximize2 className="w-4 h-4 text-blue-500" /> Logo Width
                    </Label>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                      {settings.width}px
                    </span>
                  </div>
                  <SliderEnhanced
                    value={[settings.width]}
                    min={50}
                    max={300}
                    step={5}
                    gradient="from-blue-400 to-blue-600"
                    thumbColor="border-blue-100"
                    onValueChange={(val) => updateSetting('width', val[0])}
                  />
                </div>

                {/* Opacity Control */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2 text-purple-900 font-semibold">
                      <Ghost className="w-4 h-4 text-purple-500" /> Opacity
                    </Label>
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">
                      {settings.opacity}%
                    </span>
                  </div>
                  <SliderEnhanced
                    value={[settings.opacity]}
                    min={20}
                    max={100}
                    step={5}
                    gradient="from-purple-400 to-purple-600"
                    thumbColor="border-purple-100"
                    onValueChange={(val) => updateSetting('opacity', val[0])}
                  />
                </div>

                {/* Spacing Control */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2 text-teal-900 font-semibold">
                      <MoveHorizontal className="w-4 h-4 text-teal-500" /> Spacing (X)
                    </Label>
                    <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs font-bold">
                      {settings.paddingX}px
                    </span>
                  </div>
                  <SliderEnhanced
                    value={[settings.paddingX]}
                    min={0}
                    max={100}
                    step={2}
                    gradient="from-teal-400 to-teal-600"
                    thumbColor="border-teal-100"
                    onValueChange={(val) => updateSetting('paddingX', val[0])}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 pt-4 border-t">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Alignment</Label>
                    <Select 
                      value={settings.alignment} 
                      onValueChange={(val) => updateSetting('alignment', val)}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-blue-500">
                        <SelectValue placeholder="Select alignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left (Standard)</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              </CardContent>
              <div className="p-6 bg-gray-50 border-t flex flex-col gap-3">
                 <Button 
                    onClick={handleSaveSettings} 
                    disabled={!isDirty || uploading}
                    className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white shadow-lg transition-all"
                    size="lg"
                  >
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Changes...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Save Configuration</>
                    )}
                  </Button>
                  
                  <div className="flex justify-between gap-3 mt-2">
                    {isDirty && (
                      <Button variant="outline" onClick={resetSettings} className="flex-1 text-gray-600 border-gray-300 hover:bg-gray-100">
                          <RotateCcw className="w-4 h-4 mr-2" /> Reset
                      </Button>
                    )}
                    {logoUrl && (
                      <Button 
                          variant="ghost" 
                          className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={handleRemove}
                      >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Logo
                      </Button>
                    )}
                  </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LogoManager;