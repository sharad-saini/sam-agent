export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  specs?: Record<string, string | number>;
}

export interface ResearchProviderOutput {
  status: 'success' | 'insufficient' | 'error';
  results: SearchResultItem[];
  sources: string[];
  latencyMs: number;
  provider: string;
}

export interface ResearchProvider {
  search(query: string, options?: { forceFailure?: boolean; forceInsufficient?: boolean }): Promise<ResearchProviderOutput>;
}

export class DemoResearchProvider implements ResearchProvider {
  private callCount: number = 0;

  async search(query: string, options?: { forceFailure?: boolean; forceInsufficient?: boolean }): Promise<ResearchProviderOutput> {
    this.callCount++;

    // Controlled failure injection on first call if requested
    if (options?.forceFailure || (this.callCount === 1 && options?.forceInsufficient)) {
      return {
        status: 'insufficient',
        results: [
          {
            title: 'Notion for Education (Student Plan)',
            url: 'https://notion.so/students',
            snippet: 'All-in-one workspace for notes, wiki, and project management. Free for student emails.',
            specs: { price: 'Free', offline: 'Limited', collaboration: 'High' },
          },
          {
            title: 'Obsidian Knowledge Base',
            url: 'https://obsidian.md',
            snippet: 'Local Markdown knowledge base with graph view and extensive community plugins.',
            specs: { price: 'Free', offline: 'Full', collaboration: 'Sync Add-on' },
          },
        ],
        sources: ['https://notion.so', 'https://obsidian.md'],
        latencyMs: 120,
        provider: 'DemoResearchProvider (Insufficient Sample Demo)',
      };
    }

    // Success response
    return {
      status: 'success',
      results: [
        {
          title: 'Notion for Education (Free Student Plan)',
          url: 'https://notion.so/students',
          snippet: 'All-in-one workspace for notes, wiki, and project management. Real-time collaboration, unlimited blocks for students.',
          specs: { price: 'Free for Students', platform: 'Web / Desktop / Mobile', offline: 'Limited', rating: '4.8/5' },
        },
        {
          title: 'Obsidian Knowledge Base',
          url: 'https://obsidian.md',
          snippet: 'Local-first Markdown notes with graph visualization. 100% offline capability, zero vendor lock-in.',
          specs: { price: 'Free (Core)', platform: 'Cross-platform', offline: '100% Native', rating: '4.9/5' },
        },
        {
          title: 'Trello / Jira Product Discovery',
          url: 'https://trello.com',
          snippet: 'Visual Kanban boards, sprint task tracking, and lightweight team workflow automations.',
          specs: { price: 'Free Tier (10 Boards)', platform: 'Web / Mobile', offline: 'No', rating: '4.5/5' },
        },
        {
          title: 'Linear Software Tracking',
          url: 'https://linear.app',
          snippet: 'High-performance issue tracking and sprint planning for engineering teams. Free tier available.',
          specs: { price: 'Free Tier (Unlimited Users / 250 Issues)', platform: 'Web / Desktop', offline: 'Yes', rating: '4.9/5' },
        },
        {
          title: 'Miro Visual Collaborative Whiteboard',
          url: 'https://miro.com',
          snippet: 'Infinite visual canvas for architecture diagrams, brainstorming, and real-time sprint retrospectives.',
          specs: { price: 'Free Student / Educator Tier', platform: 'Web / Desktop', offline: 'No', rating: '4.7/5' },
        },
      ],
      sources: [
        'https://notion.so/students',
        'https://obsidian.md',
        'https://trello.com',
        'https://linear.app',
        'https://miro.com',
      ],
      latencyMs: 240,
      provider: 'DemoResearchProvider (Verified Academic Index)',
    };
  }

  reset() {
    this.callCount = 0;
  }
}

export const defaultResearchProvider = new DemoResearchProvider();
