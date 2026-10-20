import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { api } from "../api";
import { UserContext } from "../context/UserContext";

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () =>
    api(`/api/course/${id}`).then(setCourse).catch((e) => setError(e.message));

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const enroll = async () => {
    setError(""); setSuccess("");
    try {
      await api(`/api/course/${id}/enroll`, { method: "POST" });
      setSuccess("Enrolled successfully");
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!course) return error ? <Alert severity="error">{error}</Alert> : null;

  const isTeacher = user.role === "Teacher";
  const full = course.enrolledCount >= course.maxStudent;
  const canEnroll = !isTeacher && course.status === "Open" && !full && !course.enrolled;

  return (
    <Paper sx={{ p: 3, display: "grid", gap: 1.5 }}>
      <Typography variant="h5">{course.name}</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Typography>Teacher: {course.teacherName}</Typography>
      <Typography>Duration: {course.duration} days</Typography>
      <Typography>Price: {course.price}</Typography>
      <Typography>Seats: {course.enrolledCount} / {course.maxStudent}</Typography>
      <Typography>Status: {course.status}</Typography>
      <div>Topics: {course.topics.map((t) => <Chip key={t} label={t} size="small" sx={{ mr: 0.5 }} />)}</div>

      {!isTeacher && (
        <div>
          <Button variant="contained" disabled={!canEnroll} onClick={enroll}>
            {course.enrolled ? "Already enrolled" : course.status !== "Open" ? "Not open" : full ? "Course full" : "Enroll"}
          </Button>
        </div>
      )}

      {isTeacher && (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>Enrolled Students</Typography>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell>Username</TableCell><TableCell>Email</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {course.enrolledStudents.map((s) => (
                <TableRow key={s.id}><TableCell>{s.username}</TableCell><TableCell>{s.email}</TableCell></TableRow>
              ))}
              {course.enrolledStudents.length === 0 && (
                <TableRow><TableCell colSpan={2} align="center">No students enrolled yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}
    </Paper>
  );
}
