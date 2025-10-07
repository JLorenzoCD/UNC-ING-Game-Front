import { RiAlertLine } from "@remixicon/react";

interface AlertErrorListProps {
  title: string;
  errorList: Array<{
    key: string | number;
    error: string;
  }>;
}

export default function AlertErrorList({
  title,
  errorList,
}: AlertErrorListProps) {
  if (
    !title ||
    !errorList.length ||
    !errorList.map(({ error }) => error).join("")
  )
    return null;

  return (
    <div
      role="alert"
      className="flex p-4 mb-4 text-red-800 rounded-lg bg-red-50"
    >
      <RiAlertLine
        className="shrink-0 inline w-5 h-5 me-3 mt-[2px]"
        aria-hidden="true"
      />

      <span className="sr-only">Danger</span>

      <div>
        <span className="font-medium">{title}</span>
        <ul className="mt-1.5 list-disc list-inside">
          {errorList.length &&
            errorList.map(
              ({ key, error }) =>
                error && (
                  <li key={key} data-testid="error-item">
                    {error}
                  </li>
                ),
            )}
        </ul>
      </div>
    </div>
  );
}
