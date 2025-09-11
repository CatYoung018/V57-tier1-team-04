import { Octokit } from 'octokit'
import { useState } from 'react'
import '../App.css'
import mockData from './data/mock_data.json';

const TeamInfo = () => {
  const [branches, setBranches] = useState('')
  const [prs, setPRs] = useState('')
  const [repo, setRepo] = useState('')
  const [team, setTeam] = useState('')
  const [useMockData, setUseMockData] = useState(false);

  const syntaxHighlight =(json) => {
    json = JSON.stringify(json, undefined, 4)
    json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)|(\b(true|false|null)\b)|(\b-?\d+(\.\d*)?([eE][+-]?\d+)?\b)/g, function (match) {
        var cls = 'number'
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string'
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean'
        } else if (/null/.test(match)) {
            cls = 'null'
        }
        return '<span class="' + cls + '">' + match + '</span>'
    })
  }

  // New mock data functions
  const getMockTeam = () => {
    return mockData.team;
  };

  const getMockTeamRepo = () => {
    return mockData.repos;
  };

  const getMockRepoBranches = () => {
    return mockData.branches;
  };

  const getMockPullRequests = () => {
    return mockData.pullRequests;
  };


  const handleClick = async (e) => {
    // Prevent the browser from reloading the page
    e.preventDefault()

    let teamData;
    let repoData;
    let branchData;
    let prData;

    if (useMockData) {
      teamData = getMockTeam();
      repoData = getMockTeamRepo();
      branchData = getMockRepoBranches();
      prData = getMockPullRequests();
    } else {
      teamData = await getTeam()
      repoData = await getTeamRepo()
      branchData = await getRepoBranches()
      prData = await getPullRequests()
    }

    const teamInfo = (
        <div className="border">
          <p className="code-text justify-left">{syntaxHighlight(teamData)}</p>
        </div>
    )
    setTeam(teamInfo)

    const repoInfo = (
        <div className="border">
          <p className="code-text justify-left">{syntaxHighlight(repoData)}</p>
        </div>
    )
    setRepo(repoInfo)

    const branchItems = branchData.data.map((entry, index) => {
      return (
        <div className="border" key={index}>
          <p className="code-text justify-left">{syntaxHighlight(entry)}</p>
        </div>
      )
    })
    setBranches(branchItems)

    const prItems = prData.data.map((entry, index) => {
      return (
        <div className="border" key={index}>
          <p className="code-text justify-left">{syntaxHighlight(entry)}</p>
        </div>
      )
    })
    setPRs(prItems)
  }

  const handleUpdateMockData = async () => {
    console.log ('Fetching live data to update mock data...')
    try {
      const teamData = await getTeam()
      const repoData = await getTeamRepo()
      const branchData = await getRepoBranches()
      const prData = await getPullRequests()
      
      const allData = {
        team: teamData,
        repos: repoData,
        branches: branchData,
        pullRequests: prData
      }

      console.log('Fetched data:', allData)
      console.log ('Copy the following JSON and paste it into mock_data.json file:');
      console.log (JSON.stringify(allData, null, 2));
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  }
    
  const getRepoBranches = async () => {
    const octokit = new Octokit({
      auth: import.meta.env.VITE_GITHUB_TOKEN,
    })
    
    const repoBranches = await octokit.request('GET /repos/{owner}/{repo}/branches', {
      owner: import.meta.env.VITE_GITHUB_ORG,
      repo: import.meta.env.VITE_GITHUB_REPO_NAME,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return repoBranches
  }

  const getPullRequests = async () => {
    const octokit = new Octokit({
      auth: import.meta.env.VITE_GITHUB_TOKEN
    })
    
    const pullRequests = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
      owner: import.meta.env.VITE_GITHUB_ORG,
      repo: import.meta.env.VITE_GITHUB_REPO_NAME,
      state: 'all',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return pullRequests
  }

  const getTeam = async () => {
    const octokit = new Octokit({
      auth: import.meta.env.VITE_GITHUB_TOKEN
    })

    const teamInfo = await octokit.request('GET /orgs/{org}/teams/{team_slug}', {
      org: import.meta.env.VITE_GITHUB_ORG,
      team_slug: import.meta.env.VITE_GITHUB_REPO_NAME,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return teamInfo
  }

  const getTeamRepo = async () => {
    const octokit = new Octokit({
      auth: import.meta.env.VITE_GITHUB_TOKEN
    })
    
    const teamRepos = await octokit.request('GET /orgs/{org}/teams/{team_slug}/repos', {
      org: import.meta.env.VITE_GITHUB_ORG,
      team_slug: import.meta.env.VITE_GITHUB_REPO_NAME,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    return teamRepos
  }

  return (
    <div>
      <button className="button" onClick={handleClick}>Click to get PR information</button>
      <button className="button" onClick={handleUpdateMockData}>Update Mock Data from Live</button>
      <div>
        <input
          type="checkbox"
          id="mockDataCheckbox"
          checked={useMockData}
          onChange={() => setUseMockData(!useMockData)}
        />
        <label htmlFor="mockDataCheckbox">Use Mock PR Data</label>
      </div>
      <h2>Team Info</h2>
      {team}
      <h2>Repo Info</h2>
      {repo}
      <h2>Repo Branches</h2>
      {branches}
      <h2>Pull Requests</h2>
      {prs}
    </div>
  )
}

export default TeamInfo;