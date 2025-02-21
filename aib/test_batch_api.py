import os
import requests
import time

BASE_URL = "http://127.0.0.1:8000/api/"
OCR_URL = f"{BASE_URL}process_image/"
OBJECT_URL = f"{BASE_URL}detect_object/"
CURRENCY_URL = f"{BASE_URL}classify_note/"

IMAGE_DIRS = {
    'ocr': r'C:\Users\SK\Documents\GitHub\aiforblind_app\ocr_images',
    'object_detection': r'C:\Users\SK\Documents\GitHub\aiforblind_app\object_detection_images',
    'currency_recognition': r'C:\Users\SK\Documents\GitHub\aiforblind_app\currency_detection_images'
}

def test_endpoint(endpoint_url, image_dir):
    results = []
    total_time = 0
    successful_requests = 0

    for image_name in os.listdir(image_dir):
        image_path = os.path.join(image_dir, image_name)
        if image_name.lower().endswith(('.png', '.jpg', '.jpeg')):
            with open(image_path, 'rb') as img:
                files = {'image': img}
                start_time = time.time()  
                response = requests.post(endpoint_url, files=files)
                elapsed_time = time.time() - start_time 
                
                result = {
                    'image': image_name,
                    'status_code': response.status_code,
                    'response_time': elapsed_time,
                    'response': response.json() if response.status_code == 200 else response.text
                }
                results.append(result)
                total_time += elapsed_time
                
                if response.status_code == 200:
                    successful_requests += 1
                
                print(f"Processed {image_name}: {response.status_code} in {elapsed_time:.2f} seconds")
    
    total_images = len(results)
    accuracy = (successful_requests / total_images) * 100 if total_images > 0 else 0
    average_time = total_time / total_images if total_images > 0 else 0

    print(f"\nResults for {endpoint_url.split('/')[-2]}:")
    print(f"Total Images: {total_images}")
    print(f"Successful Requests: {successful_requests}")
    print(f"Accuracy: {accuracy:.2f}%")
    print(f"Average Response Time: {average_time:.2f} seconds")

    return results, accuracy, average_time

if _name_ == '_main_':
    print("Testing OCR...")
    ocr_results, ocr_accuracy, ocr_avg_time = test_endpoint(OCR_URL, IMAGE_DIRS['ocr'])
    
    print("\nTesting Object Detection...")
    object_results, object_accuracy, object_avg_time = test_endpoint(OBJECT_URL, IMAGE_DIRS['object_detection'])
    
    print("\nTesting Currency Recognition...")
    currency_results, currency_accuracy, currency_avg_time = test_endpoint(CURRENCY_URL, IMAGE_DIRS['currency_recognition'])

    with open('ocr_results.log', 'w') as f:
        f.write(str(ocr_results))
    with open('object_results.log', 'w') as f:
        f.write(str(object_results))
    with open('currency_results.log', 'w') as f:
        f.write(str(currency_results))

    with open('test_summary.log', 'w') as f:
        f.write(f"OCR Accuracy: {ocr_accuracy:.2f}%, Avg Response Time: {ocr_avg_time:.2f} seconds\n")
        f.write(f"Object Detection Accuracy: {object_accuracy:.2f}%, Avg Response Time: {object_avg_time:.2f} seconds\n")
        f.write(f"Currency Recognition Accuracy: {currency_accuracy:.2f}%, Avg Response Time: {currency_avg_time:.2f} seconds\n")
    
    print("\nTesting completed. Results and metrics saved to log files.")