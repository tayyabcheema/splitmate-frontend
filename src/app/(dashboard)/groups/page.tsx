"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: { user: any }[];
}

export default function GroupListPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroups(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  // Join group by invite
  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter a valid invite code");
      return;
    }

    try {
      setJoining(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/join`,
        { inviteCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(
        `Joined group "${response.data.data.groupName}" successfully!`
      );
      setInviteCode(""); // clear input
      fetchGroups(); // refresh group list
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to join group");
    } finally {
      setJoining(false);
    }
  };

  // Delete group
  const handleDelete = async (groupId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGroups((prev) => prev.filter((g) => g._id !== groupId));
      toast.success("Group deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete group");
    }
  };

  // Edit group modal
  const openEditModal = (group: Group) => {
    setEditingGroup(group);
    setName(group.name);
    setDescription(group.description || "");
  };

  const closeEditModal = () => setEditingGroup(null);

  const handleUpdate = async (groupId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/update/${groupId}`,
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGroups((prev) =>
        prev.map((g) => (g._id === groupId ? response.data.data : g))
      );

      toast.success("Group updated successfully");
      closeEditModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update group");
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <h1 className="text-3xl font-bold">Your Groups</h1>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-40 rounded" />
            <Skeleton className="h-10 w-28 rounded" />
          </div>
        </div>

        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-6 w-2/3 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-4 w-1/3 rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between space-x-4">
        <h1 className="text-3xl font-bold">Your Groups</h1>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Enter invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="h-10 px-3"
          />
          <Button onClick={handleJoinGroup} disabled={joining}>
            {joining ? "Joining..." : "Join"}
          </Button>

          <Link href="/groups/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </Link>
        </div>
      </div>

      {/* Group cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <Card key={group._id} className="relative hover:shadow-md transition">
            <Link href={`/groups/${group._id}`}>
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>
                  {group.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {group.members.length} members
              </CardContent>
            </Link>

            {/* Edit button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-10 text-blue-500 hover:text-blue-700"
              onClick={(e) => {
                e.preventDefault();
                openEditModal(group);
              }}
            >
              ✏️
            </Button>

            {/* Delete button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(group._id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-xl font-bold mb-4">Edit Group</h2>
            <input
              type="text"
              placeholder="Group Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 mb-3 rounded"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 mb-3 rounded"
            />
            <div className="flex justify-end space-x-2">
              <Button onClick={closeEditModal} variant="outline">
                Cancel
              </Button>
              <Button onClick={() => handleUpdate(editingGroup._id)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
