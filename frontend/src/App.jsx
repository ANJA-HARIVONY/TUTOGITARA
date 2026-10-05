import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './pages/admin/AdminPage';
import ProgressPage from './pages/admin/ProgressPage';
import StudentProgressPage from './pages/admin/StudentProgressPage';
import UsersPage from './pages/admin/UsersPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogPage from './pages/student/CatalogPage';
import CoursePage from './pages/student/CoursePage';
import LessonPage from './pages/student/LessonPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route
        element={(
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/catalogue" element={<CatalogPage />} />
        <Route path="/cours/:id" element={<CoursePage />} />
        <Route path="/cours/:id/lecons/:lessonId" element={<LessonPage />} />
        <Route
          element={(
            <ProtectedRoute roles={['admin']}>
              <Outlet />
            </ProtectedRoute>
          )}
        >
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/utilisateurs" element={<UsersPage />} />
          <Route path="/admin/suivi" element={<ProgressPage />} />
          <Route path="/admin/suivi/:userId" element={<StudentProgressPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
