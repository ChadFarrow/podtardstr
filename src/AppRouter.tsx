import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Albums from "./pages/Albums";
import Music from "./pages/Music";


export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/music" element={<Music />} />
        <Route path="/albums" element={<Albums />} />
        
        {/* Individual Album Pages - Clean URLs */}
        <Route path="/albums/bloodshot-lies" element={<Albums feedUrl="https://www.doerfelverse.com/feeds/bloodshot-lies-album.xml" />} />
        <Route path="/albums/heycitizen-experience" element={<Albums feedUrl="https://files.heycitizen.xyz/Songs/Albums/The-Heycitizen-Experience/the heycitizen experience.xml" />} />
        <Route path="/albums/think-ep" element={<Albums feedUrl="https://www.doerfelverse.com/feeds/think-ep.xml" />} />
        <Route path="/albums/music-from-the-doerfelverse" element={<Albums feedUrl="https://www.doerfelverse.com/feeds/music-from-the-doerfelverse.xml" />} />
        <Route path="/albums/stay-awhile" element={<Albums feedUrl="https://ableandthewolf.com/static/media/feed.xml" />} />
        <Route path="/albums/spectral-hiding" element={<Albums feedUrl="https://zine.bitpunk.fm/feeds/spectral-hiding.xml" />} />
        <Route path="/albums/polar-embrace" element={<Albums feedUrl="https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/polarembrace/rss/videofeed/feed.xml" />} />
        <Route path="/albums/autumn-rust" element={<Albums feedUrl="https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/autumnrust/mp3s/album_feed/feed.xml" />} />
        <Route path="/albums/the-satellite-skirmish" element={<Albums feedUrl="https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/the_satellite_skirmish_album.xml" />} />
        <Route path="/albums/lofi-experience" element={<Albums feedUrl="https://files.heycitizen.xyz/Songs/Albums/Lofi-Experience/lofi.xml" />} />
        <Route path="/albums/tinderbox" element={<Albums feedUrl="https://wavlake.com/feed/music/d677db67-0310-4813-970e-e65927c689f1" />} />
        <Route path="/albums/deathdreams" element={<Albums feedUrl="https://static.staticsave.com/mspfiles/deathdreams.xml" />} />
        <Route path="/albums/pony-up-daddy" element={<Albums feedUrl="https://music.behindthesch3m3s.com/wp-content/uploads/Mike_Epting/$2Holla/pony%20up%20daddy.xml" />} />
        <Route path="/albums/empty-passenger-seat" element={<Albums feedUrl="https://whiterabbitrecords.org/wp-content/uploads/2023/04/Empty-Passenger-Seat.xml" />} />
        
        {/* Doerfels Podroll Albums */}
        <Route path="/albums/ben-doerfel" element={<Albums feedUrl="https://www.doerfelverse.com/feeds/ben-doerfel.xml" />} />
        <Route path="/albums/into-the-doerfelverse" element={<Albums feedUrl="https://www.doerfelverse.com/feeds/intothedoerfelverse.xml" />} />
        <Route path="/albums/kurtisdrums-v1" element={<Albums feedUrl="https://www.sirtjthewrathful.com/wp-content/uploads/2023/08/Kurtisdrums-V1.xml" />} />
        <Route path="/albums/nostalgic" element={<Albums feedUrl="https://www.sirtjthewrathful.com/wp-content/uploads/2023/08/Nostalgic.xml" />} />
        <Route path="/albums/citybeach" element={<Albums feedUrl="https://www.sirtjthewrathful.com/wp-content/uploads/2023/08/CityBeach.xml" />} />
        <Route path="/albums/wrath-of-banjo" element={<Albums feedUrl="https://www.doerfelverse.com/feeds/wrath-of-banjo.xml" />} />
        <Route path="/albums/ring-that-bell" element={<Albums feedUrl="https://www.thisisjdog.com/media/ring-that-bell.xml" />} />
        
        {/* ChadF Albums */}
        <Route path="/albums/wavlake-album" element={<Albums feedUrl="https://wavlake.com/feed/music/997060e3-9dc1-4cd8-b3c1-3ae06d54bb03" />} />
  
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;