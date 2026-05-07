# Jira-Style Frontend - Implementation Chunks

---

## Backend Changes

### Chunk B1: Add status to Task model
- [ ] Add `status` column to Tasks table (default: 'active')
- [ ] Add `avatar_url` column to Users table
- [ ] Update `TasksModel` with status field
- [ ] Add `__future__` imports for relationship typing

### Chunk B2: Update schemas
- [ ] Update `TaskSchema` to include status
- [ ] Update `UserSchema` to include avatar_url
- [ ] Add `TasksUpdateStatusSchema`

### Chunk B3: Add complete endpoint
- [ ] Add `complete_task` route PATCH `/tasks/{id}/complete`
- [ ] Add service method
- [ ] Add repository method

---

## Frontend Changes

### Chunk F1: Update types & API
- [ ] Update `src/types/task.ts` - add status, creator fields
- [ ] Update `src/types/user.ts` - add avatar_url
- [ ] Update `src/api/tasks.ts` - add completeTask function

### Chunk F2: Create TaskBoard layout
- [ ] Create `src/components/layout/AppLayout.tsx` - two-column grid
- [ ] Update `src/components/layout/Navbar.tsx` - with avatar
- [ ] Create `src/components/ui/Avatar.tsx` - avatar component with fallback

### Chunk F3: TaskSidebar component
- [ ] Create `src/components/layout/TaskSidebar.tsx`
- [ ] Scrollable task list with status indicators 🔵/✅
- [ ] Filter tabs: All | Active | Completed
- [ ] Click task → select state

### Chunk F4: TaskPanel component
- [ ] Create `src/components/layout/TaskPanel.tsx`
- [ ] Display: title, description, creator, owner, timestamps
- [ ] Show avatar next to names
- [ ] Status badge with emoji

### Chunk F5: Complete button
- [ ] Create `src/components/ui/StatusBadge.tsx`
- [ ] Add `CompleteButton` to TaskPanel (owner only)
- [ ] Use useGlobalToast for feedback
- [ ] Update task list after completion

### Chunk F6: Task Board page
- [ ] Create `src/pages/TaskBoardPage.tsx`
- [ ] Combine Sidebar + Panel
- [ ] Add selectedTask state management
- [ ] Update `/tasks` route to use new page

### Chunk F7: Visual polish
- [ ] Add color theme to Tailwind config
- [ ] Style completed tasks (strikethrough, muted)
- [ ] Hover effects on task items
- [ ] Selected task highlight
- [ ] Responsive adjustments

---

## Summary

| Chunk | Description | Type |
|-------|-------------|------|
| B1 | Task model + status field | Backend |
| B2 | Update Pydantic schemas | Backend |
| B3 | Complete endpoint | Backend |
| F1 | Types + API updates | Frontend |
| F2 | Two-column layout | Frontend |
| F3 | TaskSidebar component | Frontend |
| F4 | TaskPanel component | Frontend |
| F5 | Complete button | Frontend |
| F6 | TaskBoard page | Frontend |
| F7 | Visual polish | Frontend |

**Total: 10 chunks (3 backend, 7 frontend)**

---

## Status

- [ ] B1: Not started
- [ ] B2: Not started
- [ ] B3: Not started
- [ ] F1: Not started
- [ ] F2: Not started
- [ ] F3: Not started
- [ ] F4: Not started
- [ ] F5: Not started
- [ ] F6: Not started
- [ ] F7: Not started