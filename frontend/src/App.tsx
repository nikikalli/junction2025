import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { CampaignScreen } from './pages/Campaign';
import { Segments } from './pages/Segments';
import { Test } from './pages/Test';
import { SasViyaCaseStudy } from './pages/sas-viya-case-study';
import { Nav } from './components/Nav';
//lol
function App() {
  return (
    <div className="app">
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/campaign" element={<CampaignScreen />} />
        <Route path="/segments/:canvasId" element={<Segments />} />
        <Route path="/sas-viya-case-study" element={<SasViyaCaseStudy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
