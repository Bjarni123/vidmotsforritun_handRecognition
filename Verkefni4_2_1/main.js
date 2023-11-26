import { 
    GestureRecognizer, 
    FilesetResolver, 
    DrawingUtils 
} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3';

let gestureRecognizer;
let runningMode = 'IMAGE';
let enableWebcamButton;
let webcamRunning = false;
const videoWidth = '480px';
const videoHeight = '360px';

const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm');
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
            delegate: 'GPU'
        },
        runningMode: runningMode
    });
};
createGestureRecognizer();

const video = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const gestureOutput = document.getElementById('gesture_output');
const xOutput = document.getElementById('x_output');
const yOutput = document.getElementById('y_output');

enableWebcamButton = document.getElementById('webcamButton');
enableWebcamButton.addEventListener('click', enableCam);

function enableCam(event) {
    if (!gestureRecognizer) {
        alert('Please wait for gestureRecognizer to load');
        return;
    }
    if (webcamRunning === true) {
        webcamRunning = false;
    }
    else {
        webcamRunning = true;
    }
    // getUsermedia parameters.
    const constraints = {
        video: true
    };
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener('loadeddata', predictWebcam);
    });
}
let lastVideoTime = -1;
let results = undefined;
async function predictWebcam() {
    const webcamElement = document.getElementById('webcam');
    // Now let's start detecting the stream.
    if (runningMode === 'IMAGE') {
        runningMode = 'VIDEO';
        await gestureRecognizer.setOptions({ runningMode: 'VIDEO' });
    }

    let nowInMs = Date.now();

    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        results = gestureRecognizer.recognizeForVideo(video, nowInMs);
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    const drawingUtils = new DrawingUtils(canvasCtx);
    canvasElement.style.height = videoHeight;
    webcamElement.style.height = videoHeight;
    canvasElement.style.width = videoWidth;
    webcamElement.style.width = videoWidth;

    if (results.landmarks) {
        for (const landmarks of results.landmarks) {
            drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 5
            });
            drawingUtils.drawLandmarks(landmarks, {
                color: '#FF0000',
                lineWidth: 2
            });
        }
    }

    canvasCtx.restore();
    if (results.gestures.length > 0) {
        gestureOutput.style.display = 'block';
        gestureOutput.style.width = videoWidth;
        gestureOutput.innerText = results.gestures[0][0].categoryName;
        
        parseFloat(xOutput.innerText = results.landmarks[0][0].x.toFixed(2));
        parseFloat(yOutput.innerText = results.landmarks[0][0].y.toFixed(2));
        
        console.log(gestureOutput.innerText)
    }
    else {
        gestureOutput.style.display = 'none';
    }

    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}