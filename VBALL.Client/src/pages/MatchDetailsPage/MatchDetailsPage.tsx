import { observer } from 'mobx-react-lite';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useScheduleStore } from '../../stores/rootStore';
import styles from './MatchDetailsPage.module.css';

export const MatchDetailsPage = observer(() => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const scheduleStore = useScheduleStore();

  const match = scheduleStore.matches.find((item) => item.id === Number(matchId));

  if (!match) {
    return (
      <section className={styles.page}>
        <p>Матч не найден.</p>
        <button type="button" onClick={() => navigate(-1)}>
          Назад
        </button>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{match.title}</h1>
      <p className={styles.meta}>
        {format(new Date(match.startTime), 'dd MMMM yyyy, HH:mm')} · {match.court ?? 'Главный зал'}
      </p>
      <p className={styles.meta}>Статус: {match.status}</p>
      <p>
        {match.teamA?.name ?? 'TBD'} vs {match.teamB?.name ?? 'TBD'}
      </p>
    </section>
  );
});
