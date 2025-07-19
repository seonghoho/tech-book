export async function loadGameModule(slug: string) {
  switch (slug) {
    case 'pixel-runner':
      return import('../games/pixel-runner');
    case 'space-shooter':
      return import('../games/space-shooter');
    default:
      throw new Error(`Unknown game slug: ${slug}`);
  }
}
