import { useContext } from "react";
import { Link as RouterLink, Navigate, Outlet } from "react-router-dom";
import { AppBar, Box, Button, CircularProgress, Container, Toolbar, Typography } from "@mui/material";
import { UserContext } from "../context/UserContext";

// Wraps all protected pages: redirects to /login when not authenticated
export default function Layout() {
  const { user, loading, logout } = useContext(UserContext);

  if (loading) return <Box sx={{ textAlign: "center", mt: 10 }}><CircularProgress /></Box>;
  if (!user) return <Navigate to="/login" replace />;

  const isTeacher = user.role === "Teacher";
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Online Course</Typography>
          {isTeacher ? (
            <>
              <Button color="inherit" component={RouterLink} to="/teacher/courses">My Courses</Button>
              <Button color="inherit" component={RouterLink} to="/teacher/courses/new">New Course</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/courses">All Courses</Button>
              <Button color="inherit" component={RouterLink} to="/my-courses">My Enrollments</Button>
            </>
          )}
          <Typography variant="body2">{user.username} ({user.role})</Typography>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 3, mb: 6 }}><Outlet /></Container>
    </>
  );
}

// Route-level role guard (the backend enforces the same rules)
export function RequireRole({ role, children }) {
  const { user } = useContext(UserContext);
  if (user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

export function HomeRedirect() {
  const { user } = useContext(UserContext);
  return <Navigate to={user?.role === "Teacher" ? "/teacher/courses" : "/courses"} replace />;
}
