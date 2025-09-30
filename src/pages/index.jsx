import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

import Layout from "./Layout.jsx";

import GameBoard from "./GameBoard.jsx";

import Archive from "./Archive.jsx";

//import CardManager from "./CardManager.jsx";

//import ConclusionManager from "./ConclusionManager.jsx";

const PAGES = {
    
    GameBoard: GameBoard,
    
    Archive: Archive,
    
    //CardManager: CardManager,
    
    //ConclusionManager: ConclusionManager,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
   const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);
    
    return (
      <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<GameBoard />} />
                    <Route path="/GameBoard" element={<GameBoard />} />
                    <Route path="/Archive" element={<Archive />} />
                    {/*<Route path="/CardManager" element={<CardManager />} />
                    <Route path="/ConclusionManager" element={<ConclusionManager />} />*/}
                
            </Routes>
            </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}