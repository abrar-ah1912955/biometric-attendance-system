import { Box, Button, CircularProgress, Container, TextField, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import * as faceApi from 'face-api.js'

const WebcamComponent = () => <Webcam />
const videoConstraints = {
    width: 400,
    height: 400,
    facingMode: 'user',
}


export default function FaceScan() {
    const [picture, setPicture] = useState('')
    const [qpicture, setQpicture] = useState('')
    const [matching, setMatching] = useState(false)
    const [ loading, setLoading ] = useState(false)
    const [quid, setQuid] = useState(null)
    
    const pictureRef = useRef(null)
    const qpictureRef = useRef(null)
    const webcamRef = useRef(null)

    const loadModels = async () => {

        const MODEL_URL = '/models/'
        console.log(faceApi)
        await faceApi.loadSsdMobilenetv1Model(MODEL_URL)
        await faceApi.loadFaceLandmarkModel(MODEL_URL)
        await faceApi.loadFaceRecognitionModel(MODEL_URL)

    }

    const capture = useCallback(() => {
        const pictureSrc = webcamRef.current.getScreenshot()
        setPicture(pictureSrc)
    })


    const match = async (referenceImage, queryImage) => {
        setLoading(true)
        const results = await faceApi
            .detectAllFaces(referenceImage)
            .withFaceLandmarks()
            .withFaceDescriptors()

        if (!results.length) {
            return
        }

        // // create FaceMatcher with automatically assigned labels
        // // from the detection results for the reference image
        const faceMatcher =  new faceApi.FaceMatcher(results, 0.4)


        const singleResult = await faceApi
            .detectSingleFace(queryImage)
            .withFaceLandmarks()
            .withFaceDescriptor()

        if (singleResult) {
            const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor)
            console.log(bestMatch.toString())
            if (!bestMatch.toString().includes('unknown')) {
                fetch('/api/checkin', {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        quid: quid
                    })
                })
                .then(res => res.json())
                .then(res => console.log(res))
                .then(() => alert('Checked in'))
                .catch((e) => console.log(e))
            } else {
                alert('Face does not match')
            }
            setMatching(false)
            setLoading(false)
        }
    }

    

    const getFaceMatcher = async () => {
        if (!quid) {
            alert('Please Enter QUID')
            return;
        }

        const stdRaw = await fetch('/api/student/students');
        const studentsRes = await stdRaw.json();
        const students = studentsRes.students.students
        const cid = "3"
        console.log(cid, students)

        const currentClassList = students.filter(student => student.courses.some(course => "" + course.id === cid));
        const std = currentClassList.find(stdn => stdn.QUID == quid);
        console.log("this is the current class: ", currentClassList)
        setQpicture(std.face)
    }

    useEffect(() => {
        loadModels()
    }, [])

    useEffect(() => {
        if (qpicture) {
            match(pictureRef.current, qpictureRef.current)
        }
    }, [qpicture])

    useEffect(() => {
        if (matching) {
            getFaceMatcher()
        }
    }, [matching])

    return (
        <Container>
            <Box sx={{display: 'flex'}}>
                <Box>

                    <Typography variant='h6'>Webcam</Typography>
                    <Webcam
                        audio={false}
                        height={400}
                        ref={webcamRef}
                        width={400}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                    />
                </Box>
                <Box sx={{ width: '100%',display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
                    <Box>
                        <Typography variant='h6'>Captured Photo</Typography>
                        <img src={picture} ref={pictureRef} />
                    </Box>
                    <Box>
                        <Typography variant='h6'>Photo from DB</Typography>
                        <img src={qpicture} ref={qpictureRef} />
                    </Box>
                </Box>
            </Box>
            <Box>
                <Button
                    onClick={(e) => {
                        e.preventDefault()
                        capture()
                    }}
                    variant="contained"
                >
                    Capture
                </Button>
            </Box>
            <Box>
            <TextField onChange={(e) => setQuid(e.target.value)} id="outlined-basic" label="QUID" variant="outlined" ></TextField>
                {loading && <CircularProgress></CircularProgress>}
                {!loading &&
                    <Button
                    sx={{m: 2}}
                    disabled={!picture || !quid}
                        variant='contained'
                        onClick={(e) => {
                            e.preventDefault()
                            setMatching(true)
                        }}>
                        Check In
                    </Button>
                }
            </Box>
        </Container>
    )
}