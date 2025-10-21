"use client";

import React, { useState, useEffect } from 'react';
import { Plus, X, BarChart2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HABIT_CATEGORIES = ['Health', 'Work', 'Learning', 'Personal'];
const YEAR_2025_DATES = Array.from({ length: 365 }, (_, i) => {
  const date = new Date(2025, 0, 1);
  date.setDate(1 + i);
  return date.toISOString().split('T')[0];
});

const HabitTracker = () => {
  // State management
  const [habits, setHabits] = useState<Array<{ name: string; category: string }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('habits');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [completions, setCompletions] = useState<Record<string, Record<number, boolean>>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('completions');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [newHabit, setNewHabit] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Persist data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('completions', JSON.stringify(completions));
    }
  }, [completions]);

  // Utility functions
  const getWeekNumber = (d: string | Date) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const isNewMonth = (date: string, prevDate: string | null) => {
    if (!prevDate) return true;
    const d1 = new Date(date);
    const d2 = new Date(prevDate);
    return d1.getMonth() !== d2.getMonth();
  };

  // Habit management
  const addHabit = () => {
    if (newHabit.trim()) {
      setHabits([...habits, {
        name: newHabit.trim(),
        category: newCategory
      }]);
      setNewHabit('');
    }
  };

  const toggleCompletion = (date: string, habitIndex: number) => {
    const dateCompletions = completions[date] || {};
    const newDateCompletions = {
      ...dateCompletions,
      [habitIndex]: !dateCompletions[habitIndex]
    };

    setCompletions({
      ...completions,
      [date]: newDateCompletions
    });
  };

  const getStats = (habitIndex: number) => {
    let total = 0;
    let completed = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const dates = Object.keys(completions).sort();
    const today = new Date().toISOString().split('T')[0];

    dates.forEach(date => {
      if (completions[date]?.[habitIndex] !== undefined) {
        total++;
        if (completions[date][habitIndex]) {
          completed++;
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          if (date <= today) {
            currentStreak = tempStreak;
          }
        } else {
          tempStreak = 0;
          if (date <= today) {
            currentStreak = 0;
          }
        }
      }
    });

    const lastWeek = dates
      .filter(date => {
        const d = new Date(date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      })
      .filter(date => completions[date]?.[habitIndex])
      .length;

    const lastMonth = dates
      .filter(date => {
        const d = new Date(date);
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        return d >= monthAgo;
      })
      .filter(date => completions[date]?.[habitIndex])
      .length;

    return { total, completed, currentStreak, longestStreak, lastWeek, lastMonth };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Habit Tracker</CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const exportData = {
                  habits,
                  completions,
                  exportDate: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `habit-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const rows = ['Date,Day,Week,Month,' + habits.map(h => h.name).join(',')];
                const dates = Object.keys(completions).sort();
                dates.forEach(date => {
                  const d = new Date(date);
                  const row = [
                    date,
                    d.toLocaleDateString('en-US', { weekday: 'short' }),
                    getWeekNumber(d).toString(),
                    d.toLocaleDateString('en-US', { month: 'short' })
                  ];
                  habits.forEach((_, index) => {
                    row.push(completions[date]?.[index] ? '1' : '0');
                  });
                  rows.push(row.join(','));
                });

                const csvContent = rows.join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `habit-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export CSV
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('habits');
                  localStorage.removeItem('completions');
                }
                setHabits([]);
                setCompletions({});
                setNewHabit('');
                setNewCategory('Personal');
                setSelectedCategory('All');
              }}
            >
              Clear All Data
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Add New Habit</h2>
            <div className="flex gap-4">
              <div className="space-y-2 flex-grow">
                <label htmlFor="habit-name" className="text-sm font-medium">Habit Name</label>
                <Input
                  id="habit-name"
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  placeholder="Enter a new habit..."
                  onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {HABIT_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={addHabit}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Habit
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Habit Tracking</h2>
            <div className="flex gap-4 items-end mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {HABIT_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50">Date</th>
                  {habits
                    .filter(habit => selectedCategory === 'All' || habit.category === selectedCategory)
                    .map((habit, index) => (
                    <th key={index} className="border p-2 bg-gray-50">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="flex-grow text-center font-medium">{habit.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const filteredHabits = habits.filter((_, i) => i !== index);
                            setHabits(filteredHabits);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        Category: {habit.category}
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>{getStats(index).completed}/365 total days</div>
                        <div>Current streak: {getStats(index).currentStreak} days</div>
                        <div>Longest streak: {getStats(index).longestStreak} days</div>
                        <div>Last 7 days: {getStats(index).lastWeek}/7</div>
                        <div>Last 30 days: {getStats(index).lastMonth}/30</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {YEAR_2025_DATES.map((date) => (
                  <tr key={date}>
                    <td className="border p-2 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                            {date === new Date().toISOString().split('T')[0] && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            W{getWeekNumber(new Date(date))}
                          </div>
                        </div>
                        <div>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </td>
                    {habits
                      .filter(habit => selectedCategory === 'All' || habit.category === selectedCategory)
                      .map((_, habitIndex) => {
                      const isCompleted = completions[date]?.[habitIndex];
                      return (
                        <td
                          key={`${date}-${habitIndex}`}
                          className="border p-2 text-center cursor-pointer"
                          onClick={() => toggleCompletion(date, habitIndex)}
                        >
                          <div
                            className={`w-6 h-6 mx-auto rounded-full ${
                              isCompleted
                                ? 'bg-green-500'
                                : 'border-2 border-gray-300'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {habits.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No habits added yet. Add your first habit above!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitTracker;
