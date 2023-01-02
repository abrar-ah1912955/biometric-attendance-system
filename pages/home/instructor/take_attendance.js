import { Button, Chip, Container, FormControl, FormControlLabel, Link, Radio, RadioGroup, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";


export default function TakeAttendance() {
    const [ attendance, setAttendance ] = useState([])
    const [ attendanceToday, setAttendanceToday ] = useState({})
    const [ crn, setCrn ] = useState('112211');
    const [ submitting, setSubmitting ] = useState(false)

    const getAttendance = () => {
        fetch(`/api/classes/${crn}`)
        .then(res => res.json())
        .then(data => {
            const arr = JSON.parse(data)
            const today = {}
            setAttendance(arr)

            arr.forEach(student => today[student.quid] = true)
            setAttendanceToday(today)
            console.log("today", attendanceToday)
        })
        .catch(e => console.log(e))
    }

    const postAttendance = () => {
        fetch(`/api/classes/${crn}`, { 
            method: "POST",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(attendanceToday) 
        })
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(e => console.log("post attendance: ", e))
        .finally(() => setSubmitting(false))
    }

    useEffect(() => {
        getAttendance()
    }, [])

    useEffect(() => {
        if (submitting) postAttendance()
    }, [submitting])

    return (
        <Container>
            <Typography variant="h3">Welcome, Instructor</Typography>
            <Typography variant="h4">Taking attendance for class CRN{crn}</Typography>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Name
                        </TableCell>
                        <TableCell>
                            Attendance
                        </TableCell>
                        <TableCell>
                            <Link href="/home/instructor/FaceScan">
                                <Button variant="contained">
                                    Take Attendance by Face ID
                                </Button>
                            </Link>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {attendance.map(student => (
                        <TableRow key={student.quid}>
                            <TableCell>
                                {student.name} <br />
                                {student.quid}
                            </TableCell>
                            <TableCell>
                                <FormControl>
                                    <RadioGroup
                                        row
                                        aria-labelledby={`attendance-for-${student.name}`}
                                        name={`controlled-radio-buttons-group-${student.name}`}
                                        value={attendanceToday[student.quid] ? "Present" : "Absent"}
                                        onChange={e => {
                                            setAttendanceToday({...attendanceToday, [student.quid]: !attendanceToday[student.quid]})
                                        }}
                                    >
                                        <FormControlLabel checked={attendanceToday[student.quid]} value="Present" control={<Radio />} label="Present" />
                                        <FormControlLabel checked={!attendanceToday[student.quid]} value="Absent" control={<Radio />} label="Absent" />
                                    </RadioGroup>
                                </FormControl>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button variant="contained" sx={{mt: 2}} onClick={() => setSubmitting(true)}>
                Submit
            </Button>
        </Container>

    )
}