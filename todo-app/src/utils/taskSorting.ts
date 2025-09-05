import { Todo, TodoGroup } from '../types';

export interface SortedTask {
  type: 'task';
  task: Todo;
  group?: TodoGroup;
}

export interface GroupHeader {
  type: 'group_header';
  group: TodoGroup;
}

export type SortedItem = SortedTask | GroupHeader;

/**
 * Priority order for sorting (higher number = higher priority)
 */
const PRIORITY_ORDER: Record<string, number> = {
  'high': 3,
  'medium': 2, 
  'low': 1,
  '': 0, // No priority
};

/**
 * Calculates temporal distance from today in days
 * Today = 0, Tomorrow = 1, Yesterday = -1, etc.
 */
function getTemporalDistance(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);
  
  const diffTime = taskDate.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Primary sorting function for tasks:
 * 1. Date sorting by temporal distance (today first, then tomorrow, etc.)
 * 2. Priority sorting (high → medium → low → none)
 * 3. Created date as tiebreaker (oldest first)
 */
function compareTasks(a: Todo, b: Todo): number {
  // 1. Sort by due date (temporal distance from today)
  const aDistance = a.dueDate ? getTemporalDistance(a.dueDate) : Infinity;
  const bDistance = b.dueDate ? getTemporalDistance(b.dueDate) : Infinity;
  
  if (aDistance !== bDistance) {
    return aDistance - bDistance;
  }
  
  // 2. Sort by priority (high to low)
  const aPriority = PRIORITY_ORDER[a.priority || ''] || 0;
  const bPriority = PRIORITY_ORDER[b.priority || ''] || 0;
  
  if (aPriority !== bPriority) {
    return bPriority - aPriority; // Higher priority first
  }
  
  // 3. Tiebreaker: sort by creation date (oldest first)
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

/**
 * Groups tasks by their group and sorts them according to the requirements
 * @param tasks Array of tasks to sort and group
 * @param groups Array of available groups
 * @returns Array of sorted items (group headers and tasks)
 */
export function sortAndGroupTasks(tasks: Todo[], groups: TodoGroup[]): SortedItem[] {
  if (tasks.length === 0) {
    return [];
  }

  // Create a map for quick group lookup
  const groupMap = new Map<string, TodoGroup>();
  groups.forEach(group => groupMap.set(group.id, group));

  // Separate tasks with and without groups
  const tasksWithGroups = tasks.filter(task => task.groupId);
  const tasksWithoutGroups = tasks.filter(task => !task.groupId);

  // Group tasks by their groupId
  const tasksByGroup = new Map<string, Todo[]>();
  tasksWithGroups.forEach(task => {
    if (task.groupId) {
      if (!tasksByGroup.has(task.groupId)) {
        tasksByGroup.set(task.groupId, []);
      }
      tasksByGroup.get(task.groupId)!.push(task);
    }
  });

  // Sort tasks within each group
  tasksByGroup.forEach(groupTasks => {
    groupTasks.sort(compareTasks);
  });

  // Sort ungrouped tasks
  tasksWithoutGroups.sort(compareTasks);

  // Determine the order in which to display groups
  // We'll order groups based on the earliest due date of their tasks
  const groupOrder: Array<{ groupId: string, earliestDate: number }> = [];
  
  tasksByGroup.forEach((groupTasks, groupId) => {
    if (groupTasks.length > 0) {
      const earliestTask = groupTasks[0]; // Already sorted, so first is earliest
      if (earliestTask) {
        const earliestDate = earliestTask.dueDate 
          ? getTemporalDistance(earliestTask.dueDate)
          : Infinity;
        
        groupOrder.push({ groupId, earliestDate });
      }
    }
  });

  // Sort groups by their earliest task date
  groupOrder.sort((a, b) => a.earliestDate - b.earliestDate);

  // Build the final sorted list
  const result: SortedItem[] = [];

  // Add grouped tasks (with headers)
  groupOrder.forEach(({ groupId }) => {
    const group = groupMap.get(groupId);
    const groupTasks = tasksByGroup.get(groupId);
    
    if (group && groupTasks && groupTasks.length > 0) {
      // Add group header
      result.push({
        type: 'group_header',
        group
      });
      
      // Add sorted tasks in this group
      groupTasks.forEach(task => {
        result.push({
          type: 'task',
          task,
          group
        });
      });
    }
  });

  // Add ungrouped tasks at the end
  tasksWithoutGroups.forEach(task => {
    result.push({
      type: 'task',
      task
    });
  });

  return result;
}

/**
 * Simple task sorting without grouping (for backward compatibility)
 * @param tasks Array of tasks to sort
 * @returns Array of sorted tasks
 */
export function sortTasks(tasks: Todo[]): Todo[] {
  return [...tasks].sort(compareTasks);
}

/**
 * Get formatted date string for display
 * @param date Date to format
 * @returns Formatted date string
 */
export function getFormattedDate(date: Date): string {
  const distance = getTemporalDistance(date);
  
  if (distance === 0) {
    return 'Heute';
  } else if (distance === 1) {
    return 'Morgen';
  } else if (distance === -1) {
    return 'Gestern';
  } else if (distance > 1 && distance <= 7) {
    return `In ${distance} Tagen`;
  } else if (distance < -1 && distance >= -7) {
    return `Vor ${Math.abs(distance)} Tagen`;
  } else {
    return date.toLocaleDateString('de-DE', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }
}