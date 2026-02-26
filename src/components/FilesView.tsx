import { useState } from 'react';
import { FileSplitView } from './FileSplitView';
import { FileCombineView } from './FileCombineView';

type SubTab = 'split' | 'combine';

export function FilesView() {
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

      {subTab === 'split' && <FileSplitView />}
      {subTab === 'combine' && <FileCombineView />}
    </div>
  );
}
