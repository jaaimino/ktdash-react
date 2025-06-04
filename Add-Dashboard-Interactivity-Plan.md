# Kill Team Interactive Features: JavaScript Development Roadmap

Based on the project stack (Next.js 15, React 19, Mantine UI, SWR, Lodash), here's the updated implementation plan using pure JavaScript with JSDoc for documentation.

## Phase 1: Foundation - Game State Management Core
**PR #1: Implement Core Game State Architecture**

### Scope
- Create `GameStateProvider` context using React Context + useReducer pattern
- Implement foundational game state schema with JSDoc documentation
- Add basic state persistence layer (localStorage with migration strategy)
- Create core reducer functions for state mutations

### Technical Implementation
```javascript
// hooks/use-game-state.js
/**
 * @typedef {Object} GameState
 * @property {OperativeGameState[]} operatives
 * @property {GlobalModifier[]} globalModifiers
 * @property {TurnState} turnState
 * @property {string} sessionId
 */

/**
 * @typedef {Object} OperativeGameState
 * @property {string} rosteropid
 * @property {StatusEffect[]} statusEffects
 * @property {number} currentWounds
 * @property {string[]} appliedModifiers
 * @property {ActivationState} activationState
 */

const gameStateReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_STATUS_EFFECT':
      return immer.produce(state, draft => {
        // Immutable state updates using immer pattern
      });
    default:
      return state;
  }
};
```


### Deliverables
- `hooks/use-game-state.js` - Core game state management with Context
- `types/game-state.js` - JSDoc type definitions
- `utils/game-state-persistence.js` - localStorage utilities with versioning
- `utils/immer-lite.js` - Lightweight immutable update helpers
- Unit tests using Jest

### Exit Criteria
- Game state can be initialized, updated, and persisted
- State changes trigger re-renders correctly via Context
- Clean migration path for localStorage schema changes
- All components can access game state via custom hook

---

## Phase 2: Status Effect System
**PR #2: Implement Status Effect Engine**

### Scope
- Create comprehensive status effect definitions in JSON
- Implement status effect application/removal logic
- Add visual indicators for status effects on OperativeCard
- Create status effect picker UI component using Mantine

### Technical Implementation
```javascript
// data/status-effects.json
{
  "injured": {
    "id": "injured",
    "name": "Injured",
    "description": "Operative suffers +1 to all Hit rolls",
    "icon": "IconDroplet",
    "color": "red",
    "modifiers": [
      {
        "stat": "hit",
        "operation": "add",
        "value": 1,
        "appliesTo": "all_weapons"
      }
    ],
    "duration": "permanent"
  }
}

// components/status-effect-picker.jsx
export function StatusEffectPicker({ operative, onUpdate }) {
  const [opened, setOpened] = useState(false);
  // Mantine Menu component with status effect options
}
```


### Deliverables
- `data/status-effects.json` - Complete Kill Team status definitions
- `components/status-effect-picker.jsx` - Mantine-based picker component
- `components/status-badge.jsx` - Visual status indicators
- Enhanced `OperativeCard` with status display
- `utils/status-effect-engine.js` - Pure functions for effect logic

### Exit Criteria
- All major Kill Team status effects properly defined
- Status effects can be applied/removed via intuitive UI
- Visual feedback uses Mantine's design system consistently
- Status effects persist across page refreshes

---

## Phase 3: Dynamic Stat Modification Engine
**PR #3: Implement Stat Modifier System**

### Scope
- Create rule-based stat modification engine using pure functions
- Implement modifier calculation pipeline (base → status → equipment → global)
- Add visual differentiation for modified stats using Mantine styling
- Create hover tooltips explaining modifications using Mantine Tooltip

### Technical Implementation
```javascript
// utils/stat-calculator.js
/**
 * @typedef {Object} StatModifier
 * @property {string} stat - 'hit', 'damage', 'attacks', etc.
 * @property {'add'|'subtract'|'multiply'|'set'} operation
 * @property {number} value
 * @property {string} source - Where the modifier comes from
 * @property {Function} [condition] - Optional condition function
 */

/**
 * Calculate modified stat value
 * @param {number} baseStat 
 * @param {StatModifier[]} modifiers 
 * @param {Object} operative 
 * @returns {Object} { value, modifiers, hasChanged }
 */
export function calculateModifiedStat(baseStat, modifiers, operative) {
  // Pure function implementation
  // Returns object with calculated value and explanation
}

// components/modified-stat-display.jsx
export function ModifiedStatDisplay({ originalValue, modifiedValue, modifiers }) {
  const hasChanged = originalValue !== modifiedValue;
  // Mantine styling for visual differentiation
}
```


### Deliverables
- `utils/stat-calculator.js` - Pure calculation functions
- `components/modified-stat-display.jsx` - Visual stat component with Mantine
- `components/stat-tooltip.jsx` - Explanation tooltips using Mantine Tooltip
- Enhanced weapon tables with dynamic stat display
- CSS modules for stat modification styling

