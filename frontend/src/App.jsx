import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import AppLayout from "./layouts/AppLayout";
import RequireSession from "./auth/RequireSession";
import ScrollToTop from "./components/ScrollToTop";
import CatalogPage from "./pages/CatalogPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import InstructorCoursesPage from "./pages/InstructorCoursesPage";
import CourseEditorPage from "./pages/CourseEditorPage";
import LessonPage from "./pages/LessonPage";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<RequireSession />}>
          <Route path="/home" element={<HomePage />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/cursos" element={<CatalogPage />} />
          <Route path="/cursos/:id" element={<CourseDetailPage />} />
          <Route element={<RequireSession role="estudiante" />}>
            <Route path="/lecciones/:id" element={<LessonPage />} />
          </Route>
          <Route element={<RequireSession role="instructor" />}>
            <Route
              path="/instructor/cursos"
              element={<InstructorCoursesPage />}
            />
            <Route
              path="/instructor/cursos/nuevo"
              element={<CourseEditorPage />}
            />
            <Route
              path="/instructor/cursos/:id/editar"
              element={<CourseEditorPage />}
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/cursos" replace />} />
      </Routes>
    </>
  );
}
