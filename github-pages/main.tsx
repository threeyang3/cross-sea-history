import { createRoot } from 'react-dom/client';
import '../app/globals.css';
import '../app/timeline.css';
import '../app/article-reader.css';
import '../app/home-hub.css';
import '../app/poetry/poetry.css';
import HistorySite from '../app/page';

const root=document.getElementById('root');
if(!root)throw new Error('Missing static site root');
createRoot(root).render(<HistorySite/>);
