"use client";
import Link from "next/link";
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

interface TransactionType{
  tag: string;
  description: string;
  amount: number;
  date: string;
}

export default function Home() {
  const [amount, setAmount] = useState<string>(""); // Initialize as an empty string
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [showAddTagModal, setShowAddTagModal] = useState(false);

  useEffect(() => {
    const updateStateFromLocalStorage = () => {
      const storedTotal = retrieveFromLocalStorage<number>("total");
      if (storedTotal) {
        setTotal(storedTotal);
      }
      const storedTags = retrieveFromLocalStorage<string[]>("tags");
      if (storedTags) {
        setTags(storedTags);
      }
    };

    updateStateFromLocalStorage();

    window.addEventListener("storage", updateStateFromLocalStorage);
    return () => {
      window.removeEventListener("storage", updateStateFromLocalStorage);
    };
  }, []);

  function AddTagModal() {
    const [tagName, setTagName] = useState("");
    const handleAddTag = () => {
      if (tagName.trim() !== "") {
        if (tags.includes(tagName.toUpperCase())) {
          alert("Tag already exists!");
          return;
        }
        storeToLocalStorage("tags", [...tags, tagName.toUpperCase()]);
        setTags((prevTags) => [...prevTags, tagName.toUpperCase()]);
        setTagName("");
        setShowAddTagModal(false);
      }
    };
    return (
      <div className="absolute h-full w-full bg-gray-800/90 flex justify-center items-center">
        <div className="w-5/6 flex justify-center items-center flex-col text-[#41644A] bg-[#ADA991] p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-center w-full mb-4 px-2">
            <h2 className="text-xl font-bold">Add a new tag</h2>
            <button
              className="bg-[#41644A] text-white py-1.5 text-xl px-3 rounded-xl font-light tracking-wider"
              onClick={() => setShowAddTagModal(false)}
            >
              X
            </button>
          </div>
          <input
            autoFocus
            type="text"
            value={tagName.toUpperCase()}
            onChange={(e) => setTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTag();
            }}
            placeholder="Tag name"
            className="bg-white outline-[#41644A] border border-gray-300 rounded-lg px-4 py-2 mb-4 w-full"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={handleAddTag}
          >
            Add Tag
          </button>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    if (!selectedTag) {
      alert("Please select a tag");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount) && selectedTag) {
      const newTotal = total + parsedAmount;
      setTotal(newTotal);
      storeToLocalStorage("total", newTotal);

      const transaction: TransactionType = {
        tag: selectedTag,
        description: '',
        amount: parsedAmount,
        date: new Date().toISOString(),
      };

      const storedTransactions =
        retrieveFromLocalStorage<TransactionType[]>('transactions') || [];
      const updatedTransactions = [...storedTransactions, transaction];
      storeToLocalStorage("transactions", updatedTransactions);
    }
    setAmount("");
    setSelectedTag(null);
  };

  return (
    <div>
      {showAddTagModal && <AddTagModal />}
      <div className="p-4 space-y-4">
        {/* TOTAL */}
        <div className="h-40 bg-[#FFA725] rounded-4xl m-4 text-black font-semibold flex justify-center items-center text-5xl font-serif">
          <span>Total: {total ? total : "N.A."}</span>
        </div>

        {/* ADD TAG */}
        <div className="pt-10 px-4">
          <div className="text-lg font-medium">Select a tag:</div>
          <div className="flex flex-wrap space-y-2 space-x-2 mt-2">
            {tags.map((tag) => (
              <button
                key={tag}
                className={`bg-[#FFA725] py-2 px-4 rounded-xl font-semibold tracking-wider border-4 ${selectedTag === tag ? "border-blue-600" : "border-[#FFA725]"}`}
                onClick={() => {
                  setSelectedTag(tag);
                }}
              >
                {tag}
              </button>
            ))}
            <button
              className="bg-[#FFA725] py- px-4 rounded-xl font-semibold border-4 boreder-[#FFA725] tracking-wider"
              onClick={() => setShowAddTagModal(true)}
            >
              +
            </button>
          </div>
        </div>

        {/* ADD AMOUNT */}
        <div className="pt-4 text-xl px-4 space-y-2">
          <div>Enter amount to add:</div>
          <div className="flex space-x-2">
            <input
              autoFocus
              type="number"
              inputMode="numeric"
              value={amount}
              min={0}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
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

        {/* TRANSACTIONS HISTORY*/}
          <Link
            href="/transactions"
            className="flex items-center justify-center mx-4 mt-10 bg-[#41644A] py-3.5 px-4 text-xl rounded-xl font-semibold tracking-wider"
            >
            <div>OPEN DETAILED VIEW</div>
          </Link>
      </div>
    </div>
  );
}
