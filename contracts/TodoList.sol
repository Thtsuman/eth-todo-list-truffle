// SPDX-License-Identifier: MIT
pragma solidity >0.5.0;

contract TodoList {
    constructor() public {
        createNewTask("Check out YouTube");
    }

    uint256 public taskCount = 0;

    struct Task {
        uint256 id;
        string content;
        bool completed;
    }
    event TaskCreated(uint256 id, string content, bool completed);
    event TaskUpdated(uint256 id, bool completed);

    mapping(uint256 => Task) public tasks;

    function createNewTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content, false);
    }

    function toggleCompleted(uint256 _id) public {
        Task memory _task = tasks[_id];
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit TaskUpdated(_id, _task.completed);
    }
}
