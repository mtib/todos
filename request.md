# Task: Add visual connectors to the todo list

The user wants to add a visual representation of the parent-child relationships in the todo list. This will involve drawing a vertical line down from each parent task and then a horizontal line to each of its direct children.

## Requirements

-   The lines should be drawn using only HTML and CSS.
-   No SVG or other drawing libraries should be used.
-   The lines should be styled to match the rest of the application.
-   The vertical line should extend from the parent task down to its last child.
-   A horizontal line should connect the vertical line to each child task.

## Files to modify

-   `src/components/TodoItem.tsx`
-   `src/components/TodoTree.tsx`

## Suggested approach

-   Use CSS pseudo-elements (`::before` and `::after`) to create the lines.
-   Add a new prop `isLastChild` to the `TodoItem` component to determine the height of the vertical line.
-   Use Tailwind CSS classes for styling.
-   The `TodoTree` component will need to be modified to pass the `isLastChild` prop to the `TodoItem` component.
