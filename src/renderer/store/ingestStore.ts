import { defineStore } from 'pinia';
import { OTMData } from '../../schemas/OTM';
import { coordinateConfig } from '../../schemas/SegyTable';
import { SeismicLine } from '../../schemas/SeismicLine';
import { SeismicData } from '../../schemas/SeismicData';
import WellMetadata from '../../schemas/WellMetadata';

export const useIngestStore = defineStore('ingest', {
      state: () => ({
        OTMData: [] as OTMData[],
        seismicData: [] as any[],
        seismicErrors: [] as any[],
        wellData: [] as any[],
        wellErrors: [] as any[],
        otherData: [] as any[],
        otherErrors: [] as any[],
        activeTab: 'seismic' as string,
        isDeleteMode: false as boolean,
        isToolsModalVisible: false as boolean,
        selectedErrorFileForTools: null as ({ index: number; data: any } | null),
        coordinateConfigs: [] as ({
          index: number;
          config: coordinateConfig
        }[]),
        CRS: null as ({
          srid: number;
          proj4: any
        } | null),
        // Database processing data
        dbProcessingData: {
          surveyName: null as (null | string),
          seismicLinesToUpsert: [] as SeismicLine[],
          seismicDatasToUpsert: [] as SeismicData[],
          wellMetadatasToUpsert: [] as WellMetadata[],
          otherSeismicDatasToUpsert: [] as SeismicData[],
          otherWellMetadatasToUpsert: [] as WellMetadata[],
        },
        // segyValidationErrors: [] as validationError[],
        // lasValidationErrors: [] as validationError[],
        // othersValidationErrors: [] as validationError[]
        seismicHasValidationError: false as boolean,
        wellHasValidationError: false as boolean,
        othersHasValidationError: false as boolean
  }),
actions: {
  setIngestData(data: any[], format: 'SEGY' | 'LAS' | 'OTHERS') {
    switch (format) {
      case 'SEGY':
        this.seismicData = data;
        this.activeTab = 'seismic';
        break;
      case 'LAS':
        this.wellData = data;
        this.activeTab = 'well';
        break;
      case 'OTHERS':
        this.otherData = data;
        this.activeTab = 'others';
        break;
    }
  },
  setSeismicData(data: any) {
    if (Array.isArray(data)) {
      this.seismicData = data;
    } else {
      this.seismicData.push(data);
    }
  },
  setSeismicError(data: any) {
    if (Array.isArray(data)) {
      this.seismicErrors = data;
    } else {
      this.seismicErrors.push(data);
    }
  },
  setWellData(data: any) {
    this.wellData = data;
  },
  setWellError(data: any) {
    this.wellErrors = data;
  },
  setOthersData(data: any) {
    this.otherData = data;
  },
  setOthersError(data: any) {
    this.otherErrors = data;
  },
  clearIngestData() {
    this.seismicData = [];
    this.wellData = [];
    this.otherData = [];
    this.activeTab = 'seismic';
  },
  setOTMData(data: OTMData) {
    this.OTMData.push({ ...data, selected: false });
  },
  clearOTMData() {
    this.OTMData = [];
  },
  clearAll() {
    this.clearIngestData();
    this.clearOTMData();
    this.seismicErrors = [];
    this.wellErrors = [];
    this.otherErrors = [];
    this.selectedErrorFileForTools = null;
    this.isDeleteMode = false;
    this.isToolsModalVisible = false;
    this.coordinateConfigs = [];
    this.clearDbProcessingData();
    // this.segyValidationErrors = [];
    // this.lasValidationErrors = [];
    // this.othersValidationErrors = [];
    this.seismicHasValidationError = false;
    this.wellHasValidationError = false;
    this.othersHasValidationError = false;
  },
  enterDeleteMode() {
    this.isDeleteMode = true;
  },
  exitDeleteMode() {
    this.isDeleteMode = false;
    this.OTMData.forEach(row => {
      row.selected = false;
    });
  },
  finishDelete() {
    const selectedRows = this.OTMData.filter(row => row.selected);
    console.log('Selected rows:', selectedRows);
    this.OTMData = this.OTMData.filter(row => !row.selected);
    this.isDeleteMode = false;
  },
  cancelDelete() {
    this.exitDeleteMode();
  },
  toggleSelectAll(checked: boolean) {
    this.OTMData.forEach(row => {
      row.selected = checked;
    });
  },
  setActiveTab(tab: string) {
    this.activeTab = tab;
  },
  setDeleteMode(mode: boolean) {
    this.isDeleteMode = mode;
  },
  setIsToolsModalVisible(isVisible: boolean) {
    this.isToolsModalVisible = isVisible;
  },
  setSelectedErrorFileForTools(file: { index: number; data: any } | null) {
    this.selectedErrorFileForTools = file;
  },
  setCoordinateConfigs(index: number, config: coordinateConfig){
    this.coordinateConfigs.push({
      index,
      config
    })
  },
  setCRS(srid: number, proj4: string) {
    this.CRS = {
      srid,
      proj4
    }
  },
  // Database processing actions
  setSurveyName(name: string) {
    this.dbProcessingData.surveyName = name;
  },
  addSeismicLine(line: SeismicLine) {
    this.dbProcessingData.seismicLinesToUpsert.push(line);
  },
  addSeismicData(data: SeismicData) {
    this.dbProcessingData.seismicDatasToUpsert.push(data);
  },
  addWellMetadata(metadata: WellMetadata) {
    this.dbProcessingData.wellMetadatasToUpsert.push(metadata);
  },
  addOtherSeismicData(data: SeismicData) {
    this.dbProcessingData.otherSeismicDatasToUpsert.push(data);
  },
  addOtherWellMetadata(metadata: WellMetadata) {
    this.dbProcessingData.otherWellMetadatasToUpsert.push(metadata);
  },
  clearDbProcessingData() {
    this.dbProcessingData = {
      surveyName: '',
      seismicLinesToUpsert: [],
      seismicDatasToUpsert: [],
      wellMetadatasToUpsert: [],
      otherSeismicDatasToUpsert: [],
      otherWellMetadatasToUpsert: [],
    };
  },
  getDbProcessingData() {
    return this.dbProcessingData;
  },
  setSeismicHasValidationError(value :boolean){
    this.seismicHasValidationError = value;
  },
  setWellHasValidationError(value :boolean){
    this.wellHasValidationError = value;
  },
  setOthersHasValidationError(value :boolean){
    this.othersHasValidationError = value;
  },
  // setSegyValidationError(errors: validationError[]) {
  //   this.segyValidationErrors = errors
  // },
  // setLasValidationError(errors: validationError[]) {
  //   this.lasValidationErrors = errors
  // },
  // setOthersValidationError(errors: validationError[]) {
  //   this.othersValidationErrors = errors
  // },
  getTotalFilesSubmitted(){
    return this.dbProcessingData.seismicLinesToUpsert.length + 
    this.dbProcessingData.seismicDatasToUpsert.length +
    this.dbProcessingData.wellMetadatasToUpsert.length +
    this.dbProcessingData.otherSeismicDatasToUpsert.length +
    this.dbProcessingData.otherWellMetadatasToUpsert.length;
  //   seismicLinesToUpsert: [],
  //     seismicDatasToUpsert: [],
  //     wellMetadatasToUpsert: [],
  //     otherSeismicDatasToUpsert: [],
  //     otherWellMetadatasToUpsert: [],
  // }
  }
},
}); 