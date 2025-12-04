import { Shell } from './components/layout/Shell';
import { AppRouter } from './routes/AppRouter';

export function App() {
  return (
    <Shell>
      <AppRouter />
    </Shell>
  );
}

export default App;
