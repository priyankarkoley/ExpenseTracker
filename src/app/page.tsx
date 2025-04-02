"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { retrieveFromLocalStorage, storeToLocalStorage } from "@/utils/localStorage";
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
		<div className="flex h-[calc(88vh)] flex-col justify-between px-7 pt-8 pb-4">
			{showAddTagModal && <AddTagModal />}
      <div className="space-y-4">
        {/* TOTAL */}
        <div className="m-4 flex h-40 items-center justify-center rounded-4xl bg-[#FFA725] font-serif text-5xl font-semibold text-black">
          <span className="pt-4 pr-2 text-lg">Total:</span> ₹{total ? total : 'N.A.'}
        </div>
        {/* ADD TAG */}
        <div className="px-4 pt-10">
          <div className="text-lg font-medium">Select a tag:</div>
          <div className="mt-2 flex flex-wrap space-y-2 space-x-2">
            {tags.map(tag => (
              <button
                key={tag}
                className={`rounded-xl border-4 bg-[#FFA725] px-4 py-2 font-semibold tracking-wider ${
                  selectedTag === tag ? 'border-blue-600' : 'border-[#FFA725]'
                }`}
                onClick={() => {
                  setSelectedTag(tag);
                }}
              >
                {tag}
              </button>
            ))}
            <button
              className="py- boreder-[#FFA725] rounded-xl border-4 bg-[#FFA725] px-4 font-semibold tracking-wider"
              onClick={() => setShowAddTagModal(true)}
            >
              +
            </button>
          </div>
        </div>
        {/* ADD AMOUNT */}
        <div className="space-y-2 px-4 pt-4 text-xl">
          <div>Enter amount to add:</div>
          <div className="flex space-x-2">
            <input
              autoFocus
              type="number"
              inputMode="numeric"
              value={amount}
              min={0}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAdd();
              }}
              className="w-full rounded-xl bg-white p-2 px-4 text-2xl text-[#0D4715] outline-none"
            />
            <button onClick={handleAdd} className="rounded-xl bg-[#41644A] px-4 py-3.5 font-semibold tracking-wider">
              ADD
            </button>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS HISTORY*/}
			<Link
				href="/transactions"
				className="mt-10 rounded-xl bg-[#41644A] py-3.5 text-center font-semibold tracking-wider"
			>
				OPEN DETAILED VIEW
			</Link>
		</div>
	);
}
