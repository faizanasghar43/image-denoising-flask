document.getElementById('image-upload').addEventListener('change', function (event) {
    const inputImage = document.getElementById('input-preview-image');
    const fileNameDisplay = document.getElementById('file-name');
    const loader = document.getElementById('load');
    const uploadLabel = document.querySelector('.upload-label');
    // const outputPreviews = document.getElementById('output-previews'); // Add this line
    console.log(event.target);

    if (event.target.files && event.target.files.length > 0) {
        const files = event.target.files;

        // Clear previous previews
        // outputPreviews.innerHTML = '';

        for (const file of files) {
            const reader = new FileReader();
            loader.style.display = 'block';
            uploadLabel.style.display = 'none';

            reader.onload = function (e) {
                // Create a new image element for each file
                const imagePreview = document.createElement('img');
                imagePreview.src = e.target.result;
                imagePreview.style.maxWidth = '100%';

                // Append the image preview to the container
                // outputPreviews.appendChild(imagePreview);

                fileNameDisplay.textContent += file.name + ', '; // Display the file names
            };

            reader.readAsDataURL(file);

            // Send each file to the server
            saveImageToServer(file);
        }
    }
});

function saveImageToServer(file) {
    console.log("here inside");
     const loader = document.getElementById('lora-mera');
     const result = document.getElementById('result-txt');
    // Create a FormData object and append the file
    const formData = new FormData();
    formData.append('file', file);

    // Make an XMLHttpRequest to send the file to the server
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    // Set up the onload and onerror events
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('File uploaded successfully');
            loader.style.display = 'none';
            result.innerHTML="YOU CAN NOW DOWNLOAD THE DENOISED FILES";
            result.style.color='white';
            const response = JSON.parse(xhr.responseText);
            console.log(response);
        } else {
            console.error('File upload failed. Status:', xhr.status);
        }
    };

    xhr.onerror = function () {
        console.error('File upload failed. Network error.');
    };

    // Send the FormData to the server
    xhr.send(formData);
}

// Event listener for the download button
document.getElementById('download-btn').addEventListener('click', function () {
    const outputImage = document.getElementById('output-preview-image');
    if (outputImage.src) {
        const link = document.createElement('a');
        link.href = outputImage.src;
        link.download = 'processed-image.png';
        link.click();
    } else {
        alert("No image to download.");
    }
});

// Reset button functionality
document.getElementById('reset-btn').addEventListener('click', function () {
    // Clear the image preview
    const inputImage = document.getElementById('input-preview-image');
    inputImage.style.display = 'none';
    inputImage.src = '';

    // Reset the file input
    document.getElementById('image-upload').value = '';

    // Hide the file name display and clear its content
    const fileNameDisplay = document.getElementById('file-name');
    fileNameDisplay.textContent = '';

    // Show the upload label again
    const uploadLabel = document.querySelector('.upload-label');
    uploadLabel.style.display = 'inline-block';
});
