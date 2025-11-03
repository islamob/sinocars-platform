import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import BrowseListings from './pages/BrowseListings';
import MyListings from './pages/MyListings';
import MyProfile from './pages/MyProfile';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [currentPage, setCurrentPage] = useState('browse');

  const renderPage = () => {
    switch (currentPage) {
      case 'browse':
        return <BrowseListings />;
      case 'myListings':
        return <MyListings />;
      case 'profile':
        return <MyProfile />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <BrowseListings />;
    }
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
          <main>{renderPage()}</main>
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
