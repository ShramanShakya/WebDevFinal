import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { api } from "../api";

const empty = { name: "", duration: "", topics: "", price: "", maxStudent: "", status: "Open" };

// Used for both "create" (/teacher/courses/new) and "edit" (/teacher/courses/:id/edit)
export default function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api(`/api/course/${id}`)
      .then((c) => setForm({ ...c, topics: c.topics.join(", ") }))
      .catch((e) => setError(e.message));
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api(id ? `/api/course/${id}` : "/api/course", {
        method: id ? "PUT" : "POST",
        body: {
          name: form.name,
          duration: form.duration,
          topics: form.topics.split(",").map((t) => t.trim()).filter(Boolean),
          price: form.price,
          maxStudent: form.maxStudent,
          status: form.status,
        },
      });
      navigate("/teacher/courses");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Paper component="form" onSubmit={submit} sx={{ p: 3, maxWidth: 520, display: "grid", gap: 2 }}>
      <Typography variant="h5">{id ? "Edit Course" : "New Course"}</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField label="Course name" value={form.name} onChange={set("name")} required />
      <TextField label="Duration (days)" type="number" value={form.duration} onChange={set("duration")} required />
      <TextField label="Topics (comma separated)" value={form.topics} onChange={set("topics")} required />
      <TextField label="Price" type="number" value={form.price} onChange={set("price")} required />
      <TextField label="Max Student" type="number" value={form.maxStudent} onChange={set("maxStudent")} required />
      <TextField select label="Status" value={form.status} onChange={set("status")}>
        {["Open", "Close", "Cancel"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>
      <Button type="submit" variant="contained">Save</Button>
    </Paper>
  );
}
