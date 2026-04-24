from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io

app = Flask(__name__)
CORS(app)

# Paths
MODEL_PATH = '../backend/app/ml/models/mushroom_model.h5'
CLASS_NAMES_PATH = '../backend/app/ml/models/class_names.json'

print("=" * 50)
print("🍄 Loading Mushroom AI Model...")
print("=" * 50)

# Load model
model = tf.keras.models.load_model(MODEL_PATH, compile=False)
print("✅ Model loaded successfully!")

# Load class names
with open(CLASS_NAMES_PATH, 'r') as f:
    class_data = json.load(f)
    class_names = class_data['class_names']
    num_classes = class_data['num_classes']

print(f"✅ Loaded {num_classes} classes")
print(f"✅ Classes: {class_names}")

def get_toxicity(class_name):
    name_lower = class_name.lower()
    poisonous = ['amanita', 'cortinarius', 'poison', 'deadly', 'toxic', 'death']
    edible = ['agaricus', 'boletus', 'edible', 'button', 'oyster', 'champignon', 'suillus', 'hygrocybe']
    for word in poisonous:
        if word in name_lower:
            return 'poisonous'
    for word in edible:
        if word in name_lower:
            return 'edible'
    return 'suspicious'

def check_not_mushroom(predictions):
    """Layer 2: Non-mushroom detection using prediction entropy"""
    entropy = -np.sum(predictions * np.log(predictions + 1e-10))
    max_confidence = float(np.max(predictions))
    # Lower thresholds to catch more non-mushroom images
    if entropy > 1.5 and max_confidence < 0.5:
        return True, entropy, max_confidence
    if max_confidence < 0.25:
        return True, entropy, max_confidence
    return False, entropy, max_confidence

def check_fake_image(img):
    """Layer 3: Fake/cartoon image detection"""
    img_array = np.array(img)
    
    # Check 1: Color variety (cartoons have fewer unique colors)
    unique_colors = len(np.unique(img_array.reshape(-1, 3), axis=0))
    
    # Check 2: Edge sharpness (cartoons have unnaturally sharp edges)
    gray = np.mean(img_array, axis=2)
    edges_h = np.abs(np.diff(gray, axis=0))
    edges_v = np.abs(np.diff(gray, axis=1))
    edge_density = edges_h.mean() + edges_v.mean()
    sharp_edges = np.sum(edges_h > 100) + np.sum(edges_v > 100)
    sharp_ratio = sharp_edges / (gray.shape[0] * gray.shape[1])
    
    # Check 3: Color uniformity (cartoons have large flat color areas)
    color_std = np.std(img_array.reshape(-1, 3), axis=0).mean()
    
    # Check 4: Saturation
    r, g, b = img_array[:,:,0].astype(float), img_array[:,:,1].astype(float), img_array[:,:,2].astype(float)
    max_rgb = np.maximum(np.maximum(r, g), b)
    min_rgb = np.minimum(np.minimum(r, g), b)
    saturation = np.mean((max_rgb - min_rgb) / (max_rgb + 1e-10))
    
    # Detection logic
    is_fake = False
    if unique_colors < 500:
        is_fake = True
    elif unique_colors < 3000 and saturation > 0.5 and color_std < 50:
        is_fake = True
    elif unique_colors < 5000 and sharp_ratio > 0.15 and saturation > 0.45:
        is_fake = True
    elif color_std < 35 and saturation > 0.4:
        is_fake = True
    
    return is_fake, {
        'unique_colors': int(unique_colors),
        'edge_density': round(float(edge_density), 2),
        'sharp_ratio': round(float(sharp_ratio), 4),
        'color_std': round(float(color_std), 2),
        'saturation': round(float(saturation), 4)
    }

@app.route('/')
def home():
    return jsonify({
        'message': '🍄 Mushroom AI Service',
        'status': 'Running',
        'model': 'REAL AI ✅',
        'classes': num_classes,
        'class_names': class_names
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        # Read image
        file = request.files['image']
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img = img.resize((224, 224))

        # Layer 3: Check for fake/cartoon images
        is_fake, fake_details = check_fake_image(img)
        if is_fake:
            return jsonify({
                'success': True,
                'predictions': [],
                'top_prediction': {
                    'species': 'Unknown',
                    'confidence': 0,
                    'toxicity': 'suspicious'
                },
                'safety_warning': '⚠️ This image appears to be a cartoon or illustration, not a real mushroom photograph. Please upload a real photo.',
                'mode': 'fake_image',
                'analysis': fake_details
            })

        # Preprocess
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Layer 1: CNN Prediction
        predictions = model.predict(img_array, verbose=0)[0]

        # Layer 2: Non-mushroom detection
        is_not_mushroom, entropy, max_conf = check_not_mushroom(predictions)
        if is_not_mushroom:
            return jsonify({
                'success': True,
                'predictions': [],
                'top_prediction': {
                    'species': 'Not a Mushroom',
                    'confidence': 0,
                    'toxicity': 'suspicious'
                },
                'safety_warning': '❌ This does not appear to be a mushroom. Please upload a clear photo of a mushroom.',
                'mode': 'not_mushroom',
                'analysis': {
                    'entropy': round(float(entropy), 4),
                    'max_confidence': round(max_conf, 4)
                }
            })

        # Get top 3 predictions
        top_indices = np.argsort(predictions)[-3:][::-1]

        results = []
        for idx in top_indices:
            class_name = class_names[idx]
            confidence = float(predictions[idx])
            toxicity = get_toxicity(class_name)
            results.append({
                'species': class_name,
                'confidence': round(confidence, 4),
                'confidence_percent': f"{confidence * 100:.1f}%",
                'toxicity': toxicity
            })

        # Layer 4 & 5: Safety warning based on toxicity and confidence
        top = results[0]
        if top['toxicity'] == 'poisonous':
            warning = '🚨 DANGER: This mushroom is POISONOUS! Do NOT consume under any circumstances! Seek medical help if ingested.'
        elif top['toxicity'] == 'suspicious':
            warning = '⚠️ CAUTION: This mushroom needs expert verification. Do NOT consume without confirmation from a mycologist.'
        else:
            if top['confidence'] > 0.8:
                warning = '✅ This appears to be an edible species. However, ALWAYS verify with an expert before consuming any wild mushroom.'
            elif top['confidence'] > 0.5:
                warning = '⚠️ Moderate confidence. This may be edible but please get expert verification before consuming.'
            else:
                warning = '⚠️ Low confidence prediction. The AI is not certain about this identification. Please consult a mycologist.'

        return jsonify({
            'success': True,
            'predictions': results,
            'top_prediction': results[0],
            'safety_warning': warning,
            'mode': 'normal',
            'analysis': {
                'entropy': round(float(entropy), 4),
                'max_confidence': round(max_conf, 4)
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("🍄 MUSHROOM AI SERVICE")
    print("=" * 50)
    print(f"✅ Model: Loaded")
    print(f"✅ Classes: {num_classes}")
    print(f"✅ Layers: CNN + Entropy + Fake Detection + Toxicity + Safety")
    print(f"🌐 Server: http://localhost:5001")
    print("=" * 50 + "\n")
    app.run(port=5001, debug=True)