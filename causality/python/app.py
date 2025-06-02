from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/submit_description', methods=['POST'])
def submit_data():
    data = request.get_json()
    description = data.get('description', 'N/A')
    print(f"Received description: {description}")

    return jsonify(data), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='localhost')