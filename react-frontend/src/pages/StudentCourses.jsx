import { useEffect, useState } from "react";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { api } from "../api";
import CourseTable from "../components/CourseTable";

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = (q = "") =>
    api(`/api/course?search=${encodeURIComponent(q)}`)
      .then(setCourses)
      .catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>All Courses</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" sx={{ display: "flex", gap: 1, mb: 2 }}
        onSubmit={(e) => { e.preventDefault(); load(search); }}>
        <TextField size="small" label="Course or teacher name" value={search}
          onChange={(e) => setSearch(e.target.value)} sx={{ width: 320 }} />
        <Button type="submit" variant="contained">Search</Button>
        <Button onClick={() => { setSearch(""); load(); }}>Clear</Button>
      </Box>
      <CourseTable courses={courses} showTeacher />
    </>
  );
}
