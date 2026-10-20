import { useEffect, useState } from "react";
import { Alert, Typography } from "@mui/material";
import { api } from "../api";
import CourseTable from "../components/CourseTable";

export default function MyEnrollments() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/course?enrolled=true").then(setCourses).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>My Enrolled Courses</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <CourseTable courses={courses} showTeacher />
    </>
  );
}
