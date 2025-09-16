import { Octokit } from "octokit";
import { useState } from "react";

function OpenPRs() {

  const [prs, setPRs] = useState([]); 
  const [rawPRData, setRawPRData] = useState(null); 

  const downloadPRData = () => {
    if (!rawPRData) {
      alert("No PR data to download! Please fetch PR data first.");
      return;
    }

    const dataString = JSON.stringify(rawPRData, null, 2);
    const blob = new Blob([dataString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `open_prs-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert("Open PR data downloaded successfully!");   
  };

  const handleGetOpenPRs = async (e) => {
    e.preventDefault();

    try {
      const prData = await getPullRequests();
      const openPRs = prData.data.filter(pr => pr.state === "open");
      setRawPRData (openPRs);
      setPRs(openPRs);

    } catch (error) {
      alert("Error getting PR data: " + error.message);
    }
  };

  const getPullRequests = async () => {
    const octokit = new Octokit({
      auth: import.meta.env.VITE_GITHUB_TOKEN,
    });

    const pullRequests = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
      owner: import.meta.env.VITE_GITHUB_ORG,
      repo: import.meta.env.VITE_GITHUB_REPO_NAME,
      state: "open",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    return pullRequests;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const openPRInNewTab = (url) => {
    window.open(url, "_blank");
  };
  return (
  <section>
    <div className="main-content">
      <h2 className="text-2xl font-bold mb-4">Open Pull Requests</h2>
      <p className="text-gray-600 mb-6"> This screen displays a summary of all open PRs on your team repo.</p>
      
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleGetOpenPRs}
          className="px-5 py-2 rounded-md text-white border-none font-medium bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            Get Open PRs
        </button>

        {rawPRData && (
          <button
          onClick={downloadPRData}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
          >
        Save JSON for Testing
        </button>
        )}
      </div>

      {prs.length > 0 ? (
        <div>
          <h3 className="text-xl font-semibold mb-4">Found {prs.length} open PR{prs.length !== 1 ? "s" : ""}</h3>
          {prs.map((pr) => (
            <div
              key={pr.id}
              className="border border-gray-300 p-5 mb-4 rounded-lg bg-gray-50"
              >

                <div className="mb-3">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    #{pr.number}
                    </span>
                    </div>

                    <h4
                      className="text-lg font-medium mb-4 cursor-pointer text-blue-600 underline hover:text-blue-800"
                      onClick={() => openPRInNewTab(pr.html_url)}
                      title="Click to open PR in GitHub"
                      >
                        {pr.title}
                        </h4>

                        <div className="flex items-center mb-4">
                          <img
                          src={pr.user.avatar_url}
                          alt={`${pr.user.login} avatar`}
                          className="w-10 h-10 rounded-full mr-3 border-2 border-gray-300"
                          />
                          <div>
                            <div className="font-semibold text-gray-800">
                              Created by: {pr.user.login}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDate(pr.created_at)}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-4 space-y-1">
                          <div>
                            <strong className="text-gray-700">Last updated:</strong> {formatDate(pr.updated_at)}
                          </div>
                          <div>
                            <strong className="text-gray-700">Status:</strong>
                          <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {pr.state.toUpperCase()}
                          </span>
                          </div>
                        </div>
                      {(pr.assignees?.length > 0 || pr.requested_reviewers?.length > 0) ? (
                  <div className="mt-4">
                    <strong className="block mb-2 text-gray-700">Assigned Reviewers:</strong>
                    <div className="flex flex-wrap gap-2">
                      {pr.assignees?.map((assignee) => (
                        <span
                          key={assignee.id}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-xs font-medium"
                        >
                          {assignee.login}
                        </span>
                      ))}
                      {pr.requested_reviewers?.map((reviewer) => (
                        <span
                          key={reviewer.id}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-medium border border-gray-300"
                        >
                          {reviewer.login} (requested)
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic mt-4">
                    No reviewers assigned yet
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Open PRs Loaded</h3>
            <p>Click "Get Open PRs" above to fetch data from your GitHub repository.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default OpenPRs;