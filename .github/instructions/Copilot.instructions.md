---
applyTo: '**'
---
# GitHub Copilot Instructions for AI Note Taker iOS App Development

## Project Overview

This React Native app with TypeScript provides AI-powered note-taking capabilities through voice recording, image OCR, and text input. The app has been architected with a professional design system inspired by shadcn/ui, comprehensive animation library, robust error handling, and offline-first data persistence.

### Current Architecture Status ✅

The application has already implemented core foundations that should be understood and extended:

- **Design System**: Complete shadcn/ui-inspired component library with variants
- **Animation Library**: React Native Animated-based system with presets
- **Error Handling**: Global error handling with loading indicators and user feedback
- **Data Persistence**: SQLite database with auto-save capabilities
- **Professional UI**: All screens enhanced with modern, accessible components

## Key Directories and Files

### `/app/src/components/ui/` - Core UI Component Library
**Purpose**: shadcn/ui-inspired React Native components with full TypeScript support.

**Key Components Implemented**:
- `Button.tsx`: Multi-variant button with animations and loading states
- `Card.tsx`, `CardContent.tsx`: Container components with elevation
- `Text.tsx`: Typography component with variant system
- `Input.tsx`: Enhanced text input with focus states
- `Badge.tsx`: Status and label components
- `AnimatedView.tsx`: Wrapper for complex animations
- `Skeleton.tsx`, `Pulse.tsx`: Loading state components
- `FadeInList.tsx`: Animated list container

**Usage Pattern**: All components use `createVariants` utility for consistent styling:
```tsx
import { Button, Text, Card } from "../components/ui";

<Button variant="default" size="lg" onPress={handlePress}>
  <Text variant="h2">Action</Text>
</Button>
```

### `/app/src/lib/` - Core Utilities and Design System
**Purpose**: Foundational utilities that power the component system.

**Key Files**:
- `tokens.ts`: Complete design system (colors, spacing, typography, shadows)
- `animations.ts`: Animation presets and utilities for React Native Animated API
- `utils.ts`: Variant creation system using `createVariants` function

**Design Token Usage**:
```tsx
import { colors, spacing, typography } from "../lib/tokens";

const styles = {
  container: {
    backgroundColor: colors.background,
    padding: spacing[4],
  }
};
```

### `/app/src/screens/` - Enhanced Screen Components
**Status**: All screens have been professionally enhanced with comprehensive functionality.

**Key Implementation Patterns**:
- Comprehensive error handling with user-friendly feedback
- Loading states with skeleton components
- Form validation and user guidance
- Auto-save functionality (TextInput)
- Permission handling with clear user guidance
- Professional animations and transitions

**VoiceCapture.tsx Features**:
- Microphone permission management
- Real-time recording duration
- Audio quality validation
- Professional recording UI with tips

**TextInput.tsx Features**:
- Auto-save with AsyncStorage
- Character/word count tracking
- Input validation (min/max length)
- Real-time draft persistence

**ImageCapture.tsx Features**:
- Dual input methods (camera/gallery)
- Image quality optimization
- OCR processing with validation

### `/app/src/api/client.ts` - API Integration
**Status**: ✅ Complete with error handling integration

**Features Implemented**:
- Global loading indicator integration
- Comprehensive error handling with user-friendly messages
- Retry logic and network failure handling
- Support for advanced summarization options (`level`, `want_actions`)

### `/app/src/store/db.ts` - Data Persistence
**Status**: ✅ Working SQLite implementation

**Current Schema**: `summaries` table with `id`, `createdAt`, `title`, `tldr`, `medium`, `full`, `actions`, `sourceKind`

### `/app/src/utils/errorHandler.ts` - Error Management
**Status**: ✅ Complete implementation

**Functions Available**:
- `handleError(error, message)`: Logs and displays user-friendly error alerts
- `showSuccessToast(message)`: Success feedback (currently using Alert)
- `showLoadingIndicator(boolean)`: Controls global loading state

