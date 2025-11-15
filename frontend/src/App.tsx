import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { CampaignScreen } from "./pages/Campaign";
import { NewHome } from "./pages/NewHome";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/campaign" element={<CampaignScreen />} />
        <Route path="/newhome" element={<NewHome />} />
      </Routes>
    </div>
  );
}

export default App;
