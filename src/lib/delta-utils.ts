import { Memory, DeltaBullet } from './types';

export function generateDeltaBullets(currentMemory: Memory, previousMemory?: Memory): DeltaBullet[] {
  const bullets: DeltaBullet[] = [];
  const text = currentMemory.rawText.toLowerCase();

  if (text.includes('timeline') || text.includes('schedule') || text.includes('week') || text.includes('month')) {
    bullets.push({ type: 'timeline', text: 'Timeline updated' });
  }

  if (text.includes('pricing') || text.includes('budget') || text.includes('$') || text.includes('cost')) {
    bullets.push({ type: 'pricing', text: 'Pricing/Budget mentioned' });
  }

  if (text.includes('objection') || text.includes('concern') || text.includes('issue')) {
    bullets.push({ type: 'objection', text: 'New objection raised' });
  }

  if (text.includes('next step') || text.includes('follow up') || text.includes('scheduled') || text.includes('meeting')) {
    bullets.push({ type: 'nextstep', text: 'Next step agreed' });
  }

  if (text.includes('champion') || text.includes('stakeholder') || text.includes('contact') || text.includes('vp') || text.includes('cfo') || text.includes('cto') || text.includes('ciso')) {
    bullets.push({ type: 'stakeholder', text: 'Stakeholder change' });
  }

  if (text.includes('demo') || text.includes('presentation')) {
    bullets.push({ type: 'demo', text: 'Demo conducted' });
  }

  if (text.includes('contract') || text.includes('signed') || text.includes('approved')) {
    bullets.push({ type: 'contract', text: 'Contract progress' });
  }

  if (bullets.length === 0) {
    bullets.push({ type: 'update', text: 'General update' });
  }

  return bullets;
}

export function generateSnapshot(memories: Memory[]): string {
  if (memories.length === 0) {
    return 'No activity recorded yet.';
  }

  const lastMemory = memories[memories.length - 1];
  const text = lastMemory.rawText;
  
  // Extract key info from the last memory
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const firstSentence = sentences[0]?.trim() || '';
  
  // Create a simple summary
  if (text.toLowerCase().includes('contract signed') || text.toLowerCase().includes('deal closed')) {
    return `Current state: Deal closed. ${firstSentence}`;
  }
  
  if (text.toLowerCase().includes('next step')) {
    return `Current state: Active engagement. ${firstSentence}`;
  }
  
  if (text.toLowerCase().includes('objection') || text.toLowerCase().includes('concern')) {
    return `Current state: Addressing concerns. ${firstSentence}`;
  }
  
  if (text.toLowerCase().includes('demo') || text.toLowerCase().includes('presentation')) {
    return `Current state: In evaluation. ${firstSentence}`;
  }
  
  if (text.toLowerCase().includes('initial') || text.toLowerCase().includes('discovery')) {
    return `Current state: Early stage discovery. ${firstSentence}`;
  }
  
  return `Current state: In progress. ${firstSentence}`;
}

export function getMemoriesForDeal(dealId: string, allMemories: Memory[]): Memory[] {
  return allMemories
    .filter(m => m.dealId === dealId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

export function isStale(updatedAt: string, days: number = 7): boolean {
  const date = new Date(updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= days;
}
