interface OneTimeExtraItem {
  yearMonth: string;
  amount: string;
}

interface OneTimeExtrasListProps {
  items: OneTimeExtraItem[];
  errors: Record<string, string>;
  onAdd: () => void;
  onUpdate: (index: number, field: 'yearMonth' | 'amount', value: string) => void;
  onRemove: (index: number) => void;
  inputClass: string;
  labelClass: string;
  errorClass: string;
}

export function OneTimeExtrasList({
  items,
  errors,
  onAdd,
  onUpdate,
  onRemove,
  inputClass,
  labelClass,
  errorClass,
}: OneTimeExtrasListProps) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className={labelClass}>特定月の臨時返済</span>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + 追加
        </button>
      </div>

      {items.map((item, index) => {
        const ymErrorKey = `oneTimeExtras.${index}.yearMonth`;
        const amtErrorKey = `oneTimeExtras.${index}.amount`;
        return (
          <div key={index} className="flex gap-2 mb-2 items-start">
            <div className="flex-1">
              <input
                type="month"
                value={item.yearMonth}
                onChange={(e) => onUpdate(index, 'yearMonth', e.target.value)}
                className={inputClass}
                placeholder="YYYY-MM"
                aria-label={`臨時返済${index + 1}の年月`}
                aria-invalid={!!errors[ymErrorKey]}
                aria-describedby={errors[ymErrorKey] ? `ote-ym-error-${index}` : undefined}
              />
              {errors[ymErrorKey] && (
                <p id={`ote-ym-error-${index}`} className={errorClass} role="alert">
                  {errors[ymErrorKey]}
                </p>
              )}
            </div>
            <div className="flex-1">
              <input
                type="number"
                value={item.amount}
                onChange={(e) => onUpdate(index, 'amount', e.target.value)}
                className={inputClass}
                placeholder="金額"
                aria-label={`臨時返済${index + 1}の金額`}
                aria-invalid={!!errors[amtErrorKey]}
                aria-describedby={errors[amtErrorKey] ? `ote-amt-error-${index}` : undefined}
              />
              {errors[amtErrorKey] && (
                <p id={`ote-amt-error-${index}`} className={errorClass} role="alert">
                  {errors[amtErrorKey]}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-3 py-2 text-red-600 hover:text-red-800"
              aria-label={`臨時返済${index + 1}を削除`}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
