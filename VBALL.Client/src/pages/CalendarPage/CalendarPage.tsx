import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { WeeklyCalendar } from '../../components/calendar/WeeklyCalendar';
import { MatchTable } from '../../components/matches/MatchTable';
import { ViewToggle } from '../../components/shared/ViewToggle';
import { useScheduleStore } from '../../stores/rootStore';
import styles from './CalendarPage.module.css';

const VIEW_OPTIONS = [
  { label: 'Календарь', value: 'calendar' },
  { label: 'Таблица', value: 'table' },
] as const;

type ViewValue = (typeof VIEW_OPTIONS)[number]['value'];

export const CalendarPage = observer(() => {
  const scheduleStore = useScheduleStore();
  const navigate = useNavigate();

  const handleMatchClick = (matchId: number) => {
    navigate(`/matches/${matchId}`);
  };

  const handleViewChange = (view: ViewValue) => {
    scheduleStore.setView(view === 'calendar' ? 'calendar' : 'table');
  };

  const content =
    scheduleStore.view === 'calendar' ? (
      <WeeklyCalendar matches={scheduleStore.matches} onSelectMatch={handleMatchClick} />
    ) : (
      <MatchTable matches={scheduleStore.matches} onSelectMatch={handleMatchClick} />
    );

  return (
    <section>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Расписание матчей</h1>
        <div className={styles.layoutSwitcher}>
          <span>Вид:</span>
          <ViewToggle<ViewValue> value={scheduleStore.view} options={VIEW_OPTIONS} onChange={handleViewChange} />
        </div>
      </header>
      {content}
    </section>
  );
});
