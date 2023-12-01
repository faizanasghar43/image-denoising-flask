import os
from zipfile import ZipFile

import replicate
from flask import Flask, render_template, request, jsonify, send_file
import requests

from PIL import Image
import io


def get_image_data(image_path):
    # Open the image file
    with Image.open(image_path) as img:
        # Convert the image to RGB format (if not already in this format)
        img = img.convert('RGB')
        # Create a byte buffer
        img_byte_arr = io.BytesIO()
        # Save image to the byte buffer
        img.save(img_byte_arr, format='PNG')
        # Get the byte data
        img_byte_arr = img_byte_arr.getvalue()
        return img_byte_arr


app = Flask(__name__)


@app.route('/')
def hello_world():  # put application's code here
    # if remove_files_in_folder("uploads/").exist():
    #
    #     # os.remove("uploads.zip")
    return render_template('index.html')


UPLOAD_FOLDER = app.config['UPLOAD_FOLDER'] = "uploads"


@app.route('/download', methods=['GET'])
def download():
    # Get a list of all files in the 'uploads' folder
    files_to_zip = [os.path.join(UPLOAD_FOLDER, filename) for filename in os.listdir(UPLOAD_FOLDER) if
                    os.path.isfile(os.path.join(UPLOAD_FOLDER, filename))]

    # Create a zip file in memory
    zip_buffer = ZipFile('uploads.zip', 'w')
    for file_path in files_to_zip:
        # Add each file to the zip file with its original filename
        zip_buffer.write(file_path, os.path.basename(file_path))

    # Close the zip file
    zip_buffer.close()

    # Send the zip file as a response
    return send_file('uploads.zip', as_attachment=True)


def remove_files_in_folder(folder_path):
    try:
        # Get the list of files in the folder
        file_list = os.listdir(folder_path)

        # Iterate through the files and remove each one
        for file_name in file_list:
            file_path = os.path.join(folder_path, file_name)
            os.remove(file_path)

        return True, None  # Success
    except Exception as e:
        return False, str(e)  # Error message


def download_file(url, filename):
    # Send a GET request to the URL
    response = requests.get(url, stream=True)

    # Check if the request was successful
    if response.status_code == 200:
        # Open a file in binary write mode
        with open("uploads/" + filename+"_processed", 'wb') as file:
            # Write the content of the response to the file
            for chunk in response.iter_content(chunk_size=128):
                file.write(chunk)
        print("Download completed.")
    else:
        print("Error: Unable to download the file.")


@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return render_template('index.html', message='No file part')

    file = request.files['file']

    if file.filename == '':
        return render_template('index.html', message='No selected file')

    if file:
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)

        file.save(filename)
        # donoised=(denoiser(filename))

        # Call the denoiser function on the saved file
        image_to_send =open(f"{filename}", "rb")


        output = replicate.run(
            "cszn/scunet:df9a3c1dbc6c1f7f4c2d244f68dffa2699a169cf5e701e0d6a009bf6ff507f26",

            input={
                "image": image_to_send,
                "model_name": "real image denoising"
            }
        )

        output_deblur = replicate.run(
            "megvii-research/nafnet:018241a6c880319404eaa2714b764313e27e11f950a7ff0a7b5b37b27b74dcf7",
            input={
                "image": f"{output['denoised_image']}",
                "task_type": "Image Debluring (REDS)"
            }
        )


        output = replicate.run(
            "microsoft/bringing-old-photos-back-to-life:c75db81db6cbd809d93cc3b7e7a088a351a3349c9fa02b6d393e35e0d51ba799",
            input={
                "HR": True,
                "image": f"{output_deblur}",
                "with_scratch": True
            }
        )

        os.remove(filename)
        download_file(output, file.filename)

        # Return a JSON response with the denoised image URL
        return jsonify({'message': 'File uploaded and processed successfully',
                        'denoised_image_url': '/denoised/' + file.filename})


if __name__ == '__main__':
    app.run()
