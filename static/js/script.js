const rawImage = document.getElementById("raw-image");
const imageBefore = document.getElementById("image-before");
const imageAfter = document.getElementById("image-after");
const load = document.getElementById("load");
const loadTxt = document.getElementById("result-txt");
const imageContainer = document.getElementById("image-container");
const resetBtn = document.getElementById("reset-btn");
const downloadBtn = document.getElementById("download-btn");
const uploadBtn = document.getElementById("upload-btn");
const errorText = document.getElementById("error-text");
const uploadLabel = document.querySelector(".upload-label");
const rangeSelector = document.getElementById("range-selector");
// Create a FormData object and append the file

console.log(imageBefore, imageAfter, "-=-=-=-");

document
  .getElementById("image-upload")
  .addEventListener("change", function (event) {
    // const inputImage = document.getElementById("input-preview-image");
    // const rawImage = document.getElementById("raw-image");
    const fileNameDisplay = document.getElementById("file-name");
    // const load = document.getElementById("load");

    // const outputPreviews = document.getElementById('output-previews'); // Add this line
    console.log(event.target);

    if (event.target.files && event.target.files.length > 0) {
      const files = event.target.files;

      // Clear previous previews
      // outputPreviews.innerHTML = '';

      for (const file of files) {
        const reader = new FileReader();
        rangeSelector.style.display = "block";
        errorText.style.display = "none";
        load.style.display = "block";
        uploadBtn.style.display = "none";
        loadTxt.style.display = "block";
        uploadLabel.style.display = "none";

        reader.onload = function (e) {
          // Create a new image element for each file
          // rawImage.style.background = `url("${e.target.result}")`;
          //   const imagePreview = document.createElement("img");
          //   imagePreview.src = e.target.result;
          //   imagePreview.style.maxWidth = "100%";
          // rawImage.style.maxWidth = "100%";
          // rawImage.style.height = "500px";
          // rawImage.style.backgroundSize = "contain";
          // Append the image preview to the container
          // outputPreviews.appendChild(imagePreview);
          // fileNameDisplay.textContent += file.name + ", "; // Display the file names
        };

        reader.readAsDataURL(file);

        // Send each file to the server
        saveImageToServer(file);
      }
    }
  });

function saveImageToServer(file) {
  console.log("here inside");
  const loader = document.getElementById("lora-mera");
  const result = document.getElementById("result-txt");
  const imageBefore = document.getElementById("image-before");
  const imageAfter = document.getElementById("image-after");
  // Create a FormData object and append the file
  const formData = new FormData();
  const xhr = new XMLHttpRequest();
  console.log(imageBefore, imageAfter, "-=-=-=-");
  formData.append("file", file);

  console.log("File uploaded successfully");
  // const response = JSON.parse(xhr.responseText);
  // Set the images in the slider}
  // console.log(imageBefore, imageAfter, imageContainer);
  // imageContainer.style.height = "700px";
  // imageBefore.style.backgroundImage = `url("${URL.createObjectURL(file)}")`;
  // // imageAfter.style.backgroundImage = `url("${response.denoised_image_url.denoised_image}")`;
  // imageAfter.style.backgroundImage = `url("${URL.createObjectURL(file)}")`;
  // rawImage.style.height = 0;
  // load.style.display = "none";
  // resetBtn.style.display = "flex";
  // downloadBtn.style.display = "flex";
  // uploadBtn.style.display = "none";

  // Make an XMLHttpRequest to send the file to the server

  xhr.open("POST", "/upload", true);

  // Set up the onload and onerror events
  xhr.onload = function () {
    console.log(xhr, "xhrrrr");
    if (xhr.status === 200) {
      console.log("File uploaded successfully");
      const response = JSON.parse(xhr.responseText);
      // Set the images in the slider

      imageContainer.style.height = "700px";
      imageBefore.style.backgroundImage = `url("${URL.createObjectURL(file)}")`;
      imageAfter.style.backgroundImage =  `url("${response.denoised_image_url}")`;


      rawImage.style.height = 0;
      load.style.display = "none";
      resetBtn.style.display = "flex";
      downloadBtn.style.display = "flex";
      uploadBtn.style.display = "none";

      loadTxt.style.display = "none";
      load.style.display = "none";
      result.innerHTML = "YOU CAN NOW DOWNLOAD THE DENOISED FILES";
      result.style.color = "white";
      rawImage.style.display = "none";
    } else {
      console.error("File upload failed. Status:", xhr.status);

      loadTxt.style.display = "none";
      load.style.display = "none";
      errorText.style.display = "block";
      errorText.innerHTML = "File upload failed";
      uploadBtn.style.display = "inline-block";
      uploadLabel.style.display = "block";
    }
  };

  xhr.onerror = function () {
    console.error("File upload failed. Network error.");
  };

  // Send the FormData to the server
  xhr.send(formData);
}

// Event listener for the download button
document.getElementById("download-btn").addEventListener("click", function () {
  // const outputImage = document.getElementById("image-after");

  const imageDiv = document.getElementById("image-after");

  // Extract the URL of the background image
  const backgroundImage = window.getComputedStyle(imageDiv).backgroundImage;
  const imageUrl = backgroundImage.slice(5, -2); // Remove 'url("' and '")' parts
  console.log(imageUrl, "outputImage");
  if (imageUrl) {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.target = "_blank";
    link.download = "processed-image.png";
    link.click();
  } else {
    alert("No image to download.");
  }
});

// Reset button functionality
document.getElementById("reset-btn").addEventListener("click", function () {
  // Clear the image preview
  window.location.reload();
  // const inputImage = document.getElementById("input-preview-image");
  // inputImage.style.display = "none";
  // inputImage.src = "";

  // // Reset the file input
  // document.getElementById("image-upload").value = "";

  // // Hide the file name display and clear its content
  // const fileNameDisplay = document.getElementById("file-name");
  // fileNameDisplay.textContent = "";

  // // Show the upload label again
  // const uploadLabel = document.querySelector(".upload-label");
  // uploadLabel.style.display = "inline-block";
});
