"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function AddExpensePage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [paidBy, setPaidBy] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [splitType, setSplitType] = useState("equal");
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("USD");

  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [loading, setLoading] = useState(false); // Form submission

  // Fetch group members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMembers(res.data.data.members || []);
      } catch (err) {
        console.error("Error fetching group members:", err);
      } finally {
        setMembersLoading(false);
      }
    };

    if (id) fetchMembers();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const finalParticipants =
        participants.length > 0 ? participants : [paidBy];

      const amountPerPerson = amount / finalParticipants.length;

      const splits = finalParticipants.map((userId) => ({
        user: userId,
        amount: amountPerPerson,
      }));

      const payload = {
        amount,
        description,
        category,
        paidBy,
        participants: finalParticipants,
        splitType,
        splits,
        notes,
        currency,
      };

      console.log("Expense added:", payload);
      console.log("Splits:", splits);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${id}/expenses`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      router.push(`/groups/${id}`);
    } catch (err) {
      console.error("Error adding expense:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/groups/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add Expense</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            // Skeleton form
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" /> {/* Amount */}
              <Skeleton className="h-10 w-full" /> {/* Description */}
              <Skeleton className="h-10 w-full" /> {/* Category */}
              <Skeleton className="h-10 w-full" /> {/* Paid By */}
              <div>
                <Skeleton className="h-5 w-32 mb-2" />{" "}
                {/* Participants label */}
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-20 rounded-md" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-10 w-full" /> {/* Split Type */}
              <Skeleton className="h-10 w-full" /> {/* Notes */}
              <Skeleton className="h-10 w-full" /> {/* Currency */}
              <Skeleton className="h-10 w-32" /> {/* Submit Button */}
            </div>
          ) : (
            // Actual form
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="number"
                placeholder="Amount"
                value={amount === 0 ? "" : amount}
                onChange={(e) =>
                  setAmount(e.target.value === "" ? 0 : Number(e.target.value))
                }
                required
              />

              <Input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              {/* Category */}
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Accommodation">Accommodation</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              {/* Paid By */}
              <Select value={paidBy} onValueChange={setPaidBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Who paid?" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.user._id} value={m.user._id}>
                      {m.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Participants */}
              <div>
                <label className="text-sm font-medium">Participants</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {members.map((m) => (
                    <Button
                      key={m.user._id}
                      type="button"
                      variant={
                        participants.includes(m.user._id)
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        setParticipants((prev) =>
                          prev.includes(m.user._id)
                            ? prev.filter((id) => id !== m.user._id)
                            : [...prev, m.user._id]
                        )
                      }
                    >
                      {m.user.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Split Type */}
              <Select value={splitType} onValueChange={setSplitType}>
                <SelectTrigger>
                  <SelectValue placeholder="Split Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Equal</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="text"
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <Input
                type="text"
                placeholder="Currency (default USD)"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Add Expense"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
