import { useState, useEffect } from "react";

function Contributors() {
    const [contributors, setContributors] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
      fetch('http://localhost:5001/api/contributors', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => setContributors(data))
        .catch(err => {
          setError("Failed to fetch contributors");
          console.error(err);
        });
    }, []);

  return (
    <section>
      <div className="main-content">
        <h2 className="main-h2">Contributors</h2>
        <p>
Developers who have worked on this project:
        </p>

          {error && <p className="text-red-600">{error}</p>}

        <ul className="flex gap-6 flex-wrap mt-8 justify-start">
          {contributors.map((contributor) => (
            <li key={contributor.id}>
              <a
              href={contributor.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center hover:opacity-80 transition-opacity text-wrap min-w-0"
              aria-label={`View ${contributor.login}'s GitHub profile`}
              >
              <img
                src={contributor.avatar_url}
                alt={`${contributor.login}'s avatar`}
                className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-[#60B8DE] mb-2"
              />
            
                <span
                className="text-sm text-center text-gray-700 font-medium"
                >
                  {contributor.login}
                </span>
              
              </a>
          </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Contributors;
