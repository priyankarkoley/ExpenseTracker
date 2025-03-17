"use client";
import { useEffect, useState } from "react";

function storeToLocalStorage(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error storing to localStorage", error);
  }
}

function retrieveFromLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error("Error retrieving from localStorage", error);
    return null;
  }
}

export default function Home() {
  const [amount, setAmount] = useState<string>(""); // Initialize as an empty string
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const storedTotal = retrieveFromLocalStorage<number>("total");
    if (storedTotal) {
      setTotal(storedTotal);
    }
  }, []);

  const handleAdd = () => {
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount)) {
      const newTotal = total + parsedAmount;
      setTotal(newTotal);
      storeToLocalStorage("total", newTotal);
    }
    setAmount("");
  };

  return (
    <div className="p-4">
      <div className="h-40 bg-[#FFA725] rounded-4xl m-4 text-black font-semibold flex justify-center items-center text-5xl font-serif">
        <span>Total: {total ? total : "N.A."}</span>
      </div>
      <div className="pt-10 text-xl px-4 space-y-2">
        <div>Enter amount to add:</div>
        <div className="flex space-x-2">
          <input
            autoFocus
            type="number"
            inputMode="numeric"
            value={amount}
            min={0}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {if (e.key === "Enter")handleAdd()}}
            className="w-full px-4 text-2xl outline-none rounded-xl bg-white text-[#0D4715] p-2"
          />
          <button
            onClick={handleAdd}
            className="bg-[#41644A] py-3.5 px-4 rounded-xl font-semibold tracking-wider"
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}
