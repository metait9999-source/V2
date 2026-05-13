import { useEffect, useState } from "react";
import { useSocketContext } from "../../../context/SocketContext";
import { PiHandWithdrawFill } from "react-icons/pi";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import notificationSound from "../../../Assets/sound/notification.mp3";

const WithdrawToast = () => {
  const { socket } = useSocketContext();
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (withdraw) => {
      const sound = new Audio(notificationSound);
      sound.play().catch((err) => {
        console.warn("Withdraw notification sound could not be played:", err);
      });

      const id = Date.now();
      setToasts((prev) => [...prev, { id, withdraw }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    socket?.on("newWithdraw", handler);
    return () => socket?.off("newWithdraw", handler);
  }, [socket]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
      {toasts.map(({ id, withdraw }) => (
        <div
          key={id}
          onClick={() => navigate("/panel/withdraws")}
          className="flex items-center gap-4 bg-white border border-violet-100 shadow-xl rounded-2xl px-5 py-4 min-w-[340px] max-w-[400px] cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
            <PiHandWithdrawFill size={24} className="text-violet-600" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-gray-800 mb-0.5">
              New withdrawal request
            </p>
            <p className="text-[12px] text-gray-400 truncate">
              Amount: {withdraw?.amount ?? "—"}
            </p>
            <p className="text-[11px] text-violet-400 font-medium mt-0.5">
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

export default WithdrawToast;
