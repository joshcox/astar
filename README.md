# A*

This package provides a flexible and efficient implementation of the A* search algorithm in TypeScript. It's designed to be easily adaptable for various pathfinding and problem-solving scenarios.

## Documentation
* [Design](./design.md)

## Features

- Generic implementation allowing for custom data types and goal conditions
- Efficient priority queue for managing open nodes
- Customizable scoring system with support for cost and heuristic modifications
- Type-safety

## Installation

To install the package, run:

```
npm install astar
```

## Quick Start

Here's a simple example of how to use the A* implementation:

```typescript
import { AStar, IData, IGoal, IScore } from 'astar';

// Define your custom Data and Goal types
class MyData implements IData {
  // ...
}

class MyGoal implements IGoal {
  // ...
}

class MyScoreClass implements IScore {
  // ...
}

// Create an instance of AStar
const astar = new AStar<MyData, MyGoal>({
  Score: MyScoreClass,
  scoreOptions: {},
  successors: (node) => {
    // Generate and return successor nodes
  },
});

// Perform the search
const result = astar.search(startData, goalData);
```

