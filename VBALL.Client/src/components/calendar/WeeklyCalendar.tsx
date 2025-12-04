import { Calendar, dateFnsLocalizer, View, EventPropGetter } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { MatchSummary } from '../../types/match';
import styles from './WeeklyCalendar.module.css';

const locales = {};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const STATUS_COLORS: Record<string, string> = {
  Scheduled: '#2563eb',
  InProgress: '#059669',
  Finished: '#6b7280',
};

interface CalendarEvent extends MatchSummary {
  start: Date;
  end: Date;
}

interface Props {
  matches: MatchSummary[];
  onSelectMatch?: (matchId: number) => void;
  defaultView?: View;
}

export const WeeklyCalendar: React.FC<Props> = ({ matches, onSelectMatch, defaultView = 'week' }) => {
  const events: CalendarEvent[] = matches.map((match) => ({
    ...match,
    start: new Date(match.startTime),
    end: new Date(match.endTime),
  }));

  const eventPropGetter: EventPropGetter<CalendarEvent> = (event: CalendarEvent) => {
    const backgroundColor = STATUS_COLORS[event.status] ?? '#0f172a';
    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        border: 'none',
      },
    };
  };

  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.legend}>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: color }} />
            {status}
          </div>
        ))}
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        views={['week']}
        defaultView={defaultView}
        onSelectEvent={(event: CalendarEvent) => onSelectMatch?.(event.id)}
        style={{ height: 520 }}
        eventPropGetter={eventPropGetter}
      />
    </div>
  );
};
