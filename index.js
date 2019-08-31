const webcamElement = document.getElementById("webcam");

const classifier = knnClassifier.create();

let net;
async function app()    {
     console.log('Loading mobilenet...');

     //Load the model.
     net = await mobilenet.load();
     console.log('Sucessfully loaded the model');
 
     await setupWebcam();
     console.log('After setup webcam');
     //Reads an image from the webcam and associates it with a specific class index
     const addExample = classId => {
        //Get the intermediate activation of MobileNet 'conv_preds' and pass that to the KNN classifier
        const activation = net.infer(webcamElement, 'conv_preds');
        // Pass the intermediate activation to the classifier
        classifier.addExample(activation, classId);
     };

     //When clicking a button, add an example for that class.
     document.getElementById('class-a').addEventListener('click', () => addExample(0));
     document.getElementById('class-b').addEventListener('click', () => addExample(1));
     document.getElementById('class-c').addEventListener('click', () => addExample(2));
     //Add an extra button for no action, or 'blank' image.
     document.getElementById('class-blank').addEventListener('click', () => addExample(3));


     while(true) {
        if(classifier.getNumClasses() > 0 ) {
            //Get the activation from mobilenet from the webcam
            const activation = net.infer(webcamElement, 'conv_preds');
            //Get the most likely class and confidences from the classifier module
            const result = await classifier.predictClass(activation);

            const classes = ['A','B','C'];
            document.getElementById('console').innerText = `
            prediction: ${classes[result.classIndex]}\n
            probability: ${result.confidences[result.classIndex]}
            `;
        }

        //Give some breathing room by waiting for the next animation frame to fire
        await tf.nextFrame;
  
     }
}

async function setupWebcam() {
    console.log('Setting up webcam');
    return new Promise((resolve, reject) => {
        const navigatorAny = navigator;
        console.log('DO we have user media?');
        navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
        
        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                stream => {
                    webcamElement.srcObject = stream;
                    webcamElement.addEventListener('loadeddata', () => resolve(), false);
                },
                error => reject());
        } else {
            reject();
        }
    });
}

 app();