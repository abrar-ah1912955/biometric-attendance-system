import { Box, Button, CircularProgress, Container, Input, TextField } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import * as faceApi from 'face-api.js'

const videoConstraints = {
    width: 400,
    height: 400,
    facingMode: 'user',
}


export default function FaceSave() {
    const [picture, setPicture] = useState('')
    const [fm, setFm] = useState(null)
    const [loading, setLoading] = useState(false)
    const [quid, setQuid] = useState(null)

    const pictureRef = useRef(null)
    const webcamRef = useRef(null)

    const capture = useCallback(() => {
        const pictureSrc = webcamRef.current.getScreenshot()
        setPicture(pictureSrc)
    })

    const savePic = () => {
        getFaceMatcher(pictureRef.current.src)
    }

    const getFaceMatcher = async (imgSrc) => {
        setLoading(true)
        // const results = await faceApi
        //     .detectAllFaces(img)
        //     .withFaceLandmarks()
        //     .withFaceDescriptors()

        // if (!results.length) {
        //     return
        // }

        // create FaceMatcher with automatically assigned labels
        // from the detection results for the reference image
        //const faceMatcher = new faceApi.FaceMatcher(results, 0.5)
        setFm(imgSrc)
    }

    const saveFM = async () => {
        if (!quid) {
            alert('Please Enter QUID')
            setFm(null)
            return;
        }
        fetch('/api/save_face_exp', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quid: quid,
                faceData: fm
            })
        })
            .then(res => res.json())
            .then(data => data.error? alert(data.error) : console.log(data))
            .then(() => setLoading(false))
            .then(() => setFm(null))
    }


    const loadModels = async () => {
        // webcamRef.current.setAttribute("width", 400);
        // webcamRef.current.setAttribute("height", 300);
        const MODEL_URL = '/models/'
        console.log(faceApi)
        await faceApi.loadSsdMobilenetv1Model(MODEL_URL)
        await faceApi.loadFaceLandmarkModel(MODEL_URL)
        await faceApi.loadFaceRecognitionModel(MODEL_URL)

    }

    useEffect(() => {
        loadModels()
    }, [])

    useEffect(() => {
        if (fm) {
            saveFM()
        }
    }, [fm])

    return (
        <Container>
            <Box sx={{ display: 'flex', alignItems: 'center' }} >
                <Box>
                    <h5>Take Photo</h5>
                    <Webcam
                        audio={false}
                        height={400}
                        ref={webcamRef}
                        width={400}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                    />
                </Box>
                <Box>
                <h5>Captured Photo</h5>
                    <img src={picture} ref={pictureRef} />
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
                            savePic(pictureRef.current)
                        }}>
                        Register Face ID
                    </Button>
                }
            </Box>
        </Container>
    )
}