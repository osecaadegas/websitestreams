// TypeScript declarations for slot database
export interface SlotDatabaseEntry {
  name: string;
  provider: string;
  image: string;
}

export declare const DEFAULT_SLOT_IMAGE: string;
export declare const slotDatabase: SlotDatabaseEntry[];