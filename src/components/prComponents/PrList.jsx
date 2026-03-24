import { useState, useEffect, useCallback } from "react";
import PROverviewCard from "./PrCard";

const PrList = ({ state = "open", onDataFetched, search }) => {
  const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);
  const [prs, setPrs] = useState([]);
  const [error, setError] = useState(null);

  const fetchPRs = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch('http://127.0.0.1:5001/api/pulls', {
        credentials: 'include'
      });
      
      const data = await response.json();

      const filteredPRs = data.filter(pr => pr.state === state);

      setPrs(filteredPRs);

      if (onDataFetched) {
        onDataFetched(filteredPRs);
      }
    } catch (err) {
      setError("Failed to fetch pull requests. Please try again later.");
      console.error(err);
    }
  }, [state, onDataFetched]);

  useEffect(() => {
    fetchPRs();
  }, []);

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        Error getting PR data: {error}
      </div>
    );
  }

  const searchTerm = (search || "").toLowerCase();

  const filteredAndSearchedPRs = prs.filter(pr =>
    pr.title.toLowerCase().includes(searchTerm) ||
    pr.user.login.toLowerCase().includes(searchTerm) ||
    (pr.body?.toLowerCase() || "").includes(searchTerm)
  );

  return (
    <div>
      {filteredAndSearchedPRs.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredAndSearchedPRs.map((pr, index) => (
            <PROverviewCard key={pr.id} pr={pr} state={state} defaultOpen={index < 3} />
          ))}
        </div>
      ) : (
        <div className="no-found-box text-center py-8 px-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200 m-4">
          <h3 className="text-lg font-medium mb-2">No {capitalize(state)} PRs Found</h3>
        </div>
      )}
    </div>
  );
};

export default PrList;
