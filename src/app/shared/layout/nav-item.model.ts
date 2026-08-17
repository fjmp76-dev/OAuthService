export interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'PlexRAG', icon: 'forum', route: '/plexrag', adminOnly: false },
  { label: 'Indexing', icon: 'sync', route: '/indexing', adminOnly: true },
  { label: 'Users', icon: 'group', route: '/users', adminOnly: true }
];
