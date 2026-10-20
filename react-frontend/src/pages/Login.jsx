import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { Alert, Box, Button, Paper, TextField, Typography } from "@mui/material";
import { UserContext } from "../context/UserContext";

export default function Login() {
  const { user, login } = useContext(UserContext);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(identifier, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <Paper component="form" onSubmit={submit} sx={{ p: 4, width: 360, display: "grid", gap: 2 }}>
        <Typography variant="h5">Online Course Login</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Username or Email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" variant="contained">Login</Button>
      </Paper>
    </Box>
  );
}
