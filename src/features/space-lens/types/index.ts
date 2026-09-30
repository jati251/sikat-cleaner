import { LargeFileItem, LensNode, LensFolderResponse } from "@/types";

export type { LargeFileItem, LensNode, LensFolderResponse };

export interface BubbleNode {
  id: string;
  name: string;
  path: string;
  value: number;
  isDir: boolean;
  fileType: string;
  extension?: string;
  x?: number;
  y?: number;
  r?: number;
}
