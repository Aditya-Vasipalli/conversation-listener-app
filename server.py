from flask import Flask, request, jsonify
from sklearn.cluster import KMeans
import numpy as np
import os

app = Flask(__name__)

# Allow CORS for local dev
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'POST')
    return response

@app.route('/diarize', methods=['POST'])
def diarize():
    try:
        data = request.get_json(force=True)
        segments = data.get('segments', [])
        if not segments:
            return jsonify({'speakers': []})
    except Exception as e:
        return jsonify({'error': 'Invalid request', 'details': str(e)}), 400
    # If only one segment, just assign Speaker 1
    if len(segments) == 1:
        speakers = ['Speaker 1']
    else:
        # Use length of text as a fake feature for clustering
        features = np.array([[len(s)] for s in segments])
        n_clusters = min(2, len(segments))
        kmeans = KMeans(n_clusters=n_clusters).fit(features)
        speaker_labels = kmeans.labels_
        speakers = [f'Speaker {s+1}' for s in speaker_labels]
    return jsonify({'speakers': speakers})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
