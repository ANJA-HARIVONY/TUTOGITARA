import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './pages/admin/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogPage from './pages/student/CatalogPage';
import LessonPage from './pages/student/LessonPage';

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route
        element={(
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/" element={<CatalogPage />} />
        <Route path="/cours/:id" element={<LessonPage />} />
        <Route
          path="/admin"
          element={(
            <ProtectedRoute roles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          )}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
