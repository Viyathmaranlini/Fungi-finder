# ============================================================
# TRAIN MUSHROOM MODEL ON YOUR PC - 8000+ IMAGES
# ============================================================
import os
import zipfile
import json
import numpy as np
from PIL import Image
import shutil
import gc

print("=" * 60)
print("🍄 MUSHROOM AI MODEL TRAINING ON YOUR PC")
print("=" * 60)

# ============================================================
print("\nSTEP 1: DOWNLOAD DATASETS")
print("=" * 60)

os.makedirs('data', exist_ok=True)

print("📥 Downloading Dataset 1: Mushrooms Classification...")
os.system('kaggle datasets download -d maysee/mushrooms-classification-common-genuss-images -p data/dataset1')

print("📥 Downloading Dataset 2: Edible & Poisonous Fungi...")
os.system('kaggle datasets download -d marcosvolpato/edible-and-poisonous-fungi -p data/dataset2')

print("\n📦 Extracting datasets...")

for folder in ['data/dataset1', 'data/dataset2']:
    if os.path.exists(folder):
        for file in os.listdir(folder):
            if file.endswith('.zip'):
                zip_path = os.path.join(folder, file)
                print(f"   Extracting {file}...")
                with zipfile.ZipFile(zip_path, 'r') as z:
                    z.extractall(folder)
                os.remove(zip_path)

print("✅ Datasets ready!")

# ============================================================
print("\nSTEP 2: CLEAN AND COMBINE IMAGES")
print("=" * 60)

COMBINED_DIR = 'combined_data'
if os.path.exists(COMBINED_DIR):
    shutil.rmtree(COMBINED_DIR)
os.makedirs(COMBINED_DIR)

def clean_and_copy(src_folder, class_name, max_images=1000):
    dst_folder = os.path.join(COMBINED_DIR, class_name)
    os.makedirs(dst_folder, exist_ok=True)
    
    existing = len(os.listdir(dst_folder))
    count = 0
    
    if not os.path.exists(src_folder):
        return 0
        
    for img_name in os.listdir(src_folder):
        if count + existing >= max_images:
            break
            
        img_path = os.path.join(src_folder, img_name)
        try:
            with Image.open(img_path) as img:
                img = img.convert('RGB')
                img.load()
                img = img.resize((224, 224))
                save_path = os.path.join(dst_folder, f"{existing + count}.jpg")
                img.save(save_path, 'JPEG', quality=90)
                count += 1
        except:
            pass
    
    return count

total_images = 0

print("\n📁 Processing Dataset 1...")
data1_path = 'data/dataset1/Mushrooms'
if os.path.exists(data1_path):
    for class_name in os.listdir(data1_path):
        class_path = os.path.join(data1_path, class_name)
        if os.path.isdir(class_path):
            count = clean_and_copy(class_path, class_name, max_images=1000)
            total_images += count
            print(f"   {class_name}: {count} images")

print("\n📁 Processing Dataset 2...")
for root, dirs, files_list in os.walk('data/dataset2'):
    imgs = [f for f in files_list if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    if len(imgs) > 20:
        folder_name = os.path.basename(root)
        if 'edible' in folder_name.lower():
            class_name = 'Edible_Fungi'
        elif 'poison' in folder_name.lower():
            class_name = 'Poisonous_Fungi'
        else:
            continue
        
        count = clean_and_copy(root, class_name, max_images=1500)
        if count > 0:
            total_images += count
            print(f"   {class_name}: {count} images")

print("\n" + "=" * 60)
print("DATASET SUMMARY")
print("=" * 60)

class_names = sorted(os.listdir(COMBINED_DIR))
for class_name in class_names:
    class_path = os.path.join(COMBINED_DIR, class_name)
    count = len(os.listdir(class_path))
    print(f"   {class_name}: {count} images")

print(f"\n🍄 TOTAL IMAGES: {total_images}")
print(f"📁 TOTAL CLASSES: {len(class_names)}")

if total_images >= 8000:
    print("✅ 8000+ images requirement MET!")

gc.collect()

# ============================================================
print("\nSTEP 3: SETUP TENSORFLOW")
print("=" * 60)

import tensorflow as tf
print(f"TensorFlow version: {tf.__version__}")

gpus = tf.config.list_physical_devices('GPU')
if gpus:
    print(f"✅ GPU detected: {gpus}")
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)
else:
    print("⚠️ No GPU detected, using CPU (slower but works)")

