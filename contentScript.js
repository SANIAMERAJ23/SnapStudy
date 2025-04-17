let directoryHandle = null;
let notificationTimerId = null;
let isVideoPlaying = false;

const chooseDirectory = async () => {
  try {
    directoryHandle = await window.showDirectoryPicker();
  } catch (error) {
    console.log("Directory Not Selected > ", error);
  }
};

const saveFile = async (filename, dataURL) => {
  if (!directoryHandle) {
    console.error("Directory not selected yet.");
    return;
  }

  try {
    let fileHandle = await directoryHandle.getFileHandle(filename, {
      create: true,
    });
    let writable = await fileHandle.createWritable();
    await writable.write(await (await fetch(dataURL)).blob());
    await writable.close();
  } catch (error) {
    console.error("File saving error:", error.message);
  }
};

const colorHexCodes = ["#00FF00", "#0000FF", "#FF00FF",];
let lastColorIndex = 0;
let notificationElement = document.getElementById("notificationSS");

function getRandomUniqueColor() {
  let i = 0;
  while (lastColorIndex == i){
    i = Math.floor(Math.random() * 3);
  };

  lastColorIndex = i;
  return colorHexCodes[lastColorIndex];
}

const showNotification = (fileName) => {
  if (notificationTimerId) clearTimeout(notificationTimerId);

  if (!notificationElement) {
    const color = getRandomUniqueColor();
    notificationElement = document.createElement("p");
    notificationElement.id = "notificationSS";
    notificationElement.style.backgroundImage = `radial-gradient(circle at center, ${color}, ${color}20)`;
    notificationElement.classList.add("animation-notification");
    document.body.appendChild(notificationElement);
  }

  notificationElement.innerText = `File saved: ${fileName}`;

  notificationTimerId = setTimeout(() => {
    if (notificationElement && document.body.contains(notificationElement)) {
      document.body.removeChild(notificationElement);
      notificationElement = null; // Resetting to null after removal
    }
  }, 2000);
};

const cropVideo = async (setPath) => {
  try {
    if (setPath) await chooseDirectory();

    let video = document.querySelector("video");

    if (video && directoryHandle) {
      const isPlaying = !video.paused && !video.ended && video.currentTime > 0;

      if (isPlaying) {
        video.pause();
        isVideoPlaying = true;
      } else {
        isVideoPlaying = false;
      }

      // Create a canvas and set its dimensions to match the video
      let canvasContainer = document.createElement("canvas");
      canvasContainer.width = video.videoWidth;
      canvasContainer.height = video.videoHeight;

      let context = canvasContainer.getContext("2d");

      if (context) {
        // Draw the video frame to the canvas
        context.drawImage(
          video,
          0,
          0,
          canvasContainer.width,
          canvasContainer.height
        );

        if (isVideoPlaying) video.play();

        let timestamp = new Date().toISOString().replace(/[-:.]/g, "");
        let filename = `screenshot_${timestamp}.png`;

        let dataURL = canvasContainer.toDataURL("image/png");

        // Save the file
        await saveFile(filename, dataURL);

        if (notificationTimerId && notificationElement) {
          const color = getRandomUniqueColor();
          notificationElement.style.backgroundImage = `radial-gradient(circle at center, ${color}, ${color}20)`;
        }
        showNotification(filename);
      } else {
        console.log("Canvas context couldn't be created.");
      }
    } else {
      console.log("Video element not found.");
    }
  } catch (e) {
    console.log("Error in cropping video > ", e);
  }
};

const createElements = () => {
  let appendButton = document.createElement("button");
  appendButton.id = "downloadSS";
  appendButton.className = "bento-button flex-center";

  let spanButtonTitle = document.createElement("span");
  spanButtonTitle.innerText = "Snap";
  spanButtonTitle.className = "bento-button__title flex-center";
  appendButton.appendChild(spanButtonTitle);

  let video = document.querySelector("video");
  let canvasContainer = document.createElement("canvas");

  let videoHeight = video.videoHeight;
  let videoWidth = video.videoWidth;

  canvasContainer.id = "canvas";
  canvasContainer.height = videoHeight;
  canvasContainer.width = videoWidth;
  canvasContainer.style.display = "none";

  return {
    appendButton,
    canvasContainer,
  };
};

const appendElementToBody = () => {
  const elements = createElements();
  let container = document.getElementById("end");

  Object.values(elements).forEach((element) => {
    if (element) {
      const isAlready = document.getElementById(element.id);
      if (!isAlready) container.appendChild(element);
    }
  });
};

const addEventListener = () => {
  document.getElementById("downloadSS").addEventListener("click", () => {
    cropVideo(true);
  });

  document.addEventListener("keydown", (event) => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

    if (isMac && event.metaKey && event.key === "e") {
      cropVideo();
    } else if (!isMac && event.ctrlKey && event.key === "e") {
      cropVideo();
    }
  });
};

appendElementToBody();
addEventListener();
