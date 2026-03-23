from flask import Flask, jsonify, redirect, request, session
from flask_cors import CORS
from flask_session import Session
from dotenv import load_dotenv
import os
import requests

load_dotenv()

app = Flask (__name__)
app.secret_key = os.getenv('SECRET_KEY')
CORS(app, supports_credentials=True, origins=['http://localhost:5173'])

app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')

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

@app.route('/api/auth/login')
def login():
    github_auth_url = f'https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&scope=read:user'
    return redirect(github_auth_url)

@app.route('/api/auth/callback')
def callback():
    code = request.args.get('code')

    token_response = requests.post(
        'https://github.com/login/oauth/access_token',
        json={
            'client_id': GITHUB_CLIENT_ID,
            'client_secret': GITHUB_CLIENT_SECRET,
            'code': code
        },
        headers={'Accept': 'application/json'}
    )

    token_data = token_response.json()
    access_token = token_data.get('access_token')

    if not access_token:
        return redirect('http://localhost:5173?error=auth_failed')

    user_response = requests.get(
        'https://api.github.com/user',
        headers={'Authorization': f'token {access_token}'}
    )

    user_data = user_response.json()

    if 'login' not in user_data:
        return redirect('http://localhost:5173?error=auth_failed')

    session['user'] = user_data
    session['access_token'] = access_token

    return redirect('http://localhost:5173')

@app.route('/api/auth/user')
def get_user():
    user = session.get('user')
    if user:
        return jsonify(user)
    return jsonify(None)

@app.route('/api/auth/logout')
def logout():
    session.clear()
    return jsonify({'status': 'logged out'})

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5001)