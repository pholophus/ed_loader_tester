import { defineStore } from 'pinia';

interface ProcessingOptions {
  extractFiles: boolean;
  loadDirectlyToDBAfterExtract: boolean;
  publishAuto: boolean;
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    selectedTarget: '' as string,
    options: {
      extractFiles: true,
      loadDirectlyToDBAfterExtract: false,
      publishAuto: false
    } as ProcessingOptions,
  }),
  
  actions: {
    setSelectedTarget(target: string) {
      this.selectedTarget = target;
    },
    
    clearSelectedTarget() {
      this.selectedTarget = '';
    },
    
    setOptions(newOptions: Partial<ProcessingOptions>) {
      this.options = { ...this.options, ...newOptions };
    },
    
    setOption(key: keyof ProcessingOptions, value: boolean) {
      this.options[key] = value;
    },
    
    resetOptions() {
      this.options = {
        extractFiles: true,
        loadDirectlyToDBAfterExtract: false,
        publishAuto: false
      };
    },
    
    clearAllSettings() {
      this.selectedTarget = '';
      this.resetOptions();
    }
  },
  
  getters: {
    getSelectedTarget: (state) => state.selectedTarget,
    hasSelectedTarget: (state) => state.selectedTarget !== '',
    getOptions: (state) => state.options,
    getOption: (state) => (key: keyof ProcessingOptions) => state.options[key],
  }
}); 