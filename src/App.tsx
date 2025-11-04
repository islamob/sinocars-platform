import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import BrowseListings from './pages/BrowseListings';
import MyListings from './pages/MyListings';
import MyProfile from './pages/MyProfile';
import AdminPanel from './pages/AdminPanel';
// 1. Import the new UserProfile page
import UserProfile from './pages/UserProfile'; 

// Define a type for the possible pages, including the new dynamic view
type PageName = 'browse' | 'myListings' | 'profile' | 'admin' | 'userProfile';

function App() {
  // 2. State to track the active page
  const [currentPage, setCurrentPage] = useState<PageName>('browse');
  // 3. State to track the ID of the user being viewed on the 'userProfile' page
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  // 4. Create a function to handle navigation to a specific user's profile
  const navigateToUser = (userId: string) => {
    setTargetUserId(userId);
    setCurrentPage('userProfile');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'browse':
        return <BrowseListings navigateToUser={navigateToUser} />; // Pass the navigation function down
      case 'myListings':
        return <MyListings />;
      case 'profile':
        // Note: MyProfile is likely the *current* user's profile, distinct from UserProfile
        return <MyProfile />; 
      case 'admin':
        return <AdminPanel />;
      // 5. Add the new case for viewing another user's profile
      case 'userProfile':
        // We ensure targetUserId exists before rendering
        return targetUserId ? <UserProfile userId={targetUserId} /> : <BrowseListings />;
      default:
        return <BrowseListings navigateToUser={navigateToUser} />;
    }
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          {/* Note: You may need to update Navigation if you want 'userProfile' in the menu */}
          <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
          <main>{renderPage()}</main>
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
