import React, { Suspense, useState, useCallback } from 'react';
import { AppTab } from './types';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ChatView from './components/ChatView';

const ReportView = React.lazy(() => import('./components/ReportView'));
const CaseStudiesView = React.lazy(() => import('./components/CaseStudiesView'));
const SceneImageView = React.lazy(() => import('./components/SceneImageView'));

function ScreenLoading() {
  return (
    <div className="app-screen flex items-center justify-center" role="status">
      <p className="text-sm text-slate-400">載入中…</p>
    </div>
  );
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Chat);
  const [sceneDraft, setSceneDraft] = useState('');

  const handleGoToScene = useCallback((description: string) => {
    setSceneDraft(description);
    setActiveTab(AppTab.Scene);
  }, []);

  const clearSceneDraft = useCallback(() => setSceneDraft(''), []);

  const isChat = activeTab === AppTab.Chat;

  return (
    <div className="app-root">
      <div className="app-frame">
        <Header activeTab={activeTab} />

        <main className="app-main">
          {isChat ? (
            <ChatView onCreateScene={handleGoToScene} />
          ) : (
            <div className="app-screen-host">
              <Suspense fallback={<ScreenLoading />}>
                <div className="app-screen animate-fade-in">
                  {activeTab === AppTab.Scene && (
                    <SceneImageView
                      initialDescription={sceneDraft}
                      onDescriptionConsumed={clearSceneDraft}
                    />
                  )}
                  {activeTab === AppTab.Report && <ReportView />}
                  {activeTab === AppTab.Cases && <CaseStudiesView />}
                </div>
              </Suspense>
            </div>
          )}
        </main>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;
