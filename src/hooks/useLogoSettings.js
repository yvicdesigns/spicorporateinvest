import { useState, useEffect } from 'react';
import { useWebsiteLogo } from './useWebsiteLogo';

export const useLogoSettings = () => {
  const { 
    logoUrl, 
    logoSettings: savedSettings, 
    loading: dbLoading, 
    updateSettings: saveToDb,
    uploadLogo: uploadToDb,
    deleteLogo: deleteFromDb
  } = useWebsiteLogo();

  const defaultSettings = {
    width: 150,
    height: 'auto',
    opacity: 100,
    alignment: 'left',
    paddingX: 0
  };

  const [previewSettings, setPreviewSettings] = useState(defaultSettings);
  const [isDirty, setIsDirty] = useState(false);

  // Sync with database settings when they load
  useEffect(() => {
    if (savedSettings) {
      setPreviewSettings(savedSettings);
      setIsDirty(false);
    }
  }, [savedSettings]);

  const updateSetting = (key, value) => {
    setPreviewSettings(prev => {
      const updated = { ...prev, [key]: value };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(savedSettings));
      return updated;
    });
  };

  const resetSettings = () => {
    setPreviewSettings(defaultSettings);
    setIsDirty(true);
  };

  const saveSettings = async () => {
    await saveToDb(previewSettings);
    setIsDirty(false);
  };

  const uploadLogoWithSettings = async (file) => {
    await uploadToDb(file, previewSettings);
    setIsDirty(false);
  };

  return {
    logoUrl,
    loading: dbLoading,
    settings: previewSettings,
    savedSettings,
    isDirty,
    updateSetting,
    resetSettings,
    saveSettings,
    uploadLogo: uploadLogoWithSettings,
    deleteLogo: deleteFromDb
  };
};