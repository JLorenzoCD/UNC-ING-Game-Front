import { useState } from "react";
import { useBasicGame } from "@/contexts/BasicGameContext";

import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";

import { RiCloseLine } from "@remixicon/react";

import type { MatchLog } from "@/types/log";

export default function Logs() {
  const { logs } = useBasicGame();
  const [isOpen, setIsOpen] = useState(false);

  const sortedLogs = [...logs].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const lastLog = sortedLogs.at(0);

  return (
    <div
      data-testid="logs-container"
      className={twMerge(
        "absolute top-2 right-2 min-w-sm p-2 bg-white rounded",
        !lastLog && "opacity-50 cursor-default",
      )}
    >
      {lastLog ? (
        <button
          type="button"
          className="cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Log log={lastLog} />
        </button>
      ) : (
        <div className="text-gray-600">No logs available yet.</div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            tabIndex={-1}
            className="fixed inset-0 z-10 w-screen h-screen bg-black/50 backdrop-blur-[2px] flex justify-end"
            data-testid="logs-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: "tween", duration: 0.3 }}
              className="bg-white min-w-96 h-full p-4 overflow-y-auto"
            >
              <div className="flex justify-between">
                <h2 className="text-2xl font-bold mb-4">Match Logs</h2>

                <button onClick={() => setIsOpen(false)}>
                  <RiCloseLine />
                </button>
              </div>

              <ul className="flex flex-col gap-y-2">
                {sortedLogs.map((log) => (
                  <li
                    key={log.id}
                    className="p-1 rounded border border-gray-300"
                  >
                    <Log log={log} showDate />
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface LogProps {
  log: MatchLog;
  showDate?: boolean;
}

function Log({ log, showDate = false }: LogProps) {
  const [type, message] = log.message.split(/\[.*?\]/);

  const ocurredAt = formatDistanceToNow(new Date(log.created_at), {
    addSuffix: true,
  });

  return (
    <div
      data-testid="log-item"
      aria-details={type}
      className="w-96 break-words text-start"
    >
      {showDate && (
        <div className="text-xs text-gray-500 mt-1">{ocurredAt}</div>
      )}

      <p className="w-fit break-words">{message}</p>
    </div>
  );
}
