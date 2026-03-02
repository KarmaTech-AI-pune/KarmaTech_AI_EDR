# Frontend Implementation Guides

**Location:** `.kiro/frontend-guides/`  
**Status:** Inactive by Default (Manual Activation Required)

---

## 🚨 IMPORTANT: These Files Are NOT Auto-Loaded

Unlike files in `.kiro/steering/`, these frontend guides are **NOT automatically included** in AI context.

They must be **explicitly read** when the user activates them.

---

## 🔑 How to Activate

**User must say one of these phrases:**
- "Use Frontend Steering Files in the Implementation"
- "Use frontend steering files"
- "Apply frontend workflow"
- "Follow React workflow"

**Only then will these files be read and applied.**

---

## 📚 Available Guides

### Main Workflow:
- **`react-implementation-workflow.md`** - Complete 11-step implementation process

### Specialized Guides:
- **`REACT_COMPONENT_REUSABILITY_GUIDE.md`** - Component reusability and data flow patterns
- **`REACT_WORKFLOW_VISUAL_GUIDE.md`** - Visual flowcharts and diagrams
- **`DEVELOPER_WORKFLOW_GUIDE.md`** - Quick decision tree for workflow selection
- **`react-component-patterns.md`** - Component architecture and best practices
- **`react-state-api-integration.md`** - State management and API integration
- **`react-routing-navigation.md`** - Routing and navigation patterns
- **`react-forms-validation.md`** - Form handling and validation
- **`material-ui-styling-guide.md`** - Material-UI styling patterns

### Supporting Files:
- **`REACT_WORKFLOW_CHANGELOG.md`** - History of workflow updates

---

## 🎯 Purpose of This Structure

### Why Separate from `.kiro/steering/`?

**Problem:** Files in `.kiro/steering/` are automatically loaded as "steering rules" for every conversation, consuming context even when not needed.

**Solution:** Move frontend guides to `.kiro/frontend-guides/` so they're only loaded when explicitly requested.

### Benefits:
- ✅ **Saves Context**: No unnecessary file loading
- ✅ **User Control**: Activate only when needed
- ✅ **Flexibility**: Simple tasks stay simple
- ✅ **Selective Loading**: Read only relevant guides

---

## 📋 Activation Control

The activation system is managed by:
- **Control File:** `.kiro/steering/FRONTEND_WORKFLOW_ACTIVATION.md`
- **Trigger Phrase:** "Use Frontend Steering Files in the Implementation"

When activated:
1. Read main workflow file
2. Analyze requirement
3. Read only relevant specialized guides
4. Generate design and tasks

---

## 🔧 Example Usage

### Without Activation (Default):
```
User: "Please check the subscription implementation"

AI: Checks implementation directly without loading frontend guides
```

### With Activation:
```
User: "Use frontend steering files to implement user profile page"

AI: 
1. Reads react-implementation-workflow.md
2. Reads relevant guides (routing, forms, etc.)
3. Generates structured design and tasks
```

---

## ⚠️ Important Notes

1. **These files are NOT rules** - They're reference guides
2. **Manual activation required** - User must explicitly request
3. **Selective reading** - Only relevant guides are read
4. **Per-feature activation** - Each feature needs separate activation

---

**Last Updated:** January 21, 2025  
**Maintained By:** Kiro AI Development Team
