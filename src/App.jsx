import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Components
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';

// Screens
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { SendMoney } from './screens/SendMoney';
import { Receive } from './screens/Receive';
import { Wallet } from './screens/Wallet';
import { TransactionHistory } from './screens/TransactionHistory';
import { TransactionDetail } from './screens/TransactionDetail';
import { Settings } from './screens/Settings';
import { Notifications } from './screens/Notifications';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isOnboarded } = useStore();
  
  if (!isOnboarded) return <Navigate to="/onboarding" />;
  if (!isLoggedIn) return <Navigate to="/onboarding" />;
  
  return children;
};

const withErrorBoundary = (Component) => (
  <ErrorBoundary>
    <Component />
  </ErrorBoundary>
);

const App = () => {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/onboarding" element={withErrorBoundary(Onboarding)} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<ProtectedRoute>{withErrorBoundary(Home)}</ProtectedRoute>} />
          <Route path="/send" element={<ProtectedRoute>{withErrorBoundary(SendMoney)}</ProtectedRoute>} />
          <Route path="/receive" element={<ProtectedRoute>{withErrorBoundary(Receive)}</ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute>{withErrorBoundary(Wallet)}</ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute>{withErrorBoundary(TransactionHistory)}</ProtectedRoute>} />
          <Route path="/history/:pdaAddress" element={<ProtectedRoute>{withErrorBoundary(TransactionDetail)}</ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute>{withErrorBoundary(Settings)}</ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute>{withErrorBoundary(Notifications)}</ProtectedRoute>} />
        </Route>
      </Routes>
    </ToastProvider>
  );
};

export default App;