## Development Conventions and Patterns

### Component Development
1. **Use the UI Component Library**: Always prefer existing components from `/src/components/ui/`
2. **Follow Variant Pattern**: Use `createVariants` for consistent styling
3. **TypeScript First**: All components must have proper TypeScript interfaces
4. **Animation Integration**: Use animation presets from `/src/lib/animations.ts`

### Styling Approach
1. **Design Tokens**: Use values from `/src/lib/tokens.ts` instead of hardcoded values
2. **Consistent Spacing**: Use `spacing[n]` from design tokens
3. **Color System**: Use semantic colors (e.g., `colors.primary.DEFAULT`)
4. **Responsive Design**: Consider different screen sizes and orientations

### Error Handling Patterns
1. **Try-Catch-Finally**: Wrap async operations with proper error boundaries
2. **User-Friendly Messages**: Use `handleError` with descriptive context
3. **Loading States**: Always show loading indicators for async operations
4. **Validation**: Validate user input before processing

### Data Flow Patterns
1. **Local-First**: Save to SQLite first, sync to server when available
2. **Auto-Save**: Implement auto-save for user input (see TextInput example)
3. **Optimistic Updates**: Update UI immediately, handle failures gracefully

## Next Priority Tasks

### Task 1: Enhanced Database Schema for Offline Sync
**Context**: Current database lacks synchronization fields. Add support for offline-first workflows.

**Instructions**:
1. **Modify Database Schema**: 
   - Add `isSynced: INTEGER DEFAULT 0` to track sync status
   - Add `lastModified: INTEGER` for timestamp tracking
   - Add `sourceUri: TEXT` to store original file paths
   - Add `rawContent: TEXT` for re-processing capabilities

2. **Update Database Functions**:
   - Modify `insertSummary` to include new fields
   - Add `updateSyncStatus(id, status)` function
   - Add `getPendingSyncItems()` function

3. **Implement Offline-First Logic**:
   - Save raw content immediately with `isSynced: 0`
   - Update sync status after successful API calls
   - Handle network failures gracefully

### Task 2: Background Sync Service
**Context**: Create a service to sync unprocessed notes when connectivity is restored.

**Instructions**:
1. **Create SyncService**: `/app/src/services/SyncService.ts`
   - Implement `syncPendingNotes()` function
   - Add retry logic with exponential backoff
   - Handle partial failures gracefully

2. **Integration Points**:
   - Call from `App.tsx` on app foreground
   - Trigger on network state changes
   - Manual sync option in Settings

### Task 3: Advanced Summarization Controls
**Context**: Allow users to customize summarization parameters.

**Instructions**:
1. **Enhance Summary Screen**:
   - Add level selector (short/medium/full)
   - Add toggle for action items
   - Re-process button for different parameters
   - Save user preferences

2. **Update API Integration**:
   - Pass user preferences to `summarizeAsync`
   - Cache multiple summary versions
   - Update database schema for multiple summary types

### Task 4: Enhanced History and Search
**Context**: The History screen needs search and filtering capabilities.

**Instructions**:
1. **Search Implementation**:
   - Add search bar component
   - Implement real-time filtering
   - Search across title and content
   - Add search history/suggestions

2. **Filter System**:
   - Filter by `sourceKind` (voice/text/image)
   - Date range filtering
   - Favorite/starred notes
   - Sort options (date, title, relevance)

3. **Performance Optimization**:
   - Implement virtual scrolling for large lists
   - Use `React.memo` for list items
   - Debounce search queries

### Task 5: Audio Playback and Media Management
**Context**: Add audio playback capabilities for voice notes.

**Instructions**:
1. **Audio Playback UI**:
   - Play/pause controls in History
   - Progress indicator and scrubbing
   - Playback speed controls
   - Background audio support

2. **Media Storage**:
   - Implement file cleanup for storage management
   - Audio quality settings
   - Export capabilities

