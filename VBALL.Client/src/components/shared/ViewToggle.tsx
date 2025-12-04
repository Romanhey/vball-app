import styles from './ViewToggle.module.css';

export interface ViewOption<TValue extends string> {
  label: string;
  value: TValue;
}

interface Props<TValue extends string> {
  value: TValue;
  options: ReadonlyArray<ViewOption<TValue>>;
  onChange: (value: TValue) => void;
}

export function ViewToggle<TValue extends string>({ value, options, onChange }: Props<TValue>) {
  return (
    <div className={styles.wrapper}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={
            option.value === value ? `${styles.button} ${styles.buttonActive}` : styles.button
          }
          onClick={() => onChange(option.value as TValue)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
