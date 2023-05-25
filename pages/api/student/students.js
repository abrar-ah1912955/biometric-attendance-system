export default async function handle(req, res) {
    try {
        const studentsRaw = await fetch('http://localhost:3000/api/student/students');
        const students = await studentsRaw.json();
        return res.status(200).json({ students });
    } catch (e) {
        return res.json({ code: "No students stored" });
    }
}