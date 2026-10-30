export function slugify(text: string): string {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      // remove accents
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // replace spaces with hyphens
      .replace(/\s+/g, '-')
      // remove invalid chars
      .replace(/[^a-z0-9_-]/g, '')
      // remove double hyphens
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'iqplotter-chart'
  );
}
