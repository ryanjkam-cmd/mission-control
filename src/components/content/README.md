# Content Studio Components

Phase 2 implementation for Mission Control Content Studio.

## Component Hierarchy

```
ContentStudioPage (page.tsx)
├── View Switcher (Week/Month/Kanban/List buttons)
├── New Post Button
├── ContentCalendar (multi-view)
│   ├── Week View (7 columns)
│   │   └── ContentCard (draggable) × N per day
│   │       ├── PlatformBadges
│   │       └── Hover actions (Edit, Duplicate, Delete)
│   ├── Month View (30-day grid)
│   │   └── Content bubbles (draggable) × max 3 per day
│   └── Kanban View (3 columns)
│       └── ContentCard (draggable) × N per column
│           ├── PlatformBadges
│           └── Hover actions
├── ContentList (table view)
│   ├── Filters (Platform, Status)
│   ├── Sortable columns
│   ├── Table rows × 20 per page
│   │   ├── PlatformBadges
│   │   └── Row actions (Edit, Duplicate, Delete)
│   └── Pagination
└── ContentModal (create/edit)
    ├── Form fields (Title, Body, Platforms, Status, Schedule)
    ├── Validation
    └── Actions (Save, Cancel)
```

## Component Files

| Component | Purpose | Props |
|-----------|---------|-------|
| `PlatformBadge.tsx` | Platform icons with status indicators | `platform`, `status?`, `variant?`, `size?` |
| `ContentCard.tsx` | Draggable content card | `item`, `onEdit?`, `onDelete?`, `onDuplicate?`, `variant?` |
| `ContentModal.tsx` | Create/edit form | `isOpen`, `onClose`, `editItem?` |
| `ContentCalendar.tsx` | Multi-view calendar | `view`, `onEditItem?`, `onDeleteItem?`, `onDuplicateItem?` |
| `ContentList.tsx` | Table view with filters | `items`, `onEdit?`, `onDelete?`, `onDuplicate?` |

## Platform Colors

| Platform | Color | Style |
|----------|-------|-------|
| LinkedIn | #0A66C2 | Solid blue |
| X | #000000 | Solid black |
| Substack | #FF6719 | Solid orange |
| Instagram | Gradient | 45deg, 5 stops (#f09433 → #bc1888) |

## Status Colors

| Status | Color | Label |
|--------|-------|-------|
| Draft | #8b949e | Gray |
| Scheduled | #d29922 | Yellow |
| Published | #3fb950 | Green |
| Failed | #f85149 | Red |

## Usage Example

```tsx
import ContentCalendar from '@/components/content/ContentCalendar';
import ContentModal from '@/components/content/ContentModal';
import { useContentStore } from '@/stores/contentStore';

function MyPage() {
  const { items, view } = useContentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ContentCalendar
        view={view}
        onEditItem={(item) => setEditingItem(item)}
        onDeleteItem={(id) => deleteItem(id)}
        onDuplicateItem={(item) => duplicateItem(item)}
      />
      <ContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editItem={editingItem}
      />
    </>
  );
}
```

## State Management

All components use `useContentStore` from `/src/stores/contentStore.ts`:

```typescript
const { items, view, setView, addItem, updateItem, deleteItem } = useContentStore();
```

## Drag and Drop

Uses `@hello-pangea/dnd` for drag-and-drop:
- Calendar: Drag cards between days (updates `scheduledDate`)
- Kanban: Drag cards between columns (updates `status`)
- Visual feedback: 0.5 opacity when dragging

## Form Validation

ContentModal validates:
- Title required
- Body required
- At least one platform required
- Schedule date must be in future (if status is "Scheduled")

## Responsive Design

| Breakpoint | Behavior |
|------------|----------|
| Mobile (< 768px) | List view only, calendar collapses |
| Tablet (768-1024px) | 2-column calendar, full kanban |
| Desktop (> 1024px) | Full 7-column week view |

## Icons

All icons from `lucide-react`:
- `Plus` - New post button
- `Calendar` - Week/month view buttons
- `Columns` - Kanban view button
- `List` - List view button
- `Edit2` - Edit action
- `Trash2` - Delete action
- `Copy` - Duplicate action
- `Clock` - Schedule time display
- `ChevronLeft`, `ChevronRight` - Navigation
- `ArrowUpDown` - Sortable columns
- Platform icons: `Linkedin`, `Twitter`, `FileText`, `Instagram`

## Mock Data

15 realistic content items loaded on first visit:
- 5 drafts
- 6 scheduled (Feb 10-15, 2026)
- 4 published (Feb 2-5, 2026 with metrics)
- Mix of all platforms

## Future Enhancements

- Virtual scrolling for large lists (>1000 items)
- Real-time updates via SSE
- Gateway API integration
- Content preview (platform-specific formatting)
- Bulk actions (select multiple, delete/duplicate/schedule)
- Export to CSV
- Content templates
- AI-powered content suggestions
- Analytics integration
