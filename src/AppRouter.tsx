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
        <Route path="/albums/aged-friends-old-whiskey" element={<Albums feedUrl="https://music.behindthesch3m3s.com/wp-content/uploads/Delta_OG/Aged_Friends_and_Old_Whiskey/aged_friends_old_whiskey.xml" />} />
        <Route path="/albums/cosmodrome" element={<Albums feedUrl="https://feed.falsefinish.club/Temples/Temples - Cosmodrome/cosmodrome.xml" />} />
        <Route path="/albums/live-at-the-fickle-pickle" element={<Albums feedUrl="https://headstarts.uk/msp/live-at-the-fickle-pickle/live-at-the-fickle-pickle-into-the-valueverse.xml" />} />
        
        {/* Producer Picks Albums */}
        <Route path="/albums/east-to-west" element={<Albums feedUrl="https://music.behindthesch3m3s.com/wp-content/uploads/Empath Eyes/East To West/east to west.xml" />} />
        <Route path="/albums/tripodacus" element={<Albums feedUrl="https://music.behindthesch3m3s.com/wp-content/uploads/Tripodacus/tripodacus.xml" />} />
        <Route path="/albums/pilot" element={<Albums feedUrl="https://music.behindthesch3m3s.com/wp-content/uploads/Mellow Cassette/Pilot/pilot.xml" />} />
        <Route path="/albums/if-we-stayed-alive" element={<Albums feedUrl="https://music.behindthesch3m3s.com/wp-content/uploads/12 Rods/If We Stayed Alive/if we stayed alive.xml" />} />
        <Route path="/albums/radio-brigade" element={<Albums feedUrl="https://music.behindthesch3m3s.com/wp-content/uploads/Mellow Cassette/Radio_Brigade/radio_brigade.xml" />} />
        <Route path="/albums/way-to-go" element={<Albums feedUrl="https://static.staticsave.com/mspfiles/waytogo.xml" />} />
        <Route path="/albums/now-i-feel-it" element={<Albums feedUrl="https://music.behindthesch3m3s.com/wp-content/uploads/c_kostra/now i feel it.xml" />} />
        <Route path="/albums/midnight-breakheart" element={<Albums feedUrl="https://rocknrollbreakheart.com/msp/MidnightBreakheart/midnight breakheart.xml" />} />
        <Route path="/albums/rocknroll-breakheart" element={<Albums feedUrl="https://rocknrollbreakheart.com/msp/RNRBH/rock%27n%27roll%20breakheart.xml" />} />
        <Route path="/albums/nate-and-cole-find-a-radio" element={<Albums feedUrl="https://wavlake.com/feed/music/47bc7992-48ad-4a4b-907c-9972490bcdba" />} />
        <Route path="/albums/love-in-its-purest-form" element={<Albums feedUrl="https://feed.falsefinish.club/Vance Latta/Vance Latta - Love In Its Purest Form/love in its purest form.xml" />} />
        
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