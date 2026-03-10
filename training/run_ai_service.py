from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io
import os

app = Flask(__name__)
CORS(app)

# Path to model (relative to training folder)
MODEL_PATH = '../backend/app/ml/models/mushroom_model.h5'
CLASS_NAMES_PATH = '../backend/app/ml/models/class_names.json'

print("=" * 50)
print("🍄 Loading Mushroom AI Model...")
print("=" * 50)

# Load model
model = tf.keras.models.load_model(MODEL_PATH)
print("✅ Model loaded successfully!")

# Load class names
with open(CLASS_NAMES_PATH, 'r') as f:
    class_data = json.load(f)
    class_names = class_data['class_names']
    num_classes = class_data['num_classes']
    training_acc = class_data.get('training_accuracy', 0)
    validation_acc = class_data.get('validation_accuracy', 0)

print(f"✅ Classes ({num_classes}): {class_names}")
print(f"✅ Training Accuracy: {training_acc*100:.2f}%")
print(f"✅ Validation Accuracy: {validation_acc*100:.2f}%")

def get_toxicity(class_name):
    name_lower = class_name.lower()
    
    poisonous = ['amanita', 'cortinarius', 'poison', 'deadly', 'toxic', 'death']
    edible = ['agaricus', 'boletus', 'suillus', 'hygrocybe', 'edible', 'button', 'oyster']
    
    for word in poisonous:
        if word in name_lower:
            return 'poisonous'
    for word in edible:
        if word in name_lower:
            return 'edible'
    return 'suspicious'

def check_image_quality(img):
    """
    Check if the image looks like a real photograph vs cartoon/illustration.
    """
    img_array = np.array(img)
    issues = []
    
    unique_colors = len(np.unique(img_array.reshape(-1, 3), axis=0))
    if unique_colors < 1000:
        issues.append('low_color_variety')
    
    gray = np.mean(img_array, axis=2)
    grad_x = np.abs(np.diff(gray, axis=1))
    grad_y = np.abs(np.diff(gray, axis=0))
    
    edge_mean = (np.mean(grad_x) + np.mean(grad_y)) / 2
    edge_std = (np.std(grad_x) + np.std(grad_y)) / 2
    
    if edge_mean > 0 and edge_std / (edge_mean + 1e-5) > 3.5:
        issues.append('cartoon_like_edges')
    
    r, g, b = img_array[:,:,0].astype(float), img_array[:,:,1].astype(float), img_array[:,:,2].astype(float)
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    diff = max_c - min_c
    
    saturation = np.mean(diff / (max_c + 1e-5))
    if saturation > 0.6:
        issues.append('high_saturation')
    
    flat_threshold = 0.15
    pixels = img_array.reshape(-1, 3)
    unique, counts = np.unique(pixels, axis=0, return_counts=True)
    max_same_color_ratio = np.max(counts) / len(pixels)
    if max_same_color_ratio > flat_threshold:
        issues.append('flat_background')
    
    return issues

def check_if_mushroom(predictions):
    """
    Check if the image is likely a mushroom based on prediction confidence.
    If the model is very uncertain, it's likely NOT a mushroom image.
    """
    max_conf = np.max(predictions)
    
    # Calculate entropy (uncertainty measure)
    probs = predictions + 1e-10
    entropy = -np.sum(probs * np.log(probs))
    max_entropy = np.log(len(predictions))
    entropy_ratio = entropy / max_entropy  # 0 = certain, 1 = completely uncertain
    
    # Top-2 confidence gap
    sorted_preds = np.sort(predictions)[::-1]
    top2_gap = sorted_preds[0] - sorted_preds[1]
    
    # Not a mushroom if:
    # 1. Max confidence is very low AND entropy is high
    # 2. Max confidence is extremely low (model has no idea)
    # 3. Top predictions are all very close (model can't distinguish)
    is_not_mushroom = (max_conf < 0.55 and entropy_ratio > 0.65) or \
                      (max_conf < 0.40) or \
                      (top2_gap < 0.10 and max_conf < 0.55)
    
    return {
        'is_mushroom': not is_not_mushroom,
        'max_confidence': float(max_conf),
        'entropy_ratio': float(entropy_ratio),
        'top2_gap': float(top2_gap)
    }

