/**
 * App principal avec routing React Router
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Presentation } from './pages/Presentation';
import { Questionnaire } from './pages/Questionnaire';
import { QuestionnaireUpload } from './pages/Questionnaire-Upload';
import { Soutenir } from './pages/Soutenir';
import { Pionniers } from './pages/Pionniers';
import { ThankYou } from './pages/ThankYou';
import { Temoignages } from './pages/Temoignages';
import { Admin } from './pages/Admin';
import { Ecosysteme } from './pages/Ecosysteme';
import { MentionsLegales } from './pages/MentionsLegales';
import { PolitiqueConfidentialite } from './pages/PolitiqueConfidentialite';
import { CGV } from './pages/CGV';
import { Tarifs } from './pages/Tarifs';
import { Contact } from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/questionnaire/upload" element={<QuestionnaireUpload />} />
          <Route path="/questionnaire/merci" element={<ThankYou />} />
          <Route path="/soutenir" element={<Soutenir />} />
          <Route path="/pionniers" element={<Pionniers />} />
          <Route path="/tarifs" element={<Tarifs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ecosysteme" element={<Ecosysteme />} />
          <Route path="/temoignages" element={<Temoignages />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="/cgv" element={<CGV />} />
          {/* Route 404 - Redirection vers accueil */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
