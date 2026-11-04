const STAGES = ['Cold','Warm','Hot','Lead'];
const CONCEPTS = ['Launch','Review','Low Stock','Sale—Early Access','Sale—Last Chance'];
const QUALITIES = ['Studio','Campaign','UGC','Ghost','Flatlay','Graphic'];
function buildNames(f) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) throw new Error('Choose a valid date.');
  const parsed = new Date(f.date+'T12:00:00Z');
  if (isNaN(parsed) || parsed.toISOString().slice(0,10)!==f.date) throw new Error('Choose a valid date.');
  if (!STAGES.includes(f.stage) || !CONCEPTS.includes(f.concept) || !QUALITIES.includes(f.quality)) throw new Error('Choose a stage, concept and quality.');
  if (!f.mixed && !CATALOG[f.collection]) throw new Error('Choose a collection.');
  if (!f.mixed && !f.set && !CATALOG[f.collection].includes(f.product)) throw new Error('Choose a product from this collection.');
  if (!/^\d+$/.test(f.version) || +f.version < 1 || +f.version > 999999) throw new Error('Version must be a whole number from 1 to 999999.');
  const handle = f.handle.trim().replace(/^@/, '');
  if (!f.noHandle && (!handle || !/^[A-Za-z0-9._]+$/.test(handle))) throw new Error('Enter a handle using letters, numbers, dots or underscores, or check No Handle.');
  const parts = ['GSB', f.date.slice(2).replaceAll('-',''), f.stage, f.concept, f.mixed ? 'Mixed Collections' : f.collection, f.mixed ? 'Mixed Set' : f.set ? 'Set' : f.product, f.quality];
  if (!f.noHandle) parts.push(handle);
  return ['4x5','1x1','9x16'].map(d => [...parts,d,`v${Number(f.version)}`].join('_'));
}