@app.route('/')
def home():
    return jsonify({
        'message': '🍄 Mushroom AI Service',
        'status': 'Running',
        'model': 'REAL AI ✅',
        'classes': num_classes,
        'class_names': class_names,
        'training_accuracy': f"{training_acc*100:.2f}%",
        'validation_accuracy': f"{validation_acc*100:.2f}%"
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        
        # Check image quality
        quality_issues = check_image_quality(img.resize((224, 224)))
        is_likely_fake = len(quality_issues) >= 2
        
        # Resize and predict
        img_resized = img.resize((224, 224))
        img_array = np.array(img_resized) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        predictions = model.predict(img_array, verbose=0)[0]
        
        # Check if image is actually a mushroom
        mushroom_check = check_if_mushroom(predictions)
        
        top_indices = np.argsort(predictions)[-3:][::-1]
        
        results = []
        for idx in top_indices:
            class_name = class_names[idx]
            confidence = float(predictions[idx])
            results.append({
                'species': class_name,
                'confidence': round(confidence, 4),
                'confidence_percent': f"{confidence * 100:.1f}%",
                'toxicity': get_toxicity(class_name)
            })
        
        top = results[0]
        
        # Determine warning based on checks
        if not mushroom_check['is_mushroom']:
            # NOT A MUSHROOM IMAGE
            warning = '🚫 NOT A MUSHROOM: This image does not appear to contain a mushroom. ' \
                      'The AI model could not find any mushroom features in this image. ' \
                      'Please upload a clear photograph of a real mushroom for accurate identification.'
            top['toxicity'] = 'suspicious'
            top['species'] = 'Not a Mushroom'
            top['confidence'] = 0.0
            top['confidence_percent'] = '0.0%'
            mode = 'REAL AI (🚫 Not a Mushroom)'
        elif is_likely_fake:
            # FAKE/CARTOON IMAGE
            warning = '🚫 WARNING: This image appears to be an illustration, cartoon, or digitally created image — ' \
                      'not a real photograph. Please upload a clear, real photograph of the mushroom for accurate identification. ' \
                      'Results may be unreliable.'
            top['toxicity'] = 'suspicious'
            mode = 'REAL AI (⚠️ Fake/Illustration Detected)'
        elif top['confidence'] < 0.50:
            # LOW CONFIDENCE
            warning = '❓ LOW CONFIDENCE: The model is not confident in this result. ' \
                      'This may not be a clear mushroom image, or it could be a species not in our database. ' \
                      'Please upload a clearer, real photograph.'
            top['toxicity'] = 'suspicious'
            mode = 'REAL AI (⚠️ Low Confidence)'
        elif top['toxicity'] == 'poisonous':
            warning = '🚨 DANGER: This mushroom is likely POISONOUS! Do NOT consume! Seek expert verification immediately.'
            mode = 'REAL AI'
        elif top['toxicity'] == 'suspicious':
            warning = '⚠️ CAUTION: This mushroom needs expert verification. Do not consume without professional confirmation.'
            mode = 'REAL AI'
        else:
            warning = '✅ This appears to be edible. However, ALWAYS verify with a qualified mycologist before consuming any wild mushroom.'
            mode = 'REAL AI'
        
        return jsonify({
            'success': True,
            'predictions': results,
            'top_prediction': results[0],
            'safety_warning': warning,
            'mode': mode,
            'image_quality': {
                'is_likely_fake': is_likely_fake,
                'issues': quality_issues
            },
            'mushroom_check': mushroom_check
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("🍄 MUSHROOM AI SERVICE - READY!")
    print("=" * 50)
    print(f"✅ Model: Loaded")
    print(f"✅ Classes: {num_classes}")
    print(f"✅ Accuracy: {validation_acc*100:.2f}%")
    print(f"✅ Image Quality Check: Enabled")
    print(f"✅ Non-Mushroom Detection: Enabled")
    print(f"🌐 Server: http://localhost:5001")
    print("=" * 50 + "\n")
    app.run(port=5001, debug=True)