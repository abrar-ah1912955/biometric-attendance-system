import {promises as fs} from 'fs'

export default async function handler(req, res) {
    try {
        const crn  = '112211'
        const file = `./data/CRN${crn}.json`

        switch (req.method) {
            case "POST": {
                const attendance = await fs.readFile(file, 'utf8')
                const attArray = JSON.parse(attendance)
        
        
                const face = req.body;
                console.log("quid", face.quid)
                const existing = attArray.findIndex(student => student.quid === face.quid)
                console.log("exisitn", existing)
                if (existing >= 0) {
                    attArray[existing].faceData = face.faceData
                } else {
                    res.status(500).json({error: `Student of QUID ${req.body.quid} not found`})
                    break;
                }

        
                await fs.writeFile(file, JSON.stringify(attArray))
                res.status(200).json(attArray)
                
                break;
            }

            default:
                res.status(405).json({error: "Method not supported"})
                break;
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: "An error occured. Check server console" })
    }
}