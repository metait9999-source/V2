import { useEffect, useState } from "react";
import { useSocketContext } from "../../../context/SocketContext";
import { PiHandDepositFill } from "react-icons/pi";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import notificationSound from "../../../Assets/sound/notification.mp3";

const DepositToast = () => {
  const { socket } = useSocketContext();
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (deposit) => {
      // ── Play sound ──
      const sound = new Audio(notificationSound);
      sound.play().catch((err) => {
        console.warn("Deposit notification sound could not be played:", err);
      });

      const id = Date.now();
      setToasts((prev) => [...prev, { id, deposit }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    socket?.on("newDeposit", handler);
    return () => socket?.off("newDeposit", handler);
  }, [socket]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
      {toasts.map(({ id, deposit }) => (
        <div
          key={id}
          onClick={() => navigate("/panel/deposits")}
          className="flex items-center gap-4 bg-white border border-indigo-100 shadow-xl rounded-2xl px-5 py-4 min-w-[340px] max-w-[400px] cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <PiHandDepositFill size={24} className="text-indigo-600" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-gray-800 mb-0.5">
              New deposit received
            </p>
            <p className="text-[12px] text-gray-400 truncate">
              Amount: {deposit?.amount ?? "—"}
            </p>
            <p className="text-[11px] text-indigo-400 font-medium mt-0.5">
              Click to review →
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setToasts((prev) => prev.filter((t) => t.id !== id));
            }}
            className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 self-start"
          >
            <IoClose size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default DepositToast;
