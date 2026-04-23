import { useEffect, useState } from "react";
import api from "../../api/axios";

const TimeSlotScheduler = ({ serviceId, selectedDate, onClose, editData }) => {
  //   const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);

  const formatTime = (timeRange) => {
    const [start, end] = timeRange.split("-");

    const format = (time) => {
      let [hour, minute] = time.split(":");
      hour = parseInt(hour);
      const ampm = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minute} ${ampm}`;
    };

    return `${format(start)} - ${format(end)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // 🔒 Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  // 📡 Fetch slots
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      try {
        // 🔥 IF EDIT MODE → USE EXISTING DATA
        if (editData) {
          const defaultSlots = [
            "09:00-10:00",
            "12:00-13:00",
            "15:00-16:00",
            "17:00-18:00",
          ];

          const mapped = defaultSlots.map((time) => {
            const existing = editData.slots.find((s) => s.time === time);

            return {
              time,
              capacity: existing?.capacity || 0,
              isSelected: !!existing,
            };
          });

          setSlots(mapped);
          setIsBlocked(editData.isBlocked || false);
          return;
        }

        // 🔥 NORMAL FLOW
        const res = await api.get(
          `/timeslots/get-timeslots?serviceId=${serviceId}&date=${selectedDate}`,
        );

        setIsBlocked(res.data.isBlocked || false);

        const updated = res.data.slots.map((slot) => ({
          ...slot,
          isSelected: true,
        }));

        setSlots(updated);
      } catch (err) {
        console.log(err);
      }
    };

    fetchSlots();
  }, [selectedDate, serviceId, editData]);

  // 🔘 Toggle slot selection
  const toggleSlot = (index) => {
    const updated = [...slots];
    updated[index].isSelected = !updated[index].isSelected;
    setSlots(updated);
  };

  // 🔘 Select all
  const selectAll = () => {
    setSlots(slots.map((s) => ({ ...s, isSelected: true })));
  };

  // 🔘 Clear all
  const clearAll = () => {
    setSlots(slots.map((s) => ({ ...s, isSelected: false })));
  };

  // 💾 Save
  const handleSave = async () => {
    if (!selectedDate) {
      alert("Select date first");
      return;
    }

    try {
      await api.post("/timeslots/create-update-timeslots", {
        serviceId,
        date: selectedDate,
        isBlocked,
        slots: isBlocked
          ? []
          : slots
              .filter((s) => s.isSelected)
              .map((s) => ({
                time: s.time,
                capacity: s.capacity,
              })),
      });

      alert("Saved successfully");
      onClose();
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-6 border-b">
          <div>
            <h2 className="text-xl font-bold">Configure Time Slots</h2>
            <p className="text-sm text-gray-500">Select slots & set capacity</p>
          </div>

          <button onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* DATE */}
          <p className="text-sm text-gray-500">
            Selected Date: <b>{formatDate(selectedDate)}</b>
          </p>

          {/* BLOCK DAY */}
          <div className="flex items-center justify-between bg-red-50 p-4 rounded-xl border border-red-200">
            <span className="font-medium text-red-600">Block Entire Day</span>

            <input
              type="checkbox"
              checked={isBlocked}
              onChange={() => setIsBlocked(!isBlocked)}
              className="w-5 h-5 accent-red-500"
            />
          </div>

          {/* ACTION BUTTONS */}
          {!isBlocked && (
            <div className="flex gap-3">
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg"
              >
                Select All
              </button>

              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg"
              >
                Clear All
              </button>
            </div>
          )}

          {/* SLOTS */}
          {!isBlocked && (
            <div className="grid gap-4">
              {slots.map((slot, index) => (
                <div
                  key={index}
                  onClick={() => toggleSlot(index)}
                  className={`cursor-pointer p-4 rounded-xl border transition ${
                    slot.isSelected
                      ? "bg-indigo-50 border-indigo-400"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      {formatTime(slot.time)}
                    </span>

                    {slot.isSelected && (
                      <input
                        type="number"
                        min="0"
                        value={slot.capacity}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const updated = [...slots];
                          updated[index].capacity = e.target.value;
                          setSlots(updated);
                        }}
                        className="w-20 text-center border rounded"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-8 py-4 border-t">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotScheduler;
