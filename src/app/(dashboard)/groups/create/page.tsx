"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Users } from "lucide-react";
import axios from "axios";

export default function CreateGroupPage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* ------------------ TEMPORARILY DISABLED: Add Members ------------------
  const [memberEmail, setMemberEmail] = useState("");
  const [members, setMembers] = useState<string[]>([]);

  const addMember = async () => {
    if (!memberEmail || members.includes(memberEmail)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/check`, {
        params: { email: memberEmail },
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers([...members, memberEmail]);
      setMemberEmail("");
      toast.success(`${memberEmail} added`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "User with this email not found.");
    }
  };

  const removeMember = (email: string) => {
    setMembers(members.filter((m) => m !== email));
  };
  ------------------------------------------------------------------------ */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/create`,
        {
          name: groupName,
          description,
          // members: [], // intentionally omitted while add-member is disabled
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Group created!");
      router.push("/groups");
    } catch (error: any) {
      if (error?.response?.status === 400) {
        toast.error(error?.response?.data?.message || "Invalid member emails.");
      } else {
        toast.error("Failed to create group.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Group</h1>
          <p className="text-muted-foreground">
            Set up a new group to track shared expenses
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Details
          </CardTitle>
          <CardDescription>
            Enter the basic information for your new expense group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name *</Label>
              <Input
                id="groupName"
                placeholder="e.g., Weekend Trip, Roommates, Office Lunch"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of what this group is for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* ------------------ TEMPORARILY DISABLED: Add Members UI ------------------
            <div className="space-y-4">
              <Label>Add Members</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMember())}
                />
                <Button type="button" onClick={addMember} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {members.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Members ({members.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {members.map((email) => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-1">
                        {email}
                        <button
                          type="button"
                          onClick={() => removeMember(email)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                You can add more members later. Members will receive an invitation to join the group.
              </p>
            </div>
            ------------------------------------------------------------------------- */}

            <div className="flex gap-4 pt-4">
              <Link href="/dashboard" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1"
                disabled={!groupName || isLoading}
              >
                {isLoading ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
