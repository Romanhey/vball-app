import { format } from 'date-fns';
import type { MatchSummary } from '../../types/match';
import styles from './MatchTable.module.css';

interface Props {
  matches: MatchSummary[];
  onSelectMatch?: (matchId: number) => void;
}

export const MatchTable: React.FC<Props> = ({ matches, onSelectMatch }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Команды</th>
            <th>Статус</th>
            <th>Зал</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.id} onClick={() => onSelectMatch?.(match.id)}>
              <td>{format(new Date(match.startTime), 'dd MMM, HH:mm')}</td>
              <td>
                {match.teamA?.name ?? 'TBD'} vs {match.teamB?.name ?? 'TBD'}
              </td>
              <td>
                <span className={styles.status}>{match.status}</span>
              </td>
              <td>{match.court ?? 'Главный зал'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
