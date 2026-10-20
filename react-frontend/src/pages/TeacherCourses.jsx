import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Button, Typography } from "@mui/material";
import { api } from "../api";
import CourseTable from "../components/CourseTable";

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  const load = () =>
    api("/api/course").then(setCourses).catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const remove = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    setError("");
    try {
      await api(`/api/course/${c._id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>My Courses</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <CourseTable
        courses={courses}
        actions={(c) => (
          <>
            <Button size="small" component={RouterLink} to={`/teacher/courses/${c._id}/edit`}>Edit</Button>
            <Button size="small" color="error" disabled={c.enrolledCount > 0} onClick={() => remove(c)}>Delete</Button>
          </>
        )}
      />
    </>
  );
}
