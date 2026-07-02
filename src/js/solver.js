
export class PuzzleSolver {
  constructor(gridSize) {
    this.gridSize = gridSize;
  }
  solve(initialBoard, maxExplored = 30000) {
    const N = this.gridSize;
    if (N <= 4) {
      const path = this.solveAStar(initialBoard, N, maxExplored);
      if (path && path.length > 0) return path;
      return this.solveLayerByLayer(initialBoard, N);
    } else {
      return this.solveLayerByLayer(initialBoard, N);
    }
  }
  solveAStar(initialBoard, N, maxExplored = 30000) {
    const goalStr = Array.from({ length: N * N }, (_, i) => (i === N * N - 1 ? 0 : i + 1)).join(',');
    const startStr = initialBoard.join(',');

    if (startStr === goalStr) return [];

    const openSet = [];
    const openSetMap = new Map();
    const closedSet = new Set();

    const startH = this.getHeuristic(initialBoard, N);
    const startNode = {
      board: [...initialBoard],
      boardStr: startStr,
      g: 0,
      h: startH,
      f: startH,
      parent: null,
      movedTile: null
    };

    openSet.push(startNode);
    openSetMap.set(startStr, startNode);

    let count = 0;

    while (openSet.length > 0 && count < maxExplored) {
      count++;

      let minIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[minIdx].f) minIdx = i;
      }
      const current = openSet[minIdx];
      openSet.splice(minIdx, 1);
      openSetMap.delete(current.boardStr);

      if (current.boardStr === goalStr) {
        const path = [];
        let temp = current;
        while (temp.parent) {
          path.unshift({
            board: temp.board,
            movedTile: temp.movedTile
          });
          temp = temp.parent;
        }
        return path;
      }

      closedSet.add(current.boardStr);

