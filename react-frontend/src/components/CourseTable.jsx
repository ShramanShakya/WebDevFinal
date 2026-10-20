import { Link as RouterLink } from "react-router-dom";
import { Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

const color = { Open: "success", Close: "warning", Cancel: "error" };

// Shared table. `actions(course)` renders extra buttons per row.
export default function CourseTable({ courses, showTeacher, actions }) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            {showTeacher && <TableCell>Teacher</TableCell>}
            <TableCell>Duration (days)</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Seats</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {courses.map((c) => (
            <TableRow key={c._id}>
              <TableCell>{c.name}</TableCell>
              {showTeacher && <TableCell>{c.teacherName}</TableCell>}
              <TableCell>{c.duration}</TableCell>
              <TableCell>{c.price}</TableCell>
              <TableCell>{c.enrolledCount}/{c.maxStudent}</TableCell>
              <TableCell><Chip size="small" label={c.status} color={color[c.status]} /></TableCell>
              <TableCell align="right">
                <Button size="small" component={RouterLink} to={`/courses/${c._id}`}>View</Button>
                {actions?.(c)}
              </TableCell>
            </TableRow>
          ))}
          {courses.length === 0 && (
            <TableRow><TableCell colSpan={7} align="center">No courses</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
