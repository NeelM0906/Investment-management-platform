import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import EditProjectPage from './pages/EditProjectPage';
import DealRoomPage from './pages/DealRoomPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import InvestorPortalPage from './pages/InvestorPortalPage';
import InvestorDashboardPage from './pages/InvestorDashboardPage';
import ContactsPage from './pages/ContactsPage';
import DocumentsPage from './pages/DocumentsPage';
import ImageGalleryDemo from './pages/ImageGalleryDemo';

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<CreateProjectPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/projects/:id/edit" element={<EditProjectPage />} />
            <Route path="/projects/:projectId/deal-room" element={<DealRoomPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/company-profile" element={<CompanyProfilePage />} />
            <Route path="/investor-portal" element={<InvestorPortalPage />} />
            <Route path="/investor-dashboard/:projectId" element={<InvestorDashboardPage />} />
            <Route path="/image-gallery-demo" element={<ImageGalleryDemo />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;