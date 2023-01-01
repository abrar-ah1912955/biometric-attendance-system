import { Chip, Container, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const getPastDays = (numOfDates) => {
    const dates = []
    for (let i = 0; i <= numOfDates; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date)
    }
    return dates.reverse();
}

const parseDBDate = dateString => {
    const dateArray = dateString.split('/')
    return new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
}

export default function ViewAttendance() {
    const [ attendance, setAttendance ] = useState([])

    const getAttendance = () => {
        fetch('/api/classes/112211')
        .then(res => res.json())
        .then(data => {
            setAttendance(JSON.parse(data))
        })
        .catch(e => console.log(e))
    }

    useEffect(() => {
        getAttendance()
    }, [])
    return (
        <Container>
            <Typography variant="h3">Welcome, Teacher</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Name
                        </TableCell>
                        {getPastDays(6).map(date => (
                            <TableCell key={date}>
                                {date.toLocaleDateString('en-GB')}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {attendance.map(student => (
                        <TableRow key={student.quid}>
                            <TableCell>
                                {student.name} <br />
                                {student.quid}
                            </TableCell>
                            {getPastDays(6).map(date => (
                                <TableCell key={date}>
                                    {student.attendance.find(attended => parseDBDate(attended).toLocaleDateString('en-GB') === date.toLocaleDateString('en-GB')) ?
                                        <Chip label="Present" sx={{backgroundColor: "green", color: "white"}}></Chip>
                                        :
                                        <Chip label="Absent" sx={{backgroundColor: "tomato", color: "white"}}></Chip>
                                    }
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Container>

    )
}