### Exit Criteria
- Injured operative shows +1 to Hit with clear visual indication
- Tooltips explain modifier sources and calculations
- Multiple modifiers stack correctly using defined precedence
- Performance remains smooth with complex modifier chains

---

## Phase 4: Enhanced Weapon Display
**PR #4: Interactive Weapon Stats with Modifiers**

### Scope
- Refactor weapon display to use stat modification system
- Add conditional styling for modified weapon stats
- Implement weapon status tracking (damaged/destroyed)
- Create weapon-specific modifier rules integration

### Technical Implementation
```javascript
// components/weapon-display.jsx
/**
 * @typedef {Object} WeaponDisplayProps
 * @property {Object} weapon
 * @property {Object} operative
 * @property {boolean} showModifiers
 */

export function EnhancedWeaponTable({ weapons, operative, showModifiers = true }) {
  // Enhanced Table using Mantine components
  // Conditional rendering based on modifiers
  return (
    <Table>
      <Table.Tbody>
        {weapons.map(weapon => (
          <Table.Tr key={weapon.wepid}>
            <Table.Td>
              <ModifiedStatDisplay 
                originalValue={weapon.profiles[0].BS}
                modifiedValue={calculateHitStat(weapon, operative)}
                modifiers={getApplicableModifiers(weapon, operative)}
              />
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
```


### Deliverables
- Enhanced `OperativeCard` weapon display integration
- `components/weapon-status-tracker.jsx` using Mantine components
- `utils/weapon-modifier-rules.js` - Business logic for weapon modifiers
- CSS modules for weapon status styling
- Integration with existing weapon parsing logic

### Exit Criteria
- Weapon stats update dynamically based on operative conditions
- Clear visual distinction between original and modified values
- Weapon damage/destruction states trackable via UI
- Seamless integration with existing OperativeCard layout

---

## Phase 5: Turn Management System
**PR #5: Implement Game Turn and Activation Tracking**

### Scope
- Create turn/round progression system
- Implement APL tracking and consumption
- Add activation queue management
- Create turn controls UI using Mantine components

### Technical Implementation
```javascript
// hooks/use-turn-manager.js
/**
 * @typedef {Object} TurnState
 * @property {number} currentTurn
 * @property {number} currentRound
 * @property {'initiative'|'strategy'|'firefight'|'end'} phase
 * @property {string[]} activatedOperatives
 */

export function useTurnManager(gameState, setGameState) {
  const advanceTurn = useCallback(() => {
    // Pure function to advance game state
  }, [gameState]);

  const resetActivations = useCallback(() => {
    // Reset operative activation states
  }, [gameState]);

  return { advanceTurn, resetActivations };
}

// components/turn-manager.jsx
export function TurnManager({ gameState, onAdvanceTurn, onResetActivations }) {
  // Mantine Card with ActionIcon controls
  // Visual turn progression indicators
}
```


### Deliverables
- `hooks/use-turn-manager.js` - Turn management logic
- `components/turn-manager.jsx` - Mantine-based turn controls
- Enhanced dashboard integration with existing CP/TP/VP counters
- `utils/apl-calculator.js` - APL consumption tracking
- Turn-based effect cleanup system

### Exit Criteria
- Turn progression works correctly with game rules
- APL consumption tracked per operative and displayed
- Visual indicators show activation status clearly
- Integration with existing dashboard layout seamless

---

## Phase 6: Equipment Integration
**PR #6: Dynamic Equipment Effects System**

### Scope
- Extend modifier system to handle equipment effects
- Implement equipment condition tracking
- Add equipment-specific rules and interactions
- Create equipment status UI using existing equipment components

### Technical Implementation
```javascript
// utils/equipment-effects.js
/**
 * @typedef {Object} EquipmentEffect
 * @property {string} equipmentId
 * @property {StatModifier[]} modifiers
 * @property {Object[]} conditions
 * @property {Object} [limitedUse]
 */

export function getEquipmentModifiers(operative, equipment) {
  // Calculate equipment-based modifiers
  // Handle condition-based effects
}

// Enhanced existing equipment display
export function EnhancedEquipmentCards({ equipment, operative, onUpdate }) {
  // Build on existing EquipmentCards component
  // Add condition tracking and limited use counters
}
```


### Deliverables
- `data/equipment-effects.json` - Equipment modifier definitions
- Enhanced existing `EquipmentCards` component
- `utils/equipment-condition-tracker.js` - Condition state management
- Integration with existing equipment selection system
- Equipment usage tracking for limited-use items

### Exit Criteria
- Equipment effects modify operative stats correctly
- Limited-use equipment tracked and displayed properly
- Equipment damage states integrated with existing UI
- Backward compatibility with current equipment system

---

## Phase 7: Advanced Game Features
**PR #7: Mission Integration and Environmental Effects**

### Scope
- Add mission-specific rule support
- Implement environmental effect system
- Create objective tracking integration hooks
- Add scenario-based modifiers

