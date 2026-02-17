import { Note, NoteType, NotePriority, CreateNoteRequest, UpdateNoteRequest, TaskNoteRelation, WarningNote } from '@/types/notes';
import { ChecklistItem } from './api';

const NOTES_STORAGE_KEY = 'fireplace_notes';
const NOTES_VERSION = '1.0';

export class NotesService {
  private static instance: NotesService;

  private constructor() {}

  static getInstance(): NotesService {
    if (!NotesService.instance) {
      NotesService.instance = new NotesService();
    }
    return NotesService.instance;
  }

  // Local Storage Operations
  saveNotes(planId: string, notes: Note[]): void {
    const storageData = this.getStorageData();
    storageData[planId] = notes;
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify({
      version: NOTES_VERSION,
      data: storageData,
      lastUpdated: new Date().toISOString()
    }));
  }

  loadNotes(planId: string): Note[] {
    const storageData = this.getStorageData();
    return storageData[planId] || [];
  }

  private getStorageData(): Record<string, Note[]> {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!stored) return {};

    try {
      const parsed = JSON.parse(stored);
      if (parsed.version === NOTES_VERSION) {
        return parsed.data || {};
      }
      return {};
    } catch {
      return {};
    }
  }

  // CRUD Operations
  createNote(planId: string, request: CreateNoteRequest): Note {
    const note: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: request.content,
      type: request.type,
      tags: request.tags || [],
      relatedTaskIds: request.relatedTaskIds || [],
      planId,
      priority: request.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRead: false,
      isDismissed: false
    };

    const notes = this.loadNotes(planId);
    notes.push(note);
    this.saveNotes(planId, notes);

    return note;
  }

  updateNote(planId: string, noteId: string, updates: UpdateNoteRequest): Note | null {
    const notes = this.loadNotes(planId);
    const index = notes.findIndex(n => n.id === noteId);

    if (index === -1) return null;

    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveNotes(planId, notes);
    return notes[index];
  }

  deleteNote(planId: string, noteId: string): boolean {
    const notes = this.loadNotes(planId);
    const filtered = notes.filter(n => n.id !== noteId);

    if (filtered.length === notes.length) return false;

    this.saveNotes(planId, filtered);
    return true;
  }

  // Tag Generation
  generateTagsFromContent(content: string): string[] {
    const tags: string[] = [];
    const lowerContent = content.toLowerCase();

    // Time-based tags
    if (lowerContent.includes('morning') || lowerContent.includes('am')) tags.push('morning');
    if (lowerContent.includes('evening') || lowerContent.includes('pm')) tags.push('evening');
    if (lowerContent.includes('today')) tags.push('today');
    if (lowerContent.includes('tomorrow')) tags.push('tomorrow');
    if (lowerContent.includes('deadline')) tags.push('deadline');

    // Priority tags
    if (lowerContent.includes('urgent') || lowerContent.includes('asap')) tags.push('urgent');
    if (lowerContent.includes('important')) tags.push('important');

    // Action tags
    if (lowerContent.includes('review')) tags.push('review');
    if (lowerContent.includes('test') || lowerContent.includes('testing')) tags.push('testing');
    if (lowerContent.includes('bug') || lowerContent.includes('fix')) tags.push('bug-fix');
    if (lowerContent.includes('feature')) tags.push('feature');
    if (lowerContent.includes('refactor')) tags.push('refactor');

    return [...new Set(tags)]; // Remove duplicates
  }

  // Mock AI Note Generation
  async generateAINote(
    planId: string,
    context: {
      tasks: ChecklistItem[];
      planFocus: string;
      requestType: 'suggestion' | 'warning' | 'insight';
    }
  ): Promise<Note> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    const { tasks, planFocus, requestType } = context;
    let content = '';
    let priority: NotePriority = 'medium';
    let type: NoteType = 'ai';
    let relatedTaskIds: string[] = [];
    let tags: string[] = [];

    switch (requestType) {
      case 'warning':
        const overdueTasks = tasks.filter(t => !t.done && t.scheduledTime && new Date(t.scheduledTime) < new Date());
        if (overdueTasks.length > 0) {
          content = `⚠️ You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Consider reprioritizing or breaking them down into smaller steps.`;
          priority = overdueTasks.length > 2 ? 'high' : 'medium';
          relatedTaskIds = overdueTasks.map(t => t.id);
          tags = ['overdue', 'warning'];
        } else if (tasks.filter(t => !t.done).length > 10) {
          content = `📝 You have a lot of pending tasks. Consider archiving completed items and focusing on your top 3-5 priorities for today.`;
          priority = 'medium';
          tags = ['productivity', 'focus'];
        } else {
          content = `✅ Your task list is well-managed. Keep up the great work on "${planFocus}"!`;
          priority = 'low';
          tags = ['positive', 'progress'];
        }
        type = 'warning';
        break;

      case 'insight':
        const completedToday = tasks.filter(t => t.done);
        const completionRate = tasks.length > 0 ? (completedToday.length / tasks.length) * 100 : 0;

        if (completionRate > 70) {
          content = `🎯 Excellent progress! You've completed ${Math.round(completionRate)}% of your tasks. Consider adding new challenges for ${planFocus}.`;
          priority = 'low';
          tags = ['achievement', 'progress'];
        } else if (completionRate > 40) {
          content = `📊 You're making steady progress on ${planFocus}. Focus on completing 2-3 more tasks to build momentum.`;
          priority = 'medium';
          tags = ['progress', 'momentum'];
        } else {
          content = `💡 Consider breaking down complex tasks in ${planFocus} into smaller, actionable steps to improve completion rate.`;
          priority = 'medium';
          tags = ['strategy', 'productivity'];
        }
        type = 'insight';
        break;

      case 'suggestion':
        const unscheduledTasks = tasks.filter(t => !t.done && !t.scheduledTime);
        if (unscheduledTasks.length > 0) {
          content = `📅 You have ${unscheduledTasks.length} unscheduled tasks. Consider scheduling them to better manage your time for ${planFocus}.`;
          relatedTaskIds = unscheduledTasks.slice(0, 3).map(t => t.id);
          tags = ['scheduling', 'planning'];
        } else {
          content = `🚀 All tasks are scheduled! Consider reviewing your long-term goals for ${planFocus} and adding new objectives.`;
          tags = ['goals', 'planning'];
        }
        type = 'suggestion';
        break;
    }

    const note: Note = {
      id: `ai_note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      type,
      tags,
      relatedTaskIds,
      planId,
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiMetadata: {
        generatedFrom: 'task_analysis',
        confidence: 0.75 + Math.random() * 0.2,
        sourceContext: `Generated from ${tasks.length} tasks in ${planFocus}`,
        generatedAt: new Date().toISOString()
      },
      isRead: false,
      isDismissed: false
    };

    // Save the generated note
    const notes = this.loadNotes(planId);
    notes.push(note);
    this.saveNotes(planId, notes);

    return note;
  }

  // Generate multiple contextual notes
  async generateContextualNotes(
    planId: string,
    tasks: ChecklistItem[],
    planFocus: string
  ): Promise<Note[]> {
    const notes: Note[] = [];

    // Generate a warning note
    const warningNote = await this.generateAINote(planId, {
      tasks,
      planFocus,
      requestType: 'warning'
    });
    notes.push(warningNote);

    // Generate an insight note
    const insightNote = await this.generateAINote(planId, {
      tasks,
      planFocus,
      requestType: 'insight'
    });
    notes.push(insightNote);

    // Generate a suggestion note
    const suggestionNote = await this.generateAINote(planId, {
      tasks,
      planFocus,
      requestType: 'suggestion'
    });
    notes.push(suggestionNote);

    return notes;
  }

  // Filter notes
  filterNotes(notes: Note[], criteria: {
    tags?: string[];
    type?: NoteType;
    relatedTaskId?: string;
    priority?: NotePriority;
    isRead?: boolean;
  }): Note[] {
    return notes.filter(note => {
      if (criteria.tags && criteria.tags.length > 0) {
        if (!criteria.tags.some(tag => note.tags.includes(tag))) return false;
      }
      if (criteria.type && note.type !== criteria.type) return false;
      if (criteria.relatedTaskId && !note.relatedTaskIds.includes(criteria.relatedTaskId)) return false;
      if (criteria.priority && note.priority !== criteria.priority) return false;
      if (criteria.isRead !== undefined && note.isRead !== criteria.isRead) return false;

      return true;
    });
  }

  // Get related notes for a task
  getNotesForTask(planId: string, taskId: string): Note[] {
    const notes = this.loadNotes(planId);
    return notes.filter(note => note.relatedTaskIds.includes(taskId));
  }

  // Generate task-note relationships
  generateTaskNoteRelations(tasks: ChecklistItem[], notes: Note[]): TaskNoteRelation[] {
    const relations: TaskNoteRelation[] = [];

    notes.forEach(note => {
      note.relatedTaskIds.forEach(taskId => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          let relationshipType: TaskNoteRelation['relationshipType'] = 'suggestion_for';
          let strength = 0.5;

          // Determine relationship type based on note type and content
          if (note.type === 'warning') {
            relationshipType = 'warns_about';
            strength = 0.8;
          } else if (note.type === 'insight') {
            relationshipType = 'inspired_by';
            strength = 0.6;
          } else if (note.content.toLowerCase().includes('block') || note.content.toLowerCase().includes('wait')) {
            relationshipType = 'blocks';
            strength = 0.9;
          } else if (note.content.toLowerCase().includes('depend')) {
            relationshipType = 'depends_on';
            strength = 0.7;
          }

          relations.push({
            taskId,
            noteId: note.id,
            relationshipType,
            strength
          });
        }
      });
    });

    return relations;
  }

  // Clear all notes for a plan
  clearNotes(planId: string): void {
    this.saveNotes(planId, []);
  }
}