export const DASHBOARD_PERMISSIONS = {
  site: ['vision', 'about', 'contact', 'footer', 'images', 'logo'],
  blog: ['news'],
  shop: ['products'],
  communication: ['branch-social-links', 'whatsapp-branches', 'whatsapp-global'],
  branches: ['sci-renaissance', 'sci-espoir', 'nouveau-concept', 'atelier-5', 'spi-alim', 'la-manne', 'zen-sens', 'spi-energy', 'branch-content'],
  team: ['team']
};

export const ROLE_PRESETS = {
  blog_manager: { label: 'Gestionnaire du blog', permissions: ['blog'] },
  branch_manager: { label: 'Gestionnaire des branches', permissions: ['branches', 'communication'] },
  content_manager: { label: 'Responsable des contenus', permissions: ['site', 'blog', 'branches'] },
  administrator: { label: 'Administrateur', permissions: Object.keys(DASHBOARD_PERMISSIONS) }
};

export const canAccessModule = (user, moduleId) => {
  if (user?.app_metadata?.admin === true || user?.app_metadata?.admin === 'true') return true;
  const permissions = user?.app_metadata?.permissions || [];
  return permissions.some((permission) => DASHBOARD_PERMISSIONS[permission]?.includes(moduleId));
};
