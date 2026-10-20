//src/App.jsx

import { HashRouter, Route, Routes } from "react-router-dom";
import Layout, { HomeRedirect, RequireRole } from "./components/Layout";
import Login from "./pages/Login";
import TeacherCourses from "./pages/TeacherCourses";
import CourseForm from "./pages/CourseForm";
import CourseDetail from "./pages/CourseDetail";
import StudentCourses from "./pages/StudentCourses";
import MyEnrollments from "./pages/MyEnrollments";

const teacher = (el) => <RequireRole role="Teacher">{el}</RequireRole>;
const student = (el) => <RequireRole role="Student">{el}</RequireRole>;

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/teacher/courses" element={teacher(<TeacherCourses />)} />
          <Route path="/teacher/courses/new" element={teacher(<CourseForm />)} />
          <Route path="/teacher/courses/:id/edit" element={teacher(<CourseForm />)} />
          <Route path="/courses" element={student(<StudentCourses />)} />
          <Route path="/my-courses" element={student(<MyEnrollments />)} />
          <Route path="/courses/:id" element={<CourseDetail />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
