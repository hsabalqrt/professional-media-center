import React, { useState, useEffect } from 'react';
import MediaCard from './components/MediaCard';
import MediaPlayer from './components/MediaPlayer';
import FolderCard from './components/FolderCard';
import { Search, Video, Music, Folder, Loader2, ArrowLeft, Home, ChevronRight } from 'lucide-react';

function App() {
  const [items, setItems] = useState([]); // Mixed folders and files
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'video', 'audio'
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanPath, setScanPath] = useState('');
  const [currentPath, setCurrentPath] = useState(''); // Current browsing path
  const [pathHistory, setPathHistory] = useState([]); // Breadcrumb history

  useEffect(() => {
    filterItems();
  }, [items, activeTab, searchQuery]);

  const filterItems = () => {
    let filtered = items;

    // Filter by type
    if (activeTab === 'video') {
      filtered = filtered.filter(item =>
        item.type === 'folder' ? item.videoCount > 0 : item.type === 'video'
      );
    } else if (activeTab === 'audio') {
      filtered = filtered.filter(item =>
        item.type === 'folder' ? item.audioCount > 0 : item.type === 'audio'
      );
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleScan = async () => {
    if (!scanPath.trim()) {
      alert('Please enter a path to scan');
      return;
    }

    setIsScanning(true);
    try {
      const response = await fetch('http://localhost:5000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: [scanPath] })
      });

      const data = await response.json();
      if (data.success) {
        // After scan, browse from root
        await browse('');
      } else {
        alert('Scan failed: ' + data.error);
      }
    } catch (error) {
      alert('Error scanning: ' + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const browse = async (path) => {
    try {
      const url = path
        ? `http://localhost:5000/api/browse?path=${encodeURIComponent(path)}`
        : 'http://localhost:5000/api/browse';

      const response = await fetch(url);
      const data = await response.json();
      setItems(data.items || []);
      setCurrentPath(path);
      setSearchQuery(''); // Reset search when navigating
    } catch (error) {
      console.error('Error browsing:', error);
    }
  };

  const handleItemClick = async (item) => {
    if (item.type === 'folder') {
      // Add current path to history
      setPathHistory([...pathHistory, currentPath]);
      // Browse into folder
      await browse(item.path);
    } else {
      // It's a file, open player
      setSelectedMedia(item);
    }
  };

  const handleBack = async () => {
    if (pathHistory.length > 0) {
      const previousPath = pathHistory[pathHistory.length - 1];
      setPathHistory(pathHistory.slice(0, -1));
      await browse(previousPath);
    }
  };

  const handleBreadcrumbClick = async (index) => {
    if (index === -1) {
      // Go to root
      setPathHistory([]);
      await browse('');
    } else {
      // Go to specific breadcrumb
      const targetPath = getBreadcrumbs()[index].path;
      setPathHistory(pathHistory.slice(0, index));
      await browse(targetPath);
    }
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [];

    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [];
    let accumulatedPath = '';

    for (let i = 0; i < parts.length; i++) {
      accumulatedPath += (i > 0 ? '/' : '') + parts[i];
      breadcrumbs.push({
        name: parts[i],
        path: accumulatedPath
      });
    }

    return breadcrumbs;
  };

  const stats = {
    all: items.length,
    video: items.filter(item =>
      item.type === 'video' || (item.type === 'folder' && item.videoCount > 0)
    ).length,
    audio: items.filter(item =>
      item.type === 'audio' || (item.type === 'folder' && item.audioCount > 0)
    ).length,
  };

  const breadcrumbs = getBreadcrumbs();
  const isAtRoot = currentPath === '';

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              {!isAtRoot && (
                <button
                  onClick={handleBack}
                  className="w-10 h-10 rounded-full glass glass-hover flex items-center justify-center flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gradient">Media Center</h1>

                {/* Breadcrumb Navigation */}
                {breadcrumbs.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-400 overflow-x-auto">
                    <button
                      onClick={() => handleBreadcrumbClick(-1)}
                      className="hover:text-primary-400 transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      <Home className="w-4 h-4" />
                    </button>
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        <button
                          onClick={() => handleBreadcrumbClick(index)}
                          className={`hover:text-primary-400 transition-colors truncate ${index === breadcrumbs.length - 1 ? 'text-white font-semibold' : ''
                            }`}
                        >
                          {crumb.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <div className="glass rounded-full px-4 py-2 text-sm">
                <span className="text-gray-400">Items:</span>
                <span className="text-white font-semibold ml-2">{stats.all}</span>
              </div>
            </div>
          </div>

          {/* Scan Input - Only show at root */}
          {isAtRoot && (
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Folder className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={scanPath}
                  onChange={(e) => setScanPath(e.target.value)}
                  placeholder="Enter path to scan (e.g., C:\Users\YourName\Videos)"
                  className="w-full glass rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                />
              </div>
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="gradient-primary rounded-xl px-6 py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  'Scan'
                )}
              </button>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full glass rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'all'
                ? 'gradient-primary'
                : 'glass glass-hover'
              }`}
          >
            All ({stats.all})
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === 'video'
                ? 'gradient-primary'
                : 'glass glass-hover'
              }`}
          >
            <Video className="w-5 h-5" />
            Videos ({stats.video})
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === 'audio'
                ? 'gradient-primary'
                : 'glass glass-hover'
              }`}
          >
            <Music className="w-5 h-5" />
            Audio ({stats.audio})
          </button>
        </div>

        {/* Content Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass mb-4">
              <Folder className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {isAtRoot && items.length === 0 ? 'No media found' : 'No items found'}
            </h3>
            <p className="text-gray-500">
              {isAtRoot && items.length === 0
                ? 'Enter a path above and click Scan to find media files'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              item.type === 'folder' ? (
                <FolderCard
                  key={item.path}
                  folder={item}
                  onClick={() => handleItemClick(item)}
                />
              ) : (
                <MediaCard
                  key={item.id}
                  media={item}
                  onClick={() => handleItemClick(item)}
                />
              )
            ))}
          </div>
        )}
      </div>

      {/* Media Player Modal */}
      {selectedMedia && (
        <MediaPlayer
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
}

export default App;