### Technical Implementation
```javascript
// data/mission-rules.js
/**
 * @typedef {Object} MissionRule
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {GlobalModifier[]} [globalModifiers]
 * @property {TerritoryEffect[]} [territoryEffects]
 */

export const MISSION_RULES = {
  "escalation": {
    id: "escalation",
    name: "Escalation",
    description: "Operatives gain +1 APL after Turn 2",
    globalModifiers: [
      {
        stat: "apl",
        operation: "add",
        value: 1,
        condition: (gameState) => gameState.turnState.currentTurn > 2
      }
    ]
  }
};

// components/mission-selector.jsx
export function MissionSelector({ onMissionSelect }) {
  // Mantine Select component for mission choice
  // Mission rule preview display
}
```


### Deliverables
- `data/mission-rules.js` - Mission rule definitions
- `components/mission-selector.jsx` - Mission selection UI
- `utils/environmental-effects.js` - Environmental modifier system
- Integration hooks for objective tracking
- Mission rule application system

### Exit Criteria
- Mission rules apply correctly to game state
- Environmental effects modify stats appropriately
- Mission selection integrates with existing roster workflow
- Objective tracking hooks ready for future expansion

---

## Phase 8: Real-time Features
**PR #8: Live Game Synchronization and Auto-save**

### Scope
- Implement localStorage-based auto-save with versioning
- Add change history tracking for undo/redo
- Create change notifications using Mantine notifications
- Prepare architecture for future WebSocket integration

### Technical Implementation
```javascript
// hooks/use-auto-save.js
export function useAutoSave(gameState, interval = 30000) {
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGameStateToLocal(gameState);
    }, interval);
    
    return () => clearInterval(saveInterval);
  }, [gameState, interval]);
}

// hooks/use-change-history.js
export function useChangeHistory(gameState, setGameState) {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const undo = useCallback(() => {
    // Implement undo functionality
  }, [history, currentIndex]);

  const redo = useCallback(() => {
    // Implement redo functionality
  }, [history, currentIndex]);

  return { undo, redo, canUndo: currentIndex > 0, canRedo: currentIndex < history.length - 1 };
}
```


### Deliverables
- `hooks/use-auto-save.js` - Auto-save with localStorage
- `hooks/use-change-history.js` - Undo/redo system
- `utils/change-notifications.js` - Mantine notification integration
- `utils/game-state-versioning.js` - State version management
- Conflict resolution strategies for future sync features

### Exit Criteria
- Auto-save prevents data loss during gameplay
- Undo/redo works for all game state changes
- Change notifications provide clear feedback
- Architecture supports future real-time features

---

## Phase 9: Mobile Optimization
**PR #9: Touch-friendly Game Controls**

### Scope
- Optimize all interactive elements for touch using Mantine's responsive features
- Add swipe gestures for common actions
- Implement offline mode support with service workers
- Create mobile-specific UI patterns

### Technical Implementation
```javascript
// hooks/use-touch-gestures.js
export function useTouchGestures(element, handlers) {
  useEffect(() => {
    // Touch event handlers for swipe detection
    // Integration with Mantine's existing touch support
  }, [element, handlers]);
}

// components/mobile-stat-picker.jsx
export function MobileStatPicker({ stat, onUpdate }) {
  // Touch-optimized stat modification
  // Large touch targets using Mantine ActionIcon
  // Swipe gestures for increment/decrement
}

// service-worker.js
// Offline caching strategy for game assets
// Background sync for when connection restored
```


### Deliverables
- `hooks/use-touch-gestures.js` - Touch interaction utilities
- Enhanced mobile layouts using Mantine's responsive system
- Service worker for offline functionality
- Touch-optimized stat modification components
- Mobile-specific navigation patterns

### Exit Criteria
- All features work smoothly on mobile devices
- Offline mode maintains full gameplay functionality
- Touch interactions feel natural and responsive
- Mobile performance matches desktop experience

---

## Implementation Guidelines

### Code Standards
- **JSDoc**: All functions and complex objects documented with JSDoc
- **Testing**: Jest + React Testing Library with 80% coverage minimum
- **Performance**: No single action should block UI >100ms
- **Accessibility**: All interactive elements keyboard accessible

### Architecture Patterns
- **State Management**: React Context + useReducer for game state, SWR for server state
- **Component Design**: Composition over inheritance, leveraging Mantine's component library
- **Error Handling**: Optimistic UI with graceful fallbacks using Mantine notifications
- **Data Flow**: Unidirectional data flow, immutable state updates using pure functions

### Mantine Integration
- **Design System**: Consistent use of Mantine's theme and components
- **Responsive Design**: Leverage Mantine's built-in responsive utilities
- **Accessibility**: Utilize Mantine's accessibility features
- **Performance**: Take advantage of Mantine's optimized components

### Review Criteria
Each PR must include:
- Comprehensive Jest unit tests
- React Testing Library integration tests
- Performance impact assessment using React DevTools
- Mobile compatibility verification
- Accessibility audit using axe-core
- JSDoc documentation for all public APIs

This JavaScript-focused roadmap maintains the same feature progression while leveraging the existing tech stack effectively. Each phase builds incrementally toward a fully interactive Kill Team management system.