from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io

app = Flask(__name__)
CORS(app)

# Paths - Updated for new .keras format
MODEL_PATH = '../backend/app/ml/models/mushroom_model.keras'
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

print(f"✅ Loaded {num_classes} classes")
print(f"✅ Classes: {class_names}")

def get_toxicity(class_name):
    name_lower = class_name.lower()
    
    # Poisonous mushrooms
    poisonous = ['amanita', 'cortinarius', 'poison', 'deadly', 'toxic', 'death']
    # Edible mushrooms
    edible = ['agaricus', 'boletus', 'edible', 'button', 'oyster', 'champignon', 'suillus', 'hygrocybe']
    # Suspicious mushrooms
    suspicious = ['russula', 'lactarius', 'entoloma']
    
    for word in poisonous:
        if word in name_lower:
            return 'poisonous'
    for word in edible:
        if word in name_lower:
            return 'edible'
    return 'suspicious'

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
        
        # Preprocess
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        predictions = model.predict(img_array, verbose=0)[0]
        
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
        
        # Generate safety warning
        top = results[0]
        if top['toxicity'] == 'poisonous':
            warning = '🚨 DANGER: This mushroom is POISONOUS! Do NOT consume under any circumstances!'
        elif top['toxicity'] == 'suspicious':
            warning = '⚠️ CAUTION: This mushroom needs expert verification. Do NOT consume without confirmation from a mycologist.'
        else:
            if top['confidence'] > 0.8:
                warning = '✅ This appears to be an edible species. However, ALWAYS verify with an expert before consuming any wild mushroom.'
            else:
                warning = '⚠️ Low confidence prediction. Please get expert verification before consuming.'
        
        return jsonify({
            'success': True,
            'predictions': results,
            'top_prediction': results[0],
            'safety_warning': warning,
            'mode': 'REAL AI'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("🍄 MUSHROOM AI SERVICE")
    print("=" * 50)
    print(f"✅ Model: Loaded")
    print(f"✅ Classes: {num_classes}")
    print(f"🌐 Server: http://localhost:5001")
    print("=" * 50 + "\n")
    app.run(port=5001, debug=True)