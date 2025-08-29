"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import DhikrCard from "./DhikrCard";
import CreateDhikrModal from "./CreateDhikrModal";
import type { Dhikr, DhikrSession } from "@prisma/client";
import { PlusCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { emptyStates, getTimeBasedGreeting } from "@/lib/messages";

interface DhikrWithSession extends Dhikr {
  sessions: DhikrSession[];
}

export default function DhikrList() {
  const [dhikrs, setDhikrs] = useState<DhikrWithSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDhikr, setEditingDhikr] = useState<Dhikr | null>(null);
  const { user } = useAuth();

  const fetchDhikrs = async () => {
    try {
      const response = await fetch("/api/dhikrs");
      if (!response.ok) throw new Error("Failed to fetch dhikrs");
      const data = await response.json();
      setDhikrs(data);
    } catch (err) {
      setError("Failed to load dhikrs");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDhikrs();
    }
  }, [user]);

  const handleCreate = async (data: { name: string; targetCount: number }) => {
    try {
      const response = await fetch("/api/dhikrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create dhikr");

      await fetchDhikrs(); // Refresh the list
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating dhikr:", err);
      throw err; // Let the modal handle the error
    }
  };

  const handleEdit = (dhikr: Dhikr) => {
    setEditingDhikr(dhikr);
    setIsModalOpen(true);
  };

  const handleUpdate = async (data: { name: string; targetCount: number }) => {
    if (!editingDhikr) return;

    try {
      const response = await fetch(`/api/dhikrs/${editingDhikr.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update dhikr");

      await fetchDhikrs(); // Refresh the list
      setIsModalOpen(false);
      setEditingDhikr(null);
    } catch (err) {
      console.error("Error updating dhikr:", err);
      throw err; // Let the modal handle the error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/dhikrs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete dhikr");

      await fetchDhikrs(); // Refresh the list
    } catch (err) {
      console.error("Error deleting dhikr:", err);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingDhikr(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-4">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-base-content/70 animate-pulse">
          Loading your dhikrs...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg max-w-md mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">Something went wrong</h3>
          <div className="text-xs">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            My Dhikrs
          </h1>
          {user && (
            <p className="text-base-content/70 mt-1">
              {getTimeBasedGreeting(user.name)}
            </p>
          )}
        </div>
        <button
          className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5" />
          Add Dhikr
        </button>
      </div>

      {dhikrs.length === 0 ? (
        <div className="hero bg-base-200 rounded-box">
          <div className="hero-content text-center py-16">
            <div className="max-w-md space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-primary">
                  {emptyStates.noDhikrs.title}
                </h3>
                <p className="text-base-content/70">
                  {emptyStates.noDhikrs.subtitle}
                </p>
                <div className="alert alert-info">
                  <SparklesIcon className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">
                      Start with the classics:
                    </div>
                    <div className="text-sm opacity-70">
                      "SubhanAllah" (33x), "Alhamdulillah" (33x), "Allahu Akbar"
                      (34x)
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setIsModalOpen(true)}
              >
                <PlusCircleIcon className="w-6 h-6" />
                {emptyStates.noDhikrs.cta}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dhikrs.map((dhikr) => (
            <DhikrCard
              key={dhikr.id}
              dhikr={dhikr}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateDhikrModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={editingDhikr ? handleUpdate : handleCreate}
        initialData={editingDhikr || undefined}
        title={editingDhikr ? "Edit Dhikr" : "Create New Dhikr"}
      />
    </div>
  );
}