# ============================================================
print("\nSTEP 4: CREATE DATA GENERATORS")
print("=" * 60)

from tensorflow.keras.preprocessing.image import ImageDataGenerator

num_classes = len(class_names)

train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=30,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    brightness_range=[0.8, 1.2],
    fill_mode='nearest',
    validation_split=0.2
)

val_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

train_gen = train_datagen.flow_from_directory(
    COMBINED_DIR,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

val_gen = val_datagen.flow_from_directory(
    COMBINED_DIR,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

print(f"\n📊 Training rows: {train_gen.samples}")
print(f"📊 Validation rows: {val_gen.samples}")
print(f"📊 Total rows: {train_gen.samples + val_gen.samples}")

# ============================================================
print("\nSTEP 5: BUILD MODEL")
print("=" * 60)

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet',
    pooling='avg'
)
base_model.trainable = False

inputs = tf.keras.Input(shape=(224, 224, 3))
x = base_model(inputs, training=False)
x = tf.keras.layers.Dense(256, activation='relu')(x)
x = tf.keras.layers.Dropout(0.5)(x)
x = tf.keras.layers.Dense(128, activation='relu')(x)
x = tf.keras.layers.Dropout(0.3)(x)
outputs = tf.keras.layers.Dense(num_classes, activation='softmax')(x)

model = tf.keras.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print(f"✅ Model built! Parameters: {model.count_params():,}")

# ============================================================
print("\nSTEP 6: PHASE 1 - TRAIN TOP LAYERS (10 epochs)")
print("=" * 60)

history1 = model.fit(
    train_gen,
    epochs=10,
    validation_data=val_gen,
    verbose=1
)

phase1_acc = history1.history['val_accuracy'][-1]
print(f"\n✅ Phase 1 Complete! Accuracy: {phase1_acc*100:.2f}%")

# ============================================================
print("\nSTEP 7: PHASE 2 - FINE-TUNE (10 epochs)")
print("=" * 60)

base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

history2 = model.fit(
    train_gen,
    epochs=10,
    validation_data=val_gen,
    verbose=1
)

final_train_acc = history2.history['accuracy'][-1]
final_val_acc = history2.history['val_accuracy'][-1]

print("\n" + "=" * 60)
print("🎯 FINAL RESULTS")
print("=" * 60)
print(f"Training Accuracy:   {final_train_acc*100:.2f}%")
print(f"Validation Accuracy: {final_val_acc*100:.2f}%")

# ============================================================
print("\nSTEP 8: SAVE MODEL")
print("=" * 60)

model_dir = '../backend/app/ml/models'
os.makedirs(model_dir, exist_ok=True)

model.save(f'{model_dir}/mushroom_model.h5')
print(f"✅ Saved: {model_dir}/mushroom_model.h5")

final_class_names = list(train_gen.class_indices.keys())

with open(f'{model_dir}/class_names.json', 'w') as f:
    json.dump({
        'class_names': final_class_names,
        'num_classes': len(final_class_names),
        'total_images': total_images,
        'training_rows': train_gen.samples,
        'validation_rows': val_gen.samples,
        'training_accuracy': float(final_train_acc),
        'validation_accuracy': float(final_val_acc)
    }, f, indent=2)
print(f"✅ Saved: {model_dir}/class_names.json")

# ============================================================
print("\nSTEP 9: TEST MODEL")
print("=" * 60)

test_model = tf.keras.models.load_model(f'{model_dir}/mushroom_model.h5')
test_pred = test_model.predict(np.random.rand(1, 224, 224, 3), verbose=0)
print(f"✅ Model loads successfully!")

# ============================================================
print("\n" + "=" * 60)
print("🎉 TRAINING COMPLETE!")
print("=" * 60)
print(f"📊 Total Images: {total_images}")
print(f"📊 Classes: {len(final_class_names)}")
print(f"📊 Training Rows: {train_gen.samples}")
print(f"📊 Validation Rows: {val_gen.samples}")
print(f"🎯 Training Accuracy: {final_train_acc*100:.2f}%")
print(f"🎯 Validation Accuracy: {final_val_acc*100:.2f}%")
print("=" * 60)
print("\n✅ Model saved to: backend/app/ml/models/")
print("✅ Now run the AI service to test!")