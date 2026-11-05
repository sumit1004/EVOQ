import { Link } from 'react-router-dom';
import '../styles/notfound.css';

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="not-found-link">
        Back to Home
      </Link>
    </div>
  );
}

