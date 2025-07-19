import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Albums from "./pages/Albums";


export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/albums" element={<Albums />} />
        
        {/* Individual Album Pages - Following the same template as /albums */}
        <Route path="/albums/bloodshot-lies" element={<Albums feedUrl="https://www.doerfelverse.com/feeds/bloodshot-lies-album.xml" />} />
        <Route path="/albums/heycitizen-experience" element={<Albums feedUrl="https://files.heycitizen.xyz/Songs/Albums/The-Heycitizen-Experience/the heycitizen experience.xml" />} />
  
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;