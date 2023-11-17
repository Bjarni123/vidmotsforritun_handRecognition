// Import necessary modules from MediaPipe
const { GestureEstimator } = require('@mediapipe/gesture');
const { Hands } = require('@mediapipe/hands');

// Set up video input
const videoElement = document.createElement('video');
document.body.appendChild(videoElement);

// Set up hands and gesture estimator
const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
hands.setOptions({ maxNumHands: 1 });

const gestureEstimator = new GestureEstimator({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/gesture/${file}` });

// Initialize MediaPipe
hands.initialize().then(() => {
  // Start video stream
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    videoElement.srcObject = stream;

    videoElement.addEventListener('loadeddata', async () => {
      await hands.send({ image: videoElement });

      // Main loop to process each frame
      const processFrame = async () => {
        await hands.send({ image: videoElement });

        const results = await hands.receive();

        if (results.multiHandLandmarks) {
          const gesture = gestureEstimator.estimate(results.multiHandLandmarks, results.multiHandedness);
          console.log(gesture);
          // Perform actions based on the recognized gesture
          // You can customize this part based on your needs
        }

        requestAnimationFrame(processFrame);
      };

      processFrame();
    });
  });
});
