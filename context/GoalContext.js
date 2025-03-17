import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules } from 'react-native';

export const GoalContext = createContext();

export const GoalProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [incompleteTasks, setIncompleteTasks] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedGoals = await AsyncStorage.getItem("goals");
        const storedCompleted = await AsyncStorage.getItem("completedTasks");
        const storedIncomplete = await AsyncStorage.getItem("incompleteTasks");

        if (storedGoals) setGoals(JSON.parse(storedGoals));
        if (storedCompleted) setCompletedTasks(JSON.parse(storedCompleted));
        if (storedIncomplete) setIncompleteTasks(JSON.parse(storedIncomplete));
      } catch (error) {
        console.error("Error loading data from storage:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem("goals", JSON.stringify(goals));
        await AsyncStorage.setItem("completedTasks", JSON.stringify(completedTasks));
        await AsyncStorage.setItem("incompleteTasks", JSON.stringify(incompleteTasks));
        
        // Update widget after data changes
        if (NativeModules.TodoWidgetModule) {
          NativeModules.TodoWidgetModule.updateWidget();
        }
      } catch (error) {
        console.error("Error saving data to storage:", error);
      }
    };

    saveData();
  }, [goals, completedTasks, incompleteTasks]);

  useEffect(() => {
    const checkExpiredGoals = () => {
      const now = new Date();
      const expiredGoals = goals.filter((goal) => new Date(goal.dueDate) < now && !goal.completed);

      if (expiredGoals.length > 0) {
        setIncompleteTasks((prev) => [
          ...prev,
          ...expiredGoals.filter((g) => !incompleteTasks.some((i) => i.id === g.id)),
        ]);
        setGoals((prev) => prev.filter((goal) => !expiredGoals.includes(goal)));
      }
    };

    const interval = setInterval(checkExpiredGoals, 60000);
    return () => clearInterval(interval);
  }, [goals, incompleteTasks]);

  const addGoal = (goal) => {
    const newGoal = {
      id: Date.now().toString(),
      ...goal,
      subGoals: [],
      completed: false,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const addSubGoal = (goalId, subGoal) => {
    const newSubGoal = {
      id: Date.now().toString(),
      ...subGoal,
      completed: false,
    };

    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, subGoals: [...goal.subGoals, newSubGoal] } : goal
      )
    );
  };

  // New function to handle subgoal expiration
  const markSubGoalExpired = (goalId, subGoalId) => {
    // Find the parent goal
    const parentGoal = goals.find(goal => goal.id === goalId);
    
    if (!parentGoal) return;
    
    // Create a copy with all subgoals marked as incomplete (expired)
    const updatedSubGoals = parentGoal.subGoals.map(subGoal => ({
      ...subGoal,
      completed: false,
      expired: subGoal.id === subGoalId ? true : subGoal.expired
    }));
    
    // Create the incomplete goal to add to incomplete tasks
    const incompleteGoal = {
      ...parentGoal,
      subGoals: updatedSubGoals,
      completed: false,
      expiredReason: `Sub-goal "${parentGoal.subGoals.find(sg => sg.id === subGoalId)?.title}" expired`
    };
    
    // Add to incomplete tasks
    addToIncomplete(incompleteGoal);
    
    // Remove from active goals
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const addToIncomplete = (goal) => {
    if (!incompleteTasks.some((i) => i.id === goal.id)) {
      setIncompleteTasks((prev) => [...prev, goal]);
      setGoals((prev) => prev.filter((g) => g.id !== goal.id));
    }
  };

  const completeGoal = (goalId) => {
    setGoals((prevGoals) => {
      const goalToUpdate = prevGoals.find((goal) => goal.id === goalId);
      if (goalToUpdate) {
        // Only allow completion if there are no subgoals or all subgoals are already completed
        if (!goalToUpdate.subGoals || goalToUpdate.subGoals.length === 0 || 
            goalToUpdate.subGoals.every(sg => sg.completed)) {
          const updatedGoal = { 
            ...goalToUpdate, 
            completed: true,
            completedDate: new Date().toISOString() 
          };
          setCompletedTasks((prev) => [...prev, updatedGoal]);
          return prevGoals.filter((goal) => goal.id !== goalId);
        }
      }
      return prevGoals;
    });
  };

  const completeSubGoal = (goalId, subGoalId) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          const updatedSubGoals = goal.subGoals.map((subGoal) =>
            subGoal.id === subGoalId ? { ...subGoal, completed: !subGoal.completed } : subGoal
          );

          // Complete goal if all subgoals are completed
          const allSubGoalsCompleted = updatedSubGoals.every((sg) => sg.completed);
          const updatedGoal = { 
            ...goal, 
            subGoals: updatedSubGoals, 
            completed: allSubGoalsCompleted 
          };

          // If all subgoals are completed, also mark the parent goal as completed
          if (allSubGoalsCompleted) {
            updatedGoal.completedDate = new Date().toISOString();
            // Move to completed tasks
            setCompletedTasks(prevCompleted => [...prevCompleted, updatedGoal]);
            // Return null to filter it out in the next step
            return null;
          }

          return updatedGoal;
        }
        return goal;
      }).filter(Boolean) // Remove any null entries (completed goals)
    );
  };

  const getAllTasks = () => [...goals, ...completedTasks, ...incompleteTasks];

  const getPerformanceStats = () => {
    const total = getAllTasks().length;
    const completed = completedTasks.length;
    const performance = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;

    return {
      total,
      completed,
      incomplete: total - completed,
      performance,
    };
  };

  return (
    <GoalContext.Provider
      value={{
        goals,
        completedTasks,
        incompleteTasks,
        addGoal,
        addSubGoal,
        addToIncomplete,
        completeGoal,
        getPerformanceStats,
        completeSubGoal,
        markSubGoalExpired,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
};