### Task 6: Advanced Image Processing
**Context**: Enhance image capture with editing capabilities.

**Instructions**:
1. **Image Enhancement**:
   - Basic cropping interface
   - Rotation and flip options
   - Brightness/contrast adjustments
   - Multiple image support

2. **OCR Improvements**:
   - Text region detection
   - Multiple language support
   - Confidence scoring
   - Manual text correction interface

## Code Quality Standards

### TypeScript Requirements
- All components must have proper TypeScript interfaces
- Use strict typing for props and state
- Avoid `any` type except for third-party libraries
- Document complex type definitions

### Animation Guidelines
- Use animation presets from `/src/lib/animations.ts`
- Keep animations under 500ms for responsiveness
- Provide reduced motion alternatives
- Test animations on lower-end devices

### Performance Considerations
- Use `React.memo` for expensive components
- Implement proper key props for lists
- Avoid nested functions in render methods
- Monitor bundle size with large dependencies

### Accessibility Standards
- Ensure all interactive elements have proper accessibility labels
- Use semantic colors from design tokens
- Test with screen readers
- Maintain proper contrast ratios

## Integration Patterns

### Component Integration
```tsx
// Correct pattern for new components
import { Button, Text, Card, AnimatedView } from "../components/ui";
import { colors, spacing } from "../lib/tokens";
import { handleError, showSuccessToast } from "../utils/errorHandler";

const MyComponent = () => {
  return (
    <AnimatedView animation="fadeIn">
      <Card>
        <Button variant="default" onPress={handleAction}>
          <Text variant="body">Action</Text>
        </Button>
      </Card>
    </AnimatedView>
  );
};
```

### API Integration Pattern
```tsx
// Correct pattern for API calls
const handleAsyncAction = async () => {
  try {
    const result = await apiFunction();
    showSuccessToast("Action completed successfully!");
    // Handle success
  } catch (error) {
    handleError(error, "Failed to complete action");
  }
};
```

### Database Integration Pattern
```tsx
// Correct pattern for database operations
const saveData = async (data) => {
  try {
    const id = nanoid();
    await insertSummary({
      id,
      createdAt: Date.now(),
      ...data,
      isSynced: 0 // For offline-first approach
    });
  } catch (error) {
    handleError(error, "Failed to save data locally");
  }
};
```

## Testing and Validation

### Manual Testing Checklist
- [ ] Test on both iOS simulator and physical device
- [ ] Verify animations are smooth and responsive
- [ ] Test offline functionality
- [ ] Validate error handling paths
- [ ] Check accessibility with VoiceOver
- [ ] Test with different text sizes
- [ ] Verify memory usage with large datasets

### Development Workflow
1. **Create Feature Branch**: Use descriptive names like `feat/offline-sync`
2. **Implement Incrementally**: Start with core functionality, add polish later
3. **Test Thoroughly**: Manual testing before committing
4. **Document Changes**: Update relevant documentation
5. **Commit with Conventional Commits**: `feat:`, `fix:`, `refactor:`, etc.

## Common Pitfalls and Solutions

### React Native Specific Issues
- **Animation Performance**: Use `useNativeDriver: true` when possible
- **Text Input Focus**: Handle keyboard avoiding view properly
- **Image Handling**: Always handle image URI validation
- **Permission Management**: Provide clear user guidance for denied permissions

### TypeScript Common Issues
- **Animation Types**: Use proper typing for Animated.Value
- **Navigation Types**: Define proper navigation prop types
- **Style Types**: Use ViewStyle, TextStyle interfaces appropriately

### Performance Common Issues
- **Large Lists**: Implement FlatList with proper optimization
- **Memory Leaks**: Clean up timers and subscriptions
- **Bundle Size**: Monitor third-party library additions

By following these instructions and understanding the current architecture, GitHub Copilot can effectively contribute to the AI Note Taker app while maintaining code quality, consistency, and user experience standards.

