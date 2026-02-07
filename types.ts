export enum Tab {
  VIEWER = 'VIEWER',
  CONVERTER = 'CONVERTER',
}

export interface ImageDetails {
  width: number;
  height: number;
  sizeInBytes: number;
  mimeType: string;
}

export interface HistoryItem {
  id: string;
  thumbnail: string;
  timestamp: number;
}
