import os
from zipfile import ZipFile
import cv2
import requests
from flask import Flask, render_template, request, jsonify, send_file

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# Ensure the uploads directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def apply_hdr(input_img):
    # Enhance local contrast and details
    detail_enhanced = cv2.detailEnhance(input_img, sigma_s=10, sigma_r=0.15)

    # Convert to LAB color space to adjust the brightness and contrast
    lab = cv2.cvtColor(detail_enhanced, cv2.COLOR_BGR2LAB)

    # Split LAB channels
    l, a, b = cv2.split(lab)

    # Apply CLAHE to the L-channel
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)

    # Merge CLAHE enhanced L-channel with A and B channels
    limg = cv2.merge((cl, a, b))

    # Convert back to BGR color space
    hdr_like = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

    return hdr_like


def denoiser(file_path):
    slash_index = file_path.rfind('/')

    if slash_index == -1:
        file_full_name = file_path
    else:
        file_extra_path = file_path[:slash_index]
        file_full_name = file_path[slash_index + 1:]

    dot_index = file_full_name.rfind('.')
    file_name = file_full_name[:dot_index]
    file_extension = file_full_name[dot_index + 1:]

    input_img = cv2.imread(file_path)

    # Denoising the image
    denoised_img = cv2.fastNlMeansDenoisingColored(input_img, None, 15, 15, 7, 21)

    # Applying HDR effect
    hdr_img = apply_hdr(denoised_img)

    output_file_name = file_name + "_hdr"
    output_file_full_name = output_file_name + '.' + file_extension
    output_file_path = output_file_full_name if slash_index == -1 else file_extra_path + '/' + output_file_full_name

    cv2.imwrite(output_file_path, hdr_img)
    return output_file_path


@app.route('/')
def hello_world():
    remove_files_in_folder(UPLOAD_FOLDER)
    return render_template('index.html')


@app.route('/download', methods=['GET'])
def download():
    files_to_zip = [os.path.join(UPLOAD_FOLDER, filename) for filename in os.listdir(UPLOAD_FOLDER) if
                    os.path.isfile(os.path.join(UPLOAD_FOLDER, filename))]

    with ZipFile('uploads.zip', 'w') as zip_buffer:
        for file_path in files_to_zip:
            zip_buffer.write(file_path, os.path.basename(file_path))

    return send_file('uploads.zip', as_attachment=True)


def remove_files_in_folder(folder_path):
    try:
        file_list = os.listdir(folder_path)
        for file_name in file_list:
            file_path = os.path.join(folder_path, file_name)
            os.remove(file_path)
        return True, None
    except Exception as e:
        return False, str(e)


def download_file(url, filename):
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(os.path.join(UPLOAD_FOLDER, "processed_" + filename), 'wb') as file:
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

        output_file_path = denoiser(filename)
        os.remove(filename)

        return jsonify({'message': 'File uploaded and processed successfully',
                        'denoised_image_url': '/denoised/' + os.path.basename(output_file_path)})


if __name__ == '__main__':
    app.run()
