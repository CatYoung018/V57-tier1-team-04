from flask import Flask, jsonify
from flask_cors import CORS 
from dotenv import load_dotenv
import os
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/health')
def health_check():
    return {'status': 'Flask is running!'}

@app.route('/api/pulls')
def get_pulls():
    token = os.getenv('GITHUB_TOKEN')
    org = os.getenv('GITHUB_ORG')
    repo = os.getenv('GITHUB_REPO_NAME')

    headers = {
        'Authorization': f'token {token}',
        'X-GitHub-Api-Version': '2022-11-28'
    }

    url = f'https://api.github.com/repos/{org}/{repo}/pulls?state=all&per_page=100'
    response = requests.get(url, headers=headers)

    return jsonify(response.json())

if __name__ == '__main__':
    app.run(debug=True)