      const neighbors = this.getNeighbors(current.board, N);
      for (const neighbor of neighbors) {
        const neighborStr = neighbor.board.join(',');
        if (closedSet.has(neighborStr)) continue;

        const gScore = current.g + 1;
        const existingNode = openSetMap.get(neighborStr);

        if (!existingNode || gScore < existingNode.g) {
          const hScore = this.getHeuristic(neighbor.board, N);
          const neighborNode = {
            board: neighbor.board,
            boardStr: neighborStr,
            g: gScore,
            h: hScore,
            f: gScore + hScore,
            parent: current,
            movedTile: neighbor.movedTile
          };

          if (!existingNode) {
            openSet.push(neighborNode);
            openSetMap.set(neighborStr, neighborNode);
          } else {
            existingNode.g = gScore;
            existingNode.f = gScore + hScore;
            existingNode.parent = current;
          }
        }
      }
    }

    return null;
  }
  getHeuristic(board, N) {
    let dist = 0;

    for (let i = 0; i < board.length; i++) {
      const val = board[i];
      if (val === 0) continue;

      const targetRow = Math.floor((val - 1) / N);
      const targetCol = (val - 1) % N;
      const currentRow = Math.floor(i / N);
      const currentCol = i % N;

      dist += Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol);
    }
    for (let r = 0; r < N; r++) {
      for (let c1 = 0; c1 < N; c1++) {
        const val1 = board[r * N + c1];
        if (val1 === 0 || Math.floor((val1 - 1) / N) !== r) continue;
        for (let c2 = c1 + 1; c2 < N; c2++) {
          const val2 = board[r * N + c2];
          if (val2 === 0 || Math.floor((val2 - 1) / N) !== r) continue;
          if (val1 > val2) dist += 2;
        }
      }
    }
    for (let c = 0; c < N; c++) {
      for (let r1 = 0; r1 < N; r1++) {
        const val1 = board[r1 * N + c];
        if (val1 === 0 || (val1 - 1) % N !== c) continue;
        for (let r2 = r1 + 1; r2 < N; r2++) {
          const val2 = board[r2 * N + c];
          if (val2 === 0 || (val2 - 1) % N !== c) continue;
          if (val1 > val2) dist += 2;
        }
      }
    }

    return dist;
  }

  getNeighbors(state, N) {
    const neighbors = [];
    const emptyIdx = state.indexOf(0);
    const row = Math.floor(emptyIdx / N);
    const col = emptyIdx % N;

    const moves = [
      { r: -1, c: 0 },
      { r: 1, c: 0 },
      { r: 0, c: -1 },
      { r: 0, c: 1 }
    ];

    for (const move of moves) {
      const nr = row + move.r;
      const nc = col + move.c;

      if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
        const newEmptyIdx = nr * N + nc;
        const newBoard = [...state];
        newBoard[emptyIdx] = newBoard[newEmptyIdx];
        newBoard[newEmptyIdx] = 0;
        neighbors.push({
          board: newBoard,
          movedTile: state[newEmptyIdx]
        });
      }
    }

    return neighbors;
  }
  solveLayerByLayer(initialBoard, N) {
    const board = [...initialBoard];
    const movesList = [];
    const frozen = new Array(N * N).fill(false);

    const makeMove = (fromIdx, toIdx) => {
      const movedTile = board[fromIdx];
      board[toIdx] = movedTile;
      board[fromIdx] = 0;
      movesList.push({
        board: [...board],
        movedTile
      });
    };
    const moveZeroTo = (targetIdx, blockedIdx = -1) => {
      while (board.indexOf(0) !== targetIdx) {
        const zeroIdx = board.indexOf(0);
        if (zeroIdx === targetIdx) break;

        const queue = [[zeroIdx]];
        const visited = new Set([zeroIdx]);
        let path = null;

        while (queue.length > 0) {
          const p = queue.shift();
          const curr = p[p.length - 1];

          if (curr === targetIdx) {
            path = p;
            break;
          }

          const r = Math.floor(curr / N);
          const c = curr % N;
          const dirs = [
            { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
            { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
          ];

          for (const d of dirs) {
            const nr = r + d.dr;
            const nc = c + d.dc;
            if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
              const nxt = nr * N + nc;
              if (!visited.has(nxt) && !frozen[nxt] && nxt !== blockedIdx) {
                visited.add(nxt);
                queue.push([...p, nxt]);
              }
            }
          }
        }

        if (!path || path.length < 2) break;
        makeMove(path[1], zeroIdx);
      }
    };
    const moveTileTo = (val, targetIdx) => {
      while (board.indexOf(val) !== targetIdx) {
        const currTileIdx = board.indexOf(val);
        if (currTileIdx === targetIdx) break;

        const queue = [[currTileIdx]];
        const visited = new Set([currTileIdx]);
        let tilePath = null;

        while (queue.length > 0) {
          const p = queue.shift();
          const curr = p[p.length - 1];

          if (curr === targetIdx) {
            tilePath = p;
            break;
          }

          const r = Math.floor(curr / N);
          const c = curr % N;
          const dirs = [
            { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
            { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
          ];

          for (const d of dirs) {
            const nr = r + d.dr;
            const nc = c + d.dc;
            if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
              const nxt = nr * N + nc;
              if (!visited.has(nxt) && !frozen[nxt]) {
                visited.add(nxt);
                queue.push([...p, nxt]);
              }
            }
          }
        }

        if (!tilePath || tilePath.length < 2) break;

        const nextTilePos = tilePath[1];
        moveZeroTo(nextTilePos, currTileIdx);
        makeMove(currTileIdx, nextTilePos);
      }
    };
    const maxLayers = N - 3;

    for (let layer = 0; layer < maxLayers; layer++) {
      const r = layer;
      const c = layer;
      for (let col = c; col <= N - 3; col++) {
        const targetVal = r * N + col + 1;
        const targetIdx = r * N + col;
        moveTileTo(targetVal, targetIdx);
        frozen[targetIdx] = true;
      }
      const valA = r * N + (N - 1);
      const valB = r * N + N;
      const idxA = r * N + (N - 2);
      const idxB = r * N + (N - 1);

      if (board[idxA] !== valA || board[idxB] !== valB) {
        moveTileTo(valA, r * N + (N - 1));
        frozen[r * N + (N - 1)] = true;

        moveTileTo(valB, (r + 1) * N + (N - 1));
        frozen[(r + 1) * N + (N - 1)] = true;

        frozen[r * N + (N - 1)] = false;
        frozen[(r + 1) * N + (N - 1)] = false;
        moveZeroTo((r + 1) * N + (N - 2));

        moveZeroTo(r * N + (N - 2));
        moveZeroTo(r * N + (N - 1));
        moveZeroTo((r + 1) * N + (N - 1));
        moveZeroTo((r + 1) * N + (N - 2));
      }
      frozen[idxA] = true;
      frozen[idxB] = true;
      for (let row = r + 1; row <= N - 3; row++) {
        const targetVal = row * N + c + 1;
        const targetIdx = row * N + c;
        moveTileTo(targetVal, targetIdx);
        frozen[targetIdx] = true;
      }
      const valColA = (N - 2) * N + c + 1;
      const valColB = (N - 1) * N + c + 1;
      const idxColA = (N - 2) * N + c;
      const idxColB = (N - 1) * N + c;

      if (board[idxColA] !== valColA || board[idxColB] !== valColB) {
        moveTileTo(valColA, (N - 1) * N + c);
        frozen[(N - 1) * N + c] = true;

        moveTileTo(valColB, (N - 1) * N + (c + 1));
        frozen[(N - 1) * N + (c + 1)] = true;

        frozen[(N - 1) * N + c] = false;
        frozen[(N - 1) * N + (c + 1)] = false;
        moveZeroTo((N - 2) * N + (c + 1));

        moveZeroTo((N - 2) * N + c);
        moveZeroTo((N - 1) * N + c);
        moveZeroTo((N - 1) * N + (c + 1));
        moveZeroTo((N - 2) * N + (c + 1));
      }
      frozen[idxColA] = true;
      frozen[idxColB] = true;
    }
    const activeIndices = [];
    for (let i = 0; i < N * N; i++) {
      if (!frozen[i]) activeIndices.push(i);
    }

    if (activeIndices.length === 9) {
      const subBoard = activeIndices.map((idx) => board[idx]);
      const sortedVals = [...subBoard].filter((v) => v !== 0).sort((x, y) => x - y);
      const valToNorm = new Map();
      sortedVals.forEach((v, i) => valToNorm.set(v, i + 1));
      valToNorm.set(0, 0);

      const normSubBoard = subBoard.map((v) => valToNorm.get(v));
      const subSolver = new PuzzleSolver(3);
      const subPath = subSolver.solveAStar(normSubBoard, 3, 30000);

      if (subPath) {
        for (const step of subPath) {
          const movedNormVal = step.movedTile;
          let movedRealVal = 0;
          for (const [rk, rv] of valToNorm.entries()) {
            if (rv === movedNormVal) {
              movedRealVal = rk;
              break;
            }
          }
          const fromIdx = board.indexOf(movedRealVal);
          const toIdx = board.indexOf(0);
          makeMove(fromIdx, toIdx);
        }
      }
    }

    return movesList;
  }
}
