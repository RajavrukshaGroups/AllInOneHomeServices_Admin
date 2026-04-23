import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import TimeSlotScheduler from "./timeSlotScheduler";

const TimeSlotCalendar = ({ serviceId, onClose, editData }) => {
  const [selectedDate, setSelectedDate] = useState(editData?.date || null);
  const [openScheduler, setOpenScheduler] = useState(!!editData);
  const handleDateClick = (date) => {
    // const formatted = date.toISOString().split("T")[0];
    const formatted = date.toLocaleDateString("en-CA");
    setSelectedDate(formatted);
    setOpenScheduler(true);
  };

  return (
    <>
      {/* 🔥 CALENDAR MODAL */}
      {!openScheduler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Select Date</h2>
              <button onClick={onClose}>✕</button>
            </div>

            <Calendar
              onClickDay={handleDateClick}
              className="rounded-xl border p-4"
            />
          </div>
        </div>
      )}

      {/* 🔥 OPEN SCHEDULER AFTER DATE */}
      {openScheduler && (
        <TimeSlotScheduler
          serviceId={serviceId}
          selectedDate={selectedDate}
          editData={editData}
          onClose={onClose} // closes everything
        />
      )}
    </>
  );
};

export default TimeSlotCalendar;
