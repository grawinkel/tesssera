import { useState } from 'react';
import { SplitView } from './SplitView';
import { CombineView } from './CombineView';

type SubTab = 'split' | 'combine';

export function SecretsView() {
  const [subTab, setSubTab] = useState<SubTab>('split');

  return (
    <div>
      <nav className="sub-tab-nav">
        <button
          className={`sub-tab ${subTab === 'split' ? 'active' : ''}`}
          onClick={() => setSubTab('split')}
        >
          Split
        </button>
        <button
          className={`sub-tab ${subTab === 'combine' ? 'active' : ''}`}
          onClick={() => setSubTab('combine')}
        >
          Combine
        </button>
      </nav>

      {subTab === 'split' && <SplitView />}
      {subTab === 'combine' && <CombineView />}
    </div>
  );
}
