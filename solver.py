"""
LastTile — Python AI Auto-Solver Engine
Supports 3x3, 4x4, 5x5, and 6x6 N-Puzzle Grids
Combines Ultra-Fast A* Search (Manhattan + Linear Conflicts + Tie-Breaker) and Layer-by-Layer Reduction
"""

import sys
import json
import heapq
from collections import deque

class PuzzleSolver:
    def __init__(self, grid_size):
        self.grid_size = grid_size

    def solve(self, initial_board, max_explored=40000):
        N = self.grid_size
        goal_tuple = tuple(i + 1 if i < N * N - 1 else 0 for i in range(N * N))
        if tuple(initial_board) == goal_tuple:
            return []

        if N <= 4:
            path = self.solve_astar(initial_board, N, max_explored)
            if path is not None:
                return path
            return self.solve_layer_by_layer(initial_board, N)
        else:
            return self.solve_layer_by_layer(initial_board, N)

    def solve_astar(self, initial_board, N, max_explored=40000):
        goal_tuple = tuple(i + 1 if i < N * N - 1 else 0 for i in range(N * N))
        start_tuple = tuple(initial_board)

        if start_tuple == goal_tuple:
            return []

        open_heap = []
        open_map = {}
        closed_set = set()

        node_counter = 0
        start_h = self._get_heuristic(start_tuple, N)
        start_node = (start_h, start_h, node_counter, start_tuple, 0, None, None)

        heapq.heappush(open_heap, start_node)
        open_map[start_tuple] = start_node

        count = 0

        while open_heap and count < max_explored:
            count += 1
            f, h, _, curr_board, g, parent, moved_tile = heapq.heappop(open_heap)

            if curr_board not in open_map:
                continue
            del open_map[curr_board]

            if curr_board == goal_tuple:
                path = []
                curr = (f, h, 0, curr_board, g, parent, moved_tile)
                while curr[5] is not None:
                    path.append({
                        "board": list(curr[3]),
                        "movedTile": curr[6]
                    })
                    curr = curr[5]
                path.reverse()
                return path

            closed_set.add(curr_board)
            empty_idx = curr_board.index(0)
            r, c = divmod(empty_idx, N)

            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < N and 0 <= nc < N:
                    nxt_idx = nr * N + nc
                    nbr_list = list(curr_board)
                    nbr_list[empty_idx], nbr_list[nxt_idx] = nbr_list[nxt_idx], nbr_list[empty_idx]
                    nbr_tuple = tuple(nbr_list)

                    if nbr_tuple in closed_set:
                        continue

                    g_score = g + 1
                    h_score = self._get_heuristic(nbr_tuple, N)
                    f_score = g_score + h_score
                    nbr_moved_tile = curr_board[nxt_idx]

                    if nbr_tuple in open_map:
                        prev_node = open_map[nbr_tuple]
                        if g_score < prev_node[4]:
                            node_counter += 1
                            nbr_node = (f_score, h_score, node_counter, nbr_tuple, g_score, (f, h, 0, curr_board, g, parent, moved_tile), nbr_moved_tile)
                            open_map[nbr_tuple] = nbr_node
                            heapq.heappush(open_heap, nbr_node)
                    else:
                        node_counter += 1
                        nbr_node = (f_score, h_score, node_counter, nbr_tuple, g_score, (f, h, 0, curr_board, g, parent, moved_tile), nbr_moved_tile)
                        open_map[nbr_tuple] = nbr_node
                        heapq.heappush(open_heap, nbr_node)

        return None

    def _get_heuristic(self, board, N):
        dist = 0
        for i, val in enumerate(board):
            if val == 0:
                continue
            target_r, target_c = divmod(val - 1, N)
            curr_r, curr_c = divmod(i, N)
            dist += abs(target_r - curr_r) + abs(target_c - curr_c)
        for r in range(N):
            for c1 in range(N):
                val1 = board[r * N + c1]
                if val1 == 0 or (val1 - 1) // N != r:
                    continue
                for c2 in range(c1 + 1, N):
                    val2 = board[r * N + c2]
                    if val2 == 0 or (val2 - 1) // N != r:
                        continue
                    if val1 > val2:
                        dist += 2
        for c in range(N):
            for r1 in range(N):
                val1 = board[r1 * N + c]
                if val1 == 0 or (val1 - 1) % N != c:
                    continue
                for r2 in range(r1 + 1, N):
                    val2 = board[r2 * N + c]
                    if val2 == 0 or (val2 - 1) % N != c:
                        continue
                    if val1 > val2:
                        dist += 2

        return dist

    def solve_layer_by_layer(self, initial_board, N):
        board = list(initial_board)
        moves_list = []
        frozen = [False] * (N * N)

        def make_move(from_idx, to_idx):
            moved_tile = board[from_idx]
            board[to_idx] = moved_tile
            board[from_idx] = 0
            moves_list.append({
                "board": list(board),
                "movedTile": moved_tile
            })

        def move_zero_to(target_idx, blocked_idx=-1):
            while board.index(0) != target_idx:
                zero_idx = board.index(0)
                if zero_idx == target_idx:
                    break

                q = deque([[zero_idx]])
                visited = {zero_idx}
                path = None

                while q:
                    p = q.popleft()
                    curr = p[-1]

                    if curr == target_idx:
                        path = p
                        break

                    r, c = divmod(curr, N)
                    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < N and 0 <= nc < N:
                            nxt = nr * N + nc
                            if nxt not in visited and not frozen[nxt] and nxt != blocked_idx:
                                visited.add(nxt)
                                q.append(p + [nxt])

                if not path or len(path) < 2:
                    break
                make_move(path[1], zero_idx)

        def move_tile_to(val, target_idx):
            while board.index(val) != target_idx:
                curr_tile_idx = board.index(val)
                if curr_tile_idx == target_idx:
                    break

                q = deque([[curr_tile_idx]])
                visited = {curr_tile_idx}
                tile_path = None

                while q:
                    p = q.popleft()
                    curr = p[-1]

                    if curr == target_idx:
                        tile_path = p
                        break

                    r, c = divmod(curr, N)
                    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < N and 0 <= nc < N:
                            nxt = nr * N + nc
                            if nxt not in visited and not frozen[nxt]:
                                visited.add(nxt)
                                q.append(p + [nxt])

                if not tile_path or len(tile_path) < 2:
                    break

                nxt_pos = tile_path[1]
                move_zero_to(nxt_pos, curr_tile_idx)
                make_move(curr_tile_idx, nxt_pos)

        max_layers = N - 3

        for layer in range(max_layers):
            r = layer
            c = layer
            for col in range(c, N - 2):
                target_val = r * N + col + 1
                target_idx = r * N + col
                move_tile_to(target_val, target_idx)
                frozen[target_idx] = True
            val_a = r * N + N - 1
            val_b = r * N + N
            idx_a = r * N + N - 2
            idx_b = r * N + N - 1

            if board[idx_a] != val_a or board[idx_b] != val_b:
                move_tile_to(val_a, r * N + N - 1)
                frozen[r * N + N - 1] = True

                move_tile_to(val_b, (r + 1) * N + N - 1)
                frozen[(r + 1) * N + N - 1] = True

                frozen[r * N + N - 1] = False
                frozen[(r + 1) * N + N - 1] = False
                move_zero_to((r + 1) * N + N - 2)

                move_zero_to(r * N + N - 2)
                move_zero_to(r * N + N - 1)
                move_zero_to((r + 1) * N + N - 1)
                move_zero_to((r + 1) * N + N - 2)

            frozen[idx_a] = True
            frozen[idx_b] = True
            for row in range(r + 1, N - 2):
                target_val = row * N + c + 1
                target_idx = row * N + c
                move_tile_to(target_val, target_idx)
                frozen[target_idx] = True
            val_col_a = (N - 2) * N + c + 1
            val_col_b = (N - 1) * N + c + 1
            idx_col_a = (N - 2) * N + c
            idx_col_b = (N - 1) * N + c

            if board[idx_col_a] != val_col_a or board[idx_col_b] != val_col_b:
                move_tile_to(val_col_a, (N - 1) * N + c)
                frozen[(N - 1) * N + c] = True

                move_tile_to(val_col_b, (N - 1) * N + c + 1)
                frozen[(N - 1) * N + c + 1] = True

                frozen[(N - 1) * N + c] = False
                frozen[(N - 1) * N + c + 1] = False
                move_zero_to((N - 2) * N + c + 1)

                move_zero_to((N - 2) * N + c)
                move_zero_to((N - 1) * N + c)
                move_zero_to((N - 1) * N + c + 1)
                move_zero_to((N - 2) * N + c + 1)

            frozen[idx_col_a] = True
            frozen[idx_col_b] = True
        active_indices = [i for i in range(N * N) if not frozen[i]]

        if len(active_indices) == 9:
            sub_board = [board[idx] for idx in active_indices]
            sorted_vals = sorted([v for v in sub_board if v != 0])
            val_map = {v: i + 1 for i, v in enumerate(sorted_vals)}
            val_map[0] = 0

            norm_sub_board = [val_map[v] for v in sub_board]
            sub_solver = PuzzleSolver(3)
            sub_path = sub_solver.solve_astar(norm_sub_board, 3, 30000)

            if sub_path:
                rev_map = {v: k for k, v in val_map.items()}
                for step in sub_path:
                    moved_norm = step["movedTile"]
                    moved_real = rev_map[moved_norm]
                    from_idx = board.index(moved_real)
                    to_idx = board.index(0)
                    make_move(from_idx, to_idx)

        return moves_list

if __name__ == "__main__":
    print("Testing Python LastTile Puzzle Solver...")
    test_board = [1, 2, 3, 4, 5, 6, 7, 0, 8]
    solver = PuzzleSolver(3)
    sol = solver.solve(test_board)
    print(f"Solved 3x3 test board in {len(sol)} moves!")
