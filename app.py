import os
from zipfile import ZipFile

from flask import Flask, render_template, request, jsonify, send_file
from denoising import denoiser

app = Flask(__name__)


@app.route('/')
def hello_world():  # put application's code here
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


@app.route('/upload', methods=['POST'])
def upload():
    remove_files_in_folder("uploads/")
    if 'file' not in request.files:
        return render_template('index.html', message='No file part')

    file = request.files['file']

    if file.filename == '':
        return render_template('index.html', message='No selected file')

    if file:
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)

        file.save(filename)

        # Call the denoiser function on the saved file
        denoiser(filename)
        os.remove(filename)

        # Return a JSON response with the denoised image URL
        return jsonify({'message': 'File uploaded and processed successfully',
                        'denoised_image_url': '/denoised/' + file.filename})


if __name__ == '__main__':
    app.run()
