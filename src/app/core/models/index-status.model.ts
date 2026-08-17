// Mirrors PlexRag.Application.Dtos.IndexStatusResponse (GET /api/index/status).
export interface IndexStatus {
  running: boolean;
  sectionsDone: number;
  sectionsTotal: number;
  itemsIndexed: number;
  currentSection: string | null;
  lastError: string | null;
}

export const INITIAL_INDEX_STATUS: IndexStatus = {
  running: false,
  sectionsDone: 0,
  sectionsTotal: 0,
  itemsIndexed: 0,
  currentSection: null,
  lastError: null
};
