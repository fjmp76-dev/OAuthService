// Mirrors PlexRag.Application.Dtos.LibrarySectionResponse (GET /api/library/sections),
// plus itemCount which the backend does not expose yet and needs to add.
export interface LibrarySection {
  id: string;
  title: string;
  type: string;
  itemCount: number;
}
