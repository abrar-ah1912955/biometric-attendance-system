import { Box, Button, CircularProgress, Container } from '@mui/material'
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
    
    const pictureRef = useRef(null)
    const qpictureRef = useRef(null)
    const webcamRef = useRef(null)

    const capture = useCallback(() => {
        const pictureSrc = webcamRef.current.getScreenshot()
        if (!picture) setPicture(pictureSrc)
        else {
            if (!qpicture) setQpicture(pictureSrc)
            else setMatching(true)
        }
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

        // create FaceMatcher with automatically assigned labels
        // from the detection results for the reference image
        const faceMatcher =  new faceApi.FaceMatcher(results, 0.5)

        const singleResult = await faceApi
            .detectSingleFace(queryImage)
            .withFaceLandmarks()
            .withFaceDescriptor()

        if (singleResult) {
            const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor)
            console.log(bestMatch.toString())
            setLoading(false)
        }
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
        if (matching) {
            match( pictureRef.current, qpictureRef.current)
            setMatching(false)
        }
    }, [matching])

    return (
        <Container>
            <Box sx={{display: 'flex'}}>
                <Webcam
                    audio={false}
                    height={400}
                    ref={webcamRef}
                    width={400}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                />
                <Box>
                    <img src={picture} ref={pictureRef} />
                </Box>
                <Box>
                    <img src={qpicture} ref={qpictureRef} />
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
                {loading && <CircularProgress></CircularProgress>}
            </Box>
        </Container>
    )
}