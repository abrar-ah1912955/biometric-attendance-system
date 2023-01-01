import {promises as fs} from 'fs'

export default async function handler(req, res) {
    try {
        const { crn } = req.query
        const file = `./data/CRN${crn}.json`

        if (req.method === "GET") {
            const attendance = await fs.readFile(file, 'utf8')
            res.status(200).json(attendance)
        } else if (req.method === "POST") {
            const attendance = await fs.readFile(file, 'utf8')
            const attArray = JSON.parse(attendance)


            const today = req.body;

            attArray.forEach((student, i) => {
                if (today[student.quid]) attArray[i].attendance.push((new Date()).toLocaleDateString('en-GB'))
            });


            await fs.writeFile(file, JSON.stringify(attArray))
            res.status(200).json(attArray)
        }

        else {
            res.status(405).json({error: "Method not supported"})
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: "An error occured. Check server console" })
    }
}