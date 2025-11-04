import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import BrowseListings from './pages/BrowseListings';
import MyListings from './pages/MyListings';
import MyProfile from './pages/MyProfile';
import AdminPanel from './pages/AdminPanel';
// 1. Import the UserProfile page
import UserProfile from './pages/UserProfile'; 

// 2. Define all possible page names
type PageName = 'browse' | 'myListings' | 'profile' | 'admin' | 'userProfile';

function App() {
  // 3. State to track the active page
  const [currentPage, setCurrentPage] = useState<PageName>('browse');
  // 4. State to track the ID of the user being viewed
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  // 5. Function to handle navigation to a specific user's profile
  const navigateToUser = (userId: string) => {
    setTargetUserId(userId);
    setCurrentPage('userProfile');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'browse':
        // 6. Pass the navigation function down to BrowseListings
        return <BrowseListings navigateToUser={navigateToUser} />;
      case 'myListings':
        return <MyListings />;
      case 'profile':
        return <MyProfile />;
      case 'admin':
        return <AdminPanel />;
      // 7. Add the new case for viewing another user's profile
      case 'userProfile':
        // We ensure targetUserId exists before rendering
        return targetUserId 
          ? <UserProfile userId={targetUserId} /> 
          : <BrowseListings navigateToUser={navigateToUser} />; // Fallback
      default:
        return <BrowseListings navigateToUser={navigateToUser} />;
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
