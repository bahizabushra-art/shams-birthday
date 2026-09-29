import React, { useState, useEffect, useCallback } from 'react';
import { StarfieldBackground } from './components/StarfieldBackground.tsx';
import { WelcomeView } from './components/WelcomeView.tsx';
import { GuidedWishFlow } from './components/GuidedWishFlow.tsx';
import { NightSkyView } from './components/NightSkyView.tsx';
import { Wish } from './types.ts';
import { fetchWishes, fetchWishById } from './lib/api.ts';

type AppView = 'welcome' | 'create_wish' | 'sky';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [newlyAddedWishId, setNewlyAddedWishId] = useState<number | null>(null);
  const [focusedWish, setFocusedWish] = useState<Wish | null>(null);

  // Load all wishes for the sky
  const loadWishes = useCallback(async () => {
    try {
      const res = await fetchWishes({ page: 1, limit: 100 });
      setWishes(res.wishes);
    } catch (err) {
      console.warn('Failed to load wishes for sky:', err);
    }
  }, []);

  useEffect(() => {
    loadWishes();

    // Check for shareable /wish/:id path
    const match = window.location.pathname.match(/\/wish\/(\d+)/);
    if (match && match[1]) {
      const wishId = parseInt(match[1], 10);
      fetchWishById(wishId)
        .then((w) => {
          setFocusedWish(w);
          setCurrentView('sky');
        })
        .catch(() => {});
    }
  }, [loadWishes]);

  // Handle adding a new wish
  const handleWishCreated = (newWish: Wish) => {
    setWishes((prev) => [newWish, ...prev]);
    setNewlyAddedWishId(newWish.id);
  };

  const handleWishDeleted = (deletedId: number) => {
    setWishes((prev) => prev.filter((w) => w.id !== deletedId));
  };

  const handleFinishAndGoToSky = (createdWishId: number) => {
    setNewlyAddedWishId(createdWishId);
    setCurrentView('sky');
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="relative min-h-screen bg-[#070913] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200 overflow-hidden">
      {/* Background Starfield Canvas */}
      <StarfieldBackground />

      {/* Screen 1: Welcome Entrance */}
      {currentView === 'welcome' && (
        <WelcomeView
          totalWishes={wishes.length}
          onStartSendWish={() => setCurrentView('create_wish')}
          onExploreSky={() => setCurrentView('sky')}
        />
      )}

      {/* Screen 2: Guided One-By-One Wish Flow */}
      {currentView === 'create_wish' && (
        <GuidedWishFlow
          onWishCreated={handleWishCreated}
          onFinishAndGoToSky={handleFinishAndGoToSky}
          onCancel={() => setCurrentView('welcome')}
        />
      )}

      {/* Screen 3: The Collective Night Sky */}
      {currentView === 'sky' && (
        <NightSkyView
          wishes={wishes}
          newlyAddedWishId={newlyAddedWishId}
          onGoHome={() => setCurrentView('welcome')}
          onAddNewWish={() => setCurrentView('create_wish')}
          onWishDeleted={handleWishDeleted}
          initialSelectedWish={focusedWish}
        />
      )}
    </div>
  );